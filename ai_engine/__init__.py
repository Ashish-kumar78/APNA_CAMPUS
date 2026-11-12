"""
Smart Campus CCTV Face Attendance & Anti-Spoofing AI Engine
Deep Learning Architecture:
- Primary Detector: OpenCV YuNet Deep CNN Face Detector (ONNX) with 5-point landmarks
- Primary Recognizer: SFace / ArcFace Deep Metric Embedding (128-D / 512-D)
- Passive Anti-Spoofing Triad: 2D FFT Frequency, Laplacian Texture, YCrCb Chrominance
- Tracking: ByteTrack Multi-Person Association Tracker
- Database: Direct Neon PostgreSQL Cloud Sync + local CSV logging
"""

__version__ = "2.3.0"
__author__ = "Antigravity Senior CV & DL AI Architecture Team"

from ai_engine.config import Config
from ai_engine.models.face_engine import FaceAttendanceEngine
from ai_engine.core.video_stream import ThreadedVideoCapture, MultiCameraManager, probe_network_camera
from ai_engine.core.tracker import SimpleByteTracker
from ai_engine.core.event_manager import CentralAIEventManager
from ai_engine.services.backend_client import ApnaCampusBackendClient

__all__ = [
    "Config",
    "FaceAttendanceEngine",
    "ThreadedVideoCapture",
    "MultiCameraManager",
    "probe_network_camera",
    "SimpleByteTracker",
    "CentralAIEventManager",
    "ApnaCampusBackendClient",
]
