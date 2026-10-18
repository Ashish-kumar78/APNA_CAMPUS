from typing import Dict, Optional, List
from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    complaint: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        description="The complaint description text submitted by the student.",
        example="The water tap in my hostel bathroom is leaking continuously."
    )
    threshold_override: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
        description="Optional custom confidence threshold for manual review decision."
    )


class PredictResponse(BaseModel):
    category: str = Field(..., description="Predicted complaint category (plumbing, electrical, cleaning, maintenance, internet_it, other)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence probability for the predicted category")
    needs_review: bool = Field(..., description="True if confidence is below threshold or category is 'other'")
    threshold_used: float = Field(..., description="The confidence threshold applied")
    probabilities: Dict[str, float] = Field(default_factory=dict, description="Full probability distribution across all classes")
    review_reason: Optional[str] = Field(None, description="Explanation when needs_review is true")


class HealthResponse(BaseModel):
    status: str
    service: str
    model_loaded: bool
    version: str
    classes: List[str]
    confidence_threshold: float


class ImagePredictRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded image string or data URI (data:image/jpeg;base64,...)")
    filename: Optional[str] = Field("", description="Optional filename of the uploaded image for contextual clues")
    location_hint: Optional[str] = Field("", description="Optional hostel room or area location")


class ImagePredictResponse(BaseModel):
    title: str = Field(..., description="Suggested problem title based on detected cues")
    description: str = Field(..., description="Suggested problem description prompting student for details")
    category: str = Field(..., description="Predicted category (underlying 6-class model)")
    college_category: str = Field("OTHER", description="Mapped 7-category college taxonomy (PLUMBING, ELECTRICAL, CLEANING, FURNITURE, CIVIL, NETWORK, OTHER)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Calibrated confidence score")
    confidence_level: str = Field("medium", description="Qualitative confidence: high, medium, or low")
    explanation: str = Field("", description="Clear factual explanation of visual cues detected")
    detected_cues: List[str] = Field(default_factory=list, description="List of observed physical/color/structural cues")
    suggested_priority: str = Field("Medium", description="Suggested priority level (Low, Medium, High)")
    needs_review: bool = Field(False, description="Flag indicating human supervisor review is recommended")
    source: str = Field(..., description="Vision model identifier")

