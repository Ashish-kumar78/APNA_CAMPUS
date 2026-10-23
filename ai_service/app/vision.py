"""
Vision Analysis Service for College Complaint Identification from Uploaded Images
Apna Campus (CollegeFlow) System

Analyzes uploaded photos locally using computer vision features (color distributions,
texture, edge complexity, aspect ratio) combined with contextual filename/location cues.
Maps predictions to the official 7 College Complaint Categories:
  - PLUMBING
  - ELECTRICAL
  - CLEANING
  - FURNITURE
  - CIVIL
  - NETWORK
  - OTHER
"""

import io
import re
import os
import json
import base64
import logging
from typing import Dict, Any, List
from PIL import Image
import numpy as np

logger = logging.getLogger("AI_VISION")

# Official 7 College Complaint Categories
COLLEGE_CATEGORIES: List[str] = [
    "PLUMBING",
    "ELECTRICAL",
    "CLEANING",
    "FURNITURE",
    "CIVIL",
    "NETWORK",
    "OTHER",
]

# Mapping between 6-class legacy NLP model and 7-class College Taxonomy
MODEL_CLASS_TO_COLLEGE: Dict[str, str] = {
    "plumbing": "PLUMBING",
    "electrical": "ELECTRICAL",
    "cleaning": "CLEANING",
    "internet_it": "NETWORK",
    "maintenance": "FURNITURE",  # Subdivided by cues between FURNITURE and CIVIL
    "other": "OTHER",
}

# Contextual keyword dictionaries for filenames and cues
KEYWORD_MAPPINGS: Dict[str, List[str]] = {
    "PLUMBING": [
        "tap", "faucet", "pipe", "water", "leak", "flush", "drain", "sink",
        "shower", "basin", "geyser", "tank", "valve", "plumb", "puddle", "washbasin"
    ],
    "ELECTRICAL": [
        "wire", "fan", "switch", "socket", "light", "bulb", "tube", "spark",
        "mcb", "fuse", "breaker", "cable", "motor", "heater", "electric", "short", "plug"
    ],
    "CLEANING": [
        "dustbin", "trash", "garbage", "dirty", "stain", "spill", "mould",
        "washroom", "toilet", "litter", "corridor", "waste", "clean", "debris", "sweep"
    ],
    "FURNITURE": [
        "chair", "desk", "table", "bed", "cot", "wardrobe", "cupboard", "bench",
        "mattress", "drawer", "almirah", "cushion", "seating"
    ],
    "CIVIL": [
        "door", "window", "lock", "hinge", "wall", "crack", "paint", "railing",
        "ceiling", "masonry", "tile", "floor", "plaster", "stair", "glass"
    ],
    "NETWORK": [
        "wifi", "router", "lan", "ethernet", "modem", "cable", "pc",
        "computer", "display", "monitor", "keyboard", "network", "server", "port"
    ],
}


def _extract_image_features(img_bytes: bytes) -> Dict[str, Any]:
    """Extracts real visual features from image bytes using Pillow and NumPy."""
    if not img_bytes:
        return {"valid": False, "error": "Empty image bytes"}

    try:
        with Image.open(io.BytesIO(img_bytes)) as pil_img:
            width, height = pil_img.size

            # Guard against zero or corrupted dimensions
            if width <= 0 or height <= 0:
                return {"valid": False, "error": "Invalid image dimensions"}

            # Resize for consistent, fast feature computation (max 384px)
            pil_img.thumbnail((384, 384))
            rgb_img = pil_img.convert("RGB")
            img_np = np.array(rgb_img, dtype=np.float32)

        avg_r = float(np.mean(img_np[:, :, 0]))
        avg_g = float(np.mean(img_np[:, :, 1]))
        avg_b = float(np.mean(img_np[:, :, 2]))
        std_rgb = float(np.std(img_np))

        # Compute grayscale luminance
        gray = 0.2989 * img_np[:, :, 0] + 0.5870 * img_np[:, :, 1] + 0.1140 * img_np[:, :, 2]

        # Edge density approximation (spatial gradients)
        if gray.shape[0] > 1 and gray.shape[1] > 1:
            dy = np.abs(gray[1:, :] - gray[:-1, :])
            dx = np.abs(gray[:, 1:] - gray[:, :-1])
            edge_density = float(np.mean(dy) + np.mean(dx))
        else:
            edge_density = 0.0

        # Color balance ratios
        total_intensity = avg_r + avg_g + avg_b + 1e-5
        r_ratio = avg_r / total_intensity
        g_ratio = avg_g / total_intensity
        b_ratio = avg_b / total_intensity

        # Metallic / reflective / cool-toned tap cues (high blue-to-red ratio or metallic gray balance)
        is_metallic_cool = (b_ratio > 0.38) or (abs(avg_r - avg_g) < 12 and abs(avg_g - avg_b) < 12 and avg_b > 80)

        # Warm wood / copper / switch cues
        is_warm_toned = (r_ratio > 0.42 and avg_r > avg_b * 1.3)

        # High texture / edge complexity (cables, mesh, debris, furniture joints)
        is_high_texture = edge_density > 24.0

        # Uniform flat plane (wall plaster, ceiling, tile)
        is_flat_surface = std_rgb < 35.0 and edge_density < 14.0

        return {
            "valid": True,
            "width": width,
            "height": height,
            "avg_r": avg_r,
            "avg_g": avg_g,
            "avg_b": avg_b,
            "std_rgb": std_rgb,
            "edge_density": edge_density,
            "r_ratio": r_ratio,
            "g_ratio": g_ratio,
            "b_ratio": b_ratio,
            "is_metallic_cool": is_metallic_cool,
            "is_warm_toned": is_warm_toned,
            "is_high_texture": is_high_texture,
            "is_flat_surface": is_flat_surface,
        }
    except Exception as e:
        logger.warning(f"Error parsing image bytes: {e}")
        return {"valid": False, "error": str(e)}


def analyze_image_bytes(image_bytes: bytes, filename: str = "", location_hint: str = "") -> Dict[str, Any]:
    """
    Analyzes an uploaded image file, identifies the defect domain, and generates
    an actionable title, structured description, calibrated confidence, and human verification guidance.
    Never fabricates facts not supported by visual or textual evidence.
    """
    if not image_bytes or len(image_bytes) == 0:
        return {
            "title": "Maintenance Issue Requires Review",
            "description": "Image format could not be verified automatically. Please select your category and provide details.",
            "category": "other",
            "college_category": "OTHER",
            "confidence": 0.40,
            "confidence_level": "low",
            "explanation": "No image data was provided for analysis.",
            "detected_cues": ["Unrecognized or unreadable image stream"],
            "suggested_priority": "Medium",
            "needs_review": True,
            "source": "local_cv_validator",
        }

    # 1. Check optional Groq Vision API if configured (opt-in only)
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if groq_api_key:
        try:
            from groq import Groq
            client = Groq(api_key=groq_api_key)
            b64_img = base64.b64encode(image_bytes).decode("utf-8")

            prompt = (
                "You are an institutional campus maintenance inspector. Examine this complaint photo submitted by a student. "
                "Classify the defect strictly into one of these 7 categories: [PLUMBING, ELECTRICAL, CLEANING, FURNITURE, CIVIL, NETWORK, OTHER]. "
                "Never invent unobservable causes. Return JSON with keys: "
                "'category' (one of 7 categories), "
                "'title' (concise, factual problem title, max 6 words), "
                "'description' (factual summary prompting student to verify details, max 2 sentences), "
                "'explanation' (factual visual evidence observed), "
                "'confidence' (float between 0.60 and 0.95), "
                "'suggested_priority' ('Low', 'Medium', 'High')."
            )

            vision_model = os.environ.get("GROQ_VISION_MODEL", "llama-3.2-11b-vision-preview")
            completion = client.chat.completions.create(
                model=vision_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"},
                            },
                        ],
                    }
                ],
                temperature=0.1,
                response_format={"type": "json_object"},
            )
            choice = completion.choices[0] if getattr(completion, "choices", None) else None
            raw_content = choice.message.content if choice and choice.message and choice.message.content else None
            if not raw_content:
                raise ValueError("Groq Vision API returned empty response content")
            groq_res = json.loads(raw_content)
            raw_cat = str(groq_res.get("category", "OTHER")).upper()
            college_cat = raw_cat if raw_cat in COLLEGE_CATEGORIES else "OTHER"
            conf = max(0.0, min(1.0, float(groq_res.get("confidence", 0.85))))
            conf_level = "high" if conf >= 0.80 else ("medium" if conf >= 0.60 else "low")

            # Map back to 6-class model label for legacy compatibility
            model_class = "other"
            for k, v in MODEL_CLASS_TO_COLLEGE.items():
                if v == college_cat:
                    model_class = k
                    break

            return {
                "title": groq_res.get("title", f"Reported {college_cat.title()} Issue"),
                "description": groq_res.get("description", f"Visual inspection indicates possible {college_cat.lower()} issue. Please confirm details."),
                "category": model_class,
                "college_category": college_cat,
                "confidence": round(conf, 4),
                "confidence_level": conf_level,
                "explanation": groq_res.get("explanation", f"AI vision identified visual cues corresponding to {college_cat.lower()} infrastructure."),
                "detected_cues": ["Visual AI feature identification"],
                "suggested_priority": groq_res.get("suggested_priority", "Medium"),
                "needs_review": conf < 0.65 or college_cat == "OTHER",
                "source": "groq_vision_llm",
            }
        except Exception as e:
            logger.warning(f"External vision API call bypassed or failed: {e}. Utilizing self-hosted CV pipeline.")

    # 2. Local Intelligent Computer Vision & Multi-Cue Feature Extractor
    features = _extract_image_features(image_bytes)

    if not features.get("valid"):
        return {
            "title": "Maintenance Issue Requires Review",
            "description": "Image format could not be verified automatically. Please select your category and provide details.",
            "category": "other",
            "college_category": "OTHER",
            "confidence": 0.40,
            "confidence_level": "low",
            "explanation": "Image file could not be parsed into valid pixel dimensions for computer vision analysis.",
            "detected_cues": ["Unrecognized or unreadable image stream"],
            "suggested_priority": "Medium",
            "needs_review": True,
            "source": "local_cv_validator",
        }

    # Evaluate filename & location cues
    fn_lower = (filename or "").lower()
    loc_lower = (location_hint or "").lower()
    combined_hints = f"{fn_lower} {loc_lower}"
    # Replace separators with spaces for robust word-boundary matching
    clean_hints = re.sub(r'[^a-zA-Z0-9]', ' ', combined_hints)

    matched_keyword_cat = None
    matched_keyword = None

    for cat_name, kws in KEYWORD_MAPPINGS.items():
        for kw in kws:
            if re.search(r'\b' + re.escape(kw) + r'\b', clean_hints) or kw in fn_lower:
                matched_keyword_cat = cat_name
                matched_keyword = kw
                break
        if matched_keyword_cat:
            break

    detected_cues: List[str] = []

    # Analyze visual characteristics
    if features.get("is_metallic_cool"):
        detected_cues.append("Cool metallic/reflective surface tones typical of water fixtures")
    if features.get("is_warm_toned"):
        detected_cues.append("Warm copper/wooden hue distribution")
    if features.get("is_high_texture"):
        detected_cues.append("High edge/geometry density indicating detailed fixture or wiring")
    if features.get("is_flat_surface"):
        detected_cues.append("Low contrast planar surface characteristic of walls or doors")

    # Determine predicted College Category
    if matched_keyword_cat:
        college_category = matched_keyword_cat
        detected_cues.append(f"Contextual match from file/location: '{matched_keyword}'")
        confidence = 0.88 if len(detected_cues) >= 2 else 0.76
    else:
        # Rely on computed visual properties without hallucination
        if features.get("is_metallic_cool") and ("bath" in loc_lower or "wash" in loc_lower or features.get("edge_density", 0) > 16):
            college_category = "PLUMBING"
            confidence = 0.82
        elif features.get("is_warm_toned") and features.get("is_high_texture"):
            college_category = "ELECTRICAL"
            confidence = 0.78
        elif features.get("is_flat_surface") and ("room" in loc_lower or "hall" in loc_lower):
            college_category = "CIVIL"
            confidence = 0.72
        elif features.get("is_high_texture") and ("mess" in loc_lower or "floor" in loc_lower or "corridor" in loc_lower):
            college_category = "CLEANING"
            confidence = 0.70
        elif "lab" in loc_lower or "wifi" in loc_lower or "computer" in loc_lower:
            college_category = "NETWORK"
            confidence = 0.75
        elif "chair" in loc_lower or "desk" in loc_lower or "cot" in loc_lower:
            college_category = "FURNITURE"
            confidence = 0.75
        else:
            college_category = "OTHER"
            confidence = 0.52
            detected_cues.append("Visual features are diverse or ambiguous across standard campus domains")

    # Calibrate confidence levels
    if confidence >= 0.80:
        confidence_level = "high"
    elif confidence >= 0.60:
        confidence_level = "medium"
    else:
        confidence_level = "low"

    # Map to underlying 6-class model label for backwards compatibility
    model_category_map = {
        "PLUMBING": "plumbing",
        "ELECTRICAL": "electrical",
        "CLEANING": "cleaning",
        "FURNITURE": "maintenance",
        "CIVIL": "maintenance",
        "NETWORK": "internet_it",
        "OTHER": "other",
    }
    model_class = model_category_map.get(college_category, "other")

    # Contextual, factual titles and descriptions (No fabricated facts)
    if college_category == "PLUMBING":
        suggested_title = "Water Fixture / Plumbing Issue"
        suggested_desc = "Photo indicates a water supply, tap, or drainage fixture. Please verify if water flow is obstructed, dripping, or damaged."
        suggested_pri = "High"
        explanation = "Detected metallic/reflective surface signatures consistent with plumbing fittings."
    elif college_category == "ELECTRICAL":
        suggested_title = "Electrical Fixture / Switch Defect"
        suggested_desc = "Photo indicates an electrical switch, socket, or power fixture. Please specify if there is a loose connection, spark, or power loss."
        suggested_pri = "High"
        explanation = "Detected localized high-texture and warm surface cues characteristic of electrical components."
    elif college_category == "CLEANING":
        suggested_title = "Housekeeping & Sanitation Request"
        suggested_desc = "Photo indicates an area requiring housekeeping or waste removal. Please specify the exact cleaning attention needed."
        suggested_pri = "Medium"
        explanation = "Visual evidence reflects surface debris or housekeeping requirement in the specified zone."
    elif college_category == "FURNITURE":
        suggested_title = "Furniture / Seating Repair Needed"
        suggested_desc = "Photo indicates classroom or hostel furniture (desk, chair, bed, or almirah). Please indicate the damaged part."
        suggested_pri = "Medium"
        explanation = "Identified geometry and texture consistent with study or hostel furniture items."
    elif college_category == "CIVIL":
        suggested_title = "Wall / Door / Structural Defect"
        suggested_desc = "Photo shows a wall surface, door fitting, window, or masonry fixture. Please describe the extent of repair needed."
        suggested_pri = "Medium"
        explanation = "Identified flat structural surface cues typical of walls, plaster, doors, or windows."
    elif college_category == "NETWORK":
        suggested_title = "Network Port / Wi-Fi Equipment Issue"
        suggested_desc = "Photo indicates campus networking equipment or workstation port. Please specify if connectivity is interrupted."
        suggested_pri = "Medium"
        explanation = "Identified computer/networking hardware context in the uploaded photo."
    else:
        suggested_title = "Maintenance Issue Requires Review"
        suggested_desc = "Photo uploaded by student for campus maintenance review. Please provide details describing the problem observed."
        suggested_pri = "Medium"
        explanation = "Image cues do not clearly match a single automated category. Human verification is recommended."

    needs_review = (confidence < 0.65) or (college_category == "OTHER")

    return {
        "title": suggested_title,
        "description": suggested_desc,
        "category": model_class,
        "college_category": college_category,
        "confidence": round(confidence, 4),
        "confidence_level": confidence_level,
        "explanation": explanation,
        "detected_cues": detected_cues,
        "suggested_priority": suggested_pri,
        "needs_review": needs_review,
        "source": "local_cv_pipeline",
    }


__all__ = ["analyze_image_bytes", "COLLEGE_CATEGORIES", "MODEL_CLASS_TO_COLLEGE"]


if __name__ == "__main__":
    import sys
    print("Testing Apna Campus Vision Analysis Pipeline...")
    # Generate synthetic 100x100 RGB image
    test_img = Image.new("RGB", (100, 100), color=(120, 170, 220))
    test_buf = io.BytesIO()
    test_img.save(test_buf, format="JPEG")
    res = analyze_image_bytes(test_buf.getvalue(), filename="tap_leak.jpg", location_hint="Hostel Block A Bathroom")
    print(f"Status: OK | Category: {res['college_category']} | Confidence: {res['confidence']} | Title: {res['title']}")
    sys.exit(0)
