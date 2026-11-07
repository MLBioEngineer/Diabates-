"""
VPT Sense AI - Core Domain Database Models
Vibration Perception Threshold (VPT) & Quantitative Sensory Testing (QST)
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON, Index
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class Participant(Base):
    __tablename__ = "vpt_participants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, unique=True)
    subject_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. SUB-101
    full_name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), default="FEMALE", nullable=False) # MALE, FEMALE, OTHER
    height_cm = Column(Float, nullable=False) # e.g. 165.0 cm
    weight_kg = Column(Float, nullable=False) # e.g. 70.0 kg
    bmi = Column(Float, nullable=True)
    
    # Clinical Stratification
    clinical_group = Column(String(100), default="DIABETIC_NON_NEUROPATHIC", nullable=False) 
    # HEALTHY_CONTROL, DIABETIC_NON_NEUROPATHIC, ESTABLISHED_DPN, CIPN, IDIOPATHIC
    diabetes_duration_years = Column(Float, default=0.0, nullable=False)
    foot_ulcer_history = Column(Boolean, default=False, nullable=False)
    symptoms_nss_score = Column(Integer, default=0, nullable=False) # Neuropathy Symptom Score 0-9
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="participant_profile")
    sessions = relationship("VPTSession", back_populates="participant", cascade="all, delete-orphan", order_by="desc(VPTSession.tested_at)")
    alerts = relationship("VPTAlert", back_populates="participant", cascade="all, delete-orphan", order_by="desc(VPTAlert.created_at)")


class VPTSession(Base):
    __tablename__ = "vpt_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    participant_id = Column(String(36), ForeignKey("vpt_participants.id", ondelete="CASCADE"), nullable=False, index=True)
    investigator_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    tested_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Instrument parameters
    device_name = Column(String(100), default="Digital Biothesiometer Pro-V", nullable=False)
    frequency_hz = Column(Integer, default=100, nullable=False) # 100 Hz or 120 Hz
    ramp_rate_v_per_sec = Column(Float, default=1.0, nullable=False) # 1.0 V/s
    protocol_name = Column(String(100), default="Standard 6-Point Bilateral QST", nullable=False)
    
    # Quantitative Summary Scores
    mean_great_toe_v = Column(Float, nullable=True)
    max_site_voltage_v = Column(Float, nullable=True)
    bilateral_asymmetry_v = Column(Float, default=0.0, nullable=False)
    
    # Clinical Outcomes
    overall_classification = Column(String(50), default="PRESERVED", nullable=False) 
    # PRESERVED (<15V), MILD_BLUNTING (15-19.9V), MODERATE_NEUROPATHY (20-24.9V), SEVERE_LOPS (>=25V)
    ulcer_risk_category = Column(String(50), default="LOW", nullable=False) # LOW, MODERATE, HIGH, CRITICAL
    clinical_summary = Column(Text, nullable=True)

    # Relationships
    participant = relationship("Participant", back_populates="sessions")
    measurements = relationship("VPTMeasurement", back_populates="session", cascade="all, delete-orphan")


class VPTMeasurement(Base):
    __tablename__ = "vpt_measurements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("vpt_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    anatomical_site = Column(String(50), nullable=False) 
    # GREAT_TOE_LEFT, GREAT_TOE_RIGHT, FIRST_MTH_LEFT, FIRST_MTH_RIGHT, MALLEOLUS_LEFT, MALLEOLUS_RIGHT, INDEX_FINGER_R
    
    # Triplicate Trial Voltages (Volts RMS)
    trial_1_v = Column(Float, nullable=False)
    trial_2_v = Column(Float, nullable=False)
    trial_3_v = Column(Float, nullable=False)
    mean_vpt_v = Column(Float, nullable=False)
    sd_vpt_v = Column(Float, default=0.0, nullable=False)
    
    # Normative Comparison
    normative_expected_v = Column(Float, nullable=False)
    z_score = Column(Float, nullable=False)
    percentile = Column(Float, nullable=False)
    loss_grade = Column(String(50), default="NORMAL", nullable=False)

    session = relationship("VPTSession", back_populates="measurements")

    __table_args__ = (
        Index("idx_vpt_session_site", "session_id", "anatomical_site"),
    )


class DeviceConfig(Base):
    __tablename__ = "vpt_device_configs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    device_name = Column(String(100), default="Digital Biothesiometer Pro-V", nullable=False)
    serial_number = Column(String(100), default="BIO-THESIO-2026-X8", nullable=False)
    port_mode = Column(String(50), default="SIMULATOR", nullable=False) # SIMULATOR, WEB_SERIAL, WEB_BLUETOOTH
    frequency_hz = Column(Integer, default=100, nullable=False)
    ramp_rate_v_per_sec = Column(Float, default=1.0, nullable=False)
    max_voltage_safety_v = Column(Float, default=50.0, nullable=False)
    contact_force_target_g = Column(Float, default=22.5, nullable=False) # 20-25g constant pressure probe
    calibration_status = Column(String(50), default="CALIBRATED", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class VPTAlert(Base):
    __tablename__ = "vpt_alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    participant_id = Column(String(36), ForeignKey("vpt_participants.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    alert_level = Column(String(20), nullable=False) # INFO, WARNING, CRITICAL
    alert_type = Column(String(50), nullable=False) # SEVERE_LOPS, BILATERAL_ASYMMETRY, RAPID_DETERIORATION
    metric_value = Column(Float, nullable=False) # e.g. 28.5 V
    site = Column(String(50), nullable=True)
    message = Column(String(255), nullable=False)
    
    is_acknowledged = Column(Boolean, default=False, nullable=False)
    acknowledged_at = Column(DateTime, nullable=True)

    participant = relationship("Participant", back_populates="alerts")
