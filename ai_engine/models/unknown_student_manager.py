"""
Unknown Student Detection & Evidence Management Module (unknown_student_manager.py)
Section 2: Unregistered Students Attending Classes

Provides:
- Unregistered face detection & temporary tracking ID assignment (UNKNOWN-TRACK-XX)
- Evidence Vault capture: crops & timestamps verification snapshots for administrative review
- Gallery clustering of unknown individuals to prevent duplicate unknown alerts
- Administrative action contracts (Verify Identity, Search Records, Register, Mark Unverified, Dismiss)
- Historical re-check: allows newly registered students to resolve prior pending records
"""

import os
import time
import json
import logging
import cv2
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional, Tuple

from ai_engine.config import Config

logger = logging.getLogger("UnknownStudentManager")


@dataclass
class UnknownStudentRecord:
    """Record of an unidentified person observed in the classroom."""
    track_id: int
    temp_id: str
    camera_id: str
    classroom: str
    timestamp: float
    date_str: str
    time_str: str
    evidence_crop_path: str
    best_similarity: float
    liveness_score: float
    embedding: Optional[List[float]] = None
    status: str = "PENDING_ADMIN_REVIEW"  # PENDING_ADMIN_REVIEW, VERIFIED, REGISTERED, DISMISSED
    resolved_roll_number: Optional[str] = None

    def to_alert_payload(self) -> Dict[str, Any]:
        """Generates standard alert payload for Faculty and Admin Dashboards."""
        return {
            "alert_type": "UNREGISTERED_STUDENT_DETECTED",
            "message": "UNREGISTERED STUDENT DETECTED – Identity verification required.",
            "temporary_id": self.temp_id,
            "track_id": self.track_id,
            "camera_id": self.camera_id,
            "classroom": self.classroom,
            "detection_date": self.date_str,
            "detection_time": self.time_str,
            "evidence_snapshot": self.evidence_crop_path,
            "best_match_confidence": round(self.best_similarity, 3),
            "liveness_score": round(self.liveness_score, 3),
            "available_admin_actions": [
                {"action": "VERIFY_IDENTITY", "description": "Manually confirm student identity from roster"},
                {"action": "SEARCH_EXISTING_RECORDS", "description": "Search database for alternative photo / details"},
                {"action": "REGISTER_STUDENT", "description": "Enroll student into APNA CAMPUS ERP database"},
                {"action": "MARK_AS_UNVERIFIED", "description": "Classify record as unverified visitor / guest"},
                {"action": "DISMISS_DETECTION", "description": "Dismiss transient or false detection"}
            ]
        }


class UnknownStudentManager:
    """
    Manages detection, snapshot evidence capture, and administrative resolution
    for unregistered individuals in the classroom.
    """

    def __init__(
        self,
        vault_dir: Optional[str] = None,
        records_json: Optional[str] = None,
        max_similarity_cutoff: float = 0.40,
        recheck_threshold: float = 0.50
    ):
        base_vault = os.path.join(Config.PROJECT_ROOT, "evidence_vault")
        self.vault_dir = os.path.abspath(vault_dir) if vault_dir else os.path.join(base_vault, "unknown_students")
        self.records_json = os.path.abspath(records_json) if records_json else os.path.join(base_vault, "unknown_records.json")
        self.max_similarity_cutoff = max_similarity_cutoff
        self.recheck_threshold = recheck_threshold

        os.makedirs(self.vault_dir, exist_ok=True)
        os.makedirs(os.path.dirname(self.records_json), exist_ok=True)

        # In-memory storage: {temp_id: UnknownStudentRecord}
        self.records: Dict[str, UnknownStudentRecord] = {}
        # Track-to-temp_id mapping for active session
        self.track_to_temp_id: Dict[int, str] = {}
        # Cooldown per track to prevent filling disk with repeated snapshots
        self.last_saved_time: Dict[int, float] = {}

        self._load_records()

    def _load_records(self):
        if os.path.exists(self.records_json):
            try:
                with open(self.records_json, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for item in data:
                        rec = UnknownStudentRecord(**item)
                        self.records[rec.temp_id] = rec
            except Exception as e:
                logger.warning(f"Could not load unknown student records: {e}")

    def _save_records(self):
        try:
            with open(self.records_json, "w", encoding="utf-8") as f:
                serializable = [
                    {k: v for k, v in rec.__dict__.items()}
                    for rec in self.records.values()
                ]
                json.dump(serializable, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to persist unknown student records: {e}")

    def handle_unregistered_face(
        self,
        track_id: int,
        frame: np.ndarray,
        bbox: List[float],
        embedding: Optional[np.ndarray],
        best_similarity: float,
        liveness_score: float,
        camera_id: str = "CAM-01",
        classroom: str = "CR-101",
        cooldown_sec: float = 10.0
    ) -> Tuple[str, Optional[Dict[str, Any]]]:
        """
        Processes an unidentified face:
        1. Assigns a consistent UNKNOWN-TRACK-XX identity
        2. Crops & writes high-resolution evidence snapshot to vault
        3. Returns temp_id and alert payload (if newly triggered)
        """
        now = time.time()
        now_dt = time.localtime(now)
        date_str = time.strftime("%Y-%m-%d", now_dt)
        time_str = time.strftime("%H:%M:%S", now_dt)

        if track_id not in self.track_to_temp_id:
            temp_id = f"UNKNOWN-TRACK-{track_id:03d}"
            self.track_to_temp_id[track_id] = temp_id
        else:
            temp_id = self.track_to_temp_id[track_id]

        # Rate-limit evidence snapshot saving per track
        last_saved = self.last_saved_time.get(track_id, 0.0)
        is_new_trigger = False
        evidence_path = ""

        if now - last_saved >= cooldown_sec and frame is not None and frame.size > 0:
            self.last_saved_time[track_id] = now
            is_new_trigger = True

            # Safely crop face with padding
            h, w = frame.shape[:2]
            x1, y1, x2, y2 = [int(v) for v in bbox]
            pad_w = int((x2 - x1) * 0.20)
            pad_h = int((y2 - y1) * 0.20)
            crop_x1 = max(0, x1 - pad_w)
            crop_y1 = max(0, y1 - pad_h)
            crop_x2 = min(w, x2 + pad_w)
            crop_y2 = min(h, y2 + pad_h)

            crop = frame[crop_y1:crop_y2, crop_x1:crop_x2]
            filename = f"unknown_{camera_id}_{track_id}_{date_str}_{time.strftime('%H%M%S', now_dt)}.jpg"
            evidence_path = os.path.join(self.vault_dir, filename)

            try:
                cv2.imwrite(evidence_path, crop)
            except Exception as e:
                logger.error(f"Failed to write evidence crop: {e}")

            emb_list = embedding.tolist() if embedding is not None else None

            rec = UnknownStudentRecord(
                track_id=track_id,
                temp_id=temp_id,
                camera_id=camera_id,
                classroom=classroom,
                timestamp=now,
                date_str=date_str,
                time_str=time_str,
                evidence_crop_path=evidence_path,
                best_similarity=best_similarity,
                liveness_score=liveness_score,
                embedding=emb_list,
                status="PENDING_ADMIN_REVIEW"
            )
            self.records[temp_id] = rec
            self._save_records()

            logger.info(f"⚠️ {rec.to_alert_payload()['message']} (Temp ID: {temp_id})")
            return temp_id, rec.to_alert_payload()

        return temp_id, None

    def recheck_unknown_records(
        self,
        new_roll_number: str,
        new_embedding: np.ndarray
    ) -> List[Dict[str, Any]]:
        """
        Cross-checks a newly registered student against previously captured unknown records.
        Allows authorized administrators to resolve pending attendance records automatically.
        """
        if new_embedding is None or len(new_embedding) == 0:
            return []

        resolved = []
        new_emb = np.asarray(new_embedding, dtype=np.float32)
        norm_new = new_emb / (np.linalg.norm(new_emb) + 1e-7)

        for temp_id, rec in self.records.items():
            if rec.status == "PENDING_ADMIN_REVIEW" and rec.embedding is not None:
                cand_emb = np.asarray(rec.embedding, dtype=np.float32)
                norm_cand = cand_emb / (np.linalg.norm(cand_emb) + 1e-7)
                sim = float(np.dot(norm_new, norm_cand))

                if sim >= self.recheck_threshold:
                    rec.status = "RESOLVED_BY_REGISTRATION"
                    rec.resolved_roll_number = new_roll_number
                    resolved.append({
                        "temp_id": temp_id,
                        "roll_number": new_roll_number,
                        "similarity": round(sim, 3),
                        "date": rec.date_str,
                        "time": rec.time_str,
                        "classroom": rec.classroom
                    })
                    logger.info(f"🎉 Resolved historical unknown {temp_id} -> {new_roll_number} (sim={sim:.3f})")

        if resolved:
            self._save_records()

        return resolved
