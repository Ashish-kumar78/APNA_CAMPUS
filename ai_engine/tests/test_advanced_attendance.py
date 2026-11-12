"""
Unit Tests for Advanced CCTV Attendance System Upgrades (test_advanced_attendance.py)
Tests all 14 error-handling, accuracy enhancement, and intelligent recovery scenarios:
1. Low lighting, darkness & adaptive enhancement (Section 1)
2. Unregistered student detection & evidence vault (Section 2)
3. Cross-section student detection & timetable validation (Section 3)
4. Camera stream health & frozen footage detection (Section 4)
5. Head movement, pose estimation & multi-frame buffer (Section 5)
6. Classroom headcount reconciliation (Section 6)
7. Duplicate face detection & simultaneous identity collision (Section 7)
8. Student entry/exit duration tracking & policies (Section 8)
9. Multi-factor confidence & verification engine (Section 9)
"""

import os
import shutil
import tempfile
import unittest
import numpy as np
import cv2

from ai_engine.models.image_enhancer import IntelligentImageQualityModule, FrameQualityReport
from ai_engine.models.head_pose import HeadPoseEstimator, MultiFrameObservationBuffer, HeadPoseEstimate
from ai_engine.models.unknown_student_manager import UnknownStudentManager
from ai_engine.core.timetable_validator import SectionAttendanceValidator, ActiveClassSession
from ai_engine.core.camera_health import CameraHealthMonitor
from ai_engine.core.headcount_reconciler import HeadcountReconciler
from ai_engine.core.confidence_engine import AttendanceConfidenceEngine


class TestAdvancedAttendanceUpgrades(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp(prefix="test_attendance_advanced_")
        self.vault_dir = os.path.join(self.test_dir, "vault")
        self.records_json = os.path.join(self.test_dir, "unknown_records.json")

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    # -------------------------------------------------------------------------
    # Scenario 1: Low Lighting, Darkness & Adaptive Enhancement
    # -------------------------------------------------------------------------
    def test_scenario_1_lighting_and_enhancement(self):
        enhancer = IntelligentImageQualityModule(
            green_brightness_min=50.0,
            green_brightness_max=210.0,
            red_brightness_min=20.0
        )

        # 1. Pitch dark frame -> Must be RED & unreliable
        dark_frame = np.full((240, 320, 3), 10, dtype=np.uint8)
        dark_report = enhancer.assess_frame(dark_frame)
        self.assertEqual(dark_report.status, "RED")
        self.assertFalse(dark_report.is_recognition_reliable)
        self.assertIn("EXTREME_LOW_LIGHT", dark_report.reasons)

        # 2. Dim / Yellow low-light frame -> Must be YELLOW and enhanced
        dim_frame = np.full((240, 320, 3), 35, dtype=np.uint8)
        dim_report = enhancer.assess_frame(dim_frame)
        self.assertEqual(dim_report.status, "YELLOW")
        enhanced_frame, applied = enhancer.enhance_frame(dim_frame, dim_report)
        self.assertTrue(applied)
        # Enhanced frame mean brightness must be higher than original
        self.assertGreater(float(np.mean(enhanced_frame)), float(np.mean(dim_frame)))

        # 3. Well-lit clear frame -> Must be GREEN
        # Add random texture so it has contrast
        good_frame = np.random.RandomState(42).randint(70, 180, (240, 320, 3), dtype=np.uint8)
        good_report = enhancer.assess_frame(good_frame)
        self.assertEqual(good_report.status, "GREEN")
        self.assertTrue(good_report.is_recognition_reliable)

    # -------------------------------------------------------------------------
    # Scenario 2: Unregistered Student Detection & Evidence Management
    # -------------------------------------------------------------------------
    def test_scenario_2_unregistered_student_management(self):
        manager = UnknownStudentManager(
            vault_dir=self.vault_dir,
            records_json=self.records_json,
            max_similarity_cutoff=0.40,
            recheck_threshold=0.50
        )

        mock_frame = np.full((300, 300, 3), 120, dtype=np.uint8)
        mock_bbox = [50, 50, 150, 150]
        mock_emb = np.random.RandomState(10).randn(128).astype(np.float32)

        # Trigger unknown face
        temp_id, alert = manager.handle_unregistered_face(
            track_id=1,
            frame=mock_frame,
            bbox=mock_bbox,
            embedding=mock_emb,
            best_similarity=0.25,
            liveness_score=0.92,
            camera_id="CAM-TEST",
            classroom="CR-101",
            cooldown_sec=0.0
        )

        self.assertEqual(temp_id, "UNKNOWN-TRACK-001")
        self.assertIsNotNone(alert)
        self.assertEqual(alert["alert_type"], "UNREGISTERED_STUDENT_DETECTED")
        self.assertEqual(len(alert["available_admin_actions"]), 5)
        # Verify evidence crop was written to disk
        self.assertTrue(os.path.exists(alert["evidence_snapshot"]))

        # Cross-check historical records when student is later enrolled
        resolved = manager.recheck_unknown_records(
            new_roll_number="NEW_ROLL_105",
            new_embedding=mock_emb  # Same embedding matches perfectly
        )
        self.assertEqual(len(resolved), 1)
        self.assertEqual(resolved[0]["roll_number"], "NEW_ROLL_105")
        self.assertEqual(manager.records[temp_id].status, "RESOLVED_BY_REGISTRATION")

    # -------------------------------------------------------------------------
    # Scenario 3: Cross-Section Student Detection & Timetable Validation
    # -------------------------------------------------------------------------
    def test_scenario_3_cross_section_validation(self):
        # Section A lecture
        session = ActiveClassSession(
            classroom="CR-101",
            department="CSE",
            semester=5,
            scheduled_section="A",
            subject="Machine Learning"
        )
        validator = SectionAttendanceValidator(active_session=session)
        validator.register_or_update_student("ROLL_A", "Alice", "CSE", 5, "A")
        validator.register_or_update_student("ROLL_B", "Bob", "CSE", 5, "B")

        # 1. Section A student in Section A lecture -> ELIGIBLE
        res_a = validator.validate_attendance_eligibility("ROLL_A")
        self.assertTrue(res_a.is_eligible)
        self.assertEqual(res_a.status, "ELIGIBLE")

        # 2. Section B student in Section A lecture -> SECTION_MISMATCH
        res_b = validator.validate_attendance_eligibility("ROLL_B")
        self.assertFalse(res_b.is_eligible)
        self.assertEqual(res_b.status, "SECTION_MISMATCH")
        self.assertIsNotNone(res_b.alert_payload)
        self.assertEqual(res_b.alert_payload["alert_type"], "SECTION_MISMATCH")

        # 3. Authorized Exception (e.g. approved substitute lecture)
        validator.add_authorized_exception("ROLL_B", "Approved substitute lecture")
        res_b_exc = validator.validate_attendance_eligibility("ROLL_B")
        self.assertTrue(res_b_exc.is_eligible)
        self.assertIn("Approved Exception", res_b_exc.reason)

    # -------------------------------------------------------------------------
    # Scenario 4: CCTV Camera Health & Frozen Footage Detection
    # -------------------------------------------------------------------------
    def test_scenario_4_camera_health_and_frozen_stream(self):
        monitor = CameraHealthMonitor(
            camera_id="CAM-01",
            classroom="CR-101",
            frozen_seconds_threshold=2.0,
            heartbeat_timeout_sec=3.0
        )

        # Feed frame 1
        frame_static = np.full((120, 160, 3), 100, dtype=np.uint8)
        rep1 = monitor.record_frame(frame_static, timestamp=10.0)
        self.assertTrue(rep1.is_operational)
        self.assertFalse(rep1.is_frozen)

        # Feed exact identical static frame 2.5 seconds later -> must trigger FROZEN
        rep2 = monitor.record_frame(frame_static, timestamp=12.5)
        self.assertTrue(rep2.is_frozen)
        self.assertEqual(rep2.status, "FROZEN")
        self.assertFalse(rep2.is_operational)
        self.assertEqual(rep2.error_category, "FROZEN_VIDEO_FEED")

        # Heartbeat timeout check -> triggers OFFLINE
        rep_offline = monitor.check_heartbeat(current_time=20.0)
        self.assertEqual(rep_offline.status, "OFFLINE")
        self.assertFalse(rep_offline.is_operational)

    # -------------------------------------------------------------------------
    # Scenario 5: Head Movement, Pose Estimation & Multi-Frame Buffer
    # -------------------------------------------------------------------------
    def test_scenario_5_head_pose_and_observation_buffer(self):
        pose_estimator = HeadPoseEstimator()

        # Frontal landmarks
        frontal_pts = np.array([
            [38.0, 51.0], [73.0, 51.0], [56.0, 71.0], [41.0, 92.0], [70.0, 92.0]
        ], dtype=np.float32)
        pose_front = pose_estimator.estimate_pose(frontal_pts, (112, 112))
        self.assertTrue(pose_front.is_frontal)
        self.assertGreater(pose_front.frontality_score, 0.70)

        # Student looking down (nose lowered towards mouth)
        down_pts = np.array([
            [38.0, 45.0], [73.0, 45.0], [56.0, 85.0], [41.0, 90.0], [70.0, 90.0]
        ], dtype=np.float32)
        pose_down = pose_estimator.estimate_pose(down_pts, (112, 112))
        self.assertTrue(pose_down.is_looking_down)

        # Multi-frame observation buffer test
        buffer = MultiFrameObservationBuffer(buffer_size=5)
        mock_chip = np.zeros((112, 112, 3), dtype=np.uint8)

        # Add looking-down observation
        buffer.add_observation(
            track_id=1, timestamp=1.0, face_chip=mock_chip, landmarks=down_pts,
            pose=pose_down, quality_score=0.6, sharpness=40.0
        )
        # Add frontal observation
        buffer.add_observation(
            track_id=1, timestamp=2.0, face_chip=mock_chip, landmarks=frontal_pts,
            pose=pose_front, quality_score=0.9, sharpness=90.0
        )

        best_obs = buffer.get_best_observation(track_id=1)
        self.assertIsNotNone(best_obs)
        # Best observation must be the frontal one with higher composite score
        self.assertEqual(best_obs.timestamp, 2.0)
        self.assertTrue(best_obs.pose.is_frontal)

    # -------------------------------------------------------------------------
    # Scenarios 6, 7, 8: Headcount, Duplicate Prevention & Entry/Exit Tracking
    # -------------------------------------------------------------------------
    def test_scenarios_6_7_8_reconciliation_and_collision(self):
        reconciler = HeadcountReconciler(
            enrolled_strength=40,
            class_start_time=1000.0,
            class_duration_minutes=60,
            late_entry_window_minutes=15
        )

        # Frame 1: Roll 101 on Track 1, Unknown on Track 2
        faces_t1 = [
            {"track_id": 1, "reg_no": "101", "student_name": "Student 101"},
            {"track_id": 2, "reg_no": "UNKNOWN-TRACK-002", "student_name": "Unregistered"}
        ]
        reconciler.record_frame_detections(faces_t1, timestamp=1000.0)

        # Scenario 7: Simultaneous Duplicate Identity Collision Check
        # Roll 101 detected on Track 1 and Track 3 in the same frame!
        faces_collision = [
            {"track_id": 1, "reg_no": "101", "student_name": "Student 101"},
            {"track_id": 3, "reg_no": "101", "student_name": "Student 101"}
        ]
        collision_alerts = reconciler.record_frame_detections(faces_collision, timestamp=1010.0)
        self.assertEqual(len(collision_alerts), 1)
        self.assertEqual(collision_alerts[0]["alert_type"], "SUSPICIOUS_DUPLICATE_IDENTITY_COLLISION")

        # Scenario 8: Entry/Exit Duration Policy Check
        # Simulate student presence over 50 minutes (3000 seconds)
        reconciler.student_presence["101"].last_seen_time = 1000.0 + 3000.0
        status, policy, metrics = reconciler.evaluate_attendance_policy("101", current_time=4000.0)
        self.assertEqual(status, "CCTV_VERIFIED_PRESENT")
        self.assertEqual(policy, "FULL_ATTENDANCE")
        self.assertGreaterEqual(metrics["coverage_ratio"], 0.70)

        # Scenario 6: Headcount Summary Structure Verification
        reconciler.student_presence["101"].is_confirmed = True
        summary = reconciler.get_reconciliation_summary()
        summary_dict = summary.to_dict()

        self.assertEqual(summary_dict["enrolled_in_section"], 40)
        self.assertGreaterEqual(summary_dict["unique_students_detected"], 2)
        self.assertEqual(summary_dict["confirmed_present"], 1)
        self.assertEqual(summary_dict["unknown_individuals"], 1)

    # -------------------------------------------------------------------------
    # Scenario 9: Intelligent Attendance Confidence Engine
    # -------------------------------------------------------------------------
    def test_scenario_9_confidence_engine(self):
        engine = AttendanceConfidenceEngine(confidence_threshold=0.70)

        # 1. Perfect genuine student
        eval_pass = engine.evaluate(
            similarity_score=0.75,
            is_registered=True,
            is_section_valid=True,
            liveness_score=0.95,
            is_live=True,
            quality_score=0.90,
            camera_quality_status="GREEN",
            frontality_score=0.95,
            consecutive_track_hits=4,
            required_track_hits=3
        )
        self.assertTrue(eval_pass.passed_threshold)
        self.assertEqual(eval_pass.classification, "CCTV_VERIFIED_PRESENT")
        self.assertGreaterEqual(eval_pass.composite_confidence, 0.70)

        # 2. Camera quality RED -> Must map to PENDING_VERIFICATION
        eval_red = engine.evaluate(
            similarity_score=0.85,
            is_registered=True,
            is_section_valid=True,
            liveness_score=0.95,
            is_live=True,
            quality_score=0.30,
            camera_quality_status="RED",
            frontality_score=0.90,
            consecutive_track_hits=4
        )
        self.assertFalse(eval_red.passed_threshold)
        self.assertEqual(eval_red.classification, "PENDING_VERIFICATION")
        self.assertIn("CAMERA_IMAGE_QUALITY_WARNING_RED", eval_red.reasons)

        # 3. Cross-section mismatch -> Must map to SECTION_MISMATCH
        eval_sec = engine.evaluate(
            similarity_score=0.80,
            is_registered=True,
            is_section_valid=False,
            liveness_score=0.95,
            is_live=True,
            quality_score=0.90,
            camera_quality_status="GREEN",
            frontality_score=0.90,
            consecutive_track_hits=4
        )
        self.assertEqual(eval_sec.classification, "SECTION_MISMATCH")


if __name__ == "__main__":
    unittest.main()
