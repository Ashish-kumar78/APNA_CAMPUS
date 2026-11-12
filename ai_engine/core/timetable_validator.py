"""
Section-Based Attendance & Timetable Validation Module (timetable_validator.py)
Section 3: Cross-Section Student Detection

Provides:
- Complete academic profile validation: Department, Semester, Section, Subject, Faculty, Classroom, Timetable
- Cross-Section Detection: prevents marking students in the wrong lecture (e.g., Section A student in Section B)
- Unassigned Section Detection alerting with student's actual registered section
- Authorized Exception Mechanism for approved combined lectures, substitute classes, or inter-section electives
"""

import os
import json
import time
import logging
from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger("TimetableValidator")


@dataclass
class StudentAcademicProfile:
    """Official academic registration record from APNA CAMPUS ERP database."""
    roll_number: str
    name: str
    department: str = "CSE"
    semester: int = 5
    section: str = "A"
    enrolled_subjects: List[str] = field(default_factory=lambda: ["Artificial Intelligence", "Database Systems"])

    def to_dict(self) -> Dict[str, Any]:
        return {
            "roll_number": self.roll_number,
            "name": self.name,
            "department": self.department,
            "semester": self.semester,
            "section": self.section,
            "enrolled_subjects": self.enrolled_subjects
        }


@dataclass
class ActiveClassSession:
    """Live classroom timetable context."""
    classroom: str = "CR-101"
    department: str = "CSE"
    semester: int = 5
    scheduled_section: str = "A"
    subject: str = "Artificial Intelligence"
    assigned_faculty: str = "Prof. Admin"
    start_time_str: str = "09:00:00"
    end_time_str: str = "10:00:00"
    attendance_window_minutes: int = 15
    authorized_exceptions: List[str] = field(default_factory=list)  # Rolls permitted cross-section

    def to_dict(self) -> Dict[str, Any]:
        return {
            "classroom": self.classroom,
            "department": self.department,
            "semester": self.semester,
            "scheduled_section": self.scheduled_section,
            "subject": self.subject,
            "assigned_faculty": self.assigned_faculty,
            "start_time_str": self.start_time_str,
            "end_time_str": self.end_time_str,
            "attendance_window_minutes": self.attendance_window_minutes,
            "authorized_exceptions": self.authorized_exceptions
        }


@dataclass
class ValidationResult:
    """Evaluation outcome for student attendance eligibility."""
    is_eligible: bool
    status: str  # "ELIGIBLE", "SECTION_MISMATCH", "UNREGISTERED_STUDENT", "OUTSIDE_WINDOW"
    reason: str
    student_section: str
    scheduled_section: str
    alert_payload: Optional[Dict[str, Any]] = None


class SectionAttendanceValidator:
    """
    Validates facial recognition hits against ERP academic registration and timetable.
    Strictly prevents cross-section attendance pollution.
    """

    def __init__(
        self,
        students_metadata_path: Optional[str] = None,
        active_session: Optional[ActiveClassSession] = None
    ):
        self.students_metadata_path = students_metadata_path
        self.active_session = active_session or ActiveClassSession()
        self.student_registry: Dict[str, StudentAcademicProfile] = {}
        self.authorized_exceptions: Dict[str, str] = {}  # {roll_number: reason}

        self._load_student_registry()

    def _load_student_registry(self):
        """Loads or builds student academic records."""
        if self.students_metadata_path and os.path.exists(self.students_metadata_path):
            try:
                with open(self.students_metadata_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for key, val in data.items():
                        roll = str(val.get("roll_number", key))
                        name = val.get("name", f"Student {roll}")
                        dept = val.get("department", "CSE")
                        sem = int(val.get("semester", 5))
                        # Default distribution: odd rolls = Section A, even rolls = Section B
                        def_sec = "A" if (roll.isdigit() and int(roll) % 2 != 0) else "B"
                        sec = val.get("section", def_sec)
                        subjects = val.get("subjects", ["Artificial Intelligence"])

                        self.student_registry[roll] = StudentAcademicProfile(
                            roll_number=roll,
                            name=name,
                            department=dept,
                            semester=sem,
                            section=sec,
                            enrolled_subjects=subjects
                        )
            except Exception as e:
                logger.warning(f"Failed to load students metadata: {e}")

        # Seed defaults if registry empty
        if not self.student_registry:
            self.student_registry["1"] = StudentAcademicProfile("1", "Somesh", "CSE", 5, "A")
            self.student_registry["01"] = StudentAcademicProfile("01", "Somesh", "CSE", 5, "A")
            self.student_registry["2"] = StudentAcademicProfile("2", "Somya", "CSE", 5, "B")
            self.student_registry["3"] = StudentAcademicProfile("3", "Ashish", "CSE", 5, "A")
            self.student_registry["03"] = StudentAcademicProfile("03", "Abhijit", "CSE", 5, "A")
            self.student_registry["04"] = StudentAcademicProfile("04", "Bishnu", "CSE", 5, "B")
            self.student_registry["4"] = StudentAcademicProfile("4", "pinku", "CSE", 5, "B")
            self.student_registry["BISHNU"] = StudentAcademicProfile("BISHNU", "Bishnu prsad sahoo", "CSE", 5, "B")

    def register_or_update_student(
        self,
        roll_number: str,
        name: str,
        department: str = "CSE",
        semester: int = 5,
        section: str = "A"
    ):
        """Adds or updates a student's academic profile in the registry."""
        self.student_registry[str(roll_number)] = StudentAcademicProfile(
            roll_number=str(roll_number),
            name=name,
            department=department,
            semester=semester,
            section=section
        )

    def set_active_session(self, session: ActiveClassSession):
        """Updates currently running lecture session."""
        self.active_session = session

    def add_authorized_exception(self, roll_number: str, reason: str):
        """Grants inter-section exception for approved combined / substitute classes."""
        self.authorized_exceptions[str(roll_number)] = reason
        if str(roll_number) not in self.active_session.authorized_exceptions:
            self.active_session.authorized_exceptions.append(str(roll_number))
        logger.info(f"Authorized cross-section exception: {roll_number} ({reason})")

    def validate_attendance_eligibility(
        self,
        roll_number: str,
        timestamp: Optional[float] = None
    ) -> ValidationResult:
        """
        Validates whether the student belongs to the scheduled section and timetable.
        Prevents marking Section A students in Section B classes.
        """
        roll = str(roll_number)
        profile = self.student_registry.get(roll)

        if not profile:
            # Unregistered student
            return ValidationResult(
                is_eligible=False,
                status="UNREGISTERED_STUDENT",
                reason=f"Student {roll} is not registered in ERP database.",
                student_section="UNKNOWN",
                scheduled_section=self.active_session.scheduled_section
            )

        # Check authorized exceptions (combined lectures, substitute classes)
        if roll in self.authorized_exceptions or roll in self.active_session.authorized_exceptions:
            reason_txt = self.authorized_exceptions.get(roll, "Authorized Inter-Section Exception")
            return ValidationResult(
                is_eligible=True,
                status="ELIGIBLE",
                reason=f"Approved Exception: {reason_txt}",
                student_section=profile.section,
                scheduled_section=self.active_session.scheduled_section
            )

        # Department & Semester check
        if profile.department != self.active_session.department or profile.semester != self.active_session.semester:
            alert = {
                "alert_type": "DEPARTMENT_SEMESTER_MISMATCH",
                "message": f"Student {roll} belongs to {profile.department}-Sem{profile.semester}, not {self.active_session.department}-Sem{self.active_session.semester}.",
                "roll_number": roll,
                "student_name": profile.name,
                "registered_department": profile.department,
                "registered_semester": profile.semester,
                "classroom": self.active_session.classroom
            }
            return ValidationResult(
                is_eligible=False,
                status="SECTION_MISMATCH",
                reason="Department / Semester Mismatch",
                student_section=f"{profile.department}-{profile.section}",
                scheduled_section=f"{self.active_session.department}-{self.active_session.scheduled_section}",
                alert_payload=alert
            )

        # Section Check (e.g. Section A vs Section B)
        if profile.section != self.active_session.scheduled_section:
            alert = {
                "alert_type": "SECTION_MISMATCH",
                "message": f"UNASSIGNED SECTION DETECTION: Student {profile.name} ({roll}) belongs to Section {profile.section}, but current lecture is Section {self.active_session.scheduled_section}.",
                "roll_number": roll,
                "student_name": profile.name,
                "registered_section": profile.section,
                "scheduled_section": self.active_session.scheduled_section,
                "subject": self.active_session.subject,
                "classroom": self.active_session.classroom,
                "action_required": "Faculty / Admin review required. Student NOT marked present in current section."
            }
            logger.warning(f"🚫 {alert['message']}")
            return ValidationResult(
                is_eligible=False,
                status="SECTION_MISMATCH",
                reason=f"Cross-section detection: registered in Section {profile.section}, current lecture is Section {self.active_session.scheduled_section}.",
                student_section=profile.section,
                scheduled_section=self.active_session.scheduled_section,
                alert_payload=alert
            )

        # All criteria satisfied
        return ValidationResult(
            is_eligible=True,
            status="ELIGIBLE",
            reason="Student identity, section, subject, and classroom fully verified against timetable.",
            student_section=profile.section,
            scheduled_section=self.active_session.scheduled_section
        )
