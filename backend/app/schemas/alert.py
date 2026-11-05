from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AlertOut(BaseModel):
    id: str
    patient_id: str
    created_at: datetime
    alert_level: str
    metric_type: str
    metric_value: float
    message: str
    threshold_rule: str
    is_acknowledged: bool
    acknowledged_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AlertAck(BaseModel):
    is_acknowledged: bool = True
