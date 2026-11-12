"""
Central Face Attendance Event Manager (event_manager.py)
Upgraded Intelligent CCTV Attendance & Verification Architecture

Integrates:
- Real-time CCTV Stream Health & Frozen Footage Monitor (Section 4)
- Multi-factor Face Recognition, FQA, & Passive Anti-Spoofing (Sections 1 & 9)
- ByteTrack Person Association & Simultaneous Duplicate Identity Collision Prevention (Section 7)
- Unregistered Student Evidence Vault & Dashboard Alerting (Section 2)
- Section-Based Timetable Validation (Section 3)
- Head Pose Estimation & Multi-Frame Consistency (Section 5)
- Classroom Headcount Reconciliation (Section 6)
- Student Entry/Exit Tracking & Attendance Duration Policies (Section 8)
- Direct Neon PostgreSQL Cloud Sync with Fallback Offline Resilience
"""

import time
import logging
from typing import Dict, Any, List, Optional, Set
import numpy as np

from ai_engine.models.face_engine import FaceAttendanceEngine
from ai_engine.core.tracker import SimpleByteTracker, compute_iou_matrix
from ai_engine.core.camera_health import CameraHealthMonitor, CameraHealthReport
from ai_engine.core.headcount_reconciler import HeadcountReconciler, HeadcountSummary
from ai_engine.services.backend_client import ApnaCampusBackendClient
from ai_engine.examination_interface import AttendanceVerificationEvent, examination_bus

logger = logging.getLogger("AttendanceEventManager")


class CentralAIEventManager:
    """
    Central real-time orchestration engine processing CCTV streams into validated academic attendance.
    """

    def __init__(
        self,
        face_engine: FaceAttendanceEngine,
        backend_client: ApnaCampusBackendClient,
        tracker: Optional[SimpleByteTracker] = None,
        camera_id: str = "CAM-01",
        classroom: str = "CR-101",
        temporal_window: int = 5,
        consensus_required: int = 3,
        camera_health_monitor: Optional[CameraHealthMonitor] = None,
        headcount_reconciler: Optional[HeadcountReconciler] = None
    ):
        self.face_engine = face_engine
        self.backend_client = backend_client
        self.tracker = tracker or SimpleByteTracker()
        self.camera_id = camera_id
        self.classroom = classroom
        self.temporal_window = temporal_window
        self.consensus_required = consensus_required

        # Advanced Modules (Sections 4, 6, 7, 8)
        self.camera_health = camera_health_monitor or CameraHealthMonitor(
            camera_id=self.camera_id,
            classroom=self.classroom
        )
        self.headcount_reconciler = headcount_reconciler or HeadcountReconciler()

        self.total_frames_processed = 0
        self.total_attendances_confirmed = 0

        # Temporal voting buffer per tracking ID: {track_id: [vote1, vote2, ...]}
        self.track_votes: Dict[int, List[Dict[str, Any]]] = {}

        # Session-level duplicate lockout
        self.confirmed_students: Set[str] = set()

    def process_tick(
        self,
        frame: np.ndarray,
        timestamp: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Processes a single CCTV video frame across all intelligent recovery & validation layers.
        """
        now = timestamp if timestamp is not None else time.time()
        self.total_frames_processed += 1

        # 1. Camera Stream Health & Frozen Footage Monitor (Section 4)
        health_report = self.camera_health.record_frame(frame, timestamp=now)

        # If camera is completely frozen or non-operational: never blindly mark absent/present (Section 4 & 12)
        if not health_report.is_operational:
            return {
                "timestamp": now,
                "camera_id": self.camera_id,
                "classroom": self.classroom,
                "camera_health": health_report.to_dict(),
                "camera_quality_status": "RED",
                "face_results": [],
                "active_tracks": [],
                "headcount_reconciliation": self.headcount_reconciler.get_reconciliation_summary().to_dict(),
                "collision_alerts": [],
                "system_alert": health_report.alert_message or "Camera offline or frozen. Manual fallback active."
            }

        # 2. Deep Face Recognition, Liveness, Quality & Section Validation Pipeline
        face_results = self.face_engine.process_frame(
            frame=frame,
            date_str=time.strftime("%Y-%m-%d", time.localtime(now)),
            camera_id=self.camera_id,
            classroom=self.classroom,
            camera_is_operational=health_report.is_operational
        )

        # 3. Association Tracking (ByteTrack)
        det_boxes = [
            {"bbox": f["bbox"], "confidence": f.get("confidence", 0.90), "class_name": "person"}
            for f in face_results
        ]
        active_tracks = self.tracker.update(det_boxes)

        # Map tracking IDs to detected faces using IoU
        if face_results and active_tracks:
            f_boxes = np.array([f["bbox"] for f in face_results], dtype=np.float32)
            t_boxes = np.array([t["bbox"] for t in active_tracks], dtype=np.float32)
            iou_mat = compute_iou_matrix(f_boxes, t_boxes)

            for f_idx, face in enumerate(face_results):
                if iou_mat.shape[1] > 0:
                    best_t_idx = int(np.argmax(iou_mat[f_idx]))
                    if iou_mat[f_idx, best_t_idx] >= 0.25:
                        face["track_id"] = active_tracks[best_t_idx]["track_id"]

        # 4. Unknown Student Detection & Evidence Management (Section 2)
        for face in face_results:
            track_id = face.get("track_id")
            reg_no = face.get("reg_no", "UNKNOWN")
            best_sim = face.get("confidence", 0.0)
            is_live = face.get("is_live", False)
            live_score = face.get("liveness_score", 0.0)
            q_pass = face.get("quality_passed", True)

            # If face is high quality and live, but unassigned to any registered profile -> Unknown Student
            if (reg_no in ("UNKNOWN", "LOW_QUALITY") or reg_no.startswith("UNKNOWN-TRACK")) and is_live and q_pass and track_id is not None:
                temp_id, alert_payload = self.face_engine.unknown_manager.handle_unregistered_face(
                    track_id=track_id,
                    frame=frame,
                    bbox=face["bbox"],
                    embedding=face.get("embedding"),
                    best_similarity=best_sim,
                    liveness_score=live_score,
                    camera_id=self.camera_id,
                    classroom=self.classroom
                )
                face["reg_no"] = temp_id
                face["student_name"] = "Unregistered Individual"
                face["classification"] = "UNKNOWN_STUDENT"
                if alert_payload:
                    face["unknown_student_alert"] = alert_payload

        # 5. Headcount Reconciliation, Collision Detection & Duration Tracking (Sections 6, 7, 8)
        collision_alerts = self.headcount_reconciler.record_frame_detections(face_results, timestamp=now)

        # 6. Temporal Identity Consistency & Consensus Attendance Locking
        camera_quality_status = face_results[0].get("camera_quality_status", "GREEN") if face_results else "GREEN"

        for res in face_results:
            track_id = res.get("track_id")
            reg_no = res.get("reg_no", "UNKNOWN")
            name = res.get("student_name", "Unknown Person")
            is_live = res.get("is_live", False)
            q_pass = res.get("quality_passed", True)
            sim = res.get("confidence", 0.0)
            is_section_valid = res.get("is_section_valid", True)
            is_section_mismatch = res.get("is_section_mismatch", False)

            # Never mark attendance if cross-section mismatch or quality is RED
            if is_section_mismatch or camera_quality_status == "RED":
                continue

            # Temporal voting per track_id
            if track_id is not None:
                if track_id not in self.track_votes:
                    self.track_votes[track_id] = []
                self.track_votes[track_id].append({
                    "reg_no": reg_no,
                    "student_name": name,
                    "is_live": is_live,
                    "quality_passed": q_pass,
                    "confidence": sim,
                    "is_section_valid": is_section_valid
                })
                if len(self.track_votes[track_id]) > self.temporal_window:
                    self.track_votes[track_id].pop(0)

                valid_votes = [
                    v for v in self.track_votes[track_id]
                    if not (v["reg_no"] in ("UNKNOWN", "LOW_QUALITY") or v["reg_no"].startswith("UNKNOWN-TRACK"))
                    and v["is_live"]
                    and v["quality_passed"]
                    and v["is_section_valid"]
                ]
                counts: Dict[str, int] = {}
                for v in valid_votes:
                    counts[v["reg_no"]] = counts.get(v["reg_no"], 0) + 1

                for cand_reg, count in counts.items():
                    if count >= self.consensus_required and cand_reg not in self.confirmed_students:
                        self.confirmed_students.add(cand_reg)
                        res["attendance_confirmed"] = True
                        self.total_attendances_confirmed += 1

                        # Mark confirmed in headcount reconciler
                        if cand_reg in self.headcount_reconciler.student_presence:
                            self.headcount_reconciler.student_presence[cand_reg].is_confirmed = True

                        # Push to Neon PostgreSQL Cloud
                        sync_result = self.backend_client.submit_attendance(
                            roll_number=cand_reg,
                            student_name=name,
                            status="CCTV_VERIFIED_PRESENT"
                        )
                        res["backend_sync"] = sync_result
                        logger.info(f"✅ TEMPORAL CONSENSUS VERIFIED: {cand_reg} ({name}) [{count}/{self.temporal_window} frames]")

            # Direct fallback confirmation
            elif res.get("attendance_confirmed") and reg_no not in self.confirmed_students:
                if not is_section_mismatch and camera_quality_status != "RED":
                    self.confirmed_students.add(reg_no)
                    self.total_attendances_confirmed += 1
                    if reg_no in self.headcount_reconciler.student_presence:
                        self.headcount_reconciler.student_presence[reg_no].is_confirmed = True

                    sync_result = self.backend_client.submit_attendance(
                        roll_number=reg_no,
                        student_name=name,
                        status="CCTV_VERIFIED_PRESENT"
                    )
                    res["backend_sync"] = sync_result

            # 7. Standardized Examination & Dashboard Event Bus Dispatch
            verification_status = res.get("classification", "UNKNOWN")
            if res.get("attendance_confirmed") or reg_no in self.confirmed_students:
                verification_status = "CCTV_VERIFIED_PRESENT"
            elif is_section_mismatch:
                verification_status = "SECTION_MISMATCH"
            elif not q_pass:
                verification_status = "LOW_QUALITY"
            elif not is_live:
                verification_status = "SPOOF_REJECTED"

            event = AttendanceVerificationEvent(
                student_reg_no=reg_no,
                student_name=name,
                verification_status=verification_status,
                similarity_score=sim,
                threshold_used=self.face_engine.similarity_threshold,
                liveness_score=res.get("liveness_score", 0.0),
                liveness_passed=is_live,
                quality_score=res.get("quality_score", 1.0),
                quality_passed=q_pass,
                camera_id=self.camera_id,
                track_id=track_id,
                bbox=res.get("bbox", []),
                landmarks=res.get("landmarks", []),
                quality_metrics=res.get("quality_metrics", {})
            )
            examination_bus.emit(event)

        # 8. Classroom Headcount Reconciliation Summary (Section 6)
        reconciliation_summary = self.headcount_reconciler.get_reconciliation_summary()

        return {
            "timestamp": now,
            "camera_id": self.camera_id,
            "classroom": self.classroom,
            "camera_health": health_report.to_dict(),
            "camera_quality_status": camera_quality_status,
            "camera_quality_warning": face_results[0].get("camera_quality_warning", "") if face_results else "",
            "face_results": face_results,
            "active_tracks": active_tracks,
            "headcount_reconciliation": reconciliation_summary.to_dict(),
            "collision_alerts": collision_alerts,
            "stats": {
                "frames": self.total_frames_processed,
                "verified_attendance": self.total_attendances_confirmed
            }
        }
