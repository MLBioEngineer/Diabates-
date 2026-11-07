"""
VPT Sense AI - Vibration Perception Threshold (VPT) Reference Estimation Engine
Biomedical normative regression model based on Age, Height, Gender, BMI & Anatomical Site
Derived from Quantitative Sensory Testing (QST) & Biothesiometer clinical literature.
"""

import math
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class VPTEstimationInput(BaseModel):
    age: int = Field(..., ge=10, le=105, description="Participant age in years")
    gender: str = Field(default="FEMALE", description="MALE, FEMALE, or OTHER")
    height_cm: float = Field(..., ge=120.0, le=230.0, description="Height in centimeters")
    weight_kg: float = Field(default=70.0, ge=30.0, le=250.0, description="Weight in kilograms")
    anatomical_site: str = Field(
        default="GREAT_TOE_RIGHT",
        description="GREAT_TOE_LEFT, GREAT_TOE_RIGHT, FIRST_MTH_LEFT, FIRST_MTH_RIGHT, MALLEOLUS_LEFT, MALLEOLUS_RIGHT, INDEX_FINGER_R"
    )
    measured_vpt_v: Optional[float] = Field(
        default=None, ge=0.0, le=50.0, description="Optional actual measured voltage (Volts RMS)"
    )


class FeatureImpact(BaseModel):
    feature_name: str
    feature_label: str
    feature_value: str
    voltage_impact_v: float
    description: str


class VPTEstimationOutput(BaseModel):
    expected_mean_vpt_v: float
    upper_limit_normal_95_v: float
    lower_limit_normal_5_v: float
    standard_deviation_v: float
    
    # Measured comparison (if provided)
    measured_vpt_v: Optional[float] = None
    z_score: Optional[float] = None
    percentile_rank: Optional[float] = None
    sensory_classification: str # PRESERVED, MILD_BLUNTING, MODERATE_LOSS, SEVERE_LOPS
    ulceration_risk_multiplier: float
    ulcer_risk_category: str # LOW, MODERATE, HIGH, CRITICAL
    
    # Explainability / Contributing Factors
    feature_impacts: List[FeatureImpact]
    clinical_interpretation: str
    research_recommendation: str
    disclaimer: str = (
        "VPT Sense AI reference estimations are intended for quantitative sensory research "
        "and clinical decision support only. Definitive diagnosis requires comprehensive medical assessment."
    )


class VPTEstimationService:

    @staticmethod
    def _normal_cdf(x: float) -> float:
        """Approximation of the standard normal Cumulative Distribution Function."""
        return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))

    @classmethod
    def estimate_reference(cls, data: VPTEstimationInput) -> VPTEstimationOutput:
        age = data.age
        height = data.height_cm
        weight = data.weight_kg
        gender = data.gender.upper()
        site = data.anatomical_site.upper()
        bmi = round(weight / ((height / 100.0) ** 2), 1)

        # 1. Base physiological calibration (Young adult hallux reference baseline at age 25, height 165cm)
        base_voltage = 5.2

        # 2. Age Effect: Peripheral large myelinated A-beta fibers experience age-related axonopathy
        # Linear rise up to 50, then slight non-linear acceleration
        age_diff = age - 25.0
        age_impact = max(0.0, age_diff * 0.165)
        if age > 55:
            age_impact += 0.0035 * ((age - 55) ** 2)
        age_impact = round(age_impact, 2)

        # 3. Height Effect: Taller individuals have longer peripheral nerve axons (S1/L5 dermatome path)
        height_diff = height - 165.0
        height_impact = round(height_diff * 0.052, 2)

        # 4. Gender Effect: Slight mechanical / skin impedance difference
        gender_impact = 0.55 if gender == "MALE" else 0.0

        # 5. BMI / Plantar Tissue Damping Effect
        bmi_impact = round(max(0.0, (bmi - 24.0) * 0.09), 2)

        # 6. Anatomical Site Specific Modification
        site_label = "Great Toe (Hallux)"
        site_impact = 0.0

        if "FIRST_MTH" in site or "METATARSAL" in site:
            site_label = "1st Metatarsal Head (Plantar)"
            site_impact = 1.35 # Plantar stratum corneum mechanical dampening
        elif "MALLEOLUS" in site:
            site_label = "Medial Malleolus (Bony Prominence)"
            site_impact = -0.75 # Close acoustic coupling to bone
        elif "INDEX_FINGER" in site or "FINGER" in site:
            site_label = "Index Fingertip (Upper Extremity Control)"
            site_impact = -2.4 - (age_impact * 0.45) # Upper limb nerves have short path and preserve sensation much longer
        else:
            site_label = "Great Toe (Hallux Distal Phalanx)"
            site_impact = 0.0

        # Calculated expected mean normative threshold
        expected_mean = base_voltage + age_impact + height_impact + gender_impact + bmi_impact + site_impact
        expected_mean = round(max(2.5, min(35.0, expected_mean)), 1)

        # Standard deviation (increases with age)
        sd = round(1.6 + (age * 0.042), 2)

        # 95th Percentile Upper Limit of Normal (ULN)
        uln_95 = round(expected_mean + (1.645 * sd), 1)
        lln_5 = round(max(1.5, expected_mean - (1.645 * sd)), 1)

        # Feature Impacts for UI Explainability
        feature_impacts = [
            FeatureImpact(
                feature_name="age",
                feature_label="Chronological Age",
                feature_value=f"{age} years",
                voltage_impact_v=age_impact,
                description=f"Age-related physiological slowing of large myelinated A-beta sensory fibers (+{age_impact:.1f} V)."
            ),
            FeatureImpact(
                feature_name="height",
                feature_label="Axonal Path Length (Height)",
                feature_value=f"{height:.1f} cm",
                voltage_impact_v=height_impact,
                description=f"Longer sensory conduction distance from foot to dorsal root ganglion ({height_impact:+.1f} V)."
            ),
            FeatureImpact(
                feature_name="anatomical_site",
                feature_label="Anatomical Site",
                feature_value=site_label,
                voltage_impact_v=site_impact,
                description=f"Local dermal mechanical impedance and bone coupling ({site_impact:+.1f} V)."
            ),
            FeatureImpact(
                feature_name="bmi",
                feature_label="Body Mass Index",
                feature_value=f"{bmi} kg/m²",
                voltage_impact_v=bmi_impact,
                description=f"Plantar fat pad mechanical dampening and tissue pressure (+{bmi_impact:.1f} V)."
            ),
        ]

        # Evaluation of measured voltage (if supplied)
        measured_v = data.measured_vpt_v
        z_score = None
        percentile = None
        classification = "REFERENCE_ONLY"
        ulcer_mult = 1.0
        ulcer_cat = "LOW"
        clinical_note = (
            f"Normative baseline for a {age}yo {gender.lower()} ({height}cm) at {site_label} "
            f"is estimated at {expected_mean} V (95% Upper Limit of Normal: {uln_95} V)."
        )
        recommendation = "Utilize this normative target to evaluate patient quantitative sensory threshold trials."

        if measured_v is not None:
            z_score = round((measured_v - expected_mean) / sd, 2)
            percentile = round(cls._normal_cdf(z_score) * 100.0, 1)

            if measured_v < 15.0:
                classification = "PRESERVED"
                ulcer_mult = 1.0
                ulcer_cat = "LOW"
                clinical_note = (
                    f"Measured threshold ({measured_v} V) is within the preserved sensation range (<15 V). "
                    f"Z-score is {z_score} ({percentile}th percentile of age/height-adjusted cohort)."
                )
                recommendation = "Standard annual quantitative sensory monitoring. Protective sensation fully intact."
            elif measured_v < 20.0:
                classification = "MILD_BLUNTING"
                ulcer_mult = 2.2
                ulcer_cat = "MODERATE"
                clinical_note = (
                    f"Measured threshold ({measured_v} V) reflects mild vibration sensory blunting (15-19.9 V). "
                    f"Patient is in the {percentile}th percentile for their demographic cohort."
                )
                recommendation = "6-month follow-up recommended. Inspect footwear fit and educate on daily foot inspection."
            elif measured_v < 25.0:
                classification = "MODERATE_LOSS"
                ulcer_mult = 4.5
                ulcer_cat = "HIGH"
                clinical_note = (
                    f"Measured threshold ({measured_v} V) indicates moderate sensory neuropathy (20-24.9 V). "
                    f"Significant reduction in large fiber mechanoreception."
                )
                recommendation = "Podiatric clinical evaluation recommended. Prescribe protective diabetic socks and pressure-relieving insoles."
            else:
                classification = "SEVERE_LOPS"
                ulcer_mult = 7.8
                ulcer_cat = "CRITICAL"
                clinical_note = (
                    f"CRITICAL WARNING: Measured threshold ({measured_v} V) equals or exceeds 25.0 V. "
                    f"Patient exhibits severe Loss of Protective Sensation (LOPS). Relative ulceration risk is 7.8x."
                )
                recommendation = (
                    "URGENT CLINICAL TRIAGE: Immediate multidisciplinary foot care referral. "
                    "Custom offloading orthotics required. Prohibit unassisted barefoot walking."
                )

        return VPTEstimationOutput(
            expected_mean_vpt_v=expected_mean,
            upper_limit_normal_95_v=uln_95,
            lower_limit_normal_5_v=lln_5,
            standard_deviation_v=sd,
            measured_vpt_v=measured_v,
            z_score=z_score,
            percentile_rank=percentile,
            sensory_classification=classification,
            ulceration_risk_multiplier=ulcer_mult,
            ulcer_risk_category=ulcer_cat,
            feature_impacts=feature_impacts,
            clinical_interpretation=clinical_note,
            research_recommendation=recommendation,
        )


vpt_estimation_service = VPTEstimationService()
