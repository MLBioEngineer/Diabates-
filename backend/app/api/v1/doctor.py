"""
Clinician & Doctor Dashboard Endpoints: Patient Triage & Cohort Analytics
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.patient import PatientProfile
from backend.app.models.telemetry import TelemetryReading
from backend.app.models.risk_assessment import RiskAssessment
from backend.app.models.alert import HealthAlert
from backend.app.models.doctor import DoctorProfile
from backend.app.schemas.telemetry import TelemetryOut
from backend.app.services.telemetry_service import TelemetryService
from backend.app.api.v1.deps import get_current_doctor

router = APIRouter()


@router.get("/patients")
async def get_doctor_patient_roster(
    doctor: DoctorProfile = Depends(get_current_doctor),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns list of all patients with high-level triage risk, latest glucose,
    Time-in-Range, and unacknowledged alerts count.
    """
    patients_q = select(PatientProfile).join(User)
    res = await db.execute(patients_q)
    patients = res.scalars().all()

    roster = []
    for p in patients:
        user_res = await db.execute(select(User).where(User.id == p.user_id))
        user_obj = user_res.scalars().first()

        # Latest reading
        lat_q = select(TelemetryReading).where(TelemetryReading.patient_id == p.id).order_by(desc(TelemetryReading.recorded_at)).limit(1)
        lat_res = await db.execute(lat_q)
        latest_reading = lat_res.scalars().first()

        # Latest risk assessment
        risk_q = select(RiskAssessment).where(RiskAssessment.patient_id == p.id).order_by(desc(RiskAssessment.created_at)).limit(1)
        risk_res = await db.execute(risk_q)
        risk_obj = risk_res.scalars().first()

        # Unack alerts count
        alert_q = select(func.count(HealthAlert.id)).where(HealthAlert.patient_id == p.id, HealthAlert.is_acknowledged == False)
        alert_count_res = await db.execute(alert_q)
        unack_alerts = alert_count_res.scalar() or 0

        # Stats
        stats = await TelemetryService.get_patient_statistics(db, p.id, hours=24)

        roster.append({
            "patient_id": p.id,
            "full_name": user_obj.full_name if user_obj else "Unknown Patient",
            "email": user_obj.email if user_obj else "",
            "diabetes_type": p.diabetes_type,
            "latest_glucose": latest_reading.glucose_mg_dl if latest_reading else None,
            "latest_reading_time": latest_reading.recorded_at if latest_reading else None,
            "risk_score": risk_obj.risk_score if risk_obj else None,
            "risk_category": risk_obj.risk_category if risk_obj else "UNASSESSED",
            "time_in_range_percent": stats.time_in_range_percent,
            "active_alerts_count": unack_alerts,
        })

    # Sort so high-risk and patients with active alerts appear at the top for triage
    roster.sort(
        key=lambda item: (item["active_alerts_count"] > 0, item["risk_score"] or 0),
        reverse=True
    )
    return roster


@router.get("/patients/{patient_id}/details")
async def get_patient_clinical_details(
    patient_id: str,
    doctor: DoctorProfile = Depends(get_current_doctor),
    db: AsyncSession = Depends(get_db),
):
    patient_q = select(PatientProfile).where(PatientProfile.id == patient_id)
    p_res = await db.execute(patient_q)
    patient = p_res.scalars().first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    user_res = await db.execute(select(User).where(User.id == patient.user_id))
    user_obj = user_res.scalars().first()

    stats = await TelemetryService.get_patient_statistics(db, patient_id, hours=48)

    # 48h readings
    read_q = select(TelemetryReading).where(TelemetryReading.patient_id == patient_id).order_by(desc(TelemetryReading.recorded_at)).limit(100)
    read_res = await db.execute(read_q)
    readings = [TelemetryOut.model_validate(r) for r in read_res.scalars().all()]

    return {
        "patient_id": patient.id,
        "full_name": user_obj.full_name if user_obj else "Patient",
        "email": user_obj.email if user_obj else "",
        "diabetes_type": patient.diabetes_type,
        "height_cm": patient.height_cm,
        "baseline_weight_kg": patient.baseline_weight_kg,
        "statistics_48h": stats,
        "recent_readings": readings,
    }
