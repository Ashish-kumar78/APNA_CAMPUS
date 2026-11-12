"""
Central Face Attendance Event Manager (event_manager.py)
Streamlined for Model 1: Face Recognition, Passive Anti-Spoofing,
ByteTrack person association, temporal identity consistency voting,
and direct Neon Cloud synchronization.
"""

import time
import logging
from typing import Dict, Any, List, Optional, Set
import numpy as np

from ai_engine.models.face_engine import FaceAttendanceEngine
from ai_engine.core.tracker import SimpleByteTracker, compute_iou_matrix
from ai_engine.services.backend_client import ApnaCampusBackendClient
from ai_engine.examination_interface import AttendanceVerificationEvent, examination_bus

logger = logging.getLogger("AttendanceEventManager")


class CentralAIEventManager:
    """Central manager processing CCTV video frames for Face Attendance and Anti-Spoofing."""

    def __init__(
        self,
        face_engine: FaceAttendanceEngine,
        backend_client: ApnaCampusBackendClient,
        tracker: Optional[SimpleByteTracker] = None,
        camera_id: str = "CAM-01",
        temporal_window: int = 5,
        consensus_required: int = 3
    ):
        self.face_engine = face_engine
        self.backend_client = backend_client
        self.tracker = tracker or SimpleByteTracker()
        self.camera_id = camera_id
        self.temporal_window = temporal_window
        self.consensus_required = consensus_required

        self.total_frames_processed = 0
        self.total_attendances_confirmed = 0

        # Temporal voting buffer per tracking ID: {track_id: [vote1, vote2, ...]}
        self.track_votes: Dict[int, List[Dict[str, Any]]] = {}

        # Session-level duplicate lockout
        self.confirmed_students: Set[str] = set()

    def process_tick(
        self,
        frame: np.ndarray,
        timestamp: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Processes a single CCTV video frame:
        1. Face Detection & 5-point landmark extraction
        2. Quality Pre-Filter & Passive Anti-Spoofing Evaluation
        3. Umeyama alignment & Deep Feature Embedding
        4. Vectorized Cosine Similarity Matching
        5. ByteTrack Multi-Person Association (IoU matching)
        6. Temporal Identity Voting & Deduplication (k-of-N consensus)
        7. Real-Time Cloud Sync to Neon PostgreSQL
        8. Standardized Event Dispatching to Examination Integration Bus
        """
        now = timestamp if timestamp is not None else time.time()
        self.total_frames_processed += 1

        # 1. Face Recognition & Liveness Pipeline
        face_results = self.face_engine.process_frame(frame)

        # 2. Association Tracking (ByteTrack)
        det_boxes = [{"bbox": f["bbox"], "confidence": f.get("confidence", 0.90), "class_name": "person"} for f in face_results]
        active_tracks = self.tracker.update(det_boxes)

        # Map tracking IDs to detected faces using IoU
        if face_results and active_tracks:
            f_boxes = np.array([f["bbox"] for f in face_results], dtype=np.float32)
            t_boxes = np.array([t["bbox"] for t in active_tracks], dtype=np.float32)
            iou_mat = compute_iou_matrix(f_boxes, t_boxes)

            for f_idx, face in enumerate(face_results):
                if iou_mat.shape[1] > 0:
                    best_t_idx = int(np.argmax(iou_mat[f_idx]))
                    if iou_mat[f_idx, best_t_idx] >= 0.25:
                        face["track_id"] = active_tracks[best_t_idx]["track_id"]

        # 3. Temporal Identity Consistency & Duplicate Prevention
        for res in face_results:
            track_id = res.get("track_id")
            reg_no = res.get("reg_no", "UNKNOWN")
            name = res.get("student_name", "Unknown Person")
            is_live = res.get("is_live", False)
            q_pass = res.get("quality_passed", True)
            sim = res.get("confidence", 0.0)

            # Use track_id sliding window for consensus voting
            if track_id is not None:
                if track_id not in self.track_votes:
                    self.track_votes[track_id] = []
                self.track_votes[track_id].append({
                    "reg_no": reg_no,
                    "student_name": name,
                    "is_live": is_live,
                    "quality_passed": q_pass,
                    "confidence": sim
                })
                if len(self.track_votes[track_id]) > self.temporal_window:
                    self.track_votes[track_id].pop(0)

                valid_votes = [
                    v for v in self.track_votes[track_id]
                    if v["reg_no"] not in ("UNKNOWN", "LOW_QUALITY")
                    and v["is_live"]
                    and v["quality_passed"]
                ]
                counts: Dict[str, int] = {}
                for v in valid_votes:
                    counts[v["reg_no"]] = counts.get(v["reg_no"], 0) + 1

                for cand_reg, count in counts.items():
                    if count >= self.consensus_required and cand_reg not in self.confirmed_students:
                        self.confirmed_students.add(cand_reg)
                        res["attendance_confirmed"] = True
                        self.total_attendances_confirmed += 1

                        sync_result = self.backend_client.submit_attendance(
                            roll_number=cand_reg,
                            student_name=name
                        )
                        res["backend_sync"] = sync_result
                        logger.info(f"✅ TEMPORAL CONSENSUS VERIFIED: {cand_reg} ({name}) [{count}/{self.temporal_window} frames]")

            # Fallback direct confirmation
            elif res.get("attendance_confirmed") and reg_no not in self.confirmed_students:
                self.confirmed_students.add(reg_no)
                self.total_attendances_confirmed += 1
                sync_result = self.backend_client.submit_attendance(
                    roll_number=reg_no,
                    student_name=name
                )
                res["backend_sync"] = sync_result

            # 4. Standardized Event Dispatching
            verification_status = "UNKNOWN"
            if res.get("attendance_confirmed") or reg_no in self.confirmed_students:
                verification_status = "VERIFIED"
            elif not q_pass:
                verification_status = "LOW_QUALITY"
            elif not is_live:
                verification_status = "SPOOF_REJECTED"

            event = AttendanceVerificationEvent(
                student_reg_no=reg_no,
                student_name=name,
                verification_status=verification_status,
                similarity_score=sim,
                threshold_used=self.face_engine.similarity_threshold,
                liveness_score=res.get("liveness_score", 0.0),
                liveness_passed=is_live,
                quality_score=res.get("quality_score", 1.0),
                quality_passed=q_pass,
                camera_id=self.camera_id,
                track_id=track_id,
                bbox=res.get("bbox", []),
                landmarks=res.get("landmarks", []),
                quality_metrics=res.get("quality_metrics", {})
            )
            examination_bus.emit(event)

        return {
            "timestamp": now,
            "camera_id": self.camera_id,
            "face_results": face_results,
            "active_tracks": active_tracks,
            "stats": {
                "frames": self.total_frames_processed,
                "verified_attendance": self.total_attendances_confirmed
            }
        }
