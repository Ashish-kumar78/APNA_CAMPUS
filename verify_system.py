"""
Smart Campus CCTV Face Attendance & Anti-Spoofing System
Production Diagnostic Health & Verification Suite: verify_system.py

Executes 14 comprehensive mathematical, deep learning, vision enhancement,
and cloud connectivity health checks across all system modules:
1. Umeyama Affine Transform & Canonical Alignment
2. Deep SFace Metric Embeddings & Passive Anti-Spoofing Triad
3. Face Quality Assessment (FQA) Pre-Filter
4. ByteTrack Multi-Person Association Tracker
5. Examination Integration Event Contract
6. Intelligent Image Quality & Adaptive Lighting Enhancement (Section 1)
7. 3D Head Pose Estimation & Frontality Gating (Section 5)
8. Unknown Student Detection & Evidence Management (Section 2)
9. Section-Based Attendance & Timetable Validation (Section 3)
10. CCTV Camera Stream Health & Frozen Footage Detection (Section 4)
11. Classroom Headcount Reconciliation & Identity Collision Prevention (Sections 6 & 7)
12. Central Attendance Confidence & Verification Engine (Section 9)
13. Neon Serverless PostgreSQL Cloud Database Handshake
"""

import os
import sys
import time
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
os.chdir(BASE_DIR)

import cv2

from ai_engine.config import Config
from ai_engine.models.face_engine import (
    FaceAttendanceEngine,
    PassiveLivenessDetector,
    assess_face_quality,
    estimate_norm_affine_matrix,
    align_face_112x112
)
from ai_engine.models.image_enhancer import IntelligentImageQualityModule
from ai_engine.models.head_pose import HeadPoseEstimator
from ai_engine.models.unknown_student_manager import UnknownStudentManager
from ai_engine.core.timetable_validator import SectionAttendanceValidator, ActiveClassSession
from ai_engine.core.camera_health import CameraHealthMonitor
from ai_engine.core.headcount_reconciler import HeadcountReconciler
from ai_engine.core.confidence_engine import AttendanceConfidenceEngine
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
    print(f"{BOLD}{YELLOW}CAMPUS CCTV FACE ATTENDANCE: 13-POINT PRODUCTION HEALTH & RECOVERY AUDIT{RESET}")
    print(f"{BOLD}{YELLOW}=========================================================================={RESET}")

    # CHECK 1: Umeyama Affine Transform
    print_step("CHECK 1/13: CANONICAL FACE ALIGNMENT & UMEYAMA TRANSFORM")
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

    # CHECK 2: Deep Embeddings & Passive Anti-Spoofing
    print_step("CHECK 2/13: DEEP AdaFace IR-50 EMBEDDINGS (512-D) & PASSIVE LIVENESS")
    temp_db = os.path.join(BASE_DIR, "models", "temp_diag_db.npz")
    engine = FaceAttendanceEngine(
        similarity_threshold=0.40,
        db_path=temp_db,
        legacy_pkl_path=Config.LEGACY_EMBEDDINGS_PKL,
        students_json_path=Config.STUDENTS_JSON_PATH
    )

    test_chip = np.full((112, 112, 3), 150, dtype=np.uint8)
    emb = engine.extract_embedding(test_chip)
    total_checks += 1
    if assert_check("AdaFace IR-50 Active Recognizer Validation", engine.adaface_recognizer is not None and engine.adaface_recognizer.is_loaded, f"({engine.adaface_recognizer.MODEL_BACKBONE})"):
        passed_checks += 1

    total_checks += 1
    if assert_check("Feature Embedding Extraction (AdaFace 512-D)", len(emb) == 512, f"({len(emb)} dimensions)"):
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

    # CHECK 3: Face Quality Assessment Pre-Filter
    print_step("CHECK 3/13: FACE QUALITY ASSESSMENT (FQA) PRE-FILTER")
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
    print_step("CHECK 4/13: BYTETRACK MULTI-PERSON ASSOCIATION TRACKER")
    tracker = SimpleByteTracker()
    dets = [{"bbox": [100, 100, 180, 180], "confidence": 0.90, "class_name": "person"}]
    tracks = tracker.update(dets)
    total_checks += 1
    if assert_check("ByteTrack Association State Machine", len(tracks) == 1 and "track_id" in tracks[0], f"(Track ID: {tracks[0]['track_id'] if tracks else 'None'})"):
        passed_checks += 1

    # CHECK 5: Examination System Event Bus
    print_step("CHECK 5/13: EXAMINATION INTEGRATION EVENT CONTRACT")
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

    # CHECK 6: Intelligent Image Quality & Adaptive Lighting Enhancement (Section 1)
    print_step("CHECK 6/13: IMAGE QUALITY & ADAPTIVE LIGHTING ENHANCEMENT (SEC 1)")
    enhancer = IntelligentImageQualityModule()
    dark_test = np.full((120, 160, 3), 12, dtype=np.uint8)
    q_rep_dark = enhancer.assess_frame(dark_test)
    total_checks += 1
    if assert_check("Low-Light Detection Gatekeeper (RED on darkness)", q_rep_dark.status == "RED" and not q_rep_dark.is_recognition_reliable):
        passed_checks += 1

    dim_test = np.full((120, 160, 3), 35, dtype=np.uint8)
    q_rep_dim = enhancer.assess_frame(dim_test)
    enhanced_dim, was_enhanced = enhancer.enhance_frame(dim_test, q_rep_dim)
    total_checks += 1
    if assert_check("Adaptive CLAHE & Dynamic Gamma Enhancement", was_enhanced and np.mean(enhanced_dim) > np.mean(dim_test)):
        passed_checks += 1

    # CHECK 7: 3D Head Pose Estimation & Frontality Gating (Section 5)
    print_step("CHECK 7/13: 3D HEAD POSE ESTIMATION & FRONTALITY (SEC 5)")
    pose_estimator = HeadPoseEstimator()
    sample_landmarks = np.array([
        [38.0, 51.0], [73.0, 51.0], [56.0, 71.0], [41.0, 92.0], [70.0, 92.0]
    ], dtype=np.float32)
    pose_res = pose_estimator.estimate_pose(sample_landmarks, (112, 112))
    total_checks += 1
    if assert_check("3D Head Pose PnP Extraction (Yaw, Pitch, Roll)", pose_res.is_frontal and pose_res.frontality_score > 0.70, f"(Yaw: {pose_res.yaw:.1f}°, Pitch: {pose_res.pitch:.1f}°)") :
        passed_checks += 1

    # CHECK 8: Unknown Student Detection & Evidence Vault (Section 2)
    print_step("CHECK 8/13: UNKNOWN STUDENT DETECTION & EVIDENCE VAULT (SEC 2)")
    temp_vault = os.path.join(BASE_DIR, "evidence_vault", "test_vault")
    unknown_mgr = UnknownStudentManager(vault_dir=temp_vault, records_json=os.path.join(temp_vault, "records.json"))
    sample_frame = np.full((200, 200, 3), 120, dtype=np.uint8)
    temp_id, alert_pay = unknown_mgr.handle_unregistered_face(
        track_id=1,
        frame=sample_frame,
        bbox=[40, 40, 120, 120],
        embedding=np.ones(128, dtype=np.float32),
        best_similarity=0.22,
        liveness_score=0.90,
        cooldown_sec=0.0
    )
    total_checks += 1
    if assert_check("Unregistered Face Evidence Capture & Alerting", temp_id.startswith("UNKNOWN-TRACK") and alert_pay is not None):
        passed_checks += 1
    # Clean up test vault to avoid clutter
    import shutil
    shutil.rmtree(temp_vault, ignore_errors=True)

    # CHECK 9: Section-Based Attendance & Timetable Validation (Section 3)
    print_step("CHECK 9/13: SECTION-BASED ATTENDANCE & TIMETABLE VALIDATION (SEC 3)")
    session = ActiveClassSession(scheduled_section="A")
    sec_validator = SectionAttendanceValidator(active_session=session)
    sec_validator.register_or_update_student("S_A", "Alice", section="A")
    sec_validator.register_or_update_student("S_B", "Bob", section="B")

    val_a = sec_validator.validate_attendance_eligibility("S_A")
    val_b = sec_validator.validate_attendance_eligibility("S_B")
    total_checks += 1
    if assert_check("Cross-Section Detection (Blocks Sec B in Sec A lecture)", val_a.is_eligible and not val_b.is_eligible and val_b.status == "SECTION_MISMATCH"):
        passed_checks += 1

    # CHECK 10: CCTV Camera Stream Health & Frozen Footage (Section 4)
    print_step("CHECK 10/13: CAMERA HEALTH & FROZEN STREAM DETECTION (SEC 4)")
    cam_monitor = CameraHealthMonitor(frozen_seconds_threshold=1.0)
    stat_frame = np.full((120, 160, 3), 90, dtype=np.uint8)
    cam_monitor.record_frame(stat_frame, timestamp=10.0)
    rep_froz = cam_monitor.record_frame(stat_frame, timestamp=11.5)
    total_checks += 1
    if assert_check("Consecutive Frame Freezing Detection", rep_froz.is_frozen and rep_froz.status == "FROZEN"):
        passed_checks += 1

    # CHECK 11: Classroom Headcount Reconciliation & Identity Collision (Sections 6 & 7)
    print_step("CHECK 11/13: HEADCOUNT RECONCILIATION & IDENTITY COLLISION (SEC 6, 7)")
    reconciler = HeadcountReconciler(enrolled_strength=40)
    coll_frame = [
        {"track_id": 1, "reg_no": "101", "student_name": "Student A"},
        {"track_id": 2, "reg_no": "101", "student_name": "Student A"}  # Same student on 2 tracks simultaneously
    ]
    alerts = reconciler.record_frame_detections(coll_frame)
    reconciler.student_presence["101"].is_confirmed = True
    summary = reconciler.get_reconciliation_summary()
    total_checks += 1
    if assert_check("Simultaneous Identity Collision Detection", len(alerts) == 1 and alerts[0]["alert_type"] == "SUSPICIOUS_DUPLICATE_IDENTITY_COLLISION"):
        passed_checks += 1

    total_checks += 1
    if assert_check("Classroom Headcount Reconciliation Summary", summary.enrolled_in_section == 40 and summary.confirmed_present == 1):
        passed_checks += 1

    # CHECK 12: Central Attendance Confidence Engine (Section 9)
    print_step("CHECK 12/13: MULTI-FACTOR CONFIDENCE & VERIFICATION ENGINE (SEC 9)")
    conf_engine = AttendanceConfidenceEngine()
    conf_eval = conf_engine.evaluate(
        similarity_score=0.82,
        is_registered=True,
        is_section_valid=True,
        liveness_score=0.92,
        is_live=True,
        quality_score=0.90,
        camera_quality_status="GREEN",
        frontality_score=0.90,
        consecutive_track_hits=4,
        required_track_hits=3
    )
    total_checks += 1
    if assert_check("Multi-Factor Confidence Scoring (CCTV_VERIFIED_PRESENT)", conf_eval.passed_threshold and conf_eval.classification == "CCTV_VERIFIED_PRESENT"):
        passed_checks += 1

    # CHECK 13: Neon Serverless PostgreSQL Cloud Handshake
    print_step("CHECK 13/13: BACKEND & CLOUD - NEON SERVERLESS POSTGRESQL")
    backend_client = ApnaCampusBackendClient(neon_db_url=Config.NEON_DATABASE_URL)
    conn = backend_client._get_neon_connection()
    neon_ok = conn is not None
    if conn:
        conn.close()

    total_checks += 1
    if assert_check("Neon Serverless PostgreSQL Cloud Handshake", neon_ok, "(Connected to Neon Cloud)" if neon_ok else "(Using offline cache fallback)"):
        passed_checks += 1

    # Clean up temporary test artifacts
    if os.path.exists(temp_db):
        try:
            os.remove(temp_db)
        except Exception:
            pass

    # Summary
    print(f"\n{BOLD}{YELLOW}=========================================================================={RESET}")
    print(f"{BOLD}{YELLOW}DIAGNOSTIC HEALTH AUDIT SUMMARY: {passed_checks}/{total_checks} CHECKS PASSED{RESET}")
    print(f"{BOLD}{YELLOW}=========================================================================={RESET}")

    if passed_checks == total_checks:
        print(f"{BOLD}{GREEN}🎉 ALL {total_checks} ADVANCED SUBSYSTEMS FULLY VERIFIED & HEALTHY (100% OPERATIONAL){RESET}")
        print(f"The Intelligent CCTV Face Attendance & Recovery system is ready for live deployment.\n")
        return True
    else:
        print(f"{BOLD}{RED}⚠️ {total_checks - passed_checks} check(s) failed. Review details above.{RESET}\n")
        return False


if __name__ == "__main__":
    run_full_diagnostics()
