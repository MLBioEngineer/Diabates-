"""
VPT Sense AI - Vibration Perception Threshold & Quantitative Sensory Testing API Routes
"""

import io
import csv
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from pydantic import BaseModel, Field
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.vpt_domain import Participant, VPTSession, VPTMeasurement, DeviceConfig, VPTAlert
from backend.app.services.vpt_estimation_service import (
    vpt_estimation_service, VPTEstimationInput, VPTEstimationOutput
)
from backend.app.services.vpt_device_service import (
    vpt_device_service, LiveDeviceState
)
from backend.app.services.participant_service import participant_service
from backend.app.services.vpt_analytics_service import vpt_analytics_service
from backend.app.api.v1.deps import get_current_user

router = APIRouter()


# -------------------------------------------------------------
# 1. VPT REFERENCE ESTIMATION
# -------------------------------------------------------------
@router.post("/estimate-reference", response_model=VPTEstimationOutput)
async def estimate_vpt_reference(payload: VPTEstimationInput):
    """
    Biomedical normative regression model. Estimates normative vibration threshold
    based on Age, Height, Gender, BMI, and Anatomical Site.
    Calculates 95th percentile Upper Limit of Normal (ULN), Z-score, and ulceration risk multiplier.
    """
    return vpt_estimation_service.estimate_reference(payload)


# -------------------------------------------------------------
# 2. LIVE BIOTHESIOMETER DEVICE MONITORING & SIMULATION
# -------------------------------------------------------------
@router.get("/device/state", response_model=LiveDeviceState)
async def get_live_device_state():
    """Returns the current real-time voltage, contact force, and trial progress."""
    return vpt_device_service.state


@router.post("/device/start-ramp", response_model=LiveDeviceState)
async def start_device_ramp():
    """Initiates voltage ramping from 0.0V upwards at configured ramp rate."""
    return vpt_device_service.start_ramp()


@router.post("/device/step", response_model=LiveDeviceState)
async def step_device_simulation(delta_time_sec: float = Query(default=0.25, ge=0.05, le=2.0)):
    """Advances voltage waveform step in simulation mode."""
    return vpt_device_service.step_simulation(delta_time_sec)


@router.post("/device/trigger-perception", response_model=LiveDeviceState)
async def trigger_subject_perception():
    """Simulates or records participant pressing the patient-response button upon feeling vibration."""
    return vpt_device_service.trigger_perception_detected(manual=True)


@router.post("/device/next-trial", response_model=LiveDeviceState)
async def advance_next_trial_or_site(next_site: Optional[str] = Query(default=None)):
    """Advances to the next triplicate trial or switches testing site."""
    return vpt_device_service.next_trial_or_site(next_site)


@router.post("/device/reset", response_model=LiveDeviceState)
async def reset_device_state():
    """Resets probe voltage to 0.0V."""
    return vpt_device_service.reset()


class DeviceConfigurePayload(BaseModel):
    frequency_hz: int = Field(default=100, description="100 or 120 Hz")
    ramp_rate: float = Field(default=1.0, description="Volts per second")
    site: str = Field(default="GREAT_TOE_RIGHT")
    simulated_patient_neuropathy_level: str = Field(default="MILD", description="PRESERVED, MILD, MODERATE, SEVERE_LOPS")


@router.post("/device/configure", response_model=LiveDeviceState)
async def configure_device(payload: DeviceConfigurePayload):
    vpt_device_service.configure(
        frequency_hz=payload.frequency_hz,
        ramp_rate=payload.ramp_rate,
        site=payload.site,
        simulated_patient_neuropathy_level=payload.simulated_patient_neuropathy_level
    )
    return vpt_device_service.state


# -------------------------------------------------------------
# 3. PARTICIPANT MANAGEMENT
# -------------------------------------------------------------
class ParticipantCreatePayload(BaseModel):
    subject_code: Optional[str] = None
    full_name: str
    age: int = Field(..., ge=10, le=105)
    gender: str = "FEMALE"
    height_cm: float = Field(..., ge=120.0, le=230.0)
    weight_kg: float = Field(default=70.0, ge=30.0, le=250.0)
    clinical_group: str = "DIABETIC_NON_NEUROPATHIC"
    diabetes_duration_years: float = 0.0
    foot_ulcer_history: bool = False
    symptoms_nss_score: int = 0
    notes: Optional[str] = ""


@router.get("/participants")
async def list_participants(
    search: Optional[str] = Query(default=None),
    group: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    return await participant_service.list_participants(db, search=search, group=group)


@router.post("/participants", status_code=status.HTTP_201_CREATED)
async def create_participant(
    payload: ParticipantCreatePayload,
    db: AsyncSession = Depends(get_db),
):
    p = await participant_service.create_participant(db, payload.model_dump())
    await db.commit()
    await db.refresh(p)
    return {
        "id": p.id,
        "subject_code": p.subject_code,
        "full_name": p.full_name,
        "created_at": p.created_at.isoformat() + "Z"
    }


@router.get("/participants/{participant_id}")
async def get_participant(
    participant_id: str,
    db: AsyncSession = Depends(get_db),
):
    detail = await participant_service.get_participant_detail(db, participant_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Participant not found")
    return detail


class QSTSessionCreatePayload(BaseModel):
    device_name: str = "Digital Biothesiometer Pro-V"
    frequency_hz: int = 100
    ramp_rate_v_per_sec: float = 1.0
    protocol_name: str = "Standard 6-Point Bilateral QST"
    clinical_summary: Optional[str] = None
    measurements: List[Dict[str, Any]] # list of { site, trial_1_v, trial_2_v, trial_3_v }


@router.post("/participants/{participant_id}/sessions", status_code=status.HTTP_201_CREATED)
async def record_participant_session(
    participant_id: str,
    payload: QSTSessionCreatePayload,
    db: AsyncSession = Depends(get_db),
):
    sess = await participant_service.record_qst_session(db, participant_id, payload.model_dump())
    return {
        "id": sess.id,
        "participant_id": sess.participant_id,
        "overall_classification": sess.overall_classification,
        "ulcer_risk_category": sess.ulcer_risk_category,
        "mean_great_toe_v": sess.mean_great_toe_v,
        "bilateral_asymmetry_v": sess.bilateral_asymmetry_v,
    }


# -------------------------------------------------------------
# 4. VPT ANALYTICS
# -------------------------------------------------------------
@router.get("/analytics/overview")
async def get_analytics_overview(db: AsyncSession = Depends(get_db)):
    """Returns cohort distributions, bilateral symmetry metrics, and site averages."""
    return await vpt_analytics_service.get_overview_analytics(db)


# -------------------------------------------------------------
# 5. RESEARCH REPORTS & EXPORT
# -------------------------------------------------------------
@router.get("/reports/summary")
async def get_research_report(
    participant_id: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    return await vpt_analytics_service.generate_research_report(db, participant_id)


@router.get("/reports/export-csv")
async def export_qst_csv(db: AsyncSession = Depends(get_db)):
    """Exports all research measurements in CSV format for statistical analysis."""
    p_q = select(Participant)
    p_res = await db.execute(p_q)
    participants = {p.id: p for p in p_res.scalars().all()}

    m_q = select(VPTMeasurement).join(VPTSession)
    m_res = await db.execute(m_q)
    measurements = m_res.scalars().all()

    s_q = select(VPTSession)
    s_res = await db.execute(s_q)
    sessions = {s.id: s for s in s_res.scalars().all()}

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "SubjectCode", "Age", "Gender", "Height_cm", "BMI", "ClinicalGroup", "DiabetesYears",
        "SessionID", "TestedDate", "Device", "FrequencyHz", "Site",
        "Trial1_V", "Trial2_V", "Trial3_V", "Mean_VPT_V", "SD_VPT_V",
        "NormativeExpected_V", "ZScore", "LossGrade"
    ])

    for m in measurements:
        sess = sessions.get(m.session_id)
        if not sess:
            continue
        p = participants.get(sess.participant_id)
        if not p:
            continue
        writer.writerow([
            p.subject_code, p.age, p.gender, p.height_cm, p.bmi, p.clinical_group, p.diabetes_duration_years,
            sess.id, sess.tested_at.strftime("%Y-%m-%d %H:%M"), sess.device_name, sess.frequency_hz, m.anatomical_site,
            m.trial_1_v, m.trial_2_v, m.trial_3_v, m.mean_vpt_v, m.sd_vpt_v,
            m.normative_expected_v, m.z_score, m.loss_grade
        ])

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="vpt_sense_qst_data.csv"'}
    )


# -------------------------------------------------------------
# 6. DEVICE SETTINGS
# -------------------------------------------------------------
class DeviceSettingsUpdate(BaseModel):
    frequency_hz: int = 100
    ramp_rate_v_per_sec: float = 1.0
    max_voltage_safety_v: float = 50.0
    contact_force_target_g: float = 22.5
    port_mode: str = "SIMULATOR"


@router.get("/device-settings")
async def get_device_settings(db: AsyncSession = Depends(get_db)):
    cfg_q = select(DeviceConfig).where(DeviceConfig.is_active == True).limit(1)
    cfg_res = await db.execute(cfg_q)
    cfg = cfg_res.scalars().first()
    if not cfg:
        return {
            "device_name": "Digital Biothesiometer Pro-V",
            "serial_number": "BIO-THESIO-2026-X8",
            "port_mode": "SIMULATOR",
            "frequency_hz": 100,
            "ramp_rate_v_per_sec": 1.0,
            "max_voltage_safety_v": 50.0,
            "contact_force_target_g": 22.5,
            "calibration_status": "CALIBRATED_ISO13485",
            "is_active": True,
        }
    return {
        "id": cfg.id,
        "device_name": cfg.device_name,
        "serial_number": cfg.serial_number,
        "port_mode": cfg.port_mode,
        "frequency_hz": cfg.frequency_hz,
        "ramp_rate_v_per_sec": cfg.ramp_rate_v_per_sec,
        "max_voltage_safety_v": cfg.max_voltage_safety_v,
        "contact_force_target_g": cfg.contact_force_target_g,
        "calibration_status": cfg.calibration_status,
        "is_active": cfg.is_active,
    }


@router.put("/device-settings")
async def update_device_settings(payload: DeviceSettingsUpdate, db: AsyncSession = Depends(get_db)):
    cfg_q = select(DeviceConfig).where(DeviceConfig.is_active == True).limit(1)
    cfg_res = await db.execute(cfg_q)
    cfg = cfg_res.scalars().first()
    if not cfg:
        cfg = DeviceConfig(
            device_name="Digital Biothesiometer Pro-V",
            serial_number="BIO-THESIO-2026-X8",
        )
        db.add(cfg)

    cfg.frequency_hz = payload.frequency_hz
    cfg.ramp_rate_v_per_sec = payload.ramp_rate_v_per_sec
    cfg.max_voltage_safety_v = payload.max_voltage_safety_v
    cfg.contact_force_target_g = payload.contact_force_target_g
    cfg.port_mode = payload.port_mode
    cfg.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(cfg)

    # Sync live service
    vpt_device_service.configure(
        frequency_hz=payload.frequency_hz,
        ramp_rate=payload.ramp_rate_v_per_sec
    )
    return {"status": "SUCCESS", "message": "Biothesiometer device settings saved."}


# -------------------------------------------------------------
# 7. ALERTS
# -------------------------------------------------------------
@router.get("/alerts")
async def get_vpt_alerts(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(VPTAlert).where(VPTAlert.is_acknowledged == False).order_by(desc(VPTAlert.created_at))
    )
    alerts = res.scalars().all()
    return [
        {
            "id": a.id,
            "participant_id": a.participant_id,
            "created_at": a.created_at.isoformat() + "Z",
            "alert_level": a.alert_level,
            "alert_type": a.alert_type,
            "metric_value": a.metric_value,
            "site": a.site,
            "message": a.message,
            "is_acknowledged": a.is_acknowledged,
        }
        for a in alerts
    ]


@router.post("/alerts/{alert_id}/ack")
async def acknowledge_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(VPTAlert).where(VPTAlert.id == alert_id))
    alert = res.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_acknowledged = True
    alert.acknowledged_at = datetime.utcnow()
    await db.commit()
    return {"status": "ACKNOWLEDGED", "id": alert_id}
