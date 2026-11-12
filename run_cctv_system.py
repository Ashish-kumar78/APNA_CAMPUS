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
    """Renders professional CCTV surveillance telemetry HUD."""
    display = frame.copy()
    h, w = display.shape[:2]

    # Top Status Bar
    overlay = display.copy()
    cv2.rectangle(overlay, (0, 0), (w, 44), (20, 22, 28), -1)
    cv2.addWeighted(overlay, 0.80, display, 0.20, 0, display)

    cv2.putText(display, f"CAMPUS CCTV ATTENDANCE - {event_data.get('camera_id', 'CAM-01')}", (15, 28),
                cv2.FONT_HERSHEY_DUPLEX, 0.65, (0, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(display, f"FPS: {fps:.1f}", (w - 110, 28),
                cv2.FONT_HERSHEY_DUPLEX, 0.60, (0, 255, 0), 1, cv2.LINE_AA)

    # Face Detections, Identity, and Anti-Spoofing
    for face in event_data.get("face_results", []):
        x1, y1, x2, y2 = [int(v) for v in face["bbox"]]
        reg_no = face.get("reg_no", "UNKNOWN")
        name = face.get("student_name", "Unknown")
        conf = face.get("confidence", 0.0)
        is_live = face.get("is_live", False)
        live_score = face.get("liveness_score", 0.0)
        confirmed = face.get("attendance_confirmed", False)
        track_id = face.get("track_id")

        is_quality_rejected = (reg_no == "LOW_QUALITY")
        is_known = (reg_no not in ("UNKNOWN", "LOW_QUALITY"))

        if is_quality_rejected:
            box_color = (0, 140, 255)  # Orange for quality deferral
        elif is_known:
            box_color = (0, 255, 0)    # Green for verified student
        else:
            box_color = (0, 165, 255)  # Amber for unknown

        cv2.rectangle(display, (x1, y1), (x2, y2), box_color, 2)

        # Header tag above face
        id_str = f" [ID:{track_id}]" if track_id else ""
        if is_quality_rejected:
            label = f"Quality Rejected (Blur/Small){id_str}"
        elif is_known:
            label = f"{name} ({reg_no}){id_str} [{int(conf * 100)}%]"
        else:
            label = f"Unrecognized Face{id_str}"

        tag_w = max(180, len(label) * 9)
        cv2.rectangle(display, (x1, max(0, y1 - 25)), (x1 + tag_w, y1), box_color, -1)
        cv2.putText(display, label, (x1 + 4, max(12, y1 - 7)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 0), 1, cv2.LINE_AA)

        # Liveness & Anti-Spoofing badge below face
        if not is_quality_rejected:
            live_text = f"Live: {int(live_score * 100)}% (PASS)" if is_live else f"SPOOF RISK: {int(live_score * 100)}%"
            live_color = (0, 255, 0) if is_live else (0, 0, 255)
            cv2.putText(display, live_text, (x1, y2 + 18),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, live_color, 1, cv2.LINE_AA)

        # Attendance confirmation badge
        if confirmed or face.get("daily_record"):
            cv2.putText(display, "ATTENDANCE VERIFIED [PRESENT]", (x1, y2 + 35),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 1, cv2.LINE_AA)
            cv2.putText(display, "☁️ NEON CLOUD SYNCED", (x1, y2 + 52),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.40, (0, 220, 255), 1, cv2.LINE_AA)

    return display


def run_master_cctv(
    camera_source: str = "0",
    threshold: float = 0.45,
    sync_cloud: bool = True,
    show_gui: bool = True
):
    """Executes the live master CCTV face attendance engine."""
    norm_source = format_camera_url(camera_source)

    print(f"\n{BOLD}{CYAN}========================================================================{RESET}")
    print(f"{BOLD}{CYAN}🚀 LAUNCHING SMART CAMPUS CCTV FACE ATTENDANCE SYSTEM{RESET}")
    print(f"{BOLD}{CYAN}========================================================================{RESET}")
    print(f"  Camera Stream:     {BOLD}{norm_source}{RESET}")
    print(f"  Similarity Cutoff: {threshold:.2f}")
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
    parser.add_argument("--threshold", type=float, default=0.45, help="Cosine similarity threshold")
    parser.add_argument("--no-gui", action="store_true", help="Headless mode without GUI window")
    parser.add_argument("--no-cloud", action="store_true", help="Disable Neon Cloud database push")

    args = parser.parse_args()

    run_master_cctv(
        camera_source=args.source,
        threshold=args.threshold,
        sync_cloud=not args.no_cloud,
        show_gui=not args.no_gui
    )
