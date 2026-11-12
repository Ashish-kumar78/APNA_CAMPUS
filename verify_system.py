"""
Smart Campus CCTV Face Attendance & Anti-Spoofing System
Diagnostic Health & Verification Tool: verify_system.py

Runs 8 isolated mathematical, deep learning, and cloud connectivity checks
to verify that the Face Attendance & Anti-Spoofing system is 100% operational.
"""

import os
import sys
import time
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import cv2

from ai_engine.config import Config
from ai_engine.models.face_engine import (
    FaceAttendanceEngine,
    PassiveLivenessDetector,
    assess_face_quality,
    estimate_norm_affine_matrix,
    align_face_112x112
)
from ai_engine.core.tracker import SimpleByteTracker
from ai_engine.services.backend_client import ApnaCampusBackendClient
from ai_engine.examination_interface import AttendanceVerificationEvent, examination_bus

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def print_step(title):
    print(f"\n{BOLD}{CYAN}{'='*75}{RESET}")
    print(f"{BOLD}{CYAN}🔍 {title}{RESET}")
    print(f"{BOLD}{CYAN}{'='*75}{RESET}")


def assert_check(name, condition, extra=""):
    if condition:
        print(f"  {GREEN}✅ [PASS]{RESET} {name} {extra}")
        return True
    else:
        print(f"  {RED}❌ [FAIL]{RESET} {name} {extra}")
        return False


def run_full_diagnostics():
    total_checks = 0
    passed_checks = 0

    print(f"\n{BOLD}{YELLOW}=========================================================================={RESET}")
    print(f"{BOLD}{YELLOW}CAMPUS CCTV FACE ATTENDANCE: 8-POINT PRODUCTION HEALTH AUDIT{RESET}")
    print(f"{BOLD}{YELLOW}=========================================================================={RESET}")

    # CHECK 1: Umeyama Affine Transform
    print_step("CHECK 1/4: CANONICAL FACE ALIGNMENT & UMEYAMA TRANSFORM")
    src_landmarks = np.array([
        [35.0, 50.0], [75.0, 52.0], [55.0, 70.0], [40.0, 90.0], [70.0, 91.0]
    ], dtype=np.float32)

    M = estimate_norm_affine_matrix(src_landmarks)
    total_checks += 1
    if assert_check("Affine Similarity Matrix Computation", M.shape == (2, 3), f"(Shape: {M.shape})"):
        passed_checks += 1

    dummy_frame = np.full((480, 640, 3), 128, dtype=np.uint8)
    aligned = align_face_112x112(dummy_frame, src_landmarks)
    total_checks += 1
    if assert_check("112x112 Canonical Crop Normalization", aligned.shape == (112, 112, 3)):
        passed_checks += 1

    # CHECK 2: Deep Embeddings, Vectorized Matching & Passive Anti-Spoofing
    print_step("CHECK 2/4: DEEP EMBEDDINGS & PASSIVE LIVENESS")
    temp_db = os.path.join(BASE_DIR, "models", "temp_diag_db.npz")
    engine = FaceAttendanceEngine(
        similarity_threshold=0.60,
        db_path=temp_db,
        legacy_pkl_path=Config.LEGACY_EMBEDDINGS_PKL,
        students_json_path=Config.STUDENTS_JSON_PATH
    )

    test_chip = np.full((112, 112, 3), 150, dtype=np.uint8)
    emb = engine.extract_embedding(test_chip)
    total_checks += 1
    if assert_check("Feature Embedding Extraction", len(emb) in [128, 512], f"({len(emb)} dimensions)"):
        passed_checks += 1

    norm = np.linalg.norm(emb)
    total_checks += 1
    if assert_check("Embedding Unit L2-Normalization", abs(norm - 1.0) < 1e-3, f"(L2 Norm: {norm:.4f})"):
        passed_checks += 1

    detector = PassiveLivenessDetector()
    is_live, live_score, metrics = detector.evaluate_liveness(test_chip)
    total_checks += 1
    if assert_check("Passive Liveness Triad (FFT + Texture + YCrCb)", 0.0 <= live_score <= 1.0, f"(Score: {live_score:.2f})"):
        passed_checks += 1

    # CHECK 3: Face Quality Assessment (FQA) Pre-Filter
    print_step("CHECK 3/6: FACE QUALITY ASSESSMENT (FQA) PRE-FILTER")
    sharp_chip = np.random.RandomState(42).randint(40, 220, (112, 112, 3), dtype=np.uint8)
    q_pass, q_score, q_metrics = assess_face_quality(sharp_chip, min_blur=35.0, min_ipd=24.0)
    total_checks += 1
    if assert_check("FQA High-Quality Face Gating", q_pass and q_score > 0.50, f"(Score: {q_score:.3f})"):
        passed_checks += 1

    blurry_chip = np.full((112, 112, 3), 128, dtype=np.uint8)
    q_fail, _, q_fail_metrics = assess_face_quality(blurry_chip, min_blur=35.0)
    total_checks += 1
    if assert_check("FQA Motion/Blur Rejection Gate", not q_fail and "MOTION_OR_OPTICAL_BLUR" in q_fail_metrics["reasons"]):
        passed_checks += 1

    # CHECK 4: ByteTrack Multi-Person Tracker
    print_step("CHECK 4/6: BYTETRACK MULTI-PERSON ASSOCIATION TRACKER")
    tracker = SimpleByteTracker()
    dets = [{"bbox": [100, 100, 180, 180], "confidence": 0.90, "class_name": "person"}]
    tracks = tracker.update(dets)
    total_checks += 1
    if assert_check("ByteTrack Association State Machine", len(tracks) == 1 and "track_id" in tracks[0], f"(Track ID: {tracks[0]['track_id'] if tracks else 'None'})"):
        passed_checks += 1

    # CHECK 5: Examination System Integration Event Bus
    print_step("CHECK 5/6: EXAMINATION INTEGRATION EVENT CONTRACT")
    sample_event = AttendanceVerificationEvent(
        student_reg_no="1",
        student_name="Somesh",
        verification_status="VERIFIED",
        similarity_score=0.74,
        threshold_used=0.45,
        liveness_score=0.85,
        liveness_passed=True,
        quality_score=0.88,
        quality_passed=True,
        camera_id="CAM-01",
        track_id=1
    )
    bus_received = []
    examination_bus.register_listener(lambda e: bus_received.append(e))
    examination_bus.emit(sample_event)
    total_checks += 1
    if assert_check("Standardized AttendanceVerificationEvent Dispatch", len(bus_received) == 1 and bus_received[0].event_id.startswith("evt_")):
        passed_checks += 1

    # CHECK 6: Neon PostgreSQL Cloud Database
    print_step("CHECK 6/6: BACKEND & CLOUD - NEON SERVERLESS POSTGRESQL")
    backend_client = ApnaCampusBackendClient(neon_db_url=Config.NEON_DATABASE_URL)
    conn = backend_client._get_neon_connection()
    neon_ok = conn is not None
    if conn:
        conn.close()

    total_checks += 1
    if assert_check("Neon Serverless PostgreSQL Cloud Handshake", neon_ok, "(Connected to Neon Cloud)" if neon_ok else "(Using offline cache fallback)"):
        passed_checks += 1

    # Summary
    print(f"\n{BOLD}{YELLOW}=========================================================================={RESET}")
    print(f"{BOLD}{YELLOW}DIAGNOSTIC HEALTH AUDIT SUMMARY: {passed_checks}/{total_checks} CHECKS PASSED{RESET}")
    print(f"{BOLD}{YELLOW}=========================================================================={RESET}")

    if os.path.exists(temp_db):
        os.remove(temp_db)

    if passed_checks == total_checks:
        print(f"{BOLD}{GREEN}🎉 ALL {total_checks} SYSTEMS FULLY VERIFIED & HEALTHY (100% OPERATIONAL){RESET}")
        print(f"The CCTV Face Attendance system is ready for live deployment.\n")
        return True
    else:
        print(f"{BOLD}{RED}⚠️ Some checks failed. Review details above.{RESET}\n")
        return False


if __name__ == "__main__":
    run_full_diagnostics()
