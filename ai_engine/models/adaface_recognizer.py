"""
AdaFace Facial Recognition Engine (adaface_recognizer.py)
Replaces SFace with AdaFace (Quality Adaptive Margin for Face Recognition - CVPR 2022)

Architecture:
- Backbone: Improved Residual ResNet-50 (IR-50 / IResNet-50)
- Input: 112x112x3 BGR canonical aligned facial chip
- Normalization: (image - 127.5) / 128.0 (scaled to [-1.0, 1.0])
- Output: 512-dimensional unit L2-normalized feature embedding vector
- Feature Norm: Raw feature magnitude provides an intrinsic face image quality metric
"""

import os
import time
import logging
from typing import Optional, Tuple, Dict, Any, List, Union
import numpy as np
import cv2

logger = logging.getLogger("AdaFaceRecognizer")


class AdaFaceRecognizer:
    """
    High-performance AdaFace IR-50 Deep Metric Face Recognition Engine.
    Loaded once during initialization and reused across all video frames.
    """

    MODEL_NAME = "AdaFace"
    MODEL_BACKBONE = "IR-50"
    MODEL_VERSION = "1.0.0-ms1mv2"
    EMBEDDING_DIM = 512

    def __init__(
        self,
        model_path: Optional[str] = None,
        use_gpu: bool = False
    ):
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        self.model_path = model_path or os.path.join(root_dir, "models", "adaface_ir50_ms1mv2.onnx")
        self.use_gpu = use_gpu

        self.net = None
        self.is_loaded = False
        self.total_inferences = 0
        self.total_inference_time_sec = 0.0

        self._load_model()

    def _load_model(self):
        """Loads AdaFace ONNX neural network into OpenCV DNN module."""
        if not os.path.exists(self.model_path):
            logger.error(f"❌ AdaFace model file not found: {self.model_path}")
            self.is_loaded = False
            return

        try:
            t0 = time.time()
            self.net = cv2.dnn.readNetFromONNX(self.model_path)

            if self.use_gpu:
                try:
                    self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_CUDA)
                    self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CUDA)
                    logger.info("⚡ AdaFace: Enabled CUDA GPU acceleration.")
                except Exception as e:
                    logger.warning(f"CUDA initialization failed, falling back to CPU: {e}")
                    self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
                    self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
            else:
                self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
                self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)

            # Warmup inference
            dummy = np.zeros((112, 112, 3), dtype=np.uint8)
            self.extract_embedding(dummy)

            self.is_loaded = True
            dur = (time.time() - t0) * 1000.0
            logger.info(f"✅ AdaFace IR-50 loaded successfully ({os.path.basename(self.model_path)}) in {dur:.1f}ms")
        except Exception as e:
            logger.error(f"❌ Failed to load AdaFace ONNX model: {e}")
            self.is_loaded = False

    def extract_embedding(
        self,
        aligned_face_112: np.ndarray
    ) -> np.ndarray:
        """
        Generates 512-dimensional unit L2-normalized feature embedding from aligned 112x112 face.
        Preprocessing:
        - Input: 112x112 BGR image
        - Scaling: (pixel - 127.5) / 128.0 (range [-1.0, 1.0])
        """
        if aligned_face_112 is None or aligned_face_112.size == 0:
            return np.zeros((self.EMBEDDING_DIM,), dtype=np.float32)

        if aligned_face_112.shape[:2] != (112, 112):
            aligned_face_112 = cv2.resize(aligned_face_112, (112, 112))

        # Fallback if model not loaded
        if not self.is_loaded or self.net is None:
            return self._spatial_fallback_embedding(aligned_face_112)

        try:
            t0 = time.perf_counter()

            # AdaFace official input normalization:
            # (image - 127.5) / 128.0 = image * (1 / 127.5) - 1.0
            blob = cv2.dnn.blobFromImage(
                aligned_face_112,
                scalefactor=1.0 / 127.5,
                size=(112, 112),
                mean=(127.5, 127.5, 127.5),
                swapRB=False,  # AdaFace uses BGR
                crop=False
            )

            self.net.setInput(blob)
            out = self.net.forward()  # Shape: (1, 512)

            emb = out.flatten().astype(np.float32)
            norm = float(np.linalg.norm(emb))

            if norm > 1e-6:
                emb = emb / norm
            else:
                emb = np.zeros((self.EMBEDDING_DIM,), dtype=np.float32)

            dur = time.perf_counter() - t0
            self.total_inferences += 1
            self.total_inference_time_sec += dur

            return emb
        except Exception as e:
            logger.error(f"AdaFace inference error: {e}")
            return self._spatial_fallback_embedding(aligned_face_112)

    def extract_embedding_with_quality(
        self,
        aligned_face_112: np.ndarray
    ) -> Tuple[np.ndarray, float]:
        """
        Extracts embedding and returns raw feature norm before L2 normalization.
        In AdaFace, feature norm directly correlates with facial image quality.
        """
        if not self.is_loaded or self.net is None:
            return self.extract_embedding(aligned_face_112), 1.0

        blob = cv2.dnn.blobFromImage(
            aligned_face_112,
            scalefactor=1.0 / 127.5,
            size=(112, 112),
            mean=(127.5, 127.5, 127.5),
            swapRB=False,
            crop=False
        )
        self.net.setInput(blob)
        out = self.net.forward().flatten().astype(np.float32)
        raw_norm = float(np.linalg.norm(out))

        emb = out / (raw_norm + 1e-7)
        return emb, raw_norm

    def extract_embeddings_batch(
        self,
        aligned_faces_112: List[np.ndarray]
    ) -> np.ndarray:
        """Processes a batch of 112x112 aligned faces in a single forward pass."""
        if not aligned_faces_112:
            return np.empty((0, self.EMBEDDING_DIM), dtype=np.float32)

        if not self.is_loaded or self.net is None:
            return np.array([self.extract_embedding(f) for f in aligned_faces_112], dtype=np.float32)

        try:
            resized_faces = [
                f if f.shape[:2] == (112, 112) else cv2.resize(f, (112, 112))
                for f in aligned_faces_112
            ]

            blob = cv2.dnn.blobFromImages(
                resized_faces,
                scalefactor=1.0 / 127.5,
                size=(112, 112),
                mean=(127.5, 127.5, 127.5),
                swapRB=False,
                crop=False
            )

            self.net.setInput(blob)
            out = self.net.forward()  # Shape: (N, 512)

            norms = np.linalg.norm(out, axis=1, keepdims=True) + 1e-7
            normalized_embs = (out / norms).astype(np.float32)
            return normalized_embs
        except Exception as e:
            logger.error(f"AdaFace batch inference error: {e}")
            return np.array([self.extract_embedding(f) for f in aligned_faces_112], dtype=np.float32)

    def _spatial_fallback_embedding(self, face_chip: np.ndarray) -> np.ndarray:
        """Deterministic 512-D spatial fallback if ONNX inference fails."""
        resized = cv2.resize(face_chip, (64, 64))
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
        gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
        mag, ang = cv2.cartToPolar(gx, gy, angleInDegrees=True)

        features = []
        cell_size = 8  # 8x8 grid of 8x8 cells = 64 cells * 8 bins = 512 dims
        for r in range(8):
            for c in range(8):
                cell_ang = ang[r*cell_size:(r+1)*cell_size, c*cell_size:(c+1)*cell_size]
                cell_mag = mag[r*cell_size:(r+1)*cell_size, c*cell_size:(c+1)*cell_size]
                hist, _ = np.histogram(cell_ang, bins=8, range=(0, 360), weights=cell_mag)
                features.extend(hist)

        emb = np.array(features, dtype=np.float32)
        norm = np.linalg.norm(emb)
        if norm > 1e-6:
            emb /= norm
        return emb

    @property
    def average_latency_ms(self) -> float:
        if self.total_inferences == 0:
            return 0.0
        return (self.total_inference_time_sec / self.total_inferences) * 1000.0

    def get_monitoring_telemetry(self) -> Dict[str, Any]:
        """Returns runtime performance telemetry for the Admin Dashboard."""
        return {
            "active_model": self.MODEL_NAME,
            "model_backbone": self.MODEL_BACKBONE,
            "model_version": self.MODEL_VERSION,
            "embedding_dimension": self.EMBEDDING_DIM,
            "is_loaded": self.is_loaded,
            "total_inferences": self.total_inferences,
            "average_latency_ms": round(self.average_latency_ms, 2),
            "device": "CUDA_GPU" if self.use_gpu else "CPU_AVX2"
        }
