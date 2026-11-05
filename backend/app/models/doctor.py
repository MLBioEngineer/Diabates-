"""
Doctor profile and patient authorization access model
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    specialization = Column(String(100), default="Endocrinology", nullable=False)
    hospital_affiliation = Column(String(200), default="Metabolic Health Center", nullable=False)
    license_number = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    patient_accesses = relationship("DoctorPatientAccess", back_populates="doctor", cascade="all, delete-orphan")


class DoctorPatientAccess(Base):
    __tablename__ = "doctor_patient_accesses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    doctor_id = Column(String(36), ForeignKey("doctor_profiles.id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    access_scope = Column(String(50), default="FULL_ACCESS", nullable=False) # "READ_ONLY", "FULL_ACCESS"
    is_active = Column(Boolean, default=True, nullable=False)
    granted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    doctor = relationship("DoctorProfile", back_populates="patient_accesses")
    patient = relationship("PatientProfile", back_populates="doctor_accesses")
