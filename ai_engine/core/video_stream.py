"""
High-Performance Threaded Video Capture & Multi-Camera Manager
Eliminates RTSP/IP camera buffer lag, provides pre-flight socket testing,
and guarantees automatic reconnection for 24/7 CCTV operation.
"""

import os
import sys
import time
import socket
import logging
import threading
from urllib.parse import urlparse
from typing import Optional, Tuple, Dict, Any, Union

import cv2
import numpy as np

logger = logging.getLogger("VideoStream")


def format_camera_url(source: Union[int, str]) -> str:
    """
    Normalizes camera sources:
    - Digits or integers (0, 1, "0") return local camera index.
    - IP addresses like "192.168.43.1:8080" become "http://192.168.43.1:8080/video".
    - RTSP / HTTP streams preserve their scheme and append /video if needed.
    """
    if source is None:
        return "0"

    src_str = str(source).strip()

    # Local webcam index (e.g. 0, 1, 2)
    if src_str.isdigit():
        return src_str

    # IP Webcam app shorthand without protocol: e.g. "192.168.43.1:8080"
    if not (src_str.startswith("http://") or src_str.startswith("https://") or src_str.startswith("rtsp://")):
        src_str = f"http://{src_str}"

    # For standard Android IP Webcam apps: if user passed http://ip:port without path, add /video
    if src_str.startswith("http://") or src_str.startswith("https://"):
        parsed = urlparse(src_str)
        if not parsed.path or parsed.path == "/":
            src_str = f"{src_str.rstrip('/')}/video"

    return src_str


def probe_network_camera(url: str, timeout_sec: float = 1.5) -> Tuple[bool, str]:
    """
    Performs a lightweight TCP handshake test before initializing OpenCV.
    Prevents OpenCV from hanging indefinitely on unreachable IP webcam / RTSP ports.
    """
    if not (url.startswith("http://") or url.startswith("https://") or url.startswith("rtsp://")):
        return True, "Local or device source"

    try:
        parsed = urlparse(url)
        host = parsed.hostname
        port = parsed.port
        if not host:
            return False, f"Invalid camera URL host in '{url}'"
        if not port:
            port = 554 if url.startswith("rtsp://") else 80

        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout_sec)
        result = sock.connect_ex((host, port))
        sock.close()

        if result == 0:
            return True, f"Connection to {host}:{port} succeeded"
        else:
            return False, f"TCP Port {port} on {host} is unreachable (error code {result}). Verify phone IP & hotspot."
    except Exception as e:
        return False, f"Socket error testing {url}: {str(e)}"


class ThreadedVideoCapture:
    """
    Low-latency non-blocking video capture thread.
    Continuously drains camera hardware buffer and maintains only the newest frame.
    """

    def __init__(
        self,
        src: Union[int, str] = 0,
        name: str = "CAM-01",
        target_fps: int = 30,
        auto_reconnect: bool = True,
        reconnect_timeout_sec: float = 3.0
    ):
        self.src = int(src) if str(src).isdigit() else str(src)
        self.name = name
        self.target_fps = target_fps
        self.auto_reconnect = auto_reconnect
        self.reconnect_timeout_sec = reconnect_timeout_sec

        self.cap: Optional[cv2.VideoCapture] = None
        self.latest_frame: Optional[np.ndarray] = None
        self.grabbed: bool = False
        self.is_running: bool = False
        self.lock = threading.Lock()
        self.thread: Optional[threading.Thread] = None

        # Telemetry metrics
        self.fps_actual: float = 0.0
        self.frame_count: int = 0
        self._fps_start_time = time.time()
        self._last_successful_frame_time = time.time()

        self._connect()

    def _connect(self) -> bool:
        """Connects or reconnects to the video stream."""
        if isinstance(self.src, str) and (self.src.startswith("http://") or self.src.startswith("rtsp://")):
            is_reachable, reason = probe_network_camera(self.src, timeout_sec=2.0)
            if not is_reachable:
                logger.warning(f"[{self.name}] Camera probe failed: {reason}")
                return False

        logger.info(f"[{self.name}] Opening camera source: {self.src}")
        self.cap = cv2.VideoCapture(self.src)

        if not self.cap.isOpened():
            logger.error(f"[{self.name}] Failed to open video source: {self.src}")
            return False

        try:
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        except Exception:
            pass

        self.grabbed, self.latest_frame = self.cap.read()
        if self.grabbed and self.latest_frame is not None:
            self._last_successful_frame_time = time.time()
            logger.info(f"[{self.name}] Successfully opened stream! Resolution: {self.latest_frame.shape[1]}x{self.latest_frame.shape[0]}")
            return True
        else:
            logger.warning(f"[{self.name}] VideoCapture opened but first frame read was empty.")
            return False

    def start(self) -> "ThreadedVideoCapture":
        """Starts background frame reader daemon thread."""
        if self.is_running:
            return self

        self.is_running = True
        self.thread = threading.Thread(target=self._capture_loop, daemon=True, name=f"Thread-{self.name}")
        self.thread.start()
        return self

    def _capture_loop(self):
        """Continuously pulls frames in background to purge internal buffer."""
        while self.is_running:
            if self.cap is None or not self.cap.isOpened():
                if self.auto_reconnect:
                    time.sleep(self.reconnect_timeout_sec)
                    self._connect()
                else:
                    break
                continue

            grabbed, frame = self.cap.read()
            now = time.time()

            if grabbed and frame is not None and frame.size > 0:
                with self.lock:
                    self.grabbed = True
                    self.latest_frame = frame
                    self._last_successful_frame_time = now

                self.frame_count += 1
                elapsed = now - self._fps_start_time
                if elapsed >= 1.0:
                    self.fps_actual = self.frame_count / elapsed
                    self.frame_count = 0
                    self._fps_start_time = now
            else:
                time.sleep(0.01)
                if self.auto_reconnect and (now - self._last_successful_frame_time > self.reconnect_timeout_sec):
                    logger.warning(f"[{self.name}] Stream stalled. Reconnecting...")
                    self._release_cap()
                    self._connect()

    def read(self) -> Tuple[bool, Optional[np.ndarray]]:
        """Returns the freshest frame with zero camera lag."""
        with self.lock:
            if not self.grabbed or self.latest_frame is None:
                return False, None
            return True, self.latest_frame.copy()

    def get_fps(self) -> float:
        """Returns smoothed real-time capture frames per second."""
        return self.fps_actual

    def _release_cap(self):
        try:
            if self.cap is not None:
                self.cap.release()
                self.cap = None
        except Exception:
            pass

    def stop(self):
        """Terminates capture thread and releases camera hardware."""
        self.is_running = False
        if self.thread is not None and self.thread.is_alive():
            self.thread.join(timeout=1.0)
        self._release_cap()
        logger.info(f"[{self.name}] Video capture stopped and released.")


class MultiCameraManager:
    """Manages multiple simultaneous CCTV streams across classrooms and exam halls."""

    def __init__(self):
        self.cameras: Dict[str, ThreadedVideoCapture] = {}

    def add_camera(self, camera_id: str, src: Union[int, str]) -> ThreadedVideoCapture:
        """Initializes and starts a camera stream."""
        if camera_id in self.cameras:
            return self.cameras[camera_id]

        cam = ThreadedVideoCapture(src=src, name=camera_id)
        cam.start()
        self.cameras[camera_id] = cam
        return cam

    def get_frame(self, camera_id: str) -> Tuple[bool, Optional[np.ndarray]]:
        """Retrieves newest frame for requested camera."""
        if camera_id not in self.cameras:
            return False, None
        return self.cameras[camera_id].read()

    def stop_all(self):
        """Shuts down all active camera threads."""
        for name, cam in self.cameras.items():
            cam.stop()
        self.cameras.clear()
