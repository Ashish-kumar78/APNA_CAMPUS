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

    PROJECT_ROOT = PROJECT_ROOT
    BASE_DIR = BASE_DIR

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
    # MODEL 1: Deep Face Attendance & Anti-Spoofing (AdaFace IR-50)
    # -------------------------------------------------------------------------
    ACTIVE_RECOGNITION_MODEL = os.getenv("RECOGNITION_MODEL", "AdaFace")
    RECOGNITION_BACKBONE = "IR-50"
    RECOGNITION_DIM = int(os.getenv("RECOGNITION_DIM", "512"))
    # Calibrated on empirical dataset ROC: 0.40 yields FAR = 0.00% & FRR = 5.33%
    FACE_SIMILARITY_THRESHOLD = float(os.getenv("FACE_SIMILARITY_THRESHOLD", "0.40"))
    FACE_LIVENESS_THRESHOLD = float(os.getenv("FACE_LIVENESS_THRESHOLD", "0.50"))
    FACE_CONSECUTIVE_FRAMES_REQUIRED = int(os.getenv("FACE_CONSECUTIVE_FRAMES", "3"))
    FACE_TEMPORAL_WINDOW = int(os.getenv("FACE_TEMPORAL_WINDOW", "5"))
    FACE_CANONICAL_SIZE = (112, 112)

    # Face Quality Assessment (FQA) Pre-Filter
    FACE_MIN_IPD = float(os.getenv("FACE_MIN_IPD", "24.0"))  # Inter-Pupillary Distance (px)
    FACE_MIN_BLUR = float(os.getenv("FACE_MIN_BLUR", "35.0"))  # Laplacian variance
    FACE_MIN_BRIGHTNESS = float(os.getenv("FACE_MIN_BRIGHTNESS", "35.0"))
    FACE_MAX_BRIGHTNESS = float(os.getenv("FACE_MAX_BRIGHTNESS", "225.0"))

    # -------------------------------------------------------------------------
    # Image Quality & Adaptive Lighting Enhancement (Section 1)
    # -------------------------------------------------------------------------
    IMAGE_QUALITY_GREEN_BRIGHTNESS_MIN = float(os.getenv("IMG_QUALITY_GREEN_BRIGHTNESS_MIN", "50.0"))
    IMAGE_QUALITY_GREEN_BRIGHTNESS_MAX = float(os.getenv("IMG_QUALITY_GREEN_BRIGHTNESS_MAX", "210.0"))
    IMAGE_QUALITY_GREEN_CONTRAST_MIN = float(os.getenv("IMG_QUALITY_GREEN_CONTRAST_MIN", "25.0"))
    IMAGE_QUALITY_GREEN_BLUR_MIN = float(os.getenv("IMG_QUALITY_GREEN_BLUR_MIN", "40.0"))
    IMAGE_QUALITY_RED_BRIGHTNESS_MIN = float(os.getenv("IMG_QUALITY_RED_BRIGHTNESS_MIN", "20.0"))
    IMAGE_QUALITY_RED_BRIGHTNESS_MAX = float(os.getenv("IMG_QUALITY_RED_BRIGHTNESS_MAX", "240.0"))
    IMAGE_QUALITY_RED_BLUR_MIN = float(os.getenv("IMG_QUALITY_RED_BLUR_MIN", "18.0"))
    ENABLE_ADAPTIVE_ENHANCEMENT = os.getenv("ENABLE_ADAPTIVE_ENHANCEMENT", "true").lower() == "true"
    CLAHE_CLIP_LIMIT = float(os.getenv("CLAHE_CLIP_LIMIT", "3.0"))
    CLAHE_GRID_SIZE = (8, 8)

    # -------------------------------------------------------------------------
    # Head Pose Estimation & Occlusion (Section 5)
    # -------------------------------------------------------------------------
    MAX_ALLOWABLE_YAW = float(os.getenv("MAX_ALLOWABLE_YAW", "35.0"))      # degrees
    MAX_ALLOWABLE_PITCH = float(os.getenv("MAX_ALLOWABLE_PITCH", "30.0"))  # degrees
    MAX_ALLOWABLE_ROLL = float(os.getenv("MAX_ALLOWABLE_ROLL", "30.0"))    # degrees
    ENABLE_BEST_FRAME_SELECTION = True
    BEST_FRAME_BUFFER_SIZE = int(os.getenv("BEST_FRAME_BUFFER_SIZE", "5"))

    # -------------------------------------------------------------------------
    # Unknown Student & Evidence Vault (Section 2)
    # -------------------------------------------------------------------------
    EVIDENCE_VAULT_DIR = os.path.join(PROJECT_ROOT, "evidence_vault")
    UNKNOWN_STUDENTS_DIR = os.path.join(EVIDENCE_VAULT_DIR, "unknown_students")
    UNKNOWN_SIMILARITY_MAX = float(os.getenv("UNKNOWN_SIMILARITY_MAX", "0.40"))

    # -------------------------------------------------------------------------
    # Cross-Section & Timetable Validation (Section 3)
    # -------------------------------------------------------------------------
    ACTIVE_CLASSROOM = os.getenv("ACTIVE_CLASSROOM", "CR-101")
    ACTIVE_DEPARTMENT = os.getenv("ACTIVE_DEPARTMENT", "CSE")
    ACTIVE_SEMESTER = int(os.getenv("ACTIVE_SEMESTER", "5"))
    ACTIVE_SECTION = os.getenv("ACTIVE_SECTION", "A")
    ACTIVE_SUBJECT = os.getenv("ACTIVE_SUBJECT", "Artificial Intelligence")
    ATTENDANCE_WINDOW_MINUTES = int(os.getenv("ATTENDANCE_WINDOW_MINUTES", "15"))
    CLASS_DURATION_MINUTES = int(os.getenv("CLASS_DURATION_MINUTES", "60"))
    MIN_ATTENDANCE_RATIO = float(os.getenv("MIN_ATTENDANCE_RATIO", "0.70"))  # 70% duration for FULL_ATTENDANCE

    # -------------------------------------------------------------------------
    # Camera Health & Stream Monitoring (Section 4)
    # -------------------------------------------------------------------------
    FROZEN_FRAME_DIFF_THRESHOLD = float(os.getenv("FROZEN_FRAME_DIFF_THRESHOLD", "0.5"))
    FROZEN_SECONDS_THRESHOLD = float(os.getenv("FROZEN_SECONDS_THRESHOLD", "3.0"))
    CAMERA_HEARTBEAT_TIMEOUT_SEC = float(os.getenv("CAMERA_HEARTBEAT_TIMEOUT_SEC", "3.5"))
    MIN_OPERATIONAL_FPS = float(os.getenv("MIN_OPERATIONAL_FPS", "5.0"))

    # -------------------------------------------------------------------------
    # Attendance Confidence & Verification Engine (Section 9)
    # -------------------------------------------------------------------------
    CONFIDENCE_PASS_THRESHOLD = float(os.getenv("CONFIDENCE_PASS_THRESHOLD", "0.70"))
    CONFIDENCE_WEIGHT_SIMILARITY = 0.30
    CONFIDENCE_WEIGHT_LIVENESS = 0.20
    CONFIDENCE_WEIGHT_QUALITY = 0.15
    CONFIDENCE_WEIGHT_POSE = 0.15
    CONFIDENCE_WEIGHT_TRACK = 0.20

    # Model Weights & Face Databases
    YUNET_MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "face_detection_yunet_2023mar.onnx")
    ADAFACE_MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "adaface_ir50_ms1mv2.onnx")
    SFACE_MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "face_recognition_sface_2021dec.onnx")
    SFACE_BACKUP_PATH = os.path.join(PROJECT_ROOT, "models", "face_database_sface_backup.npz")
    ADAFACE_DB_PATH = os.path.join(PROJECT_ROOT, "models", "adaface_database.npz")
    LEGACY_EMBEDDINGS_PKL = os.path.join(PROJECT_ROOT, "models", "deep_embeddings.pkl")
    STUDENTS_JSON_PATH = os.path.join(PROJECT_ROOT, "models", "students.json")
    FACE_DB_PATH = os.path.join(PROJECT_ROOT, "models", "face_database.npz")
    MIGRATION_METADATA_PATH = os.path.join(PROJECT_ROOT, "models", "migration_metadata.json")
    TIMETABLE_JSON_PATH = os.path.join(PROJECT_ROOT, "models", "timetable.json")

    # Local Attendance Logs Directory
    ATTENDANCE_LOGS_DIR = os.path.join(PROJECT_ROOT, "attendance_logs")

    # -------------------------------------------------------------------------
    # Backend & Cloud Integration (Neon PostgreSQL + APNA_CAMPUS)
    # -------------------------------------------------------------------------
    NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL", "")
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
    BACKEND_ATTENDANCE_ENDPOINT = "/api/attendance/face-sync"
    OFFLINE_ATTENDANCE_CACHE = os.path.join(PROJECT_ROOT, "pending_attendance_sync.json")
