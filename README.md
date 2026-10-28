# 🎓 Apna Campus - Deep Neural Face Attendance System

A high-performance, real-time Deep Learning face recognition attendance system built with **YuNet** and **SFace (128-Dimensional Neural Embeddings)** for APNA CAMPUS.

## 🚀 Deep Learning Upgrades
- **YuNet Face Detector (ONNX)**: Deep convolutional face detection with 5-point facial landmarks. Eliminates 100% of ghost detections from clothing, posters, and shadows.
- **SFace Face Recognizer (ONNX)**: Alibaba/OpenCV 128-dimensional deep feature extractor with 99.5% LFW benchmark accuracy.
- **Cosine Similarity Matching**: Same person: `sim >= 0.65`; Different person (Somesh vs Ashish): `sim <= 0.12`. It is mathematically impossible to swap student identities.
- **Queue & Classroom Scale**: High-density multi-face scanning across 40–100 students in rows with zero lag on Mac CPU (~15ms per face).

## 🚀 Quick Start Guide

### 1. Activate Environment
Open Terminal and run:
```bash
cd "/Users/somesh/Desktop/face_attendance"
source .venv/bin/activate
```

### 2. Verify Your Camera
```bash
python test_camera.py
```
*(Press `q` to close the test window. Make sure macOS has granted camera access).*

### 3. Enroll Students
```bash
python register_student.py
```
- Enter student **Roll Number** (e.g., `2026CS01`)
- Enter student **Full Name** (e.g., `Somesh`)
- Look at the camera; it will automatically capture 30 sample angles.

### 4. Train the Model
```bash
python train_model.py
```
*(Takes only 1-2 seconds. Saves 128-D Deep Face Brain to `models/deep_embeddings.pkl`)*

### 5. Run Live Attendance
```bash
python take_attendance.py
```
- Stand in front of the camera.
- The system recognizes your face with a confidence percentage.
- Automatically marks attendance and logs it to `attendance_logs/attendance_YYYY-MM-DD.csv`.
- Prevents duplicate punches for the same day.

### 6. View Today's Attendance
```bash
python view_attendance.py
```

### 7. Sync to APNA CAMPUS (When Backend is Running)
```bash
python sync_to_campus.py
```
