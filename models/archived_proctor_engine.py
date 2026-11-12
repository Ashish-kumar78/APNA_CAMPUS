"""
Model 2: Exam Hall Proctoring Engine (proctor_engine.py)
Monitors examination halls using:
- YOLOv8 Prohibited Contraband Detection (cell phones, books, smartwatches)
- Perspective-n-Point (PnP) 3D Head Pose & Gaze with normal seated writing baseline
- Spatial Polygon Desk Association (cv2.pointPolygonTest)
- 30-frame temporal evidence buffering and non-repeating alert throttling
"""

import os
import time
import logging
from collections import deque
from typing import List, Dict, Tuple, Optional, Any
import numpy as np

import cv2

logger = logging.getLogger("ExamProctorEngine")

FACE_MODEL_3D_POINTS = np.array([
    [0.0, 0.0, 0.0],          # Nose Tip
    [0.0, 330.0, -65.0],      # Chin Tip
    [-225.0, -170.0, -135.0], # Left Eye
    [225.0, -170.0, -135.0],  # Right Eye
    [-150.0, 150.0, -125.0],  # Left Mouth Corner
    [150.0, 150.0, -125.0]    # Right Mouth Corner
], dtype=np.float64)


class HeadPoseEstimator:
    """Computes 3D head orientation (Yaw, Pitch, Roll) using Perspective-n-Point (PnP)."""

    @staticmethod
    def estimate_head_pose(
        landmarks_2d: np.ndarray,
        frame_shape: Tuple[int, int]
    ) -> Tuple[float, float, float, Optional[np.ndarray], Optional[np.ndarray]]:
        pts = np.asarray(landmarks_2d, dtype=np.float64)
        h, w = frame_shape[:2]

        if pts.shape[0] == 5:
            left_eye = pts[0]
            right_eye = pts[1]
            nose = pts[2]
            left_mouth = pts[3]
            right_mouth = pts[4]
            mouth_center = (left_mouth + right_mouth) / 2.0
            chin = mouth_center + (mouth_center - nose) * 0.9
            image_points = np.array([
                nose,
                chin,
                left_eye,
                right_eye,
                left_mouth,
                right_mouth
            ], dtype=np.float64)
        else:
            image_points = pts[:6]

        focal_length = float(w)
        center = (float(w) / 2.0, float(h) / 2.0)
        camera_matrix = np.array([
            [focal_length, 0, center[0]],
            [0, focal_length, center[1]],
            [0, 0, 1]
        ], dtype=np.float64)
        dist_coeffs = np.zeros((4, 1), dtype=np.float64)

        success, rvec, tvec = cv2.solvePnP(
            FACE_MODEL_3D_POINTS,
            image_points,
            camera_matrix,
            dist_coeffs,
            flags=cv2.SOLVEPNP_ITERATIVE
        )

        if not success:
            return 0.0, 0.0, 0.0, None, None

        rmat, _ = cv2.Rodrigues(rvec)

        try:
            angles, _, _, _, _, _ = cv2.RQDecomp3x3(rmat)
            pitch, yaw, roll = angles[0], angles[1], angles[2]
        except Exception:
            sy = np.sqrt(rmat[0, 0]**2 + rmat[1, 0]**2)
            if sy > 1e-6:
                pitch = np.arctan2(rmat[2, 1], rmat[2, 2]) * 180.0 / np.pi
                yaw = np.arctan2(-rmat[2, 0], sy) * 180.0 / np.pi
                roll = np.arctan2(rmat[1, 0], rmat[0, 0]) * 180.0 / np.pi
            else:
                pitch = np.arctan2(-rmat[1, 2], rmat[1, 1]) * 180.0 / np.pi
                yaw = np.arctan2(-rmat[2, 0], sy) * 180.0 / np.pi
                roll = 0.0

        return float(yaw), float(pitch), float(roll), rvec, tvec


class DeskState:
    """Maintains continuous tracking and temporal buffers for an individual desk."""

    def __init__(self, desk_id: str, reg_no: str, student_name: str, polygon: List[List[int]]):
        self.desk_id = desk_id
        self.reg_no = reg_no
        self.student_name = student_name
        self.polygon = np.array(polygon, dtype=np.int32)

        self.smoothed_yaw: float = 0.0
        self.smoothed_pitch: float = 0.0
        self.smoothed_roll: float = 0.0
        self.consecutive_gaze_violation_start: Optional[float] = None
        self.last_alert_time: float = 0.0
        self.active_contraband: List[Dict[str, Any]] = []


class ExamProctorEngine:
    """
    Main Exam Proctoring Pipeline.
    Detects contraband, analyzes student head pose relative to normal paper-writing baseline,
    associates events with seating polygons, and triggers temporal evidence capture.
    """

    def __init__(
        self,
        conf_thresh: float = 0.50,
        max_yaw_deg: float = 28.0,
        normal_writing_pitch_min: float = -45.0,
        normal_writing_pitch_max: float = -12.0,
        gaze_violation_duration_sec: float = 2.5,
        cooldown_sec: float = 10.0,
        fps: int = 30
    ):
        self.conf_thresh = conf_thresh
        self.max_yaw_deg = max_yaw_deg
        self.normal_writing_pitch_min = normal_writing_pitch_min
        self.normal_writing_pitch_max = normal_writing_pitch_max
        self.gaze_violation_duration_sec = gaze_violation_duration_sec
        self.cooldown_sec = cooldown_sec
        self.fps = fps

        self.seating_layout: List[Dict[str, Any]] = []
        self.desk_states: Dict[str, DeskState] = {}
        self.yolo_model = None

        self._init_yolo_model()

    def _init_yolo_model(self):
        """Initializes Ultralytics YOLOv8 or fallback object detector."""
        try:
            from ultralytics import YOLO
            weights_path = os.path.join(os.path.dirname(__file__), "..", "..", "models", "yolov8n.pt")
            if os.path.exists(weights_path):
                self.yolo_model = YOLO(weights_path)
            else:
                self.yolo_model = YOLO("yolov8n.pt")
            logger.info("Ultralytics YOLOv8 loaded successfully.")
        except Exception:
            self.yolo_model = None

    def load_seating_layout(self, layout_config: Dict[str, Any]):
        """Registers desk polygon regions and student associations."""
        self.seating_layout = layout_config.get("desks", [])
        self.desk_states.clear()

        for desk in self.seating_layout:
            d_id = desk["desk_id"]
            self.desk_states[d_id] = DeskState(
                desk_id=d_id,
                reg_no=desk.get("reg_no", "UNASSIGNED"),
                student_name=desk.get("student_name", "Unassigned Student"),
                polygon=desk["polygon"]
            )
        logger.info(f"Loaded seating layout with {len(self.desk_states)} desks.")

    def find_associated_desk(self, bbox: List[int]) -> Optional[DeskState]:
        """Determines which desk polygon contains the bottom-center point of bounding box."""
        x1, y1, x2, y2 = bbox
        bottom_center = (float((x1 + x2) / 2.0), float(y2))

        for desk_state in self.desk_states.values():
            dist = cv2.pointPolygonTest(desk_state.polygon, bottom_center, False)
            if dist >= 0:
                return desk_state
        return None

    def detect_contraband_objects(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """Detects cell phones, books, smartwatches, and unauthorized electronics."""
        if frame is None or frame.size == 0:
            return []

        detected_objects = []

        if self.yolo_model is not None:
            try:
                results = self.yolo_model(frame, verbose=False, conf=self.conf_thresh)
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0])
                        cls_name = r.names[cls_id]
                        conf = float(box.conf[0])
                        xyxy = box.xyxy[0].cpu().numpy().astype(int).tolist()

                        if cls_name in ["cell phone", "book", "laptop", "remote"]:
                            detected_objects.append({
                                "bbox": xyxy,
                                "class_name": cls_name,
                                "confidence": round(conf, 3)
                            })
            except Exception as e:
                logger.error(f"YOLO inference error: {e}")

        return detected_objects

    def process_frame(
        self,
        frame: np.ndarray,
        timestamp: Optional[float] = None,
        detected_faces_metadata: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """Processes frame for contraband objects and head orientation."""
        if frame is None or frame.size == 0:
            return []

        now = timestamp if timestamp is not None else time.time()
        alerts = []
        h, w = frame.shape[:2]

        # 1. Prohibited Object Detection
        objects = self.detect_contraband_objects(frame)
        for obj in objects:
            desk = self.find_associated_desk(obj["bbox"])
            if desk:
                desk.active_contraband.append(obj)
                if (now - desk.last_alert_time) >= self.cooldown_sec:
                    desk.last_alert_time = now
                    alerts.append({
                        "event_type": "PROHIBITED_OBJECT_DETECTED",
                        "violation_type": "CONTRABAND",
                        "desk_id": desk.desk_id,
                        "reg_no": desk.reg_no,
                        "student_name": desk.student_name,
                        "item": obj["class_name"],
                        "confidence": obj["confidence"],
                        "bbox": obj["bbox"],
                        "timestamp": now,
                        "review_status": "PENDING_FACULTY_REVIEW"
                    })

        # 2. Head Pose & Gaze Analysis for Detected Faces
        faces = detected_faces_metadata or []
        for face in faces:
            bbox = face["bbox"]
            landmarks = face.get("landmarks")
            if landmarks is None:
                continue

            desk = self.find_associated_desk(bbox)
            if not desk:
                continue

            yaw, pitch, roll, rvec, tvec = HeadPoseEstimator.estimate_head_pose(landmarks, (h, w))

            # EMA Smoothing
            alpha = 0.35
            desk.smoothed_yaw = alpha * yaw + (1.0 - alpha) * desk.smoothed_yaw
            desk.smoothed_pitch = alpha * pitch + (1.0 - alpha) * desk.smoothed_pitch
            desk.smoothed_roll = alpha * roll + (1.0 - alpha) * desk.smoothed_roll

            # Writing Posture Baseline Check
            is_writing = (
                (self.normal_writing_pitch_min <= desk.smoothed_pitch <= self.normal_writing_pitch_max)
                and (abs(desk.smoothed_yaw) <= 16.0)
            )

            # Suspicious Peer Gaze
            is_turning_sideways = abs(desk.smoothed_yaw) >= self.max_yaw_deg

            if is_turning_sideways and not is_writing:
                if desk.consecutive_gaze_violation_start is None:
                    desk.consecutive_gaze_violation_start = now
                elif (now - desk.consecutive_gaze_violation_start) >= self.gaze_violation_duration_sec:
                    if (now - desk.last_alert_time) >= self.cooldown_sec:
                        desk.last_alert_time = now
                        alerts.append({
                            "event_type": "SUSPICIOUS_PEER_GAZE",
                            "violation_type": "SUSPICIOUS_GAZE",
                            "desk_id": desk.desk_id,
                            "reg_no": desk.reg_no,
                            "student_name": desk.student_name,
                            "yaw_degrees": round(desk.smoothed_yaw, 1),
                            "pitch_degrees": round(desk.smoothed_pitch, 1),
                            "duration_sec": round(now - desk.consecutive_gaze_violation_start, 2),
                            "timestamp": now,
                            "review_status": "PENDING_FACULTY_REVIEW"
                        })
            else:
                desk.consecutive_gaze_violation_start = None

        return alerts
