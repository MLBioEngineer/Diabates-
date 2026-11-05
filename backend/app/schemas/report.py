from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from backend.app.schemas.telemetry import TelemetryStatsOut, TelemetryOut
from backend.app.schemas.ml import RiskPredictionOutput
from backend.app.schemas.alert import AlertOut


class HealthReportOut(BaseModel):
    report_id: str
    generated_at: datetime
    patient_name: str
    patient_id: str
    diabetes_type: str
    monitoring_period: str
    telemetry_statistics: TelemetryStatsOut
    latest_risk_assessment: Optional[RiskPredictionOutput] = None
    recent_readings_sample: List[TelemetryOut]
    recent_alerts: List[AlertOut]
    clinical_notes: str
    disclaimer: str
