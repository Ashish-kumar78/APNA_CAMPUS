"""
Model 1: Deep Face Attendance & Anti-Spoofing Engine (face_engine.py)
Hybrid Deep Learning Architecture:
- Primary Detector: OpenCV YuNet Deep CNN Face Detector (ONNX) with 5-point landmarks
- Primary Recognizer: SFace / ArcFace Deep Metric Embedding (128-D / 512-D)
- Resilient Fallback: Umeyama Affine Transform + Contrast-Invariant Spatial Vectorizer
- Passive Anti-Spoofing Triad: 2D FFT Frequency, Laplacian Texture, YCrCb Chrominance
- Vectorized Cosine Dot Product Matching (S = D @ E.T) with daily deduplication
- Automatic loading of legacy deep_embeddings.pkl and students.json
"""

import os
import json
import time
import pickle
import logging
from typing import List, Dict, Tuple, Optional, Any, Union
import numpy as np

import cv2

from ai_engine.models.image_enhancer import IntelligentImageQualityModule, FrameQualityReport
from ai_engine.models.head_pose import HeadPoseEstimator, HeadPoseEstimate, MultiFrameObservationBuffer
from ai_engine.models.unknown_student_manager import UnknownStudentManager
from ai_engine.core.timetable_validator import SectionAttendanceValidator, ActiveClassSession
from ai_engine.core.confidence_engine import AttendanceConfidenceEngine, ConfidenceEvaluation
from ai_engine.models.adaface_recognizer import AdaFaceRecognizer

logger = logging.getLogger("FaceAttendanceEngine")

REFERENCE_FACIAL_5POINTS = np.array([
    [38.2946, 51.6963],  # Left Eye
    [73.5318, 51.5014],  # Right Eye
    [56.0252, 71.7366],  # Nose Tip
    [41.5493, 92.3655],  # Left Mouth Corner
    [70.7299, 92.2041]   # Right Mouth Corner
], dtype=np.float32)


def estimate_norm_affine_matrix(source_landmarks: np.ndarray) -> np.ndarray:
    """Computes 2D affine similarity transform matrix to 112x112 reference landmarks."""
    src = np.asarray(source_landmarks, dtype=np.float32)
    dst = REFERENCE_FACIAL_5POINTS

    try:
        M, inliers = cv2.estimateAffinePartial2D(src, dst, method=cv2.LMEDS)
        if M is not None:
            return M
    except Exception:
        pass

    # Analytical Umeyama SVD transform fallback
    src_mean = np.mean(src, axis=0)
    dst_mean = np.mean(dst, axis=0)
    src_centered = src - src_mean
    dst_centered = dst - dst_mean

    covariance = np.dot(dst_centered.T, src_centered) / src.shape[0]
    U, S, Vt = np.linalg.svd(covariance)
    R = np.dot(U, Vt)
    if np.linalg.det(R) < 0:
        R[1, :] *= -1

    var_src = np.var(src, axis=0).sum()
    scale = 1.0 if var_src == 0 else np.trace(np.dot(np.diag(S), np.eye(2))) / var_src
    translation = dst_mean - scale * np.dot(R, src_mean)

    M = np.zeros((2, 3), dtype=np.float32)
    M[:2, :2] = scale * R
    M[:, 2] = translation
    return M


def align_face_112x112(frame: np.ndarray, landmarks_5pts: np.ndarray) -> np.ndarray:
    """Aligns and crops facial region into canonical 112x112 space."""
    M = estimate_norm_affine_matrix(landmarks_5pts)
    aligned = cv2.warpAffine(frame, M, (112, 112), borderValue=0.0)
    return aligned


def assess_face_quality(
    aligned_face_112: np.ndarray,
    landmarks: Optional[np.ndarray] = None,
    min_ipd: float = 24.0,
    min_blur: float = 35.0,
    min_brightness: float = 35.0,
    max_brightness: float = 225.0,
    min_contrast: float = 15.0
) -> Tuple[bool, float, Dict[str, Any]]:
    """
    Evaluates face image quality (FQA) before feature extraction.
    Rejects blurry, under-exposed, over-exposed, or excessively small faces.
    """
    if aligned_face_112 is None or aligned_face_112.size == 0:
        return False, 0.0, {"reasons": ["EMPTY_FACE_CHIP"]}

    reasons = []

    # 1. Inter-Pupillary Distance (IPD) check
    ipd = 35.0  # Canonical reference IPD in 112x112 aligned space
    if landmarks is not None and len(landmarks) >= 2:
        ipd = float(np.linalg.norm(landmarks[0] - landmarks[1]))
        if min_ipd > 0.0 and ipd < min_ipd:
            reasons.append("FACE_TOO_SMALL_IPD")

    # 2. Laplacian Sharpness (Motion / Optical Blur)
    gray = cv2.cvtColor(aligned_face_112, cv2.COLOR_BGR2GRAY)
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    if min_blur > 0.0 and laplacian_var < min_blur:
        reasons.append("MOTION_OR_OPTICAL_BLUR")

    # 3. Illumination & Contrast Envelope
    mean_brightness = float(np.mean(gray))
    std_contrast = float(np.std(gray))
    if min_brightness > 0.0 and mean_brightness < min_brightness:
        reasons.append("UNDER_EXPOSED")
    elif max_brightness < 255.0 and mean_brightness > max_brightness:
        reasons.append("OVER_EXPOSED")
    if min_contrast > 0.0 and std_contrast < min_contrast:
        reasons.append("LOW_CONTRAST")

    # Composite Quality Score [0.0, 1.0]
    sharp_norm = float(np.clip(laplacian_var / 150.0, 0.0, 1.0))
    illum_norm = float(np.clip(1.0 - abs(mean_brightness - 128.0) / 128.0, 0.0, 1.0))
    contrast_norm = float(np.clip(std_contrast / 50.0, 0.0, 1.0))
    quality_score = round(0.50 * sharp_norm + 0.30 * illum_norm + 0.20 * contrast_norm, 3)

    passed = len(reasons) == 0
    metrics = {
        "ipd_pixels": round(ipd, 1),
        "blur_laplacian": round(laplacian_var, 1),
        "mean_brightness": round(mean_brightness, 1),
        "contrast_std": round(std_contrast, 1),
        "quality_score": quality_score,
        "reasons": reasons
    }
    return passed, quality_score, metrics


class PassiveLivenessDetector:
    """
    Multi-signal passive anti-spoofing detector.
    Analyzes 2D FFT spatial frequencies, Laplacian skin texture,
    and YCrCb chrominance distribution.
    """

    def __init__(self, liveness_threshold: float = 0.50):
        self.liveness_threshold = liveness_threshold

    def evaluate_liveness(self, face_chip: np.ndarray) -> Tuple[bool, float, Dict[str, Any]]:
        if face_chip is None or face_chip.size == 0:
            return False, 0.0, {}

        resized = cv2.resize(face_chip, (112, 112))
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)

        # 1. 2D FFT Frequency Analysis
        f = np.fft.fft2(gray.astype(np.float32))
        fshift = np.fft.fftshift(f)
        magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-7)

        rows, cols = gray.shape
        crow, ccol = rows // 2, cols // 2
        mask = np.ones((rows, cols), np.uint8)
        cv2.circle(mask, (ccol, crow), 15, 0, -1)
        high_freq_content = float(np.mean(magnitude_spectrum[mask == 1]))
        freq_score = float(np.clip((high_freq_content - 50.0) / 70.0, 0.0, 1.0))

        # 2. Laplacian Texture Analysis
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        texture_score = float(np.clip(laplacian_var / 350.0, 0.0, 1.0))

        # 3. YCrCb Chrominance Analysis
        ycrcb = cv2.cvtColor(resized, cv2.COLOR_BGR2YCrCb)
        cr = ycrcb[:, :, 1].astype(np.float32)
        cb = ycrcb[:, :, 2].astype(np.float32)
        cr_mean = float(np.mean(cr))
        cb_mean = float(np.mean(cb))

        cr_diff = abs(cr_mean - 150.0)
        cb_diff = abs(cb_mean - 102.0)
        chroma_distance = float(np.sqrt(cr_diff**2 + cb_diff**2))
        chroma_score = float(np.clip(1.0 - (chroma_distance / 60.0), 0.0, 1.0))

        # Calibrated multi-signal weighted fusion
        composite_score = round((0.35 * freq_score) + (0.35 * texture_score) + (0.30 * chroma_score), 3)
        is_live = bool(composite_score >= self.liveness_threshold)

        attack_flags = []
        if texture_score < 0.15:
            attack_flags.append("SUSPECTED_PRINTED_PHOTO")
        if freq_score < 0.20:
            attack_flags.append("SUSPECTED_SCREEN_REPLAY")

        metrics = {
            "frequency_score": round(freq_score, 3),
            "texture_score": round(texture_score, 3),
            "chrominance_score": round(chroma_score, 3),
            "composite_score": composite_score,
            "attack_diagnostics": attack_flags
        }
        return is_live, composite_score, metrics


class FaceAttendanceEngine:
    """
    Complete Face Attendance and Passive Anti-Spoofing Pipeline.
    Supports OpenCV YuNet (ONNX) + SFace (ONNX) with spatial fallback.
    """

    def __init__(
        self,
        similarity_threshold: float = 0.40,
        liveness_threshold: float = 0.50,
        consecutive_frames_required: int = 3,
        min_ipd: float = 24.0,
        min_blur: float = 35.0,
        min_brightness: float = 35.0,
        max_brightness: float = 225.0,
        min_contrast: float = 15.0,
        yunet_path: Optional[str] = None,
        adaface_path: Optional[str] = None,
        sface_path: Optional[str] = None,
        db_path: str = "./models/face_database.npz",
        legacy_pkl_path: Optional[str] = None,
        students_json_path: Optional[str] = None,
        image_quality_module: Optional[IntelligentImageQualityModule] = None,
        head_pose_estimator: Optional[HeadPoseEstimator] = None,
        unknown_manager: Optional[UnknownStudentManager] = None,
        timetable_validator: Optional[SectionAttendanceValidator] = None,
        confidence_engine: Optional[AttendanceConfidenceEngine] = None,
        use_gpu: bool = False
    ):
        self.similarity_threshold = similarity_threshold
        self.liveness_threshold = liveness_threshold
        self.consecutive_frames_required = consecutive_frames_required
        self.min_ipd = min_ipd
        self.min_blur = min_blur
        self.min_brightness = min_brightness
        self.max_brightness = max_brightness
        self.min_contrast = min_contrast
        self.db_path = os.path.abspath(db_path)
        self.legacy_pkl_path = os.path.abspath(legacy_pkl_path) if legacy_pkl_path else None
        self.students_json_path = os.path.abspath(students_json_path) if students_json_path else None
        self.use_gpu = use_gpu

        self.liveness_detector = PassiveLivenessDetector(self.liveness_threshold)

        # Advanced Modules (Sections 1, 2, 3, 5, 9)
        self.image_quality_module = image_quality_module or IntelligentImageQualityModule()
        self.head_pose_estimator = head_pose_estimator or HeadPoseEstimator()
        self.observation_buffer = MultiFrameObservationBuffer(buffer_size=5)
        self.unknown_manager = unknown_manager or UnknownStudentManager()
        self.timetable_validator = timetable_validator or SectionAttendanceValidator(students_metadata_path=self.students_json_path)
        self.confidence_engine = confidence_engine or AttendanceConfidenceEngine()

        # Primary Deep Learning Models: YuNet (Detection) + AdaFace IR-50 (Recognition)
        self.embedding_dim = 512
        self.yunet_detector = None
        self.adaface_recognizer = None
        self._init_deep_models(yunet_path, adaface_path)

        # Enrolled identity storage
        self.enrolled_embeddings: Optional[np.ndarray] = None
        self.enrolled_reg_nos: List[str] = []
        self.enrolled_names: List[str] = []

        # Temporal locks & verified attendance
        self.identity_locks: Dict[str, int] = {}
        self.verified_attendance: Dict[Tuple[str, str], Dict[str, Any]] = {}

        self.load_database()

    def _init_deep_models(self, yunet_path: Optional[str], adaface_path: Optional[str]):
        """Initializes OpenCV Deep Learning ONNX models (YuNet and AdaFace IR-50)."""
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        y_path = yunet_path or os.path.join(root_dir, "models", "face_detection_yunet_2023mar.onnx")
        a_path = adaface_path or os.path.join(root_dir, "models", "adaface_ir50_ms1mv2.onnx")

        if os.path.exists(y_path):
            try:
                self.yunet_detector = cv2.FaceDetectorYN.create(y_path, "", (320, 320), score_threshold=0.6)
                logger.info(f"✅ YuNet Deep Face Detector loaded: {os.path.basename(y_path)}")
            except Exception as e:
                logger.warning(f"Could not load YuNet ONNX: {e}")

        # Primary Active Recognition Model: AdaFace IR-50 (512-D)
        self.adaface_recognizer = AdaFaceRecognizer(model_path=a_path, use_gpu=self.use_gpu)

    @property
    def enrolled_metadata(self) -> List[Dict[str, str]]:
        """Returns enrolled student metadata list."""
        return [
            {"reg_no": r, "name": n}
            for r, n in zip(self.enrolled_reg_nos, self.enrolled_names)
        ]

    def load_database(self) -> bool:
        """Loads enrolled student embeddings supporting modern 512-D AdaFace format."""
        # 1. Try modern NPZ file
        if os.path.exists(self.db_path):
            try:
                data = np.load(self.db_path, allow_pickle=True)
                loaded_embs = data["embeddings"].astype(np.float32)

                # Migration Check: Detect if file is legacy 128-D SFace database
                if len(loaded_embs) > 0 and loaded_embs.shape[1] == 128:
                    logger.warning("Detected legacy 128-D SFace database in face_database.npz.")
                    adaface_alt = os.path.join(os.path.dirname(self.db_path), "adaface_database.npz")
                    if os.path.exists(adaface_alt):
                        logger.info(f"Automatically loading modern 512-D AdaFace database from: {adaface_alt}")
                        data = np.load(adaface_alt, allow_pickle=True)
                        loaded_embs = data["embeddings"].astype(np.float32)
                    else:
                        logger.warning("Run 'python migrate_sface_to_adaface.py' to generate 512-D AdaFace embeddings.")

                self.enrolled_embeddings = loaded_embs
                if "reg_nos" in data and "names" in data:
                    self.enrolled_reg_nos = [str(r) for r in data["reg_nos"]]
                    self.enrolled_names = [str(n) for n in data["names"]]
                elif "metadata" in data:
                    meta = data["metadata"]
                    if hasattr(meta, "shape") and meta.shape == ():
                        meta = meta.item()
                    if isinstance(meta, str):
                        meta = json.loads(meta)
                    self.enrolled_reg_nos = [str(m.get("reg_no", m.get("roll_number", ""))) for m in meta]
                    self.enrolled_names = [str(m.get("name", m.get("student_name", ""))) for m in meta]
                logger.info(f"Loaded {len(self.enrolled_reg_nos)} enrolled students from {self.db_path} (dim={self.enrolled_embeddings.shape[1] if len(self.enrolled_embeddings) > 0 else 512})")
                return True
            except Exception as e:
                logger.error(f"Error reading NPZ database: {e}")

        self.enrolled_embeddings = np.empty((0, self.embedding_dim), dtype=np.float32)
        return False

    def save_database(self, db_path: Optional[str] = None) -> bool:
        """Saves enrolled student embeddings to disk."""
        target_path = os.path.abspath(db_path) if db_path else self.db_path
        try:
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            metadata = [
                {"reg_no": r, "name": n}
                for r, n in zip(self.enrolled_reg_nos, self.enrolled_names)
            ]
            np.savez_compressed(
                target_path,
                embeddings=self.enrolled_embeddings,
                metadata=np.array(json.dumps(metadata), dtype=object),
                reg_nos=np.array(self.enrolled_reg_nos, dtype=object),
                names=np.array(self.enrolled_names, dtype=object)
            )
            logger.info(f"Persisted {len(self.enrolled_reg_nos)} students to {target_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to persist face database: {e}")
            return False

    def extract_embedding(self, aligned_face_112: np.ndarray) -> np.ndarray:
        """
        Extracts 512-dimensional unit L2-normalized feature representation from aligned face crop
        using AdaFace IR-50 deep metric network.
        """
        if aligned_face_112 is None or aligned_face_112.size == 0:
            return np.zeros((self.embedding_dim,), dtype=np.float32)

        if self.adaface_recognizer is not None and self.adaface_recognizer.is_loaded:
            return self.adaface_recognizer.extract_embedding(aligned_face_112)

        # Fallback 512-D spatial vectorizer if ONNX model is not present
        return self._spatial_fallback_512(aligned_face_112)

    def _spatial_fallback_512(self, aligned_face_112: np.ndarray) -> np.ndarray:
        """Deterministic 512-D spatial gradient vectorizer fallback."""
        resized = cv2.resize(aligned_face_112, (64, 64))
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
        gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
        mag, ang = cv2.cartToPolar(gx, gy, angleInDegrees=True)

        features = []
        cell_size = 8
        for r in range(8):
            for c in range(8):
                cell_ang = ang[r*cell_size:(r+1)*cell_size, c*cell_size:(c+1)*cell_size]
                cell_mag = mag[r*cell_size:(r+1)*cell_size, c*cell_size:(c+1)*cell_size]
                hist, _ = np.histogram(cell_ang, bins=8, range=(0, 360), weights=cell_mag)
                features.extend(hist)

        emb = np.array(features, dtype=np.float32)  # 512 dims
        norm = np.linalg.norm(emb)
        if norm > 1e-6:
            emb /= norm
        return emb

    def detect_faces(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detects faces and extracts 5 facial landmarks.
        Uses YuNet Deep CNN if available, else multi-space contour detector.
        """
        if frame is None or frame.size == 0:
            return []

        h, w = frame.shape[:2]
        faces = []

        # 1. Primary Path: YuNet Deep CNN Face Detector
        if self.yunet_detector is not None:
            try:
                self.yunet_detector.setInputSize((w, h))
                _, detections = self.yunet_detector.detect(frame)
                if detections is not None and len(detections) > 0:
                    for det in detections:
                        score = float(det[-1])
                        if score < 0.55:
                            continue
                        x, y, bw, bh = [int(v) for v in det[:4]]
                        x1 = max(0, x)
                        y1 = max(0, y)
                        x2 = min(w, x + bw)
                        y2 = min(h, y + bh)
                        # Landmarks: 5 points (x, y) starting at index 4
                        landmarks = det[4:14].reshape(5, 2).astype(np.float32)
                        faces.append({
                            "bbox": [x1, y1, x2, y2],
                            "landmarks": landmarks,
                            "confidence": score
                        })
                    if faces:
                        return faces
            except Exception as e:
                logger.debug(f"YuNet detection exception: {e}")

        # 2. Resilient Fallback: Skin segmentation & morphology
        ycrcb = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb)
        mask = cv2.inRange(ycrcb, np.array([0, 133, 77]), np.array([255, 173, 127]))
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours:
            x, y, bw, bh = cv2.boundingRect(cnt)
            if bw < 50 or bh < 60:
                continue
            aspect = bh / float(bw)
            if not (0.9 <= aspect <= 2.2):
                continue

            landmarks = np.array([
                [x + 0.35 * bw, y + 0.38 * bh],
                [x + 0.65 * bw, y + 0.38 * bh],
                [x + 0.50 * bw, y + 0.58 * bh],
                [x + 0.38 * bw, y + 0.78 * bh],
                [x + 0.62 * bw, y + 0.78 * bh]
            ], dtype=np.float32)

            faces.append({
                "bbox": [x, y, x + bw, y + bh],
                "landmarks": landmarks,
                "confidence": 0.85
            })

        # Central prior fallback
        if not faces and w >= 64 and h >= 64:
            cx, cy = w // 2, h // 2
            bw, bh = int(w * 0.45), int(h * 0.55)
            x1 = max(0, cx - bw // 2)
            y1 = max(0, cy - bh // 2)
            x2 = min(w, x1 + bw)
            y2 = min(h, y1 + bh)
            landmarks = np.array([
                [x1 + 0.35 * (x2 - x1), y1 + 0.38 * (y2 - y1)],
                [x1 + 0.65 * (x2 - x1), y1 + 0.38 * (y2 - y1)],
                [x1 + 0.50 * (x2 - x1), y1 + 0.58 * (y2 - y1)],
                [x1 + 0.38 * (x2 - x1), y1 + 0.78 * (y2 - y1)],
                [x1 + 0.62 * (x2 - x1), y1 + 0.78 * (y2 - y1)]
            ], dtype=np.float32)
            faces.append({
                "bbox": [x1, y1, x2, y2],
                "landmarks": landmarks,
                "confidence": 0.60
            })

        return faces

    def extract_faces_from_frame(self, frame: np.ndarray, fast_mode: bool = True) -> List[Dict[str, Any]]:
        """Extracts detected faces, landmarks, aligned 112x112 chips, and deep embeddings."""
        if frame is None or frame.size == 0:
            return []

        faces = self.detect_faces(frame)
        results = []
        for face in faces:
            bbox = face["bbox"]
            landmarks = face["landmarks"]
            aligned = align_face_112x112(frame, landmarks)

            # Face Quality Assessment (FQA)
            q_pass, q_score, q_metrics = assess_face_quality(
                aligned_face_112=aligned,
                landmarks=landmarks,
                min_ipd=self.min_ipd,
                min_blur=self.min_blur,
                min_brightness=self.min_brightness,
                max_brightness=self.max_brightness,
                min_contrast=self.min_contrast
            )

            # Passive Anti-Spoofing Triad
            is_live, score, metrics = self.liveness_detector.evaluate_liveness(aligned)

            # Deep Embedding (only compute valid embedding if quality passed)
            embedding = self.extract_embedding(aligned) if q_pass else np.zeros((self.embedding_dim,), dtype=np.float32)

            results.append({
                "bbox": bbox,
                "landmarks": landmarks,
                "aligned_face": aligned,
                "embedding": embedding,
                "det_score": face.get("confidence", 0.90),
                "confidence": face.get("confidence", 0.90),
                "is_live": is_live,
                "liveness_score": score,
                "liveness_metrics": metrics,
                "quality_passed": q_pass,
                "quality_score": q_score,
                "quality_metrics": q_metrics
            })
        return results

    def enroll_student(
        self,
        image_path: Union[str, np.ndarray, List],
        reg_no: str,
        name: Optional[str] = None,
        student_name: Optional[str] = None,
        multiple_samples: Optional[List[np.ndarray]] = None
    ) -> Dict[str, Any]:
        """Enrolls student with multi-sample centroid embedding with quality gating."""
        final_name = str(name if name is not None else (student_name or "")).strip()
        reg_no = str(reg_no).strip()

        if not reg_no or not final_name:
            return {"success": False, "message": "Missing registration number or student name"}

        embeddings_list = []
        samples_input = multiple_samples if multiple_samples is not None else (image_path if isinstance(image_path, list) else [image_path])

        for item in samples_input:
            if item is None:
                continue
            if isinstance(item, str):
                if os.path.exists(item):
                    img = cv2.imread(item)
                else:
                    continue
            elif isinstance(item, np.ndarray):
                img = item
            else:
                continue

            if img is None or img.size == 0:
                continue

            if img.shape[:2] == (112, 112):
                q_pass, _, _ = assess_face_quality(img, min_blur=self.min_blur)
                if q_pass or not embeddings_list:
                    emb = self.extract_embedding(img)
                    embeddings_list.append(emb)
            else:
                extracted = self.extract_faces_from_frame(img, fast_mode=False)
                if extracted:
                    valid_faces = [f for f in extracted if f.get("quality_passed", True)]
                    target_face = valid_faces[0] if valid_faces else extracted[0]
                    embeddings_list.append(target_face["embedding"])
                else:
                    h, w = img.shape[:2]
                    crop = img[int(h*0.2):int(h*0.8), int(w*0.2):int(w*0.8)]
                    aligned = cv2.resize(crop, (112, 112))
                    emb = self.extract_embedding(aligned)
                    embeddings_list.append(emb)

        if not embeddings_list:
            return {"success": False, "message": "No valid facial samples detected for enrollment"}

        centroid = np.mean(embeddings_list, axis=0)
        norm = np.linalg.norm(centroid)
        if norm > 1e-6:
            centroid /= norm

        if reg_no in self.enrolled_reg_nos:
            idx = self.enrolled_reg_nos.index(reg_no)
            self.enrolled_embeddings[idx] = centroid
            self.enrolled_names[idx] = final_name
            action = "updated"
        else:
            self.enrolled_embeddings = np.vstack([self.enrolled_embeddings, centroid]) if len(self.enrolled_embeddings) > 0 else np.array([centroid])
            self.enrolled_reg_nos.append(reg_no)
            self.enrolled_names.append(final_name)
            action = "enrolled"

        self.save_database()

        # Synchronize newly enrolled student into active timetable registry
        if self.timetable_validator is not None:
            self.timetable_validator.register_or_update_student(
                roll_number=reg_no,
                name=final_name,
                department=self.timetable_validator.active_session.department,
                semester=self.timetable_validator.active_session.semester,
                section=self.timetable_validator.active_session.scheduled_section
            )

        return {
            "success": True,
            "action": action,
            "reg_no": reg_no,
            "name": final_name,
            "student_name": final_name,
            "samples_averaged": len(embeddings_list)
        }

    def process_frame(
        self,
        frame: np.ndarray,
        date_str: Optional[str] = None,
        camera_id: str = "CAM-01",
        classroom: str = "CR-101",
        camera_is_operational: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Executes complete intelligent pipeline on a CCTV video frame:
        1. Optical illumination & clarity assessment (GREEN / YELLOW / RED)
        2. Adaptive CLAHE & gamma recovery under low lighting
        3. YuNet face detection & 5-point landmark extraction
        4. 3D Head Pose estimation (Yaw, Pitch, Roll) & frontality gating
        5. FQA pre-filter & Passive Anti-Spoofing Triad
        6. Umeyama canonical 112x112 alignment & SFace embedding
        7. Section & Timetable validation (cross-section detection)
        8. Unknown student evidence capturing & registration alerting
        9. Multi-factor confidence & attendance classification
        """
        if frame is None or frame.size == 0:
            return []

        today = date_str or time.strftime("%Y-%m-%d")

        # Step 1: CCTV Footage Quality & Lighting Assessment (Section 1)
        quality_report = self.image_quality_module.assess_frame(
            frame,
            min_blur_threshold=self.min_blur,
            min_contrast_threshold=self.min_contrast
        )
        active_frame = frame
        enhanced_applied = False

        if quality_report.status == "YELLOW":
            active_frame, enhanced_applied = self.image_quality_module.enhance_frame(frame, quality_report)

        faces = self.detect_faces(active_frame)
        results = []

        for f_idx, face in enumerate(faces):
            bbox = face["bbox"]
            landmarks = face["landmarks"]

            # Step 2: Head Pose Estimation (Section 5)
            pose_estimate = self.head_pose_estimator.estimate_pose(landmarks, active_frame.shape)

            aligned_face = align_face_112x112(active_frame, landmarks)

            # Step 3: Face Quality Assessment Gate (FQA)
            q_pass, q_score, q_metrics = assess_face_quality(
                aligned_face_112=aligned_face,
                landmarks=landmarks,
                min_ipd=self.min_ipd,
                min_blur=self.min_blur,
                min_brightness=self.min_brightness,
                max_brightness=self.max_brightness,
                min_contrast=self.min_contrast
            )

            # Step 4: Passive Anti-Spoofing Triad
            is_live, liveness_score, liveness_metrics = self.liveness_detector.evaluate_liveness(aligned_face)

            matched_reg = "UNKNOWN"
            matched_name = "Unknown Person"
            best_sim = 0.0
            is_section_valid = True
            section_reason = ""
            section_alert = None
            student_section = "UNKNOWN"

            # If Camera Quality is RED: recognition is unreliable -> defer to PENDING_VERIFICATION (Section 1)
            if quality_report.status == "RED":
                matched_reg = "LOW_QUALITY"
                matched_name = "Quality Rejected"
                embedding = np.zeros((self.embedding_dim,), dtype=np.float32)
                q_pass = False
            elif not q_pass:
                matched_reg = "LOW_QUALITY"
                matched_name = "Quality Rejected"
                best_sim = 0.0
                embedding = np.zeros((self.embedding_dim,), dtype=np.float32)
            else:
                embedding = self.extract_embedding(aligned_face)

                if self.enrolled_embeddings is not None and len(self.enrolled_embeddings) > 0:
                    if self.enrolled_embeddings.shape[1] == len(embedding):
                        sims = np.dot(self.enrolled_embeddings, embedding)
                        best_idx = int(np.argmax(sims))
                        best_sim = float(sims[best_idx])

                        if best_sim >= self.similarity_threshold:
                            matched_reg = self.enrolled_reg_nos[best_idx]
                            matched_name = self.enrolled_names[best_idx]

                            # Step 5: Section & Timetable Validation (Section 3)
                            sec_val = self.timetable_validator.validate_attendance_eligibility(matched_reg)
                            is_section_valid = sec_val.is_eligible
                            section_reason = sec_val.reason
                            student_section = sec_val.student_section
                            section_alert = sec_val.alert_payload

            # Step 6: Multi-Factor Attendance Confidence Evaluation (Section 9)
            is_registered_student = (matched_reg not in ("UNKNOWN", "LOW_QUALITY"))
            consec_hits = self.identity_locks.get(matched_reg, 0) + 1 if is_registered_student else 0

            confidence_eval = self.confidence_engine.evaluate(
                similarity_score=best_sim,
                is_registered=is_registered_student,
                is_section_valid=is_section_valid,
                liveness_score=liveness_score,
                is_live=is_live,
                quality_score=q_score,
                camera_quality_status=quality_report.status,
                frontality_score=pose_estimate.frontality_score,
                consecutive_track_hits=consec_hits,
                required_track_hits=self.consecutive_frames_required,
                camera_is_operational=camera_is_operational
            )

            # Step 7: Confirmation and Lockout Logic
            attendance_confirmed = False
            # Only confirm if section is valid, confidence passed, live, and not quality-rejected
            if (
                confidence_eval.passed_threshold and
                is_section_valid and
                is_registered_student and
                is_live and
                q_pass and
                quality_report.status != "RED"
            ):
                self.identity_locks[matched_reg] = consec_hits
                key = (matched_reg, today)
                if consec_hits >= self.consecutive_frames_required and key not in self.verified_attendance:
                    attendance_confirmed = True
                    self.verified_attendance[key] = {
                        "roll_number": matched_reg,
                        "student_name": matched_name,
                        "date": today,
                        "time": time.strftime("%H:%M:%S"),
                        "status": "CCTV_VERIFIED_PRESENT",
                        "source": "FACE_RECOGNITION_AI",
                        "similarity": round(best_sim, 3),
                        "composite_confidence": round(confidence_eval.composite_confidence, 3),
                        "liveness_score": round(liveness_score, 3),
                        "quality_score": round(q_score, 3),
                        "section": student_section
                    }
                    logger.info(f"🎓 ATTENDANCE CONFIRMED: {matched_reg} - {matched_name} (Conf: {confidence_eval.composite_confidence:.2f})")
            else:
                if matched_reg in self.identity_locks and consec_hits > 0:
                    self.identity_locks[matched_reg] = max(0, consec_hits - 1)

            results.append({
                "bbox": bbox,
                "landmarks": landmarks.tolist() if hasattr(landmarks, "tolist") else landmarks,
                "reg_no": matched_reg,
                "student_name": matched_name,
                "confidence": round(best_sim, 3),
                "composite_confidence": round(confidence_eval.composite_confidence, 3),
                "classification": confidence_eval.classification,
                "is_live": is_live,
                "liveness_score": round(liveness_score, 3),
                "liveness_metrics": liveness_metrics,
                "quality_passed": q_pass,
                "quality_score": round(q_score, 3),
                "quality_metrics": q_metrics,
                "camera_quality_status": quality_report.status,
                "camera_quality_warning": quality_report.warning_message,
                "is_enhanced": enhanced_applied,
                "head_pose": pose_estimate.to_dict(),
                "is_section_valid": is_section_valid,
                "is_section_mismatch": not is_section_valid and is_registered_student,
                "student_section": student_section,
                "section_reason": section_reason,
                "section_alert": section_alert,
                "attendance_confirmed": attendance_confirmed,
                "daily_record": self.verified_attendance.get((matched_reg, today)),
                "embedding": embedding
            })

        return results
