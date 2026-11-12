"""
Global Configuration for Smart Campus CCTV Face Attendance Engine
Consolidates all Model 1 parameters, camera stream URLs, and Neon Cloud database targets.
"""

import os
from typing import Dict, Any
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))

# Load .env file
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))


class Config:
    """Central configuration class with safe defaults and environment variable overrides."""

    # -------------------------------------------------------------------------
    # Hardware & Performance
    # -------------------------------------------------------------------------
    DEVICE = os.getenv("DEVICE", "auto")
    TARGET_FPS = int(os.getenv("TARGET_FPS", "30"))
    INPUT_WIDTH = int(os.getenv("INPUT_WIDTH", "640"))
    INPUT_HEIGHT = int(os.getenv("INPUT_HEIGHT", "480"))

    # -------------------------------------------------------------------------
    # Video Streaming & Cameras (CCTV / IP Webcam / Mac Webcam)
    # -------------------------------------------------------------------------
    DEFAULT_CAMERA_SOURCE = os.getenv("CAMERA_SOURCE", "0")
    AUTO_RECONNECT = True
    RECONNECT_TIMEOUT_SEC = 3.0
    MAX_RECONNECT_ATTEMPTS = 10
    NETWORK_PROBE_TIMEOUT_SEC = 2.0

    # -------------------------------------------------------------------------
    # MODEL 1: Deep Face Attendance & Anti-Spoofing
    # -------------------------------------------------------------------------
    # Calibrated on empirical dataset ROC/EER: 0.45 yields FAR <= 0.04% & FRR <= 6.37%
    FACE_SIMILARITY_THRESHOLD = float(os.getenv("FACE_SIMILARITY_THRESHOLD", "0.45"))
    FACE_LIVENESS_THRESHOLD = float(os.getenv("FACE_LIVENESS_THRESHOLD", "0.50"))
    FACE_CONSECUTIVE_FRAMES_REQUIRED = int(os.getenv("FACE_CONSECUTIVE_FRAMES", "3"))
    FACE_TEMPORAL_WINDOW = int(os.getenv("FACE_TEMPORAL_WINDOW", "5"))
    FACE_CANONICAL_SIZE = (112, 112)

    # Face Quality Assessment (FQA) Pre-Filter
    FACE_MIN_IPD = float(os.getenv("FACE_MIN_IPD", "24.0"))  # Inter-Pupillary Distance (px)
    FACE_MIN_BLUR = float(os.getenv("FACE_MIN_BLUR", "35.0"))  # Laplacian variance
    FACE_MIN_BRIGHTNESS = float(os.getenv("FACE_MIN_BRIGHTNESS", "35.0"))
    FACE_MAX_BRIGHTNESS = float(os.getenv("FACE_MAX_BRIGHTNESS", "225.0"))

    # Model Weights & Face Databases
    YUNET_MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "face_detection_yunet_2023mar.onnx")
    SFACE_MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "face_recognition_sface_2021dec.onnx")
    LEGACY_EMBEDDINGS_PKL = os.path.join(PROJECT_ROOT, "models", "deep_embeddings.pkl")
    STUDENTS_JSON_PATH = os.path.join(PROJECT_ROOT, "models", "students.json")
    FACE_DB_PATH = os.path.join(PROJECT_ROOT, "models", "face_database.npz")

    # Local Attendance Logs Directory
    ATTENDANCE_LOGS_DIR = os.path.join(PROJECT_ROOT, "attendance_logs")

    # -------------------------------------------------------------------------
    # Backend & Cloud Integration (Neon PostgreSQL + APNA_CAMPUS)
    # -------------------------------------------------------------------------
    NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL", "")
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
    BACKEND_ATTENDANCE_ENDPOINT = "/api/attendance/face-sync"
    OFFLINE_ATTENDANCE_CACHE = os.path.join(PROJECT_ROOT, "pending_attendance_sync.json")
