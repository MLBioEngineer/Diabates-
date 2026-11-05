from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class RiskPredictionInput(BaseModel):
    pregnancies: int = Field(default=0, ge=0, le=25, description="Number of times pregnant")
    glucose: float = Field(default=115.0, ge=40.0, le=400.0, description="Fasting / 2-hour oral glucose tolerance test (mg/dL)")
    blood_pressure: float = Field(default=72.0, ge=30.0, le=200.0, description="Diastolic blood pressure (mm Hg)")
    skin_thickness: float = Field(default=23.0, ge=5.0, le=99.0, description="Triceps skin fold thickness (mm)")
    insulin: float = Field(default=85.0, ge=5.0, le=800.0, description="2-Hour serum insulin (mu U/ml)")
    bmi: float = Field(default=28.5, ge=10.0, le=70.0, description="Body Mass Index (kg/m^2)")
    diabetes_pedigree_function: float = Field(default=0.45, ge=0.05, le=3.0, description="Diabetes pedigree function (family genetic risk)")
    age: int = Field(default=45, ge=18, le=120, description="Age in years")


class SHAPContribution(BaseModel):
    feature: str
    feature_label: str
    feature_value: float
    shap_value: float
    impact_direction: str # "INCREASES_RISK" or "DECREASES_RISK"
    impact_percentage: float


class RiskPredictionOutput(BaseModel):
    id: Optional[str] = None
    patient_id: Optional[str] = None
    model_name: str
    risk_score: float # 0.0 to 1.0 (probability)
    risk_percentage: float # 0% to 100%
    risk_category: str # "LOW", "MODERATE", "HIGH", "CRITICAL"
    clinical_summary: str
    disclaimer: str
    shap_contributions: List[SHAPContribution]
    created_at: datetime


class ModelMetadataOut(BaseModel):
    dataset: str
    total_samples: int
    positive_class_ratio: float
    selected_model: str
    decision_threshold: float
    features: List[str]
    benchmark_comparison: Dict[str, Any]
