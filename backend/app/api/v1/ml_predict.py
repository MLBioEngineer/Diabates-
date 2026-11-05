"""
Machine Learning API: Prediction, SHAP Explainability & Model Info
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.schemas.ml import RiskPredictionInput, RiskPredictionOutput, ModelMetadataOut
from backend.app.services.ml_service import ml_service
from backend.app.models.risk_assessment import RiskAssessment
from backend.app.models.user import User
from backend.app.api.v1.deps import get_current_user, get_current_patient_profile

router = APIRouter()


@router.post("/predict-risk", response_model=RiskPredictionOutput)
async def predict_diabetes_risk(
    payload: RiskPredictionInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prediction = ml_service.predict_risk(payload)

    # If the user is a patient, persist the assessment to their medical history
    if current_user.role == "PATIENT":
        patient_profile = await get_current_patient_profile(current_user=current_user, db=db)
        assessment_record = RiskAssessment(
            patient_id=patient_profile.id,
            model_name=prediction.model_name,
            risk_score=prediction.risk_score,
            risk_category=prediction.risk_category,
            input_features=payload.model_dump(),
            shap_top_contributors=[s.model_dump() for s in prediction.shap_contributions[:6]],
            clinical_summary=prediction.clinical_summary,
        )
        db.add(assessment_record)
        await db.commit()
        await db.refresh(assessment_record)
        prediction.id = assessment_record.id
        prediction.patient_id = patient_profile.id

    return prediction


@router.get("/model-info", response_model=ModelMetadataOut)
async def get_model_info():
    """
    Returns transparency metadata regarding the ML training methodology,
    5-algorithm benchmark comparison, and decision thresholds.
    """
    return ml_service.get_metadata()
