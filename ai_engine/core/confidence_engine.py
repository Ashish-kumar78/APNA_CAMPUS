"""
Centralized Attendance Confidence & Verification Engine (confidence_engine.py)
Section 9: Intelligent Attendance Confidence and Verification Engine

Provides:
- Multi-factor confidence scoring combining:
  1. Facial recognition similarity
  2. Liveness / anti-spoofing score
  3. Image optical quality & illumination
  4. Head pose frontality score
  5. Temporal track consistency
- Rigorous attendance classifications:
  - CCTV_VERIFIED_PRESENT
  - PENDING_VERIFICATION
  - UNKNOWN_STUDENT
  - SECTION_MISMATCH
  - MANUALLY_VERIFIED_PRESENT
  - ABSENT
"""

import logging
from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger("ConfidenceEngine")


@dataclass
class ConfidenceEvaluation:
    """Detailed score telemetry for an attendance candidate."""
    composite_confidence: float
    classification: str  # CCTV_VERIFIED_PRESENT, PENDING_VERIFICATION, UNKNOWN_STUDENT, SECTION_MISMATCH, ABSENT
    passed_threshold: bool
    similarity_component: float
    liveness_component: float
    quality_component: float
    pose_component: float
    temporal_component: float
    reasons: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "composite_confidence": round(self.composite_confidence, 3),
            "classification": self.classification,
            "passed_threshold": self.passed_threshold,
            "similarity_component": round(self.similarity_component, 3),
            "liveness_component": round(self.liveness_component, 3),
            "quality_component": round(self.quality_component, 3),
            "pose_component": round(self.pose_component, 3),
            "temporal_component": round(self.temporal_component, 3),
            "reasons": self.reasons
        }


class AttendanceConfidenceEngine:
    """
    Evaluates multi-factor confidence before confirming attendance.
    Prevents false attendance and ensures evidence-based verification.
    """

    def __init__(
        self,
        confidence_threshold: float = 0.70,
        weight_similarity: float = 0.30,
        weight_liveness: float = 0.20,
        weight_quality: float = 0.15,
        weight_pose: float = 0.15,
        weight_temporal: float = 0.20
    ):
        self.threshold = confidence_threshold
        self.w_sim = weight_similarity
        self.w_live = weight_liveness
        self.w_qual = weight_quality
        self.w_pose = weight_pose
        self.w_temp = weight_temporal

    def evaluate(
        self,
        similarity_score: float,
        is_registered: bool,
        is_section_valid: bool,
        liveness_score: float,
        is_live: bool,
        quality_score: float,
        camera_quality_status: str,  # GREEN, YELLOW, RED
        frontality_score: float,
        consecutive_track_hits: int,
        required_track_hits: int = 3,
        camera_is_operational: bool = True
    ) -> ConfidenceEvaluation:
        """
        Computes composite confidence and maps to one of the 6 standardized classifications.
        """
        reasons = []

        # Gate 1: Check Camera Health & Optical Quality
        if not camera_is_operational:
            reasons.append("CAMERA_OFFLINE_OR_FROZEN")
            return ConfidenceEvaluation(
                composite_confidence=0.0,
                classification="PENDING_VERIFICATION",
                passed_threshold=False,
                similarity_component=0.0,
                liveness_component=0.0,
                quality_component=0.0,
                pose_component=0.0,
                temporal_component=0.0,
                reasons=reasons
            )

        if camera_quality_status == "RED":
            reasons.append("CAMERA_IMAGE_QUALITY_WARNING_RED")
            return ConfidenceEvaluation(
                composite_confidence=0.0,
                classification="PENDING_VERIFICATION",
                passed_threshold=False,
                similarity_component=0.0,
                liveness_component=0.0,
                quality_component=0.0,
                pose_component=0.0,
                temporal_component=0.0,
                reasons=reasons
            )

        # Gate 2: Unregistered Student
        if not is_registered:
            reasons.append("UNREGISTERED_STUDENT_PROFILE")
            return ConfidenceEvaluation(
                composite_confidence=0.0,
                classification="UNKNOWN_STUDENT",
                passed_threshold=False,
                similarity_component=0.0,
                liveness_component=liveness_score,
                quality_component=quality_score,
                pose_component=frontality_score,
                temporal_component=0.0,
                reasons=reasons
            )

        # Gate 3: Cross-Section Mismatch
        if not is_section_valid:
            reasons.append("CROSS_SECTION_MISMATCH")
            return ConfidenceEvaluation(
                composite_confidence=similarity_score,
                classification="SECTION_MISMATCH",
                passed_threshold=False,
                similarity_component=similarity_score,
                liveness_component=liveness_score,
                quality_component=quality_score,
                pose_component=frontality_score,
                temporal_component=0.0,
                reasons=reasons
            )

        # Gate 4: Anti-Spoofing Failure
        if not is_live:
            reasons.append("SPOOF_RISK_REJECTED")
            return ConfidenceEvaluation(
                composite_confidence=0.1,
                classification="PENDING_VERIFICATION",
                passed_threshold=False,
                similarity_component=similarity_score,
                liveness_component=liveness_score,
                quality_component=quality_score,
                pose_component=frontality_score,
                temporal_component=0.0,
                reasons=reasons
            )

        # Compute Weighted Factor Components
        # Similarity: normalized to [0, 1] relative to calibrated threshold ~0.45
        sim_norm = float(np_clip_val((similarity_score - 0.30) / 0.50, 0.0, 1.0))
        live_norm = float(np_clip_val(liveness_score, 0.0, 1.0))
        qual_norm = float(np_clip_val(quality_score, 0.0, 1.0))
        pose_norm = float(np_clip_val(frontality_score, 0.0, 1.0))
        temp_norm = float(np_clip_val(consecutive_track_hits / max(1.0, float(required_track_hits)), 0.0, 1.0))

        composite = (
            (self.w_sim * sim_norm) +
            (self.w_live * live_norm) +
            (self.w_qual * qual_norm) +
            (self.w_pose * pose_norm) +
            (self.w_temp * temp_norm)
        )

        passed = composite >= self.threshold and consecutive_track_hits >= required_track_hits

        if passed:
            classification = "CCTV_VERIFIED_PRESENT"
        else:
            classification = "PENDING_VERIFICATION"
            if composite < self.threshold:
                reasons.append(f"CONFIDENCE_BELOW_THRESHOLD ({composite:.2f} < {self.threshold:.2f})")
            if consecutive_track_hits < required_track_hits:
                reasons.append(f"TEMPORAL_CONSENSUS_PENDING ({consecutive_track_hits}/{required_track_hits} frames)")

        return ConfidenceEvaluation(
            composite_confidence=composite,
            classification=classification,
            passed_threshold=passed,
            similarity_component=sim_norm,
            liveness_component=live_norm,
            quality_component=qual_norm,
            pose_component=pose_norm,
            temporal_component=temp_norm,
            reasons=reasons
        )


def np_clip_val(val: float, min_val: float, max_val: float) -> float:
    return max(min_val, min(max_val, float(val)))
