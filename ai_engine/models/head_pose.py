"""
Multi-Frame Facial Recognition, Head Pose Estimation & Occlusion Module (head_pose.py)
Section 5: Head Movement, Face Rotation and Facial Occlusion

Provides:
- 3D Head Pose Estimation (Yaw, Pitch, Roll) from 5-point facial landmarks via Perspective-n-Point (PnP)
- Frontality classification: identifies looking down (writing notes), turned away (looking at board/peer), or occluded
- Multi-Frame Observation Buffer per Track: gathers observations across consecutive frames
- Best-Frame Selector: extracts embeddings from the clearest frontal observation, avoiding false rejections
"""

import math
import numpy as np
import cv2
from dataclasses import dataclass
from typing import Optional, Tuple, Dict, Any, List


@dataclass
class HeadPoseEstimate:
    """Estimated Euler angles and orientation classifications for a detected face."""
    yaw: float    # degrees: - = turned left, + = turned right
    pitch: float  # degrees: - = looking down, + = looking up
    roll: float   # degrees: head tilt sideways
    is_frontal: bool
    is_looking_down: bool
    is_turned_away: bool
    is_occluded: bool
    frontality_score: float  # 0.0 to 1.0 (1.0 = perfectly frontal)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "yaw": round(self.yaw, 1),
            "pitch": round(self.pitch, 1),
            "roll": round(self.roll, 1),
            "is_frontal": self.is_frontal,
            "is_looking_down": self.is_looking_down,
            "is_turned_away": self.is_turned_away,
            "is_occluded": self.is_occluded,
            "frontality_score": round(self.frontality_score, 3)
        }


@dataclass
class FaceObservation:
    """Single frame facial observation cached inside a track buffer."""
    timestamp: float
    face_chip: np.ndarray
    landmarks: np.ndarray
    pose: HeadPoseEstimate
    quality_score: float
    sharpness: float
    composite_weight: float


class HeadPoseEstimator:
    """
    Estimates 3D head pose from 2D 5-point landmarks using cv2.solvePnP with canonical 3D model.
    Detects yaw, pitch, roll, and lower-face occlusions (e.g. face masks or hands).
    """

    # 3D canonical anthropometric face coordinates (in mm)
    # Note: in computer vision image space, +Y is downwards (eyes above nose, mouth below nose)
    MODEL_POINTS_3D = np.array([
        [-30.0, -30.0,  0.0],  # Left Eye (above nose)
        [ 30.0, -30.0,  0.0],  # Right Eye (above nose)
        [  0.0,   0.0, 30.0],  # Nose Tip (projected forward +Z)
        [-20.0,  30.0,  0.0],  # Left Mouth Corner (below nose)
        [ 20.0,  30.0,  0.0]   # Right Mouth Corner (below nose)
    ], dtype=np.float32)

    def __init__(
        self,
        max_allowable_yaw: float = 35.0,
        max_allowable_pitch: float = 30.0,
        max_allowable_roll: float = 30.0
    ):
        self.max_yaw = max_allowable_yaw
        self.max_pitch = max_allowable_pitch
        self.max_roll = max_allowable_roll

    def estimate_pose(
        self,
        landmarks_5pts: np.ndarray,
        frame_shape: Tuple[int, int]
    ) -> HeadPoseEstimate:
        """
        Estimates Euler angles (Yaw, Pitch, Roll) from 5 landmarks:
        [left_eye, right_eye, nose, left_mouth, right_mouth].
        """
        if landmarks_5pts is None or len(landmarks_5pts) < 5:
            return HeadPoseEstimate(
                yaw=0.0, pitch=0.0, roll=0.0,
                is_frontal=True, is_looking_down=False, is_turned_away=False,
                is_occluded=False, frontality_score=0.5
            )

        pts_2d = np.asarray(landmarks_5pts[:5], dtype=np.float32)

        # Approximate camera intrinsic matrix based on frame dimensions
        h, w = frame_shape[:2]
        focal_length = float(w)
        center = (float(w) / 2.0, float(h) / 2.0)
        camera_matrix = np.array([
            [focal_length, 0.0, center[0]],
            [0.0, focal_length, center[1]],
            [0.0, 0.0, 1.0]
        ], dtype=np.float32)
        dist_coeffs = np.zeros((4, 1), dtype=np.float32)

        success = False
        rvec = None
        tvec = None
        try:
            success, rvec, tvec = cv2.solvePnP(
                self.MODEL_POINTS_3D,
                pts_2d,
                camera_matrix,
                dist_coeffs,
                flags=cv2.SOLVEPNP_EPNP
            )
        except Exception:
            success = False

        if not success or rvec is None:
            # Fallback to analytical 2D geometry ratios
            return self._analytical_fallback_pose(pts_2d)

        # Convert rotation vector to rotation matrix
        R, _ = cv2.Rodrigues(rvec)

        # Extract Euler angles from rotation matrix
        sy = math.sqrt(R[0, 0] * R[0, 0] + R[1, 0] * R[1, 0])
        singular = sy < 1e-6

        if not singular:
            pitch = math.atan2(R[2, 1], R[2, 2])
            yaw = math.atan2(-R[2, 0], sy)
            roll = math.atan2(R[1, 0], R[0, 0])
        else:
            pitch = math.atan2(-R[1, 2], R[1, 1])
            yaw = math.atan2(-R[2, 0], sy)
            roll = 0.0

        yaw_deg = float(np.degrees(yaw))
        pitch_deg = float(np.degrees(pitch))
        roll_deg = float(np.degrees(roll))

        # Detect mask / lower face occlusion: mouth distance vs eye distance ratio
        eye_dist = np.linalg.norm(pts_2d[0] - pts_2d[1])
        mouth_dist = np.linalg.norm(pts_2d[3] - pts_2d[4])
        occluded = False
        if eye_dist > 10.0 and (mouth_dist / eye_dist) < 0.20:
            occluded = True

        is_looking_down = pitch_deg < -20.0
        is_turned_away = abs(yaw_deg) > self.max_yaw or abs(pitch_deg) > self.max_pitch
        is_frontal = (
            abs(yaw_deg) <= 25.0 and
            abs(pitch_deg) <= 20.0 and
            abs(roll_deg) <= self.max_roll and
            not occluded
        )

        # Frontality score: 1.0 when perfectly facing camera, drops as yaw/pitch increase
        penalty = (abs(yaw_deg) / 45.0) * 0.5 + (abs(pitch_deg) / 45.0) * 0.5
        frontality_score = float(np.clip(1.0 - penalty, 0.0, 1.0))
        if occluded:
            frontality_score *= 0.5

        return HeadPoseEstimate(
            yaw=yaw_deg,
            pitch=pitch_deg,
            roll=roll_deg,
            is_frontal=is_frontal,
            is_looking_down=is_looking_down,
            is_turned_away=is_turned_away,
            is_occluded=occluded,
            frontality_score=frontality_score
        )

    def _analytical_fallback_pose(self, pts_2d: np.ndarray) -> HeadPoseEstimate:
        """2D landmark geometric symmetry fallback when solvePnP is degenerate."""
        left_eye, right_eye, nose, left_mouth, right_mouth = pts_2d[:5]

        # Roll: eye slope
        dy = right_eye[1] - left_eye[1]
        dx = right_eye[0] - left_eye[0]
        roll_deg = float(np.degrees(np.arctan2(dy, dx)))

        # Yaw: asymmetry of nose between eyes
        d_left = np.linalg.norm(nose - left_eye)
        d_right = np.linalg.norm(nose - right_eye)
        total = max(1.0, d_left + d_right)
        yaw_ratio = (d_right - d_left) / total
        yaw_deg = float(np.clip(yaw_ratio * 75.0, -75.0, 75.0))

        # Pitch: nose vertical position relative to eye midpoint and mouth midpoint
        eye_mid = (left_eye + right_eye) / 2.0
        mouth_mid = (left_mouth + right_mouth) / 2.0
        vertical_span = max(1.0, np.linalg.norm(mouth_mid - eye_mid))
        nose_y_offset = (nose[1] - eye_mid[1]) / vertical_span
        # Standard ratio ~0.55; if nose is close to mouth, pitch is negative (looking down)
        pitch_deg = float(np.clip((0.55 - nose_y_offset) * 80.0, -60.0, 60.0))

        is_looking_down = pitch_deg < -20.0
        is_turned_away = abs(yaw_deg) > self.max_yaw
        is_frontal = abs(yaw_deg) <= 25.0 and abs(pitch_deg) <= 20.0

        penalty = (abs(yaw_deg) / 45.0) * 0.5 + (abs(pitch_deg) / 45.0) * 0.5
        frontality_score = float(np.clip(1.0 - penalty, 0.0, 1.0))

        return HeadPoseEstimate(
            yaw=yaw_deg,
            pitch=pitch_deg,
            roll=roll_deg,
            is_frontal=is_frontal,
            is_looking_down=is_looking_down,
            is_turned_away=is_turned_away,
            is_occluded=False,
            frontality_score=frontality_score
        )


class MultiFrameObservationBuffer:
    """
    Maintains a sliding window of facial observations per tracked individual (track_id).
    Ranks observations by frontality, sharpness, and quality to pick the best frame for recognition.
    """

    def __init__(self, buffer_size: int = 5):
        self.buffer_size = buffer_size
        self.tracks: Dict[int, List[FaceObservation]] = {}

    def add_observation(
        self,
        track_id: int,
        timestamp: float,
        face_chip: np.ndarray,
        landmarks: np.ndarray,
        pose: HeadPoseEstimate,
        quality_score: float,
        sharpness: float
    ):
        """Appends a new observation to the track buffer."""
        if track_id not in self.tracks:
            self.tracks[track_id] = []

        # Composite frame weight combines frontality, sharpness, and overall quality
        composite_weight = (
            (0.40 * pose.frontality_score) +
            (0.35 * quality_score) +
            (0.25 * float(np.clip(sharpness / 120.0, 0.0, 1.0)))
        )

        obs = FaceObservation(
            timestamp=timestamp,
            face_chip=face_chip,
            landmarks=landmarks,
            pose=pose,
            quality_score=quality_score,
            sharpness=sharpness,
            composite_weight=composite_weight
        )

        self.tracks[track_id].append(obs)
        if len(self.tracks[track_id]) > self.buffer_size:
            self.tracks[track_id].pop(0)

    def get_best_observation(self, track_id: int) -> Optional[FaceObservation]:
        """
        Picks the best observation (most frontal and sharp) from the track history.
        Returns None if no observations exist.
        """
        obs_list = self.tracks.get(track_id, [])
        if not obs_list:
            return None

        # Return observation with highest composite weight
        return max(obs_list, key=lambda o: o.composite_weight)

    def prune_old_tracks(self, active_track_ids: List[int]):
        """Cleans up expired tracks that left the camera view."""
        active_set = set(active_track_ids)
        to_remove = [tid for tid in self.tracks if tid not in active_set]
        for tid in to_remove:
            del self.tracks[tid]
