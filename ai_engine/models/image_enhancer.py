"""
Intelligent Image Quality Detection & Adaptive Enhancement Module (image_enhancer.py)
Section 1: Low Lighting, Darkness, and Poor Visibility

Provides:
- Continuous illumination & clarity monitoring (Brightness, Contrast, Blur, Glare, Haze, Obstruction)
- Dynamic camera visibility indicator: GREEN (Good), YELLOW (Reduced), RED (Poor / Unreliable)
- Adaptive image enhancement: CLAHE on luminance, dynamic Gamma correction, and noise reduction
- Failsafe gatekeeping: Prevents blind marking when quality is RED and sets Pending Verification
"""

import cv2
import numpy as np
from dataclasses import dataclass, field
from typing import Tuple, Dict, Any, List


@dataclass
class FrameQualityReport:
    """Detailed telemetry on CCTV footage visibility and camera health."""
    status: str  # "GREEN", "YELLOW", "RED"
    mean_brightness: float
    contrast_std: float
    blur_laplacian: float
    glare_ratio: float
    dark_ratio: float
    obstruction_detected: bool
    is_recognition_reliable: bool
    reasons: List[str] = field(default_factory=list)
    warning_message: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": self.status,
            "mean_brightness": round(self.mean_brightness, 1),
            "contrast_std": round(self.contrast_std, 1),
            "blur_laplacian": round(self.blur_laplacian, 1),
            "glare_ratio": round(self.glare_ratio, 3),
            "dark_ratio": round(self.dark_ratio, 3),
            "obstruction_detected": self.obstruction_detected,
            "is_recognition_reliable": self.is_recognition_reliable,
            "reasons": self.reasons,
            "warning_message": self.warning_message
        }


class IntelligentImageQualityModule:
    """
    Monitors incoming CCTV frames for lighting, sharpness, and obstruction.
    Applies adaptive CLAHE, Gamma correction, and bilateral filtering to recover degraded frames.
    """

    def __init__(
        self,
        green_brightness_min: float = 50.0,
        green_brightness_max: float = 210.0,
        green_contrast_min: float = 20.0,
        green_blur_min: float = 40.0,
        red_brightness_min: float = 20.0,
        red_brightness_max: float = 240.0,
        red_blur_min: float = 18.0,
        clahe_clip_limit: float = 3.0,
        clahe_grid_size: Tuple[int, int] = (8, 8)
    ):
        self.green_b_min = green_brightness_min
        self.green_b_max = green_brightness_max
        self.green_c_min = green_contrast_min
        self.green_blur_min = green_blur_min

        self.red_b_min = red_brightness_min
        self.red_b_max = red_brightness_max
        self.red_blur_min = red_blur_min

        self.clahe = cv2.createCLAHE(clipLimit=clahe_clip_limit, tileGridSize=clahe_grid_size)

    def assess_frame(
        self,
        frame: np.ndarray,
        min_blur_threshold: Optional[float] = None,
        min_contrast_threshold: Optional[float] = None
    ) -> FrameQualityReport:
        """
        Evaluates the overall optical quality of a CCTV video frame.
        Outputs GREEN, YELLOW, or RED status indicator.
        """
        if frame is None or frame.size == 0:
            return FrameQualityReport(
                status="RED",
                mean_brightness=0.0,
                contrast_std=0.0,
                blur_laplacian=0.0,
                glare_ratio=0.0,
                dark_ratio=1.0,
                obstruction_detected=True,
                is_recognition_reliable=False,
                reasons=["EMPTY_FRAME"],
                warning_message="Camera Image Quality Warning: Empty video frame"
            )

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
        h, w = gray.shape[:2]

        # 1. Illumination & Contrast
        mean_brightness = float(np.mean(gray))
        contrast_std = float(np.std(gray))

        # 2. Focus & Sharpness (Laplacian Variance)
        blur_laplacian = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        # 3. Glare and Darkness Ratios
        total_pixels = float(gray.size)
        glare_ratio = float(np.sum(gray > 245)) / total_pixels
        dark_ratio = float(np.sum(gray < 15)) / total_pixels

        # 4. Lens Obstruction / Fog Detection (Sub-grid variance distribution)
        # Only evaluate on full CCTV frames (>= 200x200), not isolated face crops
        obstruction_detected = False
        if h >= 200 and w >= 200 and contrast_std > 5.0:
            gh, gw = max(1, h // 4), max(1, w // 4)
            sub_variances = []
            for i in range(4):
                for j in range(4):
                    grid_patch = gray[i*gh:(i+1)*gh, j*gw:(j+1)*gw]
                    if grid_patch.size > 0:
                        sub_variances.append(float(np.var(grid_patch)))

            dead_patches = sum(1 for v in sub_variances if v < 12.0)
            obstruction_detected = (dead_patches >= 10)  # >60% of screen has zero spatial variance

        reasons = []

        # Effective blur and contrast thresholds (supports test overrides)
        eff_red_blur = self.red_blur_min if min_blur_threshold is None else min_blur_threshold
        eff_contrast_min = self.green_c_min if min_contrast_threshold is None else min_contrast_threshold

        # Determine RED conditions (recognition impossible or unreliable)
        is_red = False
        if mean_brightness < self.red_b_min:
            is_red = True
            reasons.append("EXTREME_LOW_LIGHT")
        elif mean_brightness > self.red_b_max:
            is_red = True
            reasons.append("EXTREME_OVEREXPOSURE_GLARE")

        if eff_red_blur > 0.0 and blur_laplacian < eff_red_blur and contrast_std > 0.0:
            is_red = True
            reasons.append("SEVERE_BLUR_OR_DEFOCUS")

        if obstruction_detected:
            is_red = True
            reasons.append("CAMERA_LENS_OBSTRUCTION")

        if is_red:
            status = "RED"
            is_reliable = False
            warning = f"Camera Image Quality Warning: Poor visibility ({', '.join(reasons)}). Recognition unreliable."
            return FrameQualityReport(
                status=status,
                mean_brightness=mean_brightness,
                contrast_std=contrast_std,
                blur_laplacian=blur_laplacian,
                glare_ratio=glare_ratio,
                dark_ratio=dark_ratio,
                obstruction_detected=obstruction_detected,
                is_recognition_reliable=is_reliable,
                reasons=reasons,
                warning_message=warning
            )

        # Determine YELLOW conditions (degraded, but recoverable through enhancement)
        is_yellow = False
        if mean_brightness < self.green_b_min:
            is_yellow = True
            reasons.append("SUB_OPTIMAL_LIGHTING")
        elif mean_brightness > self.green_b_max:
            is_yellow = True
            reasons.append("HIGH_BRIGHTNESS_GLARE")

        if contrast_std < self.green_c_min:
            is_yellow = True
            reasons.append("LOW_CONTRAST")

        if blur_laplacian < self.green_blur_min:
            is_yellow = True
            reasons.append("MODERATE_BLUR")

        if is_yellow:
            status = "YELLOW"
            is_reliable = True  # Can proceed with enhancement applied
            warning = f"Camera Image Quality Alert: Reduced visibility ({', '.join(reasons)}). Adaptive enhancement active."
        else:
            status = "GREEN"
            is_reliable = True
            warning = "Good visibility"

        return FrameQualityReport(
            status=status,
            mean_brightness=mean_brightness,
            contrast_std=contrast_std,
            blur_laplacian=blur_laplacian,
            glare_ratio=glare_ratio,
            dark_ratio=dark_ratio,
            obstruction_detected=False,
            is_recognition_reliable=is_reliable,
            reasons=reasons,
            warning_message=warning
        )

    def enhance_frame(
        self,
        frame: np.ndarray,
        report: FrameQualityReport
    ) -> Tuple[np.ndarray, bool]:
        """
        Applies adaptive enhancement when lighting is reduced (YELLOW) or suboptimal:
        1. Color Space conversion to LAB
        2. CLAHE (Contrast Limited Adaptive Histogram Equalization) on L (Luminance) channel
        3. Dynamic Gamma Correction: gamma < 1.0 boosts dark shadows, gamma > 1.0 tames highlights
        4. Mild Denoising filter
        """
        if frame is None or frame.size == 0 or report.status == "GREEN":
            return frame, False

        enhanced = frame.copy()

        # Step 1: LAB CLAHE on Luminance
        lab = cv2.cvtColor(enhanced, cv2.COLOR_BGR2LAB)
        l_channel, a_channel, b_channel = cv2.split(lab)
        l_clahe = self.clahe.apply(l_channel)
        lab_enhanced = cv2.merge((l_clahe, a_channel, b_channel))
        enhanced = cv2.cvtColor(lab_enhanced, cv2.COLOR_BGR2LAB)
        enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)

        # Step 2: Adaptive Gamma Correction based on mean brightness
        mean_b = max(1.0, report.mean_brightness)
        if mean_b < 55.0:
            # Underexposed: boost shadows (gamma ~ 0.5 - 0.7)
            gamma = float(np.clip(np.log(0.50) / np.log(mean_b / 255.0), 0.45, 0.85))
            inv_gamma = 1.0 / gamma
            table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
            enhanced = cv2.LUT(enhanced, table)
        elif mean_b > 200.0:
            # Overexposed: reduce washout
            gamma = 1.35
            inv_gamma = 1.0 / gamma
            table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
            enhanced = cv2.LUT(enhanced, table)

        # Step 3: Fast Edge-Preserving Denoise for low-light sensor noise
        if mean_b < 45.0:
            enhanced = cv2.bilateralFilter(enhanced, d=5, sigmaColor=35, sigmaSpace=35)

        return enhanced, True
