"""
Health Alerts & Early Warnings Management Endpoints
"""

from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.models.alert import HealthAlert
from backend.app.models.patient import PatientProfile
from backend.app.schemas.alert import AlertOut, AlertAck
from backend.app.api.v1.deps import get_current_patient_profile

router = APIRouter()


@router.get("/active", response_model=List[AlertOut])
async def get_active_alerts(
    current_patient: PatientProfile = Depends(get_current_patient_profile),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(HealthAlert)
        .where(HealthAlert.patient_id == current_patient.id, HealthAlert.is_acknowledged == False)
        .order_by(desc(HealthAlert.created_at))
    )
    result = await db.execute(query)
    alerts = result.scalars().all()
    return [AlertOut.model_validate(a) for a in alerts]


@router.get("/all", response_model=List[AlertOut])
async def get_all_alerts(
    limit: int = 50,
    current_patient: PatientProfile = Depends(get_current_patient_profile),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(HealthAlert)
        .where(HealthAlert.patient_id == current_patient.id)
        .order_by(desc(HealthAlert.created_at))
        .limit(limit)
    )
    result = await db.execute(query)
    alerts = result.scalars().all()
    return [AlertOut.model_validate(a) for a in alerts]


@router.post("/{alert_id}/ack", response_model=AlertOut)
async def acknowledge_alert(
    alert_id: str,
    current_patient: PatientProfile = Depends(get_current_patient_profile),
    db: AsyncSession = Depends(get_db),
):
    query = select(HealthAlert).where(HealthAlert.id == alert_id, HealthAlert.patient_id == current_patient.id)
    result = await db.execute(query)
    alert = result.scalars().first()

    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    alert.is_acknowledged = True
    alert.acknowledged_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(alert)
    return AlertOut.model_validate(alert)
