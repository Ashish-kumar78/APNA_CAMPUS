"""
Exam Malpractice Temporal Evidence Vault & Circular Video Serialization
Stores pre-incident rolling frames and writes tamper-evident reviewable
MP4 clips and annotated JPG snapshots upon confirmed suspicious events.
"""

import os
import time
import logging
from collections import deque
from typing import Optional, Dict, Any, List, Tuple
import numpy as np

import cv2

logger = logging.getLogger("EvidenceVault")


class EvidenceVault:
    """Circular sliding-window video recorder and snapshot packager."""

    def __init__(
        self,
        vault_dir: str = "./evidence_vault",
        buffer_size: int = 30,
        cooldown_sec: float = 10.0,
        fps: int = 30
    ):
        self.vault_dir = os.path.abspath(vault_dir)
        self.buffer_size = buffer_size
        self.cooldown_sec = cooldown_sec
        self.fps = fps

        os.makedirs(self.vault_dir, exist_ok=True)
        self.frame_buffer = deque(maxlen=self.buffer_size)
        self.last_incident_timestamps: Dict[str, float] = {}

    def append_frame(self, frame: np.ndarray, timestamp: Optional[float] = None):
        """Adds a video frame to circular memory buffer."""
        if frame is not None and frame.size > 0:
            ts = timestamp if timestamp is not None else time.time()
            self.frame_buffer.append((frame.copy(), ts))

    def record_incident(
        self,
        incident_key: str,
        violation_type: str,
        desk_id: str,
        annotated_frame: np.ndarray,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Exports snapshot and serialized video clip if cooldown threshold is passed.
        Returns incident dictionary or None if throttled.
        """
        now = time.time()
        last_time = self.last_incident_timestamps.get(incident_key, 0.0)
        if (now - last_time) < self.cooldown_sec:
            return None

        self.last_incident_timestamps[incident_key] = now
        timestamp_str = time.strftime("%Y%m%d_%H%M%S")
        safe_desk = str(desk_id).replace(" ", "_").replace("-", "_")
        safe_type = str(violation_type).replace(" ", "_").lower()
        base_name = f"evidence_{safe_desk}_{safe_type}_{timestamp_str}"

        # 1. Save keyframe snapshot (.jpg)
        snapshot_path = os.path.join(self.vault_dir, f"{base_name}.jpg")
        cv2.imwrite(snapshot_path, annotated_frame)

        # 2. Serialize rolling buffer to MP4 clip
        clip_path = os.path.join(self.vault_dir, f"{base_name}.mp4")
        saved_video = False

        if len(self.frame_buffer) > 0:
            try:
                sample_frame = self.frame_buffer[0][0]
                h, w = sample_frame.shape[:2]
                fourcc = cv2.VideoWriter_fourcc(*"mp4v")
                writer = cv2.VideoWriter(clip_path, fourcc, float(self.fps), (w, h))

                for buf_frame, _ in self.frame_buffer:
                    writer.write(buf_frame)
                writer.release()
                saved_video = True
            except Exception as e:
                logger.error(f"Failed to serialize incident video clip: {e}")

        logger.info(f"🚨 Recorded Malpractice Evidence: {snapshot_path}")

        incident_record = {
            "incident_id": base_name,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "unix_timestamp": now,
            "desk_id": desk_id,
            "violation_type": violation_type,
            "snapshot_path": snapshot_path,
            "clip_path": clip_path if saved_video else None,
            "review_status": "PENDING_FACULTY_REVIEW",
            "metadata": metadata or {}
        }

        return incident_record
