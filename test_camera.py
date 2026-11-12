"""
Smart Campus CCTV Camera Diagnostic Test
test_camera.py: Tests Mac built-in webcam or Phone CCTV stream with pre-flight probe.
"""

import sys
import os
import cv2

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ai_engine.core.video_stream import format_camera_url, probe_network_camera


def test_camera():
    print("=" * 60)
    print("🎥 APNA CAMPUS - CCTV CAMERA DIAGNOSTIC TEST")
    print("=" * 60)

    print("Select camera to test:")
    print("  [1] Mac Built-in Webcam (Camera index 0)")
    print("  [2] Phone CCTV (via IP Webcam app)")
    choice = input("Enter choice [1/2] (default 1): ").strip() or "1"

    if choice == "2":
        ip = input("Enter Phone IP address [e.g. 192.168.43.1:8080]: ").strip()
        src_url = format_camera_url(ip)
        print(f"\n[INFO] Probing network camera: {src_url} ...")
        reachable, reason = probe_network_camera(src_url, timeout_sec=2.0)
        if not reachable:
            print(f"[ERROR] Camera port unreachable: {reason}")
            print("[TIP] Ensure 'Start server' is active in IP Webcam and phone shares Wi-Fi/Hotspot with Mac.")
            return
        src = src_url
    else:
        src = 0
        print("\n[INFO] Opening Mac built-in webcam (index 0)...")

    cap = cv2.VideoCapture(src)
    if not cap.isOpened():
        print(f"[ERROR] Could not open camera {src}!")
        print("[TIP] Check System Settings -> Privacy & Security -> Camera on your Mac.")
        return

    print("[SUCCESS] Camera connected successfully! Showing live stream.")
    print("Press 'q' in the video window to close.\n")

    win_title = "APNA CAMPUS - CCTV Diagnostic View"
    cv2.namedWindow(win_title, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(win_title, 800, 600)

    while True:
        ret, frame = cap.read()
        if not ret or frame is None:
            print("[ERROR] Failed to grab frame.")
            break

        cv2.putText(
            frame,
            f"CCTV TEST [{src}] - Press 'q' to Quit",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )
        cv2.imshow(win_title, frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("[DONE] Camera test finished successfully.")


if __name__ == "__main__":
    test_camera()
