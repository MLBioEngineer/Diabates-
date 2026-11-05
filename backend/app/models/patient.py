"""
Patient Profile Model
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    date_of_birth = Column(String(50), nullable=True)
    gender = Column(String(20), nullable=True) # "FEMALE", "MALE", "OTHER"
    height_cm = Column(Float, nullable=True, default=170.0)
    baseline_weight_kg = Column(Float, nullable=True, default=70.0)
    diabetes_type = Column(String(50), default="NONE", nullable=False) # "NONE", "PRE_DIABETES", "TYPE_1", "TYPE_2", "GESTATIONAL"
    emergency_contact = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="patient_profile")
    telemetry_readings = relationship("TelemetryReading", back_populates="patient", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="patient", cascade="all, delete-orphan")
    alerts = relationship("HealthAlert", back_populates="patient", cascade="all, delete-orphan")
    doctor_accesses = relationship("DoctorPatientAccess", back_populates="patient", cascade="all, delete-orphan")
