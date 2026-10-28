import os
import cv2
import json
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
MODELS_DIR = os.path.join(BASE_DIR, "models")
YUNET_MODEL = os.path.join(MODELS_DIR, "face_detection_yunet_2023mar.onnx")
STUDENTS_JSON = os.path.join(MODELS_DIR, "students.json")

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

TOTAL_SAMPLES_NEEDED = 35
CAPTURE_DELAY_SEC = 0.12

def load_students_registry():
    if os.path.exists(STUDENTS_JSON):
        try:
            with open(STUDENTS_JSON, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_students_registry(registry):
    with open(STUDENTS_JSON, "w") as f:
        json.dump(registry, f, indent=2)

def register_student():
    print("=" * 70)
    print("🎓 APNA CAMPUS - DEEP LEARNING STUDENT ENROLLMENT (YUNET)")
    print("=" * 70)

    roll_number = input("Enter Student Roll Number (e.g. 2026CS01): ").strip().upper()
    if not roll_number:
        print("[ERROR] Roll number cannot be empty.")
        return

    student_name = input(f"Enter Full Name for {roll_number}: ").strip()
    if not student_name:
        print("[ERROR] Student name cannot be empty.")
        return

    student_folder = os.path.join(DATASET_DIR, roll_number)
    os.makedirs(student_folder, exist_ok=True)

    # Save student metadata
    registry = load_students_registry()
    registry[roll_number] = {
        "name": student_name,
        "roll_number": roll_number
    }
    save_students_registry(registry)

    # Initialize Deep Learning Face Detector (YuNet)
    detector = cv2.FaceDetectorYN_create(
        model=YUNET_MODEL,
        config="",
        input_size=(640, 480),
        score_threshold=0.7,
        nms_threshold=0.3,
        top_k=5000
    )

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Cannot access webcam. Check permissions.")
        return

    print(f"\n[INFO] Starting Deep Face Enrollment for {student_name}...")
    print(f"[INFO] Look at the camera and gently move your head (capturing {TOTAL_SAMPLES_NEEDED} samples).")
    print("[INFO] Press 'q' anytime to cancel.\n")

    captured_count = 0
    last_snap_time = 0

    while captured_count < TOTAL_SAMPLES_NEEDED:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        h_frame, w_frame = frame.shape[:2]
        now = time.time()

        detector.setInputSize((w_frame, h_frame))
        _, faces = detector.detect(frame)

        face_detected = False

        if faces is not None and len(faces) > 0:
            face_detected = True
            # Largest face = primary target
            faces_sorted = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
            best_face = faces_sorted[0]
            box = best_face[:4].astype(int)
            x, y, w, h = box[0], box[1], box[2], box[3]

            # Bounding box bounds check
            x_min = max(0, x)
            y_min = max(0, y)
            x_max = min(w_frame, x + w)
            y_max = min(h_frame, y + h)

            cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)

            if (now - last_snap_time) >= CAPTURE_DELAY_SEC and (x_max > x_min) and (y_max > y_min):
                face_crop = frame[y_min:y_max, x_min:x_max]
                face_resized = cv2.resize(face_crop, (200, 200))

                captured_count += 1
                last_snap_time = now

                img_path = os.path.join(student_folder, f"sample_{captured_count}.jpg")
                cv2.imwrite(img_path, face_resized)

        # ---------------- HUD INTERFACE ----------------
        cv2.rectangle(frame, (10, 10), (w_frame - 10, 80), (20, 20, 20), -1)

        pct = int((captured_count / TOTAL_SAMPLES_NEEDED) * 100)
        title = f"Enrolling: {student_name} ({roll_number})"
        cv2.putText(frame, title, (25, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 255), 2)

        if face_detected:
            status_text = f"Capturing: {captured_count}/{TOTAL_SAMPLES_NEEDED} samples ({pct}%) - Move head naturally"
            status_color = (0, 255, 0)
        else:
            status_text = "Looking for face... Please look into the camera"
            status_color = (0, 165, 255)

        cv2.putText(frame, status_text, (25, 68),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.52, status_color, 1)

        # Progress bar
        bar_x = 25
        bar_y = 75
        bar_w = w_frame - 50
        bar_h = 4
        cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_w, bar_y + bar_h), (60, 60, 60), -1)
        filled_w = int(bar_w * (captured_count / TOTAL_SAMPLES_NEEDED))
        if filled_w > 0:
            cv2.rectangle(frame, (bar_x, bar_y), (bar_x + filled_w, bar_y + bar_h), (0, 255, 0), -1)

        cv2.putText(frame, "Press 'q' to Cancel", (25, h_frame - 15),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (180, 180, 180), 1)

        cv2.imshow("APNA CAMPUS - Deep Learning Face Enrollment", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("\n[CANCELLED] Enrollment aborted by user.")
            break

    cap.release()
    cv2.destroyAllWindows()

    if captured_count >= TOTAL_SAMPLES_NEEDED:
        print(f"\n[SUCCESS] Captured {captured_count} deep samples for {student_name} ({roll_number})!")
        print("\n[AUTO-TRAIN] Compiling 128-dimensional Deep Neural Embeddings...")
        from train_model import train_model
        train_model()
    else:
        print(f"\n[WARNING] Only captured {captured_count}/{TOTAL_SAMPLES_NEEDED} samples.")

if __name__ == "__main__":
    register_student()
