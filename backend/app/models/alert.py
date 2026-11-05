"""
Health Alerts & Early Warnings Model
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class HealthAlert(Base):
    __tablename__ = "health_alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    alert_level = Column(String(20), nullable=False) # "INFO", "WARNING", "CRITICAL"
    metric_type = Column(String(50), nullable=False) # "GLUCOSE_HYPO", "GLUCOSE_HYPER", "TACHYCARDIA", "HYPOXIA"
    metric_value = Column(Float, nullable=False)
    message = Column(String(255), nullable=False)
    threshold_rule = Column(String(100), nullable=False)
    
    is_acknowledged = Column(Boolean, default=False, nullable=False)
    acknowledged_at = Column(DateTime, nullable=True)

    # Relationships
    patient = relationship("PatientProfile", back_populates="alerts")

    __table_args__ = (
        Index("idx_patient_alert_ack", "patient_id", "is_acknowledged"),
    )
