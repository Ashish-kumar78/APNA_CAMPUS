# AI Complaint Classification & Assignment Microservice

FastAPI microservice utilizing Scikit-Learn (TF-IDF vectorizer + regularized multiclass Logistic Regression) for automatic complaint classification, confidence scoring, and automated staff dispatch.

## Features
- **6 Domain Classes**: `plumbing`, `electrical`, `cleaning`, `maintenance`, `internet_it`, `other`
- **Class Probability Scoring**: Returns normalized confidence distribution across all categories
- **Low-Confidence Triage**: Automatically flags ambiguous inputs or low-confidence predictions (<0.65) with `needs_review: true`
- **Sub-50ms Latency**: Ultra-lightweight CPU inference (~15ms) suitable for real-time keystroke debounced previews
- **Resilient Health & Metrics Endpoints**: Exposes `/health`, `/metrics`, and `/categories` for observability

## Quick Start

### 1. Set Up Environment
```bash
cd ai_service
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Retrain Model (Optional)
```bash
python train.py
```
Outputs model artifacts to `ai_service/models/`:
- `classifier_model.joblib`
- `tfidf_vectorizer.joblib`
- `model_metadata.json`

### 3. Run FastAPI Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API documentation: `http://localhost:8000/docs`

### 4. Run Test Suite
```bash
python test_ai_service.py
```
