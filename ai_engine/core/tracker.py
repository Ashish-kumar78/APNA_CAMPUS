"""
Lightweight ByteTrack / IoU Multi-Object Tracking Engine
Provides temporal bounding box association across consecutive CCTV frames.
"""

from typing import List, Dict, Any, Tuple, Optional
import numpy as np


def compute_iou_matrix(boxes_a: np.ndarray, boxes_b: np.ndarray) -> np.ndarray:
    """Computes Intersection-over-Union (IoU) between two sets of bounding boxes [x1, y1, x2, y2]."""
    if len(boxes_a) == 0 or len(boxes_b) == 0:
        return np.empty((len(boxes_a), len(boxes_b)), dtype=np.float32)

    boxes_a = np.asarray(boxes_a, dtype=np.float32)
    boxes_b = np.asarray(boxes_b, dtype=np.float32)

    area_a = (boxes_a[:, 2] - boxes_a[:, 0]) * (boxes_a[:, 3] - boxes_a[:, 1])
    area_b = (boxes_b[:, 2] - boxes_b[:, 0]) * (boxes_b[:, 3] - boxes_b[:, 1])

    inter_x1 = np.maximum(boxes_a[:, None, 0], boxes_b[None, :, 0])
    inter_y1 = np.maximum(boxes_a[:, None, 1], boxes_b[None, :, 1])
    inter_x2 = np.minimum(boxes_a[:, None, 2], boxes_b[None, :, 2])
    inter_y2 = np.minimum(boxes_a[:, None, 3], boxes_b[None, :, 3])

    inter_w = np.maximum(0.0, inter_x2 - inter_x1)
    inter_h = np.maximum(0.0, inter_y2 - inter_y1)
    intersection = inter_w * inter_h

    union = area_a[:, None] + area_b[None, :] - intersection
    iou = np.where(union > 0, intersection / union, 0.0)
    return iou


class TrackState:
    New = 0
    Tracked = 1
    Lost = 2
    Removed = 3


class STrack:
    _count = 0

    def __init__(self, bbox: List[float], score: float, class_name: str = "person"):
        STrack._count += 1
        self.track_id = STrack._count
        self.bbox = np.array(bbox, dtype=np.float32)
        self.score = float(score)
        self.class_name = class_name
        self.state = TrackState.New
        self.is_activated = False
        self.hits = 1
        self.age = 1
        self.time_since_update = 0

    def update(self, new_bbox: List[float], new_score: float):
        self.bbox = np.array(new_bbox, dtype=np.float32)
        self.score = float(new_score)
        self.hits += 1
        self.time_since_update = 0
        self.state = TrackState.Tracked
        self.is_activated = True

    def mark_lost(self):
        self.state = TrackState.Lost

    def mark_removed(self):
        self.state = TrackState.Removed


class SimpleByteTracker:
    """
    Two-stage ByteTrack association tracker.
    Prevents ID switches across students and correlates temporary tracking IDs.
    """

    def __init__(
        self,
        high_thresh: float = 0.50,
        low_thresh: float = 0.15,
        match_thresh: float = 0.40,
        max_lost_frames: int = 30
    ):
        self.high_thresh = high_thresh
        self.low_thresh = low_thresh
        self.match_thresh = match_thresh
        self.max_lost_frames = max_lost_frames
        self.tracked_stracks: List[STrack] = []
        self.frame_id = 0

    def update(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        self.frame_id += 1

        if not detections:
            for t in self.tracked_stracks:
                t.time_since_update += 1
                t.age += 1
                if t.time_since_update > self.max_lost_frames:
                    t.mark_removed()
            self.tracked_stracks = [t for t in self.tracked_stracks if t.state != TrackState.Removed]
            return []

        high_dets = []
        low_dets = []
        for det in detections:
            score = det.get("confidence", det.get("score", 0.5))
            if score >= self.high_thresh:
                high_dets.append(det)
            elif score >= self.low_thresh:
                low_dets.append(det)

        # Stage 1: Match high-confidence detections
        unmatched_tracks = []
        unmatched_high_dets = list(range(len(high_dets)))

        if len(self.tracked_stracks) > 0 and len(high_dets) > 0:
            track_boxes = np.array([t.bbox for t in self.tracked_stracks])
            det_boxes = np.array([d["bbox"] for d in high_dets])
            iou_matrix = compute_iou_matrix(track_boxes, det_boxes)

            matched_track_indices = set()
            matched_det_indices = set()

            for _ in range(min(len(self.tracked_stracks), len(high_dets))):
                max_idx = np.unravel_index(np.argmax(iou_matrix), iou_matrix.shape)
                t_idx, d_idx = max_idx[0], max_idx[1]
                max_iou = iou_matrix[t_idx, d_idx]

                if max_iou < self.match_thresh:
                    break

                if t_idx not in matched_track_indices and d_idx not in matched_det_indices:
                    self.tracked_stracks[t_idx].update(
                        high_dets[d_idx]["bbox"],
                        high_dets[d_idx].get("confidence", 0.9)
                    )
                    matched_track_indices.add(t_idx)
                    matched_det_indices.add(d_idx)

                iou_matrix[t_idx, :] = -1.0
                iou_matrix[:, d_idx] = -1.0

            unmatched_tracks = [t for i, t in enumerate(self.tracked_stracks) if i not in matched_track_indices]
            unmatched_high_dets = [i for i in range(len(high_dets)) if i not in matched_det_indices]
        else:
            unmatched_tracks = list(self.tracked_stracks)

        # Stage 2: Match low-confidence detections
        if len(unmatched_tracks) > 0 and len(low_dets) > 0:
            track_boxes = np.array([t.bbox for t in unmatched_tracks])
            det_boxes = np.array([d["bbox"] for d in low_dets])
            iou_matrix = compute_iou_matrix(track_boxes, det_boxes)

            matched_t_idx = set()
            for _ in range(min(len(unmatched_tracks), len(low_dets))):
                max_idx = np.unravel_index(np.argmax(iou_matrix), iou_matrix.shape)
                t_idx, d_idx = max_idx[0], max_idx[1]
                if iou_matrix[t_idx, d_idx] < (self.match_thresh * 0.75):
                    break
                unmatched_tracks[t_idx].update(low_dets[d_idx]["bbox"], low_dets[d_idx].get("confidence", 0.3))
                matched_t_idx.add(t_idx)
                iou_matrix[t_idx, :] = -1.0
                iou_matrix[:, d_idx] = -1.0

            unmatched_tracks = [t for i, t in enumerate(unmatched_tracks) if i not in matched_t_idx]

        for t in unmatched_tracks:
            t.time_since_update += 1
            t.age += 1
            if t.time_since_update > self.max_lost_frames:
                t.mark_removed()

        for d_idx in unmatched_high_dets:
            det = high_dets[d_idx]
            new_track = STrack(
                bbox=det["bbox"],
                score=det.get("confidence", 0.8),
                class_name=det.get("class_name", "person")
            )
            new_track.is_activated = True
            self.tracked_stracks.append(new_track)

        self.tracked_stracks = [t for t in self.tracked_stracks if t.state != TrackState.Removed]

        output_tracks = []
        for t in self.tracked_stracks:
            if t.time_since_update == 0:
                output_tracks.append({
                    "track_id": t.track_id,
                    "bbox": t.bbox.tolist(),
                    "confidence": t.score,
                    "class_name": t.class_name,
                    "hits": t.hits
                })
        return output_tracks
