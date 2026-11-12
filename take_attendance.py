"""
Smart Campus CCTV Live Attendance System
take_attendance.py

High-performance real-time face recognition attendance with:
- Deep Learning Face Detection (YuNet ONNX) & Recognition (SFace ONNX)
- Passive Anti-Spoofing Liveness Filter (2D FFT + Texture + Chroma)
- Instant Neon PostgreSQL Cloud Database sync & local CSV logging
- Threaded low-latency camera capture with zero buffer lag
"""

import os
import sys
import time
import argparse
import numpy as np

import cv2

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ai_engine.config import Config
from ai_engine.core.video_stream import ThreadedVideoCapture, format_camera_url, probe_network_camera
from ai_engine.models.face_engine import FaceAttendanceEngine
from ai_engine.services.backend_client import ApnaCampusBackendClient

BOLD = "\033[1m"
GREEN = "\033[92m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"


def main():
    parser = argparse.ArgumentParser(description="Smart Campus Live Face Attendance")
    parser.add_argument("--source", type=str, default="0", help="Camera source (0 for Mac webcam, phone IP, or RTSP)")
    parser.add_argument("--threshold", type=float, default=0.55, help="Cosine similarity threshold")
    parser.add_argument("--no-cloud", action="store_true", help="Disable Neon Cloud sync")

    args = parser.parse_args()

    norm_source = format_camera_url(args.source)

    print(f"\n{BOLD}{CYAN}========================================================================{RESET}")
    print(f"{BOLD}{CYAN}🎓 APNA CAMPUS - REAL-TIME FACE ATTENDANCE SYSTEM{RESET}")
    print(f"{BOLD}{CYAN}========================================================================{RESET}")
    print(f"  Camera Source:     {BOLD}{norm_source}{RESET}")
    print(f"  Similarity Cutoff: {args.threshold:.2f}")
    print(f"  Neon PostgreSQL:   {'Enabled (Cloud Sync)' if not args.no_cloud else 'Offline Logging'}")
    print(f"  Face Database:     {Config.FACE_DB_PATH}")
    print(f"{BOLD}{CYAN}------------------------------------------------------------------------{RESET}")

    if norm_source.startswith("http://") or norm_source.startswith("rtsp://"):
        reachable, reason = probe_network_camera(norm_source, timeout_sec=2.0)
        if not reachable:
            print(f"\n{RED}❌ Network Camera Warning:{RESET} {reason}")
            print(f"{YELLOW}Ensure phone and Mac share the same Wi-Fi or Phone Hotspot.{RESET}\n")

    # Initialize Engine & Backend
    engine = FaceAttendanceEngine(
        similarity_threshold=args.threshold,
        liveness_threshold=Config.FACE_LIVENESS_THRESHOLD,
        consecutive_frames_required=Config.FACE_CONSECUTIVE_FRAMES_REQUIRED,
        db_path=Config.FACE_DB_PATH,
        legacy_pkl_path=Config.LEGACY_EMBEDDINGS_PKL,
        students_json_path=Config.STUDENTS_JSON_PATH
    )

    backend = ApnaCampusBackendClient(
        neon_db_url=Config.NEON_DATABASE_URL if not args.no_cloud else "",
        logs_dir=Config.ATTENDANCE_LOGS_DIR,
        cache_path=Config.OFFLINE_ATTENDANCE_CACHE
    )

    print(f"\n[INFO] Connecting to camera: {norm_source} ...")
    cam = ThreadedVideoCapture(src=norm_source, name="ATTENDANCE-CAM")
    cam.start()

    time.sleep(1.0)
    ret, initial_frame = cam.read()
    if not ret or initial_frame is None:
        print(f"{RED}❌ Unable to read from camera source: {norm_source}{RESET}")
        cam.stop()
        return

    print(f"{GREEN}✅ Connected successfully! Attendance scanner active.{RESET}")
    print(f"{YELLOW}Press 'q' in the video window to stop.{RESET}\n")

    win_title = "Smart Campus - Live Face Attendance"
    cv2.namedWindow(win_title, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(win_title, 960, 680)

    try:
        while True:
            grabbed, frame = cam.read()
            if not grabbed or frame is None or frame.size == 0:
                time.sleep(0.02)
                continue

            h, w = frame.shape[:2]
            fps = cam.get_fps()

            results = engine.process_frame(frame)

            # Check confirmed attendance
            for res in results:
                if res.get("attendance_confirmed"):
                    backend.submit_attendance(
                        roll_number=res["reg_no"],
                        student_name=res["student_name"]
                    )

            display = frame.copy()

            # Top Status Bar
            overlay = display.copy()
            cv2.rectangle(overlay, (0, 0), (w, 42), (20, 20, 25), -1)
            cv2.addWeighted(overlay, 0.75, display, 0.25, 0, display)

            cv2.putText(display, "APNA CAMPUS - ATTENDANCE SCANNER", (15, 27),
                        cv2.FONT_HERSHEY_DUPLEX, 0.65, (0, 255, 255), 1, cv2.LINE_AA)
            cv2.putText(display, f"FPS: {fps:.1f}", (w - 110, 27),
                        cv2.FONT_HERSHEY_DUPLEX, 0.60, (0, 255, 0), 1, cv2.LINE_AA)

            # Draw Detections
            for face in results:
                x1, y1, x2, y2 = [int(v) for v in face["bbox"]]
                reg_no = face["reg_no"]
                name = face["student_name"]
                conf = face["confidence"]
                is_live = face["is_live"]
                live_score = face["liveness_score"]

                is_known = reg_no != "UNKNOWN"
                box_color = (0, 255, 0) if is_known else (0, 165, 255)
                cv2.rectangle(display, (x1, y1), (x2, y2), box_color, 2)

                label = f"{name} ({reg_no}) [{int(conf * 100)}%]" if is_known else "Unrecognized"
                cv2.rectangle(display, (x1, max(0, y1 - 25)), (x1 + len(label) * 9, y1), box_color, -1)
                cv2.putText(display, label, (x1 + 4, max(12, y1 - 7)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 0), 1, cv2.LINE_AA)

                live_txt = f"Live: {int(live_score * 100)}%" if is_live else f"Spoof Risk ({int(live_score * 100)}%)"
                cv2.putText(display, live_txt, (x1, y2 + 18),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0) if is_live else (0, 0, 255), 1, cv2.LINE_AA)

                if face.get("daily_record"):
                    cv2.putText(display, "ATTENDANCE MARKED [PRESENT]", (x1, y2 + 35),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 1, cv2.LINE_AA)

            cv2.imshow(win_title, display)
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q') or key == 27:
                break

    except KeyboardInterrupt:
        pass
    finally:
        cam.stop()
        cv2.destroyAllWindows()
        flushed = backend.flush_pending_cache()
        print(f"\n{BOLD}{GREEN}Attendance session ended. Synced {flushed} pending records to Neon Cloud.{RESET}\n")


if __name__ == "__main__":
    main()
