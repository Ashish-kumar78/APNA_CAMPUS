import cv2
import sys

def test_camera():
    print("=" * 50)
    print("APNA CAMPUS - Camera Diagnostic Test")
    print("=" * 50)
    print("[INFO] Attempting to open default webcam (index 0)...")
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Could not access webcam!")
        print("[TIP] If you are on macOS:")
        print("  1. Open System Settings -> Privacy & Security -> Camera")
        print("  2. Ensure your Terminal / Code Editor is permitted to use the Camera.")
        sys.exit(1)
        
    print("[SUCCESS] Camera opened successfully!")
    print("[INFO] Showing live video stream. Press 'q' to close window.")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("[ERROR] Failed to grab frame from camera.")
            break
            
        cv2.putText(
            frame,
            "APNA CAMPUS CAMERA TEST - Press 'q' to Quit",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )
        
        cv2.imshow("Webcam Diagnostic Test", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()
    print("[DONE] Camera test finished successfully.")

if __name__ == "__main__":
    test_camera()
