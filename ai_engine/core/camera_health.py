"""
Real-Time CCTV Health Monitoring & Frozen Stream Detection Module (camera_health.py)
Section 4: CCTV Camera Offline or Connection Failure

Provides:
- Camera connection state machine: ONLINE, UNSTABLE, OFFLINE, RECORDING_FAILED, FROZEN, RECOVERING
- Real-time FPS monitoring and jitter detection
- Frozen frame detection via consecutive frame difference analysis
- Heartbeat tracking and automatic recovery orchestration
- Error categorizer and manual fallback trigger (never marks students absent on camera failure)
"""

import time
import logging
from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional, Tuple
import numpy as np

logger = logging.getLogger("CameraHealthMonitor")


@dataclass
class CameraHealthReport:
    """Current diagnostic health state of a CCTV camera stream."""
    camera_id: str
    classroom: str
    status: str  # ONLINE, UNSTABLE, OFFLINE, RECORDING_FAILED, FROZEN, RECOVERING
    current_fps: float
    last_frame_timestamp: float
    time_since_last_frame: float
    is_frozen: bool
    is_operational: bool
    error_category: Optional[str] = None
    alert_message: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "camera_id": self.camera_id,
            "classroom": self.classroom,
            "status": self.status,
            "current_fps": round(self.current_fps, 1),
            "last_frame_timestamp": self.last_frame_timestamp,
            "time_since_last_frame": round(self.time_since_last_frame, 2),
            "is_frozen": self.is_frozen,
            "is_operational": self.is_operational,
            "error_category": self.error_category,
            "alert_message": self.alert_message
        }


class CameraHealthMonitor:
    """
    Continuously monitors CCTV streams for drops, freezes, FPS drops, and disconnection.
    Triggers recovery and fallback alerts.
    """

    def __init__(
        self,
        camera_id: str = "CAM-01",
        classroom: str = "CR-101",
        heartbeat_timeout_sec: float = 3.5,
        frozen_seconds_threshold: float = 3.0,
        frozen_diff_threshold: float = 0.5,
        min_operational_fps: float = 5.0
    ):
        self.camera_id = camera_id
        self.classroom = classroom
        self.heartbeat_timeout = heartbeat_timeout_sec
        self.frozen_seconds_threshold = frozen_seconds_threshold
        self.frozen_diff_threshold = frozen_diff_threshold
        self.min_fps = min_operational_fps

        self.last_frame_time = time.time()
        self.prev_small_gray: Optional[np.ndarray] = None
        self.frozen_start_time: Optional[float] = None
        self.is_frozen = False

        self.frame_timestamps: List[float] = []
        self.total_frames = 0
        self.consecutive_empty_frames = 0
        self.current_status = "ONLINE"
        self.recovering = False

        # Incident Audit Log
        self.error_logs: List[Dict[str, Any]] = []

    def record_frame(self, frame: Optional[np.ndarray], timestamp: Optional[float] = None) -> CameraHealthReport:
        """
        Ingests a frame to update health telemetry, check for freezes, and calculate FPS.
        """
        now = timestamp if timestamp is not None else time.time()

        if frame is None or frame.size == 0:
            self.consecutive_empty_frames += 1
            if self.consecutive_empty_frames >= 10:
                self.current_status = "RECORDING_FAILED"
                msg = f"Camera {self.camera_id} connected but frames are empty/recording failed."
                self._log_incident("RECORDING_FAILED", msg)
                return CameraHealthReport(
                    camera_id=self.camera_id,
                    classroom=self.classroom,
                    status=self.current_status,
                    current_fps=0.0,
                    last_frame_timestamp=self.last_frame_time,
                    time_since_last_frame=now - self.last_frame_time,
                    is_frozen=False,
                    is_operational=False,
                    error_category="EMPTY_FRAME_STREAM",
                    alert_message=msg
                )

        self.consecutive_empty_frames = 0
        self.total_frames += 1
        prev_frame_time = self.last_frame_time
        self.last_frame_time = now

        # Maintain rolling FPS window (over last 30 frames)
        self.frame_timestamps.append(now)
        if len(self.frame_timestamps) > 30:
            self.frame_timestamps.pop(0)

        if len(self.frame_timestamps) >= 2:
            duration = self.frame_timestamps[-1] - self.frame_timestamps[0]
            current_fps = (len(self.frame_timestamps) - 1) / max(0.001, duration)
        else:
            current_fps = 30.0

        # Frozen Frame Detection: check difference against previous frame
        # Downsample to 80x60 for fast, robust frame difference MSE
        small = frame[::8, ::8]
        if len(small.shape) == 3:
            small_gray = np.mean(small, axis=2).astype(np.float32)
        else:
            small_gray = small.astype(np.float32)

        if self.prev_small_gray is not None and self.prev_small_gray.shape == small_gray.shape:
            diff = float(np.mean(np.abs(small_gray - self.prev_small_gray)))
            if diff < self.frozen_diff_threshold:
                if self.frozen_start_time is None:
                    self.frozen_start_time = prev_frame_time
                if (now - self.frozen_start_time) >= self.frozen_seconds_threshold:
                    self.is_frozen = True
            else:
                self.frozen_start_time = None
                self.is_frozen = False
        self.prev_small_gray = small_gray

        # Determine Health State
        error_cat = None
        alert_msg = ""

        if self.is_frozen:
            self.current_status = "FROZEN"
            error_cat = "FROZEN_VIDEO_FEED"
            alert_msg = f"Camera {self.camera_id} video stream is FROZEN for >{self.frozen_seconds_threshold}s."
            self._log_incident("FROZEN", alert_msg)
        elif current_fps < self.min_fps:
            self.current_status = "UNSTABLE"
            error_cat = "LOW_STREAM_FPS"
            alert_msg = f"Camera {self.camera_id} connection unstable (FPS={current_fps:.1f} < {self.min_fps})."
        else:
            self.current_status = "ONLINE"
            self.recovering = False

        is_op = (self.current_status in ("ONLINE", "UNSTABLE")) and not self.is_frozen

        return CameraHealthReport(
            camera_id=self.camera_id,
            classroom=self.classroom,
            status=self.current_status,
            current_fps=current_fps,
            last_frame_timestamp=self.last_frame_time,
            time_since_last_frame=0.0,
            is_frozen=self.is_frozen,
            is_operational=is_op,
            error_category=error_cat,
            alert_message=alert_msg
        )

    def check_heartbeat(self, current_time: Optional[float] = None) -> CameraHealthReport:
        """Called periodically or when stream stalls to detect OFFLINE camera state."""
        now = current_time if current_time is not None else time.time()
        time_since = now - self.last_frame_time

        if time_since >= self.heartbeat_timeout:
            if not self.recovering:
                self.current_status = "OFFLINE"
                msg = f"Camera {self.camera_id} disconnected (no frames for {time_since:.1f}s). Manual fallback required."
                self._log_incident("DISCONNECTION", msg)
            else:
                self.current_status = "RECOVERING"
                msg = f"Camera {self.camera_id} recovering (attempting auto-reconnection...)"

            return CameraHealthReport(
                camera_id=self.camera_id,
                classroom=self.classroom,
                status=self.current_status,
                current_fps=0.0,
                last_frame_timestamp=self.last_frame_time,
                time_since_last_frame=time_since,
                is_frozen=False,
                is_operational=False,
                error_category="STREAM_TIMEOUT",
                alert_message=msg
            )

        return CameraHealthReport(
            camera_id=self.camera_id,
            classroom=self.classroom,
            status=self.current_status,
            current_fps=0.0,
            last_frame_timestamp=self.last_frame_time,
            time_since_last_frame=time_since,
            is_frozen=self.is_frozen,
            is_operational=(self.current_status in ("ONLINE", "UNSTABLE") and not self.is_frozen)
        )

    def set_recovering(self, recovering: bool = True):
        self.recovering = recovering
        if recovering:
            self.current_status = "RECOVERING"

    def _log_incident(self, category: str, message: str):
        # Prevent spamming the incident log with the exact same category
        if self.error_logs and self.error_logs[-1]["category"] == category and (time.time() - self.error_logs[-1]["timestamp"]) < 10.0:
            return

        self.error_logs.append({
            "camera_id": self.camera_id,
            "category": category,
            "message": message,
            "timestamp": time.time(),
            "time_str": time.strftime("%Y-%m-%d %H:%M:%S")
        })
        logger.warning(f"🚨 CAMERA HEALTH: {message}")
