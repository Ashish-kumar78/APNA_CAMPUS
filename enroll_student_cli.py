"""
Smart Campus CCTV: Interactive Student Face Enrollment Wizard
enroll_student_cli.py

- Live Viewfinder with elliptical face-alignment guide
- Auto-Trigger: begins 2-second capture countdown upon face detection
- Captures 5 multi-angle samples to compute deep centroid embedding
- Direct persistence to face_database.npz and deep_embeddings.pkl
"""

import os
import sys
import time
import argparse
import logging
from typing import Optional, Tuple
import numpy as np

import cv2

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ai_engine.config import Config
from ai_engine.models.face_engine import FaceAttendanceEngine
from ai_engine.core.video_stream import format_camera_url, probe_network_camera

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("EnrollStudent")

BOLD = "\033[1m"
GREEN = "\033[92m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"


def prompt_user_interactively() -> Tuple[str, str, str, Optional[str]]:
    """Runs interactive step-by-step CLI enrollment wizard."""
    print(f"\n{BOLD}{CYAN}========================================================================{RESET}")
    print(f"{BOLD}{CYAN}🎓 SMART CAMPUS CCTV: STUDENT FACE ENROLLMENT WIZARD{RESET}")
    print(f"{BOLD}{CYAN}========================================================================{RESET}")

    reg_no = ""
    while not reg_no:
        reg_no = input(f"{BOLD}Enter Student Roll / Registration Number: {RESET}").strip()
        if not reg_no:
            print(f"  {RED}Registration number cannot be empty.{RESET}")

    name = ""
    while not name:
        name = input(f"{BOLD}Enter Student Full Name: {RESET}").strip()
        if not name:
            print(f"  {RED}Student name cannot be empty.{RESET}")

    print(f"\n{BOLD}Select Camera Source:{RESET}")
    print(f"  {BOLD}[1]{RESET} Phone CCTV (via IP Webcam app)")
    print(f"  {BOLD}[2]{RESET} Mac Built-in Webcam")
    print(f"  {BOLD}[3]{RESET} From an existing photo/selfie on disk")
    choice = input(f"Enter choice [1/2/3] (default 2): ").strip() or "2"

    image_path = None
    stream_source = "0"

    if choice == "2":
        stream_source = "0"
        print(f"  {GREEN}Using Mac Built-in Webcam.{RESET}")
    elif choice == "3":
        while not image_path:
            p = input(f"Enter path to selfie/photo image file: ").strip().strip('"').strip("'")
            if os.path.exists(p):
                image_path = p
                print(f"  {GREEN}Loaded image file: {image_path}{RESET}")
            else:
                print(f"  {RED}File does not exist: {p}{RESET}")
    else:
        ip = input(f"Enter Phone IP address [e.g. 192.168.43.1:8080]: ").strip()
        stream_source = format_camera_url(ip)
        print(f"  Stream configured: {stream_source}")

    return reg_no, name, stream_source, image_path


def enroll_student_pipeline(
    reg_no: str,
    name: str,
    stream_source: str = "0",
    image_path: Optional[str] = None,
    db_path: Optional[str] = None
) -> bool:
    """Executes viewfinder capture and student centroid enrollment."""
    engine = FaceAttendanceEngine(
        db_path=db_path or Config.FACE_DB_PATH,
        legacy_pkl_path=Config.LEGACY_EMBEDDINGS_PKL,
        students_json_path=Config.STUDENTS_JSON_PATH
    )

    if image_path:
        print(f"\n[INFO] Loading image from {image_path}...")
        img = cv2.imread(image_path)
        if img is None:
            print(f"{RED}❌ Could not load image from {image_path}{RESET}")
            return False
        frame_to_enroll = [img]
    else:
        norm_source = format_camera_url(stream_source)
        src = int(norm_source) if norm_source.isdigit() else norm_source

        if isinstance(src, str) and (src.startswith("http://") or src.startswith("rtsp://")):
            reachable, reason = probe_network_camera(src, timeout_sec=2.0)
            if not reachable:
                print(f"\n{RED}❌ Network Camera Warning:{RESET} {reason}")
                return False

        print(f"\n[INFO] Connecting to camera: {src} ...")
        cap = cv2.VideoCapture(src)
        if not cap.isOpened():
            print(f"{RED}❌ Could not open camera {src}{RESET}")
            return False

        print(f"{GREEN}✅ Connected successfully!{RESET}")
        print(f"\nLive preview window is active on your screen.")
        print(f"Auto-Trigger enabled: The system will capture automatically once your face is detected.\n")

        win_title = "Smart Campus - Face Enrollment Viewfinder"
        cv2.namedWindow(win_title, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(win_title, 800, 600)

        face_stable_counter = 0
        countdown_start_ts = None
        trigger_capture = False
        captured_frame = None

        while True:
            ret, frame = cap.read()
            if not ret or frame is None or frame.size == 0:
                time.sleep(0.02)
                continue

            preview = frame.copy()
            ph, pw = preview.shape[:2]

            detected_faces = engine.extract_faces_from_frame(frame, fast_mode=True)
            has_face = len(detected_faces) > 0

            center_pt = (pw // 2, int(ph * 0.46))
            axes = (int(pw * 0.17), int(ph * 0.25))

            if has_face:
                face_stable_counter += 1
                bx1, by1, bx2, by2 = detected_faces[0]["bbox"]
                cv2.rectangle(preview, (bx1, by1), (bx2, by2), (0, 255, 0), 2)

                if face_stable_counter >= 3:
                    if countdown_start_ts is None:
                        countdown_start_ts = time.time()

                    elapsed = time.time() - countdown_start_ts
                    countdown_secs = max(0, int(2.0 - elapsed) + 1)

                    cv2.ellipse(preview, center_pt, axes, 0, 0, 360, (0, 255, 0), 3)
                    cv2.rectangle(preview, (0, 0), (pw, 70), (0, 120, 0), -1)
                    cv2.putText(preview, f"FACE DETECTED! AUTO-CAPTURING IN {countdown_secs}s", (25, 42),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.70, (255, 255, 255), 2)
                    cv2.putText(preview, "Hold steady | Press SPACE to snap now | 'q' to cancel", (25, 62),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (220, 255, 220), 1)

                    if elapsed >= 2.0:
                        trigger_capture = True
                else:
                    trigger_capture = False
            else:
                face_stable_counter = 0
                countdown_start_ts = None
                trigger_capture = False

                cv2.ellipse(preview, center_pt, axes, 0, 0, 360, (0, 180, 255), 2)
                cv2.rectangle(preview, (0, 0), (pw, 70), (25, 25, 30), -1)
                cv2.putText(preview, "WAITING FOR FACE... LOOK AT THE CAMERA", (25, 42),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 220, 255), 2)

            cv2.imshow(win_title, preview)
            key = cv2.waitKey(1) & 0xFF

            if key == 32 or trigger_capture:
                print(f"\n📸 Face confirmed! Capturing 5 multi-angle samples...")
                samples = []
                for s_idx in range(5):
                    s_ret, s_frame = cap.read()
                    if s_ret and s_frame is not None:
                        samples.append(s_frame.copy())
                        flash = s_frame.copy()
                        cv2.rectangle(flash, (0, 0), (pw, 70), (0, 180, 0), -1)
                        cv2.putText(flash, f"CAPTURING SAMPLES: [{s_idx+1}/5]", (30, 45),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 255), 2)
                        cv2.imshow(win_title, flash)
                        cv2.waitKey(120)
                    time.sleep(0.10)
                captured_frame = samples
                break
            elif key == ord('q') or key == 27:
                print(f"{YELLOW}Enrollment cancelled.{RESET}")
                cv2.destroyAllWindows()
                cap.release()
                return False

        cv2.destroyAllWindows()
        cap.release()
        print("\n📸 SAMPLES CAPTURED! Computing Deep Centroid Representation...")

        if captured_frame is None or len(captured_frame) == 0:
            print(f"{RED}❌ Failed to grab frames from stream.{RESET}")
            return False

        frame_to_enroll = captured_frame

    result = engine.enroll_student(frame_to_enroll, reg_no=reg_no, name=name)

    if result.get("success", False):
        print(f"\n{BOLD}{GREEN}========================================================================{RESET}")
        print(f"{BOLD}{GREEN}🎉 ENROLLMENT SUCCESSFUL!{RESET}")
        print(f"  Student Name:     {BOLD}{name}{RESET}")
        print(f"  Roll Number:      {BOLD}{reg_no}{RESET}")
        print(f"  Deep Embedding:   L2-Normalized Centroid Representation")
        print(f"  Database Storage: {engine.db_path}")
        print(f"  Total Enrolled:   {len(engine.enrolled_metadata)} students")
        print(f"{BOLD}{GREEN}========================================================================{RESET}")
        print(f"\nYou can now start the CCTV surveillance & proctoring system:")
        print(f"  {CYAN}python3 run_cctv_system.py --single-desk{RESET}\n")
        return True
    else:
        print(f"\n{RED}❌ Enrollment failed: {result.get('message', 'No clear face detected')}{RESET}")
        return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Smart Campus Student Face Enrollment Wizard")
    parser.add_argument("--reg", type=str, default=None, help="Student Roll / Registration Number")
    parser.add_argument("--name", type=str, default=None, help="Student Full Name")
    parser.add_argument("--source", type=str, default=None, help="Camera source or Phone IP")
    parser.add_argument("--image", type=str, default=None, help="Image file path")
    parser.add_argument("--db", type=str, default=None, help="Path to database file")

    args = parser.parse_args()

    if args.reg is None or args.name is None:
        reg_no, name, source, image_path = prompt_user_interactively()
    else:
        reg_no = args.reg
        name = args.name
        source = format_camera_url(args.source) if args.source else "0"
        image_path = args.image

    enroll_student_pipeline(
        reg_no=reg_no,
        name=name,
        stream_source=source,
        image_path=image_path,
        db_path=args.db
    )
