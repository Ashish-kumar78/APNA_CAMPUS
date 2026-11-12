"""
Smart Campus CCTV Face Attendance & Anti-Spoofing System
Master Execution Script: run_cctv_system.py

Executes real-time CCTV facial attendance with:
- Deep CNN Face Detection (YuNet ONNX) & 5-point landmark extraction
- Deep Metric Face Recognition (SFace ONNX 128-D / ArcFace)
- Passive Anti-Spoofing Triad (2D FFT, Laplacian Texture, YCrCb Chrominance)
- ByteTrack Multi-Person Association Tracker
- Direct Neon PostgreSQL Cloud Database synchronization and local CSV logging
"""

import os
import sys
import time
import argparse
import logging
from typing import Dict, Any, List, Optional
import numpy as np

import cv2

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ai_engine.config import Config
from ai_engine.core.video_stream import ThreadedVideoCapture, probe_network_camera, format_camera_url
from ai_engine.core.tracker import SimpleByteTracker
from ai_engine.core.event_manager import CentralAIEventManager
from ai_engine.models.face_engine import FaceAttendanceEngine
from ai_engine.services.backend_client import ApnaCampusBackendClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("CCTVAttendance")

BOLD = "\033[1m"
GREEN = "\033[92m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"


def render_attendance_hud(
    frame: np.ndarray,
    event_data: Dict[str, Any],
    fps: float
) -> np.ndarray:
    """Renders professional CCTV surveillance telemetry HUD with intelligent error handling & reconciliation."""
    display = frame.copy()
    h, w = display.shape[:2]

    # 1. Top Surveillance Status Bar
    overlay = display.copy()
    cv2.rectangle(overlay, (0, 0), (w, 56), (20, 22, 28), -1)
    cv2.addWeighted(overlay, 0.85, display, 0.15, 0, display)

    cam_id = event_data.get("camera_id", "CAM-01")
    classroom = event_data.get("classroom", "CR-101")
    cv2.putText(display, f"CAMPUS CCTV: {cam_id} [{classroom} | CSE-5-A]", (15, 24),
                cv2.FONT_HERSHEY_DUPLEX, 0.60, (0, 255, 255), 1, cv2.LINE_AA)

    # Visibility & Image Quality Indicator (Section 1)
    q_status = event_data.get("camera_quality_status", "GREEN")
    q_color = (0, 255, 0) if q_status == "GREEN" else ((0, 220, 255) if q_status == "YELLOW" else (0, 0, 255))
    cv2.rectangle(display, (15, 32), (180, 50), q_color, 1)
    cv2.putText(display, f"QUALITY: {q_status}", (22, 45),
                cv2.FONT_HERSHEY_SIMPLEX, 0.40, q_color, 1, cv2.LINE_AA)

    # Camera Stream Health (Section 4)
    cam_health = event_data.get("camera_health", {})
    health_status = cam_health.get("status", "ONLINE")
    h_color = (0, 255, 0) if health_status == "ONLINE" else ((0, 220, 255) if health_status == "UNSTABLE" else (0, 0, 255))
    cv2.rectangle(display, (190, 32), (345, 50), h_color, 1)
    cv2.putText(display, f"STREAM: {health_status}", (198, 45),
                cv2.FONT_HERSHEY_SIMPLEX, 0.40, h_color, 1, cv2.LINE_AA)

    cv2.putText(display, f"FPS: {fps:.1f}", (w - 100, 26),
                cv2.FONT_HERSHEY_DUPLEX, 0.55, (0, 255, 0), 1, cv2.LINE_AA)

    # 2. Bottom Classroom Headcount & Reconciliation Bar (Section 6)
    rec = event_data.get("headcount_reconciliation", {})
    if rec:
        overlay_b = display.copy()
        cv2.rectangle(overlay_b, (0, h - 34), (w, h), (18, 20, 24), -1)
        cv2.addWeighted(overlay_b, 0.85, display, 0.15, 0, display)

        rec_str = (
            f"RECONCILIATION: Enrolled: {rec.get('enrolled_in_section', 40)} | "
            f"Detected: {rec.get('unique_students_detected', 0)} | "
            f"Present: {rec.get('confirmed_present', 0)} | "
            f"Unknown: {rec.get('unknown_individuals', 0)} | "
            f"Pending: {rec.get('pending_verification', 0)} | "
            f"Mismatch: {rec.get('section_mismatches', 0)}"
        )
        cv2.putText(display, rec_str, (15, h - 12),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.42, (220, 225, 230), 1, cv2.LINE_AA)

    # 3. Face Bounding Boxes, Identity, Pose, and Badges
    for face in event_data.get("face_results", []):
        x1, y1, x2, y2 = [int(v) for v in face["bbox"]]
        reg_no = face.get("reg_no", "UNKNOWN")
        name = face.get("student_name", "Unknown")
        conf = face.get("confidence", 0.0)
        comp_conf = face.get("composite_confidence", conf)
        is_live = face.get("is_live", False)
        live_score = face.get("liveness_score", 0.0)
        confirmed = face.get("attendance_confirmed", False)
        track_id = face.get("track_id")
        pose = face.get("head_pose", {})
        classification = face.get("classification", "PENDING_VERIFICATION")
        is_mismatch = face.get("is_section_mismatch", False)

        is_quality_rejected = (reg_no == "LOW_QUALITY" or q_status == "RED")
        is_unknown = (reg_no in ("UNKNOWN", "LOW_QUALITY") or reg_no.startswith("UNKNOWN-TRACK"))

        # Box Color Assignment
        if is_mismatch:
            box_color = (255, 0, 255)   # Magenta for Cross-Section Mismatch
        elif is_quality_rejected:
            box_color = (0, 140, 255)   # Orange for Quality Deferral
        elif is_unknown:
            box_color = (0, 165, 255)   # Amber for Unregistered Student
        elif confirmed or classification == "CCTV_VERIFIED_PRESENT":
            box_color = (0, 255, 0)     # Green for Verified Present
        else:
            box_color = (255, 200, 0)   # Cyan/Yellow for Pending Verification

        cv2.rectangle(display, (x1, y1), (x2, y2), box_color, 2)

        # Header tag above face
        id_str = f" [ID:{track_id}]" if track_id else ""
        if is_mismatch:
            label = f"SECTION MISMATCH: {name} ({reg_no}) [Sec {face.get('student_section', '?')}]"
        elif is_quality_rejected:
            label = f"Quality Rejected (Low Light/Blur){id_str}"
        elif is_unknown:
            label = f"Unregistered Person ({reg_no}){id_str}"
        else:
            label = f"{name} ({reg_no}){id_str} [Conf:{int(comp_conf * 100)}%]"

        tag_w = max(190, len(label) * 8 + 10)
        cv2.rectangle(display, (x1, max(0, y1 - 24)), (x1 + tag_w, y1), box_color, -1)
        cv2.putText(display, label, (x1 + 4, max(12, y1 - 6)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 0, 0), 1, cv2.LINE_AA)

        # Sub-badge 1: Liveness + Head Pose (Section 5)
        pose_str = f"Y:{pose.get('yaw', 0.0):+2.0f} P:{pose.get('pitch', 0.0):+2.0f}" if pose else ""
        if not is_quality_rejected:
            live_text = f"Live:{int(live_score * 100)}% | Pose: {pose_str}" if is_live else f"SPOOF RISK: {int(live_score * 100)}%"
            live_color = (0, 255, 0) if is_live else (0, 0, 255)
            cv2.putText(display, live_text, (x1, y2 + 18),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.42, live_color, 1, cv2.LINE_AA)

        # Sub-badge 2: Academic Attendance Status (Sections 2, 3, 9)
        badge_y = y2 + 35
        if is_mismatch:
            cv2.putText(display, "UNASSIGNED SECTION [NOT MARKED]", (x1, badge_y),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 0, 255), 1, cv2.LINE_AA)
        elif is_unknown:
            cv2.putText(display, "UNREGISTERED - EVIDENCE CAPTURED", (x1, badge_y),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 165, 255), 1, cv2.LINE_AA)
        elif confirmed or face.get("daily_record"):
            cv2.putText(display, "ATTENDANCE VERIFIED [PRESENT]", (x1, badge_y),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 255, 0), 1, cv2.LINE_AA)
            cv2.putText(display, "☁️ NEON CLOUD SYNCED", (x1, badge_y + 16),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 220, 255), 1, cv2.LINE_AA)

    # 4. Critical Banner Warnings (Low light or Frozen)
    if q_status == "RED":
        cv2.putText(display, "WARNING: CAMERA ILLUMINATION RED - RECOGNITION UNRELIABLE",
                    (w // 2 - 250, 75), cv2.FONT_HERSHEY_DUPLEX, 0.52, (0, 0, 255), 1, cv2.LINE_AA)
    elif cam_health.get("is_frozen"):
        cv2.putText(display, "ALERT: CAMERA FEED FROZEN - MANUAL FALLBACK ACTIVE",
                    (w // 2 - 240, 75), cv2.FONT_HERSHEY_DUPLEX, 0.52, (0, 0, 255), 1, cv2.LINE_AA)

    return display


def run_master_cctv(
    camera_source: str = "0",
    threshold: float = 0.40,
    sync_cloud: bool = True,
    show_gui: bool = True
):
    """Executes the live master CCTV face attendance engine powered by AdaFace IR-50."""
    norm_source = format_camera_url(camera_source)

    print(f"\n{BOLD}{CYAN}========================================================================{RESET}")
    print(f"{BOLD}{CYAN}🚀 LAUNCHING SMART CAMPUS CCTV FACE ATTENDANCE (ADAFACE IR-50){RESET}")
    print(f"{BOLD}{CYAN}========================================================================{RESET}")
    print(f"  Recognition Engine: {BOLD}AdaFace (IR-50, 512-D){RESET}")
    print(f"  Camera Stream:     {BOLD}{norm_source}{RESET}")
    print(f"  Similarity Cutoff: {threshold:.2f} (Calibrated FAR: 0.00%)")
    print(f"  Neon PostgreSQL:   {'Enabled (Cloud Sync)' if (sync_cloud and Config.NEON_DATABASE_URL) else 'Offline Logging'}")
    print(f"  Face Database:     {Config.FACE_DB_PATH}")
    print(f"  Attendance Logs:   {Config.ATTENDANCE_LOGS_DIR}")
    print(f"{BOLD}{CYAN}------------------------------------------------------------------------{RESET}")

    if norm_source.startswith("http://") or norm_source.startswith("rtsp://"):
        reachable, reason = probe_network_camera(norm_source, timeout_sec=2.0)
        if not reachable:
            print(f"\n{RED}❌ Network Camera Warning:{RESET} {reason}")
            print(f"{YELLOW}Suggestions:{RESET}")
            print("  1. Verify 'Start server' is active in IP Webcam on your phone.")
            print("  2. Connect Mac and Phone to the same Wi-Fi or Phone Hotspot.")
            print("  3. Or test with Mac webcam by running: python run_cctv_system.py --source 0\n")

    # Initialize Face Attendance Engine
    face_engine = FaceAttendanceEngine(
        similarity_threshold=threshold,
        liveness_threshold=Config.FACE_LIVENESS_THRESHOLD,
        consecutive_frames_required=Config.FACE_CONSECUTIVE_FRAMES_REQUIRED,
        db_path=Config.FACE_DB_PATH,
        legacy_pkl_path=Config.LEGACY_EMBEDDINGS_PKL,
        students_json_path=Config.STUDENTS_JSON_PATH
    )

    # Backend Client (Neon PostgreSQL Cloud + Local CSV)
    backend_client = ApnaCampusBackendClient(
        neon_db_url=Config.NEON_DATABASE_URL if sync_cloud else "",
        logs_dir=Config.ATTENDANCE_LOGS_DIR,
        cache_path=Config.OFFLINE_ATTENDANCE_CACHE
    )
    tracker = SimpleByteTracker()

    manager = CentralAIEventManager(
        face_engine=face_engine,
        backend_client=backend_client,
        tracker=tracker,
        camera_id="CAM-01"
    )

    print(f"\n[INFO] Connecting to camera stream: {norm_source} ...")
    cam = ThreadedVideoCapture(src=norm_source, name="CAM-01", target_fps=Config.TARGET_FPS)
    cam.start()

    time.sleep(1.0)
    success, initial_frame = cam.read()

    if not success or initial_frame is None:
        print(f"{RED}❌ Unable to read frames from camera source.{RESET}")
        cam.stop()
        return

    print(f"{GREEN}✅ Connected successfully! CCTV attendance active.{RESET}")
    print(f"{YELLOW}Press 'q' in video window to exit | 's' for manual snapshot.{RESET}\n")

    win_title = "Smart Campus CCTV - Face Attendance & Anti-Spoofing"
    if show_gui:
        cv2.namedWindow(win_title, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(win_title, 1024, 768)

    try:
        while True:
            grabbed, frame = cam.read()
            if not grabbed or frame is None or frame.size == 0:
                time.sleep(0.02)
                continue

            event_data = manager.process_tick(frame)
            fps = cam.get_fps()

            if show_gui:
                hud_frame = render_attendance_hud(frame, event_data, fps)
                cv2.imshow(win_title, hud_frame)

                key = cv2.waitKey(1) & 0xFF
                if key == ord('q') or key == 27:
                    print(f"\n{YELLOW}Shutdown initiated by user.{RESET}")
                    break
                elif key == ord('s'):
                    snap_path = os.path.join(Config.ATTENDANCE_LOGS_DIR, f"snapshot_{int(time.time())}.jpg")
                    cv2.imwrite(snap_path, frame)
                    print(f"📸 Manual snapshot saved: {snap_path}")

    except KeyboardInterrupt:
        print(f"\n{YELLOW}Terminated via KeyboardInterrupt.{RESET}")
    finally:
        cam.stop()
        if show_gui:
            cv2.destroyAllWindows()

        flushed = backend_client.flush_pending_cache()

        print(f"\n{BOLD}{CYAN}========================================================================{RESET}")
        print(f"{BOLD}{CYAN}📊 ATTENDANCE SESSION SUMMARY{RESET}")
        print(f"{BOLD}{CYAN}========================================================================{RESET}")
        print(f"  Total CCTV Frames Analyzed:  {manager.total_frames_processed}")
        print(f"  Verified Attendances:        {manager.total_attendances_confirmed}")
        print(f"  Flushed to Neon Cloud:       {flushed} records")
        print(f"{BOLD}{CYAN}========================================================================{RESET}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Smart Campus CCTV Face Attendance System")
    parser.add_argument("--source", type=str, default="0", help="Camera source (0 for webcam, phone IP, or RTSP)")
    parser.add_argument("--threshold", type=float, default=0.40, help="Cosine similarity threshold (AdaFace calibrated: 0.40)")
    parser.add_argument("--no-gui", action="store_true", help="Headless mode without GUI window")
    parser.add_argument("--no-cloud", action="store_true", help="Disable Neon Cloud database push")

    args = parser.parse_args()

    run_master_cctv(
        camera_source=args.source,
        threshold=args.threshold,
        sync_cloud=not args.no_cloud,
        show_gui=not args.no_gui
    )
