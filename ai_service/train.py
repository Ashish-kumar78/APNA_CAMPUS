"""
AI-Based Smart Complaint Classification Model Training Script
Apna Campus (CollegeFlow) System

This script trains a real machine-learning text classification model
using TF-IDF for feature extraction and Logistic Regression for classification.
It evaluates performance with Stratified Split, Precision, Recall, F1-Score,
and Confusion Matrix, and saves serialized model artifacts via joblib.
"""

import os
import json
import logging
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_recall_fscore_support
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("TrainClassifier")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "complaints_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
VECTORIZER_PATH = os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib")
MODEL_PATH = os.path.join(MODELS_DIR, "classifier_model.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")


def clean_text(text: str) -> str:
    """Basic text normalization for campus complaints."""
    if not isinstance(text, str):
        return ""
    text = text.lower().strip()
    return text


def train():
    os.makedirs(MODELS_DIR, exist_ok=True)

    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Training dataset not found at {DATA_PATH}")

    logger.info(f"Loading labeled complaint dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)

    df["complaint"] = df["complaint"].astype(str).apply(clean_text)
    df["category"] = df["category"].astype(str).str.strip().str.lower()

    # Drop any null or empty rows
    df = df[df["complaint"].str.len() > 3]

    logger.info(f"Total labeled records: {len(df)}")
    class_distribution = df["category"].value_counts().to_dict()
    logger.info(f"Class distribution: {class_distribution}")

    X = df["complaint"].tolist()
    y = df["category"].tolist()

    # Stratified split: 80% train, 20% test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    logger.info(f"Training samples: {len(X_train)} | Test samples: {len(X_test)}")

    # 1. Feature Extraction: TF-IDF with unigrams & bigrams
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=1,
        max_features=4000,
        sublinear_tf=True,
        stop_words="english"
    )

    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # 2. Classifier: Logistic Regression with balanced class weighting
    classifier = LogisticRegression(
        C=5.0,
        max_iter=1000,
        class_weight="balanced",
        random_state=42
    )

    classifier.fit(X_train_vec, y_train)

    # 3. Model Evaluation on Held-Out Test Set
    y_pred = classifier.predict(X_test_vec)
    accuracy = float(accuracy_score(y_test, y_pred))
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_test, y_pred, average="macro")

    report_dict = classification_report(y_test, y_pred, output_dict=True)
    report_text = classification_report(y_test, y_pred)

    classes_list = sorted(list(classifier.classes_))
    conf_matrix = confusion_matrix(y_test, y_pred, labels=classes_list).tolist()

    logger.info("=== HELD-OUT TEST EVALUATION REPORT ===")
    print(report_text)
    logger.info(f"Overall Accuracy: {accuracy * 100:.2f}%")
    logger.info(f"Macro F1-Score: {f1_macro:.4f}")

    # 4. Save Artifacts using joblib
    logger.info(f"Persisting TF-IDF vectorizer to {VECTORIZER_PATH}...")
    joblib.dump(vectorizer, VECTORIZER_PATH)

    logger.info(f"Persisting Logistic Regression model to {MODEL_PATH}...")
    joblib.dump(classifier, MODEL_PATH)

    # 5. Metadata for transparency & audits
    metadata = {
        "model_type": "TF-IDF + LogisticRegression",
        "trained_at": pd.Timestamp.now().isoformat(),
        "num_training_samples": len(X_train),
        "num_test_samples": len(X_test),
        "classes": classes_list,
        "class_distribution": class_distribution,
        "evaluation_metrics": {
            "accuracy": round(accuracy, 4),
            "macro_precision": round(float(p_macro), 4),
            "macro_recall": round(float(r_macro), 4),
            "macro_f1": round(float(f1_macro), 4),
            "detailed_report": report_dict,
            "confusion_matrix": {
                "labels": classes_list,
                "matrix": conf_matrix
            }
        },
        "default_confidence_threshold": 0.65,
        "is_synthetic_dataset": True,
        "synthetic_notice": "Development dataset was synthetically compiled for college hackathon validation. Real-world accuracy will depend on real institutional complaint data."
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Saved training metadata & metrics to {METADATA_PATH}")
    logger.info("Training complete successfully!")

    return metadata


if __name__ == "__main__":
    train()
