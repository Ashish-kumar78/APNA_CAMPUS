"""Integration Tests for ByteTracker, Central Attendance Manager, and Backend Sync"""

import os
import sys
import json
import unittest
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ai_engine.core.tracker import SimpleByteTracker, compute_iou_matrix
from ai_engine.services.backend_client import ApnaCampusBackendClient
from ai_engine.core.event_manager import CentralAIEventManager
from ai_engine.models.face_engine import FaceAttendanceEngine


class TestCentralEngineAndBackend(unittest.TestCase):

    def setUp(self):
        self.test_dir = os.path.dirname(os.path.abspath(__file__))
        self.cache_file = os.path.join(self.test_dir, "test_pending_attendance.json")
        self.logs_dir = os.path.join(self.test_dir, "test_logs")
        self.db_path = os.path.join(self.test_dir, "test_event_db.npz")

        self.backend_client = ApnaCampusBackendClient(
            neon_db_url="",  # offline mode
            base_url="http://127.0.0.1:9999",
            logs_dir=self.logs_dir,
            cache_path=self.cache_file
        )
        self.face_engine = FaceAttendanceEngine(db_path=self.db_path)
        self.tracker = SimpleByteTracker()

        self.manager = CentralAIEventManager(
            face_engine=self.face_engine,
            backend_client=self.backend_client,
            tracker=self.tracker
        )

    def tearDown(self):
        for path in [self.cache_file, self.db_path]:
            if os.path.exists(path):
                os.remove(path)
        if os.path.exists(self.logs_dir):
            for f in os.listdir(self.logs_dir):
                os.remove(os.path.join(self.logs_dir, f))
            os.rmdir(self.logs_dir)

    def test_bytetrack_iou_computation(self):
        boxes_a = np.array([[10, 10, 50, 50]])
        boxes_b = np.array([[10, 10, 50, 50], [100, 100, 150, 150]])
        iou = compute_iou_matrix(boxes_a, boxes_b)

        self.assertEqual(iou.shape, (1, 2))
        self.assertAlmostEqual(iou[0, 0], 1.0, places=4)
        self.assertAlmostEqual(iou[0, 1], 0.0, places=4)

    def test_bytetrack_stable_track_ids(self):
        tracker = SimpleByteTracker()
        frame1_dets = [{"bbox": [50, 50, 150, 150], "confidence": 0.90, "class_name": "person"}]
        tracks1 = tracker.update(frame1_dets)
        self.assertEqual(len(tracks1), 1)
        initial_id = tracks1[0]["track_id"]

        frame2_dets = [{"bbox": [55, 52, 155, 152], "confidence": 0.88, "class_name": "person"}]
        tracks2 = tracker.update(frame2_dets)
        self.assertEqual(len(tracks2), 1)
        self.assertEqual(tracks2[0]["track_id"], initial_id)

    def test_backend_client_offline_caching(self):
        result = self.backend_client.submit_attendance(
            roll_number="2201297055",
            student_name="Test Student",
            date_str="2026-11-08",
            time_str="18:30:00"
        )

        payload = result["payload"]
        self.assertEqual(payload["roll_number"], "2201297055")
        self.assertEqual(payload["student_name"], "Test Student")
        self.assertEqual(payload["date"], "2026-11-08")
        self.assertEqual(payload["time"], "18:30:00")
        self.assertEqual(payload["status"], "PRESENT")

        self.assertTrue(result["cached"])
        self.assertTrue(os.path.exists(self.cache_file))

    def test_central_event_manager_attendance_tick(self):
        frame = np.full((480, 640, 3), 150, dtype=np.uint8)
        tick_res = self.manager.process_tick(frame, timestamp=500.0)

        self.assertIn("timestamp", tick_res)
        self.assertIn("face_results", tick_res)
        self.assertIn("active_tracks", tick_res)
        self.assertIn("stats", tick_res)
        self.assertEqual(tick_res["stats"]["frames"], 1)


if __name__ == "__main__":
    unittest.main()
