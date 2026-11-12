"""
APNA CAMPUS - Deep Neural Embedding Compiler (YuNet + SFace)
train_model.py: Compiles student face crops into L2-normalized deep centroids.
"""

import os
import cv2
import json
import pickle
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
MODELS_DIR = os.path.join(BASE_DIR, "models")
YUNET_MODEL = os.path.join(MODELS_DIR, "face_detection_yunet_2023mar.onnx")
SFACE_MODEL = os.path.join(MODELS_DIR, "face_recognition_sface_2021dec.onnx")
EMBEDDINGS_FILE = os.path.join(MODELS_DIR, "deep_embeddings.pkl")
LABEL_MAP_FILE = os.path.join(MODELS_DIR, "label_map.json")
STUDENTS_JSON = os.path.join(MODELS_DIR, "students.json")
NPZ_DATABASE = os.path.join(MODELS_DIR, "face_database.npz")


def train_model():
    print("=" * 70)
    print("🧠 APNA CAMPUS - DEEP NEURAL EMBEDDING COMPILER (SFACE 128-D)")
    print("=" * 70)

    if not os.path.exists(DATASET_DIR) or not os.listdir(DATASET_DIR):
        print(f"[ERROR] No student dataset found in '{DATASET_DIR}'.")
        return

    # Initialize YuNet & SFace with OpenCV 5 / 4 compatibility
    if hasattr(cv2, "FaceDetectorYN") and hasattr(cv2.FaceDetectorYN, "create"):
        detector = cv2.FaceDetectorYN.create(YUNET_MODEL, "", (320, 320), score_threshold=0.6)
    else:
        detector = cv2.FaceDetectorYN_create(YUNET_MODEL, "", (320, 320), score_threshold=0.6)

    if hasattr(cv2, "FaceRecognizerSF") and hasattr(cv2.FaceRecognizerSF, "create"):
        recognizer = cv2.FaceRecognizerSF.create(SFACE_MODEL, "")
    else:
        recognizer = cv2.FaceRecognizerSF_create(SFACE_MODEL, "")

    students_info = {}
    if os.path.exists(STUDENTS_JSON):
        try:
            with open(STUDENTS_JSON, "r") as f:
                students_info = json.load(f)
        except Exception:
            pass

    student_embeddings = {}
    label_map = {}
    npz_embeddings = []
    npz_reg_nos = []
    npz_names = []

    student_folders = sorted(os.listdir(DATASET_DIR))

    for folder_name in student_folders:
        folder_path = os.path.join(DATASET_DIR, folder_name)
        if not os.path.isdir(folder_path):
            continue

        roll_number = folder_name
        student_name = students_info.get(roll_number, {}).get("name", roll_number)
        label_map[roll_number] = {
            "name": student_name,
            "roll_number": roll_number
        }

        image_files = [f for f in os.listdir(folder_path) if f.lower().endswith((".jpg", ".png", ".jpeg"))]
        if not image_files:
            continue

        print(f"[PROCESSING] Student {student_name} ({roll_number}) - {len(image_files)} sample(s)...")

        embeddings_list = []
        for img_name in image_files:
            img_path = os.path.join(folder_path, img_name)
            img = cv2.imread(img_path)
            if img is None:
                continue

            h, w = img.shape[:2]
            detector.setInputSize((w, h))
            _, faces = detector.detect(img)

            if faces is not None and len(faces) > 0:
                primary_face = faces[0]
                aligned_face = recognizer.alignCrop(img, primary_face)
                feat = recognizer.feature(aligned_face).flatten()
                norm = np.linalg.norm(feat)
                if norm > 1e-6:
                    feat = feat / norm
                embeddings_list.append(feat)

        if embeddings_list:
            centroid = np.mean(embeddings_list, axis=0)
            norm = np.linalg.norm(centroid)
            if norm > 1e-6:
                centroid = (centroid / norm).astype(np.float32)

            student_embeddings[roll_number] = {
                "name": student_name,
                "roll_number": roll_number,
                "centroid": centroid,
                "samples": embeddings_list
            }

            npz_embeddings.append(centroid)
            npz_reg_nos.append(roll_number)
            npz_names.append(student_name)

    if student_embeddings:
        # Save legacy pickle
        with open(EMBEDDINGS_FILE, "wb") as f:
            pickle.dump(student_embeddings, f)

        # Save label map
        with open(LABEL_MAP_FILE, "w") as f:
            json.dump(label_map, f, indent=2)

        # Save modern NPZ
        np.savez_compressed(
            NPZ_DATABASE,
            embeddings=np.array(npz_embeddings, dtype=np.float32),
            reg_nos=np.array(npz_reg_nos, dtype=object),
            names=np.array(npz_names, dtype=object),
            metadata=np.array(json.dumps([{"reg_no": r, "name": n} for r, n in zip(npz_reg_nos, npz_names)]), dtype=object)
        )

        print(f"\n[SUCCESS] Compiled {len(student_embeddings)} student brain(s)!")
        print(f"  - Legacy Pickle: {EMBEDDINGS_FILE}")
        print(f"  - Modern NPZ:    {NPZ_DATABASE}")
        print(f"  - Label Map:     {LABEL_MAP_FILE}")
    else:
        print("[WARNING] No valid embeddings extracted from dataset.")


if __name__ == "__main__":
    train_model()
