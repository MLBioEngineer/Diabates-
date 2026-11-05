"""
Machine Learning Diabetes Risk Assessment Record Model
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Model Metadata
    model_name = Column(String(100), nullable=False)
    risk_score = Column(Float, nullable=False) # e.g. 0.68 (68% probability)
    risk_category = Column(String(50), nullable=False) # "LOW", "MODERATE", "HIGH", "CRITICAL"
    
    # Feature attributions & explainability
    input_features = Column(JSON, nullable=False) # raw clinical values input
    shap_top_contributors = Column(JSON, nullable=False) # top positive/negative SHAP feature impact
    clinical_summary = Column(Text, nullable=False) # Non-diagnostic decision support advice

    # Relationships
    patient = relationship("PatientProfile", back_populates="risk_assessments")
