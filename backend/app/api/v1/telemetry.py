"""
Telemetry ingestion, continuous monitoring, and simulation endpoints
"""

from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.models.telemetry import TelemetryReading
from backend.app.models.patient import PatientProfile
from backend.app.models.user import User
from backend.app.schemas.telemetry import TelemetryCreate, TelemetryOut, TelemetryStatsOut
from backend.app.services.telemetry_service import TelemetryService
from backend.app.services.simulation_service import simulation_engine
from backend.app.websockets.live_telemetry import ws_manager
from backend.app.api.v1.deps import get_current_user, get_current_patient_profile

router = APIRouter()


@router.post("/record", response_model=TelemetryOut, status_code=status.HTTP_201_CREATED)
async def record_telemetry_reading(
    payload: TelemetryCreate,
    current_patient: PatientProfile = Depends(get_current_patient_profile),
    db: AsyncSession = Depends(get_db),
):
    reading, alerts = await TelemetryService.record_telemetry(db, current_patient.id, payload)
    reading_dto = TelemetryOut.model_validate(reading)

    # Broadcast via WebSocket to patient's active dashboard
    ws_event = {
        "type": "NEW_TELEMETRY",
        "data": reading_dto.model_dump(),
        "alerts": [
            {
                "id": a.id,
                "level": a.alert_level,
                "type": a.metric_type,
                "message": a.message,
                "rule": a.threshold_rule,
            }
            for a in alerts
        ],
    }
    await ws_manager.broadcast_to_patient(current_patient.id, ws_event)
    return reading_dto


@router.get("/history", response_model=List[TelemetryOut])
async def get_telemetry_history(
    hours: int = Query(default=24, ge=1, le=168),
    current_patient: PatientProfile = Depends(get_current_patient_profile),
    db: AsyncSession = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    query = (
        select(TelemetryReading)
        .where(TelemetryReading.patient_id == current_patient.id, TelemetryReading.recorded_at >= since)
        .order_by(TelemetryReading.recorded_at.asc())
    )
    result = await db.execute(query)
    readings = result.scalars().all()
    return [TelemetryOut.model_validate(r) for r in readings]


@router.get("/statistics", response_model=TelemetryStatsOut)
async def get_telemetry_statistics(
    hours: int = Query(default=24, ge=1, le=168),
    current_patient: PatientProfile = Depends(get_current_patient_profile),
    db: AsyncSession = Depends(get_db),
):
    return await TelemetryService.get_patient_statistics(db, current_patient.id, hours=hours)


@router.post("/simulate-stream", response_model=TelemetryOut)
async def trigger_simulated_reading(
    event_override: Optional[str] = Query(default=None, description="Optional override: MEAL or EXERCISE"),
    current_patient: PatientProfile = Depends(get_current_patient_profile),
    db: AsyncSession = Depends(get_db),
):
    # Fetch latest reading for smooth interpolation
    latest_q = (
        select(TelemetryReading)
        .where(TelemetryReading.patient_id == current_patient.id)
        .order_by(desc(TelemetryReading.recorded_at))
        .limit(1)
    )
    res = await db.execute(latest_q)
    latest_obj = res.scalars().first()
    last_glucose = latest_obj.glucose_mg_dl if latest_obj else 105.0

    raw = simulation_engine.generate_single_reading(
        current_time=datetime.now(timezone.utc),
        last_glucose=last_glucose,
        event_override=event_override,
    )
    dto = TelemetryCreate(**raw)
    reading, alerts = await TelemetryService.record_telemetry(db, current_patient.id, dto)
    reading_dto = TelemetryOut.model_validate(reading)

    await ws_manager.broadcast_to_patient(
        current_patient.id,
        {
            "type": "NEW_TELEMETRY",
            "data": reading_dto.model_dump(),
            "alerts": [
                {
                    "id": a.id,
                    "level": a.alert_level,
                    "type": a.metric_type,
                    "message": a.message,
                    "rule": a.threshold_rule,
                }
                for a in alerts
            ],
        },
    )
    return reading_dto


@router.post("/seed-sample-history")
async def seed_sample_history(
    hours: int = Query(default=24, ge=6, le=48),
    current_patient: PatientProfile = Depends(get_current_patient_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Seeds initial realistic 24-hour telemetry history so the dashboard and analytics
    have immediate interactive charts on first launch.
    """
    # Check if patient already has readings
    existing = await db.execute(select(TelemetryReading).where(TelemetryReading.patient_id == current_patient.id).limit(1))
    if existing.scalars().first():
        return {"status": "ALREADY_SEEDED", "message": "Telemetry history already exists for this patient."}

    series = simulation_engine.generate_historical_series(hours=hours, interval_minutes=15)
    for s in series:
        reading = TelemetryReading(
            patient_id=current_patient.id,
            recorded_at=s["recorded_at"],
            glucose_mg_dl=s["glucose_mg_dl"],
            glucose_trend_velocity=s["glucose_trend_velocity"],
            heart_rate_bpm=s["heart_rate_bpm"],
            blood_pressure_systolic=s["blood_pressure_systolic"],
            blood_pressure_diastolic=s["blood_pressure_diastolic"],
            body_temperature_c=s["body_temperature_c"],
            spo2_percentage=s["spo2_percentage"],
            physical_activity_steps=s["physical_activity_steps"],
            provenance="SIMULATED",
        )
        db.add(reading)
    
    await db.commit()
    return {"status": "SEEDED", "count": len(series), "message": f"Successfully seeded {len(series)} telemetry records."}
