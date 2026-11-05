from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class TelemetryCreate(BaseModel):
    glucose_mg_dl: float = Field(..., description="Blood glucose reading in mg/dL")
    glucose_trend_velocity: float = Field(default=0.0, description="Rate of change in mg/dL/min")
    heart_rate_bpm: Optional[int] = Field(default=75, description="Heart rate in BPM")
    blood_pressure_systolic: Optional[int] = Field(default=120, description="Systolic blood pressure")
    blood_pressure_diastolic: Optional[int] = Field(default=80, description="Diastolic blood pressure")
    body_temperature_c: Optional[float] = Field(default=36.8, description="Body temperature in Celsius")
    spo2_percentage: Optional[float] = Field(default=98.0, description="Oxygen saturation SpO2 %")
    physical_activity_steps: int = Field(default=0, description="Step count")
    provenance: str = Field(default="SIMULATED", description="Data provenance: SIMULATED, DEXCOM_G7, ABBOTT_FREESTYLE, MANUAL")
    recorded_at: Optional[datetime] = None


class TelemetryOut(BaseModel):
    id: str
    patient_id: str
    recorded_at: datetime
    glucose_mg_dl: float
    glucose_trend_velocity: float
    heart_rate_bpm: Optional[int]
    blood_pressure_systolic: Optional[int]
    blood_pressure_diastolic: Optional[int]
    body_temperature_c: Optional[float]
    spo2_percentage: Optional[float]
    physical_activity_steps: int
    provenance: str

    model_config = ConfigDict(from_attributes=True)


class TelemetryStatsOut(BaseModel):
    time_in_range_percent: float # 70-180 mg/dL (ADA target > 70%)
    time_below_range_percent: float # < 70 mg/dL (ADA target < 4%)
    time_above_range_percent: float # > 180 mg/dL (ADA target < 25%)
    mean_glucose: float
    glucose_management_indicator: float # Estimated HbA1c: GMI = 3.31 + (0.02392 * mean_glucose)
    glycemic_variability_cv: float # Standard Deviation / Mean * 100
    readings_count: int
    latest_reading: Optional[TelemetryOut] = None
