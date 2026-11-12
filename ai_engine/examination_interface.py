"""
Examination System Integration Interface (examination_interface.py)
Provides clean decoupled data contract for future AI Examination Monitoring system (Model 2 & Model 3).
Emits standardized AttendanceVerificationEvent objects containing identity, tracking ID, camera ID,
liveness confirmation, and face quality telemetry without polluting the face recognition engine.
"""

import json
import uuid
from datetime import datetime, timezone
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional, Callable


@dataclass
class AttendanceVerificationEvent:
    """Standardized event payload for downstream examination monitoring / seating verification."""
    student_reg_no: str
    student_name: str
    verification_status: str  # 'VERIFIED', 'UNKNOWN', 'SPOOF_REJECTED', 'LOW_QUALITY'
    similarity_score: float
    threshold_used: float
    liveness_score: float
    liveness_passed: bool
    quality_score: float
    quality_passed: bool
    camera_id: str = "CAM-01"
    track_id: Optional[int] = None
    bbox: List[int] = field(default_factory=list)
    landmarks: List[List[float]] = field(default_factory=list)
    quality_metrics: Dict[str, Any] = field(default_factory=dict)
    event_id: str = field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:12]}")
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> Dict[str, Any]:
        """Serializes event to pure Python dictionary."""
        return asdict(self)

    def to_json(self) -> str:
        """Serializes event to JSON formatted string."""
        return json.dumps(self.to_dict(), default=str)


class ExaminationIntegrationBus:
    """
    Decoupled event dispatcher allowing external systems (such as Model 2 Proctoring,
    Model 3 Seating Grid, or WebSocket telemetry streamers) to subscribe to verified
    identity events.
    """

    def __init__(self, max_history: int = 1000):
        self.max_history = max_history
        self._listeners: List[Callable[[AttendanceVerificationEvent], None]] = []
        self._history: List[AttendanceVerificationEvent] = []

    def register_listener(self, callback: Callable[[AttendanceVerificationEvent], None]) -> None:
        """Registers a subscriber callback."""
        if callback not in self._listeners:
            self._listeners.append(callback)

    def unregister_listener(self, callback: Callable[[AttendanceVerificationEvent], None]) -> None:
        """Removes a subscriber callback."""
        if callback in self._listeners:
            self._listeners.remove(callback)

    def emit(self, event: AttendanceVerificationEvent) -> None:
        """Dispatches an identity verification event to all registered listeners."""
        self._history.append(event)
        if len(self._history) > self.max_history:
            self._history.pop(0)

        for listener in self._listeners:
            try:
                listener(event)
            except Exception as e:
                # Isolate listener failures so they never interrupt the main pipeline
                pass

    def get_history(self, limit: int = 100) -> List[AttendanceVerificationEvent]:
        """Returns recent verification events."""
        return self._history[-limit:]

    def clear(self) -> None:
        """Clears stored history."""
        self._history.clear()


# Global singleton instance for convenient cross-module access
examination_bus = ExaminationIntegrationBus()
