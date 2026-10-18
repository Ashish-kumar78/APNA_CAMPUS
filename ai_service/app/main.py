"""
FastAPI Microservice for AI-Based Complaint Classification
Apna Campus (CollegeFlow)
"""

import os
import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from .schemas import PredictRequest, PredictResponse, HealthResponse, ImagePredictRequest, ImagePredictResponse
from .classifier import classifier_service, DEFAULT_THRESHOLD
from .vision import analyze_image_bytes
import base64

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("AI_API")

app = FastAPI(
    title="Apna Campus AI Complaint Classification Service",
    description="Real machine-learning inference API utilizing TF-IDF and Logistic Regression to classify student campus complaints and compute assignment confidence.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["Monitoring"])
def get_health():
    """Health check endpoint indicating model readiness and configuration."""
    return HealthResponse(
        status="healthy" if classifier_service.is_ready else "degraded",
        service="apna-campus-ai-classifier",
        model_loaded=classifier_service.is_ready,
        version="1.0.0",
        classes=classifier_service.classes,
        confidence_threshold=DEFAULT_THRESHOLD
    )


@app.post("/predict", response_model=PredictResponse, tags=["Classification"])
def predict_complaint(payload: PredictRequest):
    """
    Classifies a student complaint text into categories:
    - plumbing
    - electrical
    - cleaning
    - maintenance
    - internet_it
    - other

    Returns prediction, confidence score, full probability distribution, and needs_review flag.
    """
    if not classifier_service.is_ready:
        logger.error("Predict called while model is not loaded!")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI prediction model is currently not loaded. Please train or verify model artifacts."
        )

    text = payload.complaint.strip()
    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint text cannot be empty or purely whitespace."
        )

    try:
        threshold = payload.threshold_override if payload.threshold_override is not None else DEFAULT_THRESHOLD
        category, confidence, needs_review, probabilities, review_reason = classifier_service.predict(
            text=text,
            threshold=threshold
        )

        logger.info(f"Classified complaint: '{text[:40]}...' -> {category} (conf={confidence:.2f}, review={needs_review})")

        return PredictResponse(
            category=category,
            confidence=confidence,
            needs_review=needs_review,
            threshold_used=threshold,
            probabilities=probabilities,
            review_reason=review_reason
        )
    except Exception as e:
        logger.error(f"Inference error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating prediction: {str(e)}"
        )


@app.get("/metrics", tags=["Monitoring"])
def get_metrics():
    """Returns training evaluation metrics, confusion matrix, and training provenance."""
    if not classifier_service.metadata:
        return {"message": "No training metadata available yet."}
    return classifier_service.metadata


@app.get("/categories", tags=["Information"])
def get_categories():
    """Returns supported complaint categories and descriptions."""
    return {
        "categories": [
            {
                "key": "plumbing",
                "label": "Plumbing",
                "staff_speciality": "Plumber & Water Works",
                "examples": ["Leaking taps", "Broken pipe", "No water supply", "Clogged drain", "Geyser leak"]
            },
            {
                "key": "electrical",
                "label": "Electrical",
                "staff_speciality": "Electrician & Power Maintenance",
                "examples": ["Faulty switches", "Broken light", "Fan noise", "Short circuit", "MCB trip"]
            },
            {
                "key": "cleaning",
                "label": "Cleaning & Housekeeping",
                "staff_speciality": "Housekeeping Supervisor",
                "examples": ["Dirty washrooms", "Overflowing dustbins", "Unclean corridors", "Stains", "Spills"]
            },
            {
                "key": "maintenance",
                "label": "General Maintenance",
                "staff_speciality": "Civil & Carpentry Maintenance",
                "examples": ["Broken doors", "Damaged desks", "Shattered window", "Hinges loose", "Wall damage"]
            },
            {
                "key": "internet_it",
                "label": "Internet / IT",
                "staff_speciality": "Senior Lab & Network Technician",
                "examples": ["Wi-Fi disconnected", "Slow internet", "LAN dead", "PC boot failure", "Proxy error"]
            },
            {
                "key": "other",
                "label": "Other / Administrative",
                "staff_speciality": "Resident Warden / Admin Desk",
                "examples": ["Noise complaints", "Food quality", "Lost ID card", "Transit delays", "General queries"]
            }
        ]
    }


@app.post("/predict-image", response_model=ImagePredictResponse, tags=["Vision"])
def predict_image_complaint(payload: ImagePredictRequest):
    """
    Visual AI defect identification:
    Analyzes an uploaded photo to automatically determine problem domain,
    generates an issue title, a detailed natural-language description,
    and automatic staff assignment category.
    """
    raw_b64 = payload.image_base64.strip()
    if not raw_b64:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="image_base64 cannot be empty."
        )

    # Strip data URL prefix if present (e.g. data:image/jpeg;base64,...)
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",", 1)[1]

    try:
        img_bytes = base64.b64decode(raw_b64)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid base64 image data: {str(e)}"
        )

    result = analyze_image_bytes(
        img_bytes,
        filename=payload.filename or "",
        location_hint=payload.location_hint or ""
    )
    
    # If location hint is provided, append context into description cleanly
    if payload.location_hint and payload.location_hint.strip():
        loc = payload.location_hint.strip()
        if loc not in result["description"]:
            result["description"] = f"{result['description']} (Location: {loc})"

    return ImagePredictResponse(**result)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

