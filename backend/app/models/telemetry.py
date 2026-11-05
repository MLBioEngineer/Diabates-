"""
Real-time Health Telemetry and Continuous Glucose Monitoring Model
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class TelemetryReading(Base):
    __tablename__ = "telemetry_readings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Blood Glucose
    glucose_mg_dl = Column(Float, nullable=False) # e.g. 110.5 mg/dL
    glucose_trend_velocity = Column(Float, default=0.0, nullable=False) # mg/dL/min, e.g. +1.2 or -0.8
    
    # Vital Signs
    heart_rate_bpm = Column(Integer, nullable=True) # e.g. 74
    blood_pressure_systolic = Column(Integer, nullable=True) # e.g. 120
    blood_pressure_diastolic = Column(Integer, nullable=True) # e.g. 80
    body_temperature_c = Column(Float, nullable=True) # e.g. 36.8
    spo2_percentage = Column(Float, nullable=True) # e.g. 98.0
    physical_activity_steps = Column(Integer, default=0, nullable=False)
    
    # Provenance: Strictly identify simulated research streams vs certified hardware
    provenance = Column(String(50), default="SIMULATED", nullable=False) # "SIMULATED", "DEXCOM_G7", "ABBOTT_FREESTYLE", "MANUAL"

    # Relationships
    patient = relationship("PatientProfile", back_populates="telemetry_readings")

    __table_args__ = (
        Index("idx_patient_telemetry_time", "patient_id", "recorded_at"),
    )
