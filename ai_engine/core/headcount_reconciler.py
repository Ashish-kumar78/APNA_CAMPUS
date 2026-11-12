"""
Headcount Reconciliation, Duplicate Prevention & Entry/Exit Tracking Module (headcount_reconciler.py)
Sections 6, 7, and 8:
- Section 6: Accurate Classroom Headcount & Reconciliation
- Section 7: Duplicate Face Detection & Simultaneous Identity Collision Prevention
- Section 8: Student Entry/Exit Tracking & Attendance Duration Policy Engine
"""

import time
import logging
from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional, Set, Tuple

logger = logging.getLogger("HeadcountReconciler")


@dataclass
class StudentPresenceTrack:
    """Tracks continuous classroom presence, entry, and exit timestamps for an individual."""
    roll_number: str
    name: str
    track_ids: Set[int] = field(default_factory=set)
    first_seen_time: float = 0.0
    last_seen_time: float = 0.0
    total_frames_seen: int = 0
    consecutive_hits: int = 0
    attendance_status: str = "PENDING_VERIFICATION"  # CCTV_VERIFIED_PRESENT, PENDING_VERIFICATION, LATE_ENTRY, etc.
    policy_category: str = "PENDING_VERIFICATION"   # FULL_ATTENDANCE, LATE_ENTRY, EARLY_DEPARTURE, PARTIAL_ATTENDANCE
    is_confirmed: bool = False
    evidence_snapshots: List[str] = field(default_factory=list)

    def calculate_presence_duration_minutes(self) -> float:
        if self.first_seen_time == 0.0 or self.last_seen_time == 0.0:
            return 0.0
        return max(0.0, (self.last_seen_time - self.first_seen_time) / 60.0)


@dataclass
class HeadcountSummary:
    """Classroom attendance reconciliation telemetry matching Section 6 requirements."""
    enrolled_in_section: int
    unique_students_detected: int
    successfully_identified: int
    unknown_individuals: int
    section_mismatches: int
    pending_verification: int
    confirmed_present: int

    def to_dict(self) -> Dict[str, int]:
        return {
            "enrolled_in_section": self.enrolled_in_section,
            "unique_students_detected": self.unique_students_detected,
            "successfully_identified": self.successfully_identified,
            "unknown_individuals": self.unknown_individuals,
            "section_mismatches": self.section_mismatches,
            "pending_verification": self.pending_verification,
            "confirmed_present": self.confirmed_present
        }


class HeadcountReconciler:
    """
    Coordinates classroom headcount reconciliation, multi-track duplicate collision prevention,
    and entry/exit duration tracking across the entire lecture period.
    """

    def __init__(
        self,
        enrolled_strength: int = 40,
        class_start_time: Optional[float] = None,
        class_duration_minutes: int = 60,
        late_entry_window_minutes: int = 15,
        min_attendance_ratio: float = 0.70
    ):
        self.enrolled_strength = enrolled_strength
        self.class_start_time = class_start_time or time.time()
        self.class_duration_minutes = class_duration_minutes
        self.late_window_min = late_entry_window_minutes
        self.min_attendance_ratio = min_attendance_ratio

        # Student presence records: {roll_number: StudentPresenceTrack}
        self.student_presence: Dict[str, StudentPresenceTrack] = {}

        # Observed track sets
        self.all_detected_track_ids: Set[int] = set()
        self.unknown_track_ids: Set[int] = set()
        self.section_mismatch_rolls: Set[str] = set()

        # Duplicate collision incident log
        self.collision_alerts: List[Dict[str, Any]] = []

    def record_frame_detections(
        self,
        frame_faces: List[Dict[str, Any]],
        timestamp: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Ingests all face results from a single frame:
        - Updates presence and entry/exit timestamps
        - Detects simultaneous identity collisions (same roll claimed by 2 tracks in 1 frame)
        - Updates continuous headcount metrics
        """
        now = timestamp if timestamp is not None else time.time()
        current_frame_claims: Dict[str, List[int]] = {}  # {roll_number: [track_id1, track_id2]}
        alerts_this_frame = []

        for face in frame_faces:
            track_id = face.get("track_id")
            roll = face.get("reg_no", "UNKNOWN")
            name = face.get("student_name", "Unknown")
            is_mismatch = face.get("is_section_mismatch", False)
            is_unknown = (roll in ("UNKNOWN", "LOW_QUALITY") or roll.startswith("UNKNOWN-TRACK"))

            if track_id is not None:
                self.all_detected_track_ids.add(track_id)

            if is_unknown and track_id is not None:
                self.unknown_track_ids.add(track_id)
                continue

            if is_mismatch:
                self.section_mismatch_rolls.add(roll)
                continue

            # Track registered student presence
            if roll not in ("UNKNOWN", "LOW_QUALITY"):
                if roll not in current_frame_claims:
                    current_frame_claims[roll] = []
                if track_id is not None:
                    current_frame_claims[roll].append(track_id)

                if roll not in self.student_presence:
                    self.student_presence[roll] = StudentPresenceTrack(
                        roll_number=roll,
                        name=name,
                        first_seen_time=now,
                        last_seen_time=now,
                        total_frames_seen=1,
                        consecutive_hits=1
                    )
                else:
                    record = self.student_presence[roll]
                    record.last_seen_time = now
                    record.total_frames_seen += 1
                    record.consecutive_hits += 1
                    if track_id is not None:
                        record.track_ids.add(track_id)

        # SECTION 7: Check for Simultaneous Duplicate Identity Collision
        # (e.g. Someone holding a photo of Student A while Student A is sitting in the back)
        for roll, tracks in current_frame_claims.items():
            unique_tracks = list(set(tracks))
            if len(unique_tracks) > 1:
                collision_alert = {
                    "alert_type": "SUSPICIOUS_DUPLICATE_IDENTITY_COLLISION",
                    "message": f"CRITICAL: Roll Number {roll} detected simultaneously on multiple distinct tracks ({unique_tracks}) in the same frame! Suspected photo spoof or twin impersonation.",
                    "roll_number": roll,
                    "tracks_involved": unique_tracks,
                    "timestamp": now,
                    "time_str": time.strftime("%H:%M:%S", time.localtime(now))
                }
                alerts_this_frame.append(collision_alert)
                self.collision_alerts.append(collision_alert)
                logger.error(f"🚨 {collision_alert['message']}")

        return alerts_this_frame

    def evaluate_attendance_policy(
        self,
        roll_number: str,
        current_time: Optional[float] = None
    ) -> Tuple[str, str, Dict[str, Any]]:
        """
        SECTION 8: Evaluates institution late-entry, early-departure, and duration policies.
        Returns: (attendance_status, policy_category, metrics)
        """
        now = current_time if current_time is not None else time.time()
        record = self.student_presence.get(str(roll_number))

        if not record:
            return "ABSENT", "NOT_DETECTED", {"presence_minutes": 0.0}

        duration_mins = record.calculate_presence_duration_minutes()
        # Relative to class start
        time_since_start_mins = max(0.0, (record.first_seen_time - self.class_start_time) / 60.0)

        # Policy evaluation
        is_late = time_since_start_mins > self.late_window_min
        expected_duration = float(self.class_duration_minutes)
        coverage_ratio = (duration_mins / expected_duration) if expected_duration > 0 else 1.0

        if coverage_ratio >= self.min_attendance_ratio:
            if is_late:
                status = "CCTV_VERIFIED_PRESENT"
                policy = "LATE_ENTRY"
            else:
                status = "CCTV_VERIFIED_PRESENT"
                policy = "FULL_ATTENDANCE"
        elif coverage_ratio >= 0.40:
            status = "PENDING_VERIFICATION"
            policy = "PARTIAL_ATTENDANCE"
        else:
            status = "PENDING_VERIFICATION"
            policy = "INSUFFICIENT_DWELL_TIME"

        record.attendance_status = status
        record.policy_category = policy

        metrics = {
            "first_seen_mins_after_start": round(time_since_start_mins, 1),
            "dwell_duration_minutes": round(duration_mins, 1),
            "coverage_ratio": round(coverage_ratio, 2),
            "total_frames_seen": record.total_frames_seen
        }
        return status, policy, metrics

    def get_reconciliation_summary(self) -> HeadcountSummary:
        """
        SECTION 6: Generates full classroom headcount reconciliation summary.
        Headcount acts as a validation mechanism rather than primary attendance.
        """
        confirmed = sum(1 for p in self.student_presence.values() if p.is_confirmed)
        identified = len(self.student_presence)
        unknowns = len(self.unknown_track_ids)
        mismatches = len(self.section_mismatch_rolls)
        pending = sum(1 for p in self.student_presence.values() if not p.is_confirmed)

        return HeadcountSummary(
            enrolled_in_section=self.enrolled_strength,
            unique_students_detected=len(self.all_detected_track_ids),
            successfully_identified=identified,
            unknown_individuals=unknowns,
            section_mismatches=mismatches,
            pending_verification=pending,
            confirmed_present=confirmed
        )
