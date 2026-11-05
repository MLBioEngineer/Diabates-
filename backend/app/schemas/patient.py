from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from backend.app.schemas.auth import UserOut


class PatientProfileBase(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = "FEMALE"
    height_cm: Optional[float] = 165.0
    baseline_weight_kg: Optional[float] = 68.0
    diabetes_type: Optional[str] = "NONE"
    emergency_contact: Optional[Dict[str, Any]] = None


class PatientProfileCreate(PatientProfileBase):
    pass


class PatientProfileUpdate(PatientProfileBase):
    pass


class PatientProfileOut(PatientProfileBase):
    id: str
    user_id: str
    created_at: datetime
    user: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)


class DoctorProfileOut(BaseModel):
    id: str
    user_id: str
    specialization: str
    hospital_affiliation: str
    license_number: Optional[str] = None
    created_at: datetime
    user: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)
