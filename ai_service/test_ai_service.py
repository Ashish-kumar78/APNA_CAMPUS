"""
Test suite for AI Complaint Classification Service
Validates model predictions on held-out test scenarios, confidence thresholding,
and manual review routing.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "plumbing" in data["classes"]
    print("[PASS] GET /health passed:", data)


def test_plumbing_prediction():
    response = client.post(
        "/predict",
        json={"complaint": "The water tap in my hostel bathroom is leaking continuously."}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "plumbing"
    assert data["confidence"] > 0.5
    print(f"[PASS] Plumbing prediction: category={data['category']}, conf={data['confidence']}, needs_review={data['needs_review']}")


def test_electrical_prediction():
    response = client.post(
        "/predict",
        json={"complaint": "Ceiling fan regulator is broken and wall switch board is sparking."}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "electrical"
    assert data["confidence"] > 0.5
    print(f"[PASS] Electrical prediction: category={data['category']}, conf={data['confidence']}, needs_review={data['needs_review']}")


def test_cleaning_prediction():
    response = client.post(
        "/predict",
        json={"complaint": "The dustbins in 2nd floor corridor are overflowing with dirty garbage."}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "cleaning"
    print(f"[PASS] Cleaning prediction: category={data['category']}, conf={data['confidence']}")


def test_internet_prediction():
    response = client.post(
        "/predict",
        json={"complaint": "Campus Wi-Fi is constantly dropping connection and router is offline."}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "internet_it"
    print(f"[PASS] Internet prediction: category={data['category']}, conf={data['confidence']}")


def test_ambiguous_review_routing():
    # Ambiguous or very short text should flag for manual review
    response = client.post(
        "/predict",
        json={"complaint": "Something is bad in hostel room.", "threshold_override": 0.85}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["needs_review"] is True
    print(f"[PASS] Ambiguous complaint flagged for review: category={data['category']}, conf={data['confidence']}, needs_review={data['needs_review']}")


def test_empty_complaint_validation():
    response = client.post(
        "/predict",
        json={"complaint": "  "}
    )
    assert response.status_code in (400, 422)
    print("[PASS] Empty complaint validation rejected correctly.")


def test_image_prediction():
    # 1x1 transparent png in base64
    tiny_png_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    response = client.post(
        "/predict-image",
        json={
            "image_base64": tiny_png_b64,
            "filename": "water_tap_leak.jpg",
            "location_hint": "Room 204 Bathroom"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "plumbing"
    assert "title" in data and len(data["title"]) > 0
    assert "description" in data
    assert data["confidence"] > 0.6
    print(f"[PASS] Visual AI Prediction: title='{data['title']}', category={data['category']}, conf={data['confidence']}")


if __name__ == "__main__":
    print("\nRunning AI prediction service tests...")
    test_health()
    test_plumbing_prediction()
    test_electrical_prediction()
    test_cleaning_prediction()
    test_internet_prediction()
    test_ambiguous_review_routing()
    test_empty_complaint_validation()
    test_image_prediction()
    print("\nAll AI Service unit tests passed successfully!\n")

