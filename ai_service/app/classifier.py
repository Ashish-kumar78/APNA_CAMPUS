import os
import json
import logging
from typing import Dict, Any, Tuple
import joblib
import numpy as np

logger = logging.getLogger("ComplaintClassifier")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
VECTORIZER_PATH = os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib")
MODEL_PATH = os.path.join(MODELS_DIR, "classifier_model.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")

# Default confidence threshold; configurable via env var
DEFAULT_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.65"))


class ComplaintClassifierService:
    def __init__(self):
        self.vectorizer = None
        self.model = None
        self.metadata: Dict[str, Any] = {}
        self.classes = []
        self.load_model()

    def load_model(self):
        """Loads serialized TF-IDF vectorizer and Logistic Regression model."""
        try:
            if not os.path.exists(VECTORIZER_PATH) or not os.path.exists(MODEL_PATH):
                logger.warning("Model files not found! Service will run in degraded mode.")
                return False

            self.vectorizer = joblib.load(VECTORIZER_PATH)
            self.model = joblib.load(MODEL_PATH)

            if hasattr(self.model, "classes_"):
                self.classes = [str(c) for c in self.model.classes_]

            if os.path.exists(METADATA_PATH):
                with open(METADATA_PATH, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)

            logger.info(f"Model loaded successfully. Classes: {self.classes}")
            return True
        except Exception as e:
            logger.error(f"Failed to load machine learning model: {e}", exc_info=True)
            self.vectorizer = None
            self.model = None
            return False

    @property
    def is_ready(self) -> bool:
        return self.vectorizer is not None and self.model is not None

    def predict(self, text: str, threshold: float = None) -> Tuple[str, float, bool, Dict[str, float], str]:
        """
        Classifies complaint text.
        Returns: (category, confidence, needs_review, probabilities_dict, review_reason)
        """
        if not self.is_ready:
            raise RuntimeError("Model is not initialized or trained yet.")

        active_threshold = threshold if threshold is not None else DEFAULT_THRESHOLD

        cleaned = text.lower().strip()
        X_vec = self.vectorizer.transform([cleaned])

        probabilities = self.model.predict_proba(X_vec)[0]
        max_idx = int(np.argmax(probabilities))
        pred_category = str(self.model.classes_[max_idx])
        confidence = float(probabilities[max_idx])

        # Full probability mapping sorted descending
        prob_dict = {
            str(cls_name): round(float(prob), 4)
            for cls_name, prob in zip(self.model.classes_, probabilities)
        }
        prob_dict = dict(sorted(prob_dict.items(), key=lambda item: item[1], reverse=True))

        needs_review = False
        review_reason = None

        if pred_category == "other":
            needs_review = True
            review_reason = "Prediction mapped to 'other' category; requires manual administrative assessment."
        elif confidence < active_threshold:
            needs_review = True
            review_reason = f"Confidence score ({confidence:.2f}) is below standard approval threshold ({active_threshold:.2f})."

        return pred_category, round(confidence, 4), needs_review, prob_dict, review_reason


# Singleton instance for FastAPI
classifier_service = ComplaintClassifierService()
