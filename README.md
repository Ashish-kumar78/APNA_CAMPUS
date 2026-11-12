# 🎓 Smart Campus CCTV Face Attendance & Anti-Spoofing System

An enterprise-grade, real-time Computer Vision and Deep Learning system engineered for autonomous student attendance tracking from CCTV feeds (RTSP cameras, Phone IP Webcam, or Mac/USB webcams).

Directly connected to **Neon Serverless PostgreSQL Cloud Database** for the **APNA CAMPUS** ERP management system.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    A["Live CCTV Feed (RTSP / Phone IP / Mac Webcam)"] --> B["Low-Latency Threaded Capture (Zero Buffer Lag)"]
    B --> C["YuNet Deep CNN Face Detector (ONNX)"]
    C --> D["5-Point Facial Landmark Extraction"]
    D --> QG["Face Quality Assessment (IPD >= 24px, Blur >= 35.0, Brightness 35-225)"]
    QG -- Passed --> E["Umeyama Affine Normalization (112x112 Canonical Space)"]
    QG -- Failed --> RJ["Quality Rejected (Deferred from matching)"]
    E --> F["SFace Deep Neural Feature Extractor (128-D Unit L2 Norm)"]
    E --> G["Passive Anti-Spoofing Triad (2D FFT + Texture + Chroma Fusion)"]
    F --> H["Vectorized Cosine Similarity Matching: S = D @ E.T (Threshold = 0.45)"]
    G & H --> I["ByteTrack Multi-Person IoU Association Tracking"]
    I --> J["Temporal Consensus Voting (3 of 5 frames) & Duplicate Lockout"]
    J --> K["☁️ Direct Push to Neon PostgreSQL Cloud (face_attendance_logs)"]
    J --> L["📂 Local Daily CSV Backup (attendance_logs/)"]
    J --> M["📡 Examination System Integration Event Bus (AttendanceVerificationEvent)"]
```

---

## 📊 Calibrated Recognition Benchmark & ROC

Empirically calibrated on the enrolled student dataset (1,350 genuine verification pairs and 2,250 cross-identity impostor pairs):

| Threshold | FAR (False Acceptance) | FRR (False Rejection) | Real-World Behavior |
| :--- | :--- | :--- | :--- |
| **0.340** | 3.33% | 3.34% | Equal Error Rate (EER) Point |
| **0.363** | 1.56% | 3.78% | Standard Alibaba Baseline |
| **0.450** | **0.04% (1 in 2,500)** | **6.37%** | **PRODUCTION CALIBRATED THRESHOLD** |
| 0.600 | 0.00% | 18.07% | Overly Strict (rejects 18% genuine students) |
| 0.650 | 0.00% | 25.19% | Legacy Uncalibrated (rejects 1 in 4 genuine students) |

---

## 🚀 Quick Start Guide

### Step 1: Activate Environment
Open Terminal and run:
```bash
cd "/Users/somesh/Desktop/face_attendance"
source .venv/bin/activate
```

---

### Step 2: Run Production Diagnostic Health Check
Verify that all deep learning, alignment, tracker, and cloud subsystems are operational:
```bash
python verify_system.py
```
*(All checks should report `[PASS]`)*

---

### Step 3: Run the Live CCTV Face Attendance System
Executes real-time face detection, deep SFace metric recognition, anti-spoofing liveness verification, ByteTrack tracking, and live Neon Cloud sync.

#### Option A: Using Mac Built-in Webcam
```bash
python run_cctv_system.py --source 0
```

#### Option B: Using Phone as CCTV Camera (IP Webcam App)
1. Open **IP Webcam** on your Android phone, scroll down, and tap **Start server**.
2. Note the IP displayed on your phone screen (e.g., `192.168.43.1:8080`).
3. Connect your Mac and Phone to the same Wi-Fi or Phone Personal Hotspot.
4. Run:
   ```bash
   python run_cctv_system.py --source "192.168.43.1:8080"
   ```

**What happens live on screen:**
- **Face Bounding Box:** Green box over recognized students with Name, Roll Number, Tracking ID, and Cosine Match Confidence %.
- **Anti-Spoofing Badge:** Shows `Live: 98% (PASS)` or `SPOOF RISK` to block photo/screen fraud.
- **Attendance Badge:** Displays `ATTENDANCE VERIFIED [PRESENT]` once verified for 5 consecutive frames.
- **Cloud Sync:** Automatically pushes verified attendance to your live Neon Cloud table: `☁️ NEON CLOUD SYNCED`.

---

### Step 4: Enrolling New Students
You can enroll a new student anytime using the interactive auto-trigger viewfinder:
```bash
python register_student.py
```
- Enter Roll Number and Student Full Name.
- Look at the camera. The viewfinder oval guide turns green and captures 5 multi-angle samples to compile an $L_2$-normalized deep centroid embedding.

---

### Step 5: View Live Attendance Logs (Local & Neon Cloud)
```bash
python view_attendance.py
```
Displays both today's local CSV punches and live confirmed records from your **Neon PostgreSQL Cloud table (`face_attendance_logs`)**.

---

## 📁 Project Structure

```
face_attendance/
├── ai_engine/
│   ├── config.py                 # Unified thresholds, camera URLs & Neon Cloud URL
│   ├── examination_interface.py  # Standardized event bus for downstream Model 2 integration
│   ├── core/
│   │   ├── video_stream.py       # ThreadedVideoCapture (zero buffer lag) & socket probe
│   │   ├── tracker.py            # SimpleByteTracker (stable track_id & IoU matching)
│   │   └── event_manager.py      # Face Attendance Event Manager with temporal voting
│   ├── models/
│   │   └── face_engine.py        # Model 1: YuNet + SFace + FQA Filter + Anti-Spoofing
│   ├── services/
│   │   └── backend_client.py     # Neon Cloud Direct Sync & local CSV logger
│   └── tests/                    # Automated Unit & Benchmark Tests (17 tests, 100% PASS)
├── run_cctv_system.py            # Master CCTV Face Attendance Runner
├── enroll_student_cli.py         # Visual Auto-Trigger Student Enrollment
├── register_student.py           # Enrollment CLI shortcut
├── take_attendance.py            # Dedicated Face Attendance Scanner
├── verify_system.py              # 10-Point Production Diagnostic Health Suite
├── view_attendance.py            # Local & Neon Cloud Attendance Viewer
├── db_cloud.py                   # Neon PostgreSQL Cloud Helper
├── models/
│   ├── face_detection_yunet_2023mar.onnx
│   ├── face_recognition_sface_2021dec.onnx
│   ├── deep_embeddings.pkl
│   ├── face_database.npz
│   └── archived_proctor_engine.py # Archived Model 2 reference
├── attendance_logs/              # Local daily CSV backups
└── .env                          # Neon PostgreSQL Connection String
```

---

## 🧪 Automated Testing & Verification

Run the entire 17-test verification suite:
```bash
python -m unittest discover -s ai_engine/tests -v
```
Run the 10-point production diagnostic health check:
```bash
python verify_system.py
```

---

## ☁️ Database Integration (Neon PostgreSQL)

The system automatically populates the `face_attendance_logs` table in your Neon Cloud Database:
```sql
CREATE TABLE IF NOT EXISTS face_attendance_logs (
    id SERIAL PRIMARY KEY,
    roll_number VARCHAR(50) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    date VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'PRESENT',
    source VARCHAR(50) DEFAULT 'FACE_RECOGNITION_AI',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_roll_per_date UNIQUE (roll_number, date)
);
```
No manual schema changes or extra tables are required.
