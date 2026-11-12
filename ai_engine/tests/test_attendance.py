"""Unit Tests for Model 1: Face Attendance and Anti-Spoofing Engine"""

import os
import sys
import unittest
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ai_engine.models.face_engine import (
    FaceAttendanceEngine,
    PassiveLivenessDetector,
    assess_face_quality,
    estimate_norm_affine_matrix,
    align_face_112x112
)


class TestFaceAttendanceEngine(unittest.TestCase):

    def setUp(self):
        self.test_dir = os.path.dirname(os.path.abspath(__file__))
        self.db_path = os.path.join(self.test_dir, "test_face_db.npz")
        self.engine = FaceAttendanceEngine(
            similarity_threshold=0.45,
            liveness_threshold=0.50,
            consecutive_frames_required=3,
            min_blur=0.0,  # Zero for synthetic test array compatibility
            min_ipd=0.0,
            min_contrast=0.0,
            db_path=self.db_path
        )

    def tearDown(self):
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

    def test_landmark_affine_matrix(self):
        """Verifies (2, 3) similarity matrix computation."""
        src_landmarks = np.array([
            [35.0, 50.0],
            [75.0, 52.0],
            [55.0, 70.0],
            [40.0, 90.0],
            [70.0, 91.0]
        ], dtype=np.float32)

        M = estimate_norm_affine_matrix(src_landmarks)
        self.assertEqual(M.shape, (2, 3))
        self.assertTrue(np.all(np.isfinite(M)))

    def test_face_alignment_crop_size(self):
        """Validates aligned face crop resolution is exactly 112x112x3."""
        frame = np.full((480, 640, 3), 128, dtype=np.uint8)
        src_landmarks = np.array([
            [280.0, 200.0],
            [360.0, 200.0],
            [320.0, 240.0],
            [290.0, 280.0],
            [350.0, 280.0]
        ], dtype=np.float32)

        aligned = align_face_112x112(frame, src_landmarks)
        self.assertEqual(aligned.shape, (112, 112, 3))

    def test_l2_normalized_embedding(self):
        """Verifies feature vectors have unit L2 norm."""
        dummy_chip = np.full((112, 112, 3), 140, dtype=np.uint8)
        emb = self.engine.extract_embedding(dummy_chip)

        self.assertGreater(len(emb), 0)
        norm = np.linalg.norm(emb)
        self.assertAlmostEqual(norm, 1.0, places=4)

    def test_passive_liveness_filters(self):
        """Tests 2D FFT, Laplacian, and chrominance filters."""
        detector = PassiveLivenessDetector()
        test_chip = np.random.randint(60, 200, (112, 112, 3), dtype=np.uint8)

        is_live, score, metrics = detector.evaluate_liveness(test_chip)
        self.assertIsInstance(is_live, bool)
        self.assertTrue(0.0 <= score <= 1.0)
        self.assertIn("frequency_score", metrics)
        self.assertIn("texture_score", metrics)
        self.assertIn("chrominance_score", metrics)

    def test_enrollment_and_matching(self):
        """Tests student enrollment and cosine matching."""
        face_a = np.full((112, 112, 3), 90, dtype=np.uint8)
        face_b = np.full((112, 112, 3), 210, dtype=np.uint8)

        res_a = self.engine.enroll_student(face_a, "REG_TEST_A", "Student Test A")
        res_b = self.engine.enroll_student(face_b, "REG_TEST_B", "Student Test B")

        self.assertTrue(res_a["success"])
        self.assertTrue(res_b["success"])
        self.assertEqual(len(self.engine.enrolled_reg_nos), 2)

        results = self.engine.process_frame(face_a)
        self.assertGreater(len(results), 0)
        self.assertEqual(results[0]["reg_no"], "REG_TEST_A")

    def test_face_quality_assessment_rejections(self):
        """Verifies that blurry, under-exposed, and tiny crops are properly flagged."""
        # 1. Pitch-black underexposed chip
        black_chip = np.zeros((112, 112, 3), dtype=np.uint8)
        passed, score, metrics = assess_face_quality(black_chip)
        self.assertFalse(passed)
        self.assertIn("UNDER_EXPOSED", metrics["reasons"])

        # 2. Flat uniform blurry chip (zero Laplacian sharpness)
        flat_chip = np.full((112, 112, 3), 128, dtype=np.uint8)
        passed, score, metrics = assess_face_quality(flat_chip, min_blur=35.0)
        self.assertFalse(passed)
        self.assertIn("MOTION_OR_OPTICAL_BLUR", metrics["reasons"])

        # 3. Small IPD landmarks
        tiny_landmarks = np.array([[50.0, 50.0], [58.0, 50.0], [54.0, 60.0], [51.0, 70.0], [57.0, 70.0]], dtype=np.float32)
        passed, score, metrics = assess_face_quality(flat_chip, landmarks=tiny_landmarks, min_ipd=24.0)
        self.assertFalse(passed)
        self.assertIn("FACE_TOO_SMALL_IPD", metrics["reasons"])

    def test_face_quality_assessment_pass(self):
        """Verifies that well-lit, sharp crops pass the quality filter."""
        # Sharp high-contrast synthetic chip
        sharp_chip = np.random.RandomState(42).randint(40, 220, (112, 112, 3), dtype=np.uint8)
        valid_landmarks = np.array([[38.0, 51.0], [73.0, 51.0], [56.0, 71.0], [41.0, 92.0], [70.0, 92.0]], dtype=np.float32)
        passed, score, metrics = assess_face_quality(sharp_chip, landmarks=valid_landmarks, min_ipd=24.0, min_blur=35.0)
        self.assertTrue(passed)
        self.assertGreater(score, 0.50)
        self.assertEqual(len(metrics["reasons"]), 0)


if __name__ == "__main__":
    unittest.main()
