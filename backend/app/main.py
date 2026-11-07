"""
FastAPI Application Entrypoint
VPT Sense AI - Vibration Perception Threshold & Quantitative Sensory Testing Platform
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, AsyncSessionLocal
from backend.app.core.security import get_password_hash
from backend.app.models.user import User
from backend.app.models.vpt_domain import Participant, VPTSession, VPTMeasurement, DeviceConfig, VPTAlert
from backend.app.api.v1.api import api_router
from backend.app.services.participant_service import participant_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize SQLite / PostgreSQL tables automatically
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[Lifespan] VPT Sense AI database schema tables verified.")

    # 2. Seed Default Accounts & Research Study Participants
    async with AsyncSessionLocal() as session:
        # Seed Principal Investigator / Lead Researcher
        res_q = await session.execute(select(User).where(User.email == "researcher@vptsense.ai"))
        if not res_q.scalars().first():
            lead_researcher = User(
                email="researcher@vptsense.ai",
                hashed_password=get_password_hash("researcher123"),
                full_name="Prof. Elena Rostova, MD, PhD",
                role="RESEARCHER",
            )
            session.add(lead_researcher)

        # Seed Legacy Doctor / Clinician for smooth login
        doc_q = await session.execute(select(User).where(User.email == "doctor@demo.com"))
        if not doc_q.scalars().first():
            demo_doc = User(
                email="doctor@demo.com",
                hashed_password=get_password_hash("doctor123"),
                full_name="Dr. Marcus Vance, MD",
                role="RESEARCHER",
            )
            session.add(demo_doc)

        # Seed Participant Account
        part_q = await session.execute(select(User).where(User.email == "subject@vptsense.ai"))
        if not part_q.scalars().first():
            demo_part = User(
                email="subject@vptsense.ai",
                hashed_password=get_password_hash("subject123"),
                full_name="Sarah Jenkins",
                role="PARTICIPANT",
            )
            session.add(demo_part)

        # Seed Legacy Patient Account
        pat_q = await session.execute(select(User).where(User.email == "patient@demo.com"))
        if not pat_q.scalars().first():
            demo_patient = User(
                email="patient@demo.com",
                hashed_password=get_password_hash("patient123"),
                full_name="Sarah Jenkins",
                role="PARTICIPANT",
            )
            session.add(demo_patient)

        # Seed Default Hardware Configuration
        cfg_q = await session.execute(select(DeviceConfig).limit(1))
        if not cfg_q.scalars().first():
            default_cfg = DeviceConfig(
                device_name="Digital Biothesiometer Pro-V",
                serial_number="BIO-THESIO-2026-X8",
                port_mode="SIMULATOR",
                frequency_hz=100,
                ramp_rate_v_per_sec=1.0,
                max_voltage_safety_v=50.0,
                contact_force_target_g=22.5,
                calibration_status="CALIBRATED_ISO13485",
                is_active=True,
            )
            session.add(default_cfg)

        # Seed Sample Research Study Participants (Cohort spanning normal to severe neuropathy)
        sample_subjects = [
            {
                "subject_code": "SUB-101",
                "full_name": "Claire Dupont",
                "age": 32,
                "gender": "FEMALE",
                "height_cm": 164.0,
                "weight_kg": 58.0,
                "clinical_group": "HEALTHY_CONTROL",
                "diabetes_duration_years": 0.0,
                "foot_ulcer_history": False,
                "symptoms_nss_score": 0,
                "notes": "Healthy normoglycemic reference control subject.",
                "measurements": [
                    {"site": "GREAT_TOE_RIGHT", "trial_1_v": 6.8, "trial_2_v": 7.2, "trial_3_v": 7.0},
                    {"site": "GREAT_TOE_LEFT", "trial_1_v": 7.0, "trial_2_v": 7.4, "trial_3_v": 6.9},
                    {"site": "FIRST_MTH_RIGHT", "trial_1_v": 8.2, "trial_2_v": 8.5, "trial_3_v": 8.1},
                    {"site": "MALLEOLUS_RIGHT", "trial_1_v": 5.8, "trial_2_v": 6.0, "trial_3_v": 5.9},
                ]
            },
            {
                "subject_code": "SUB-102",
                "full_name": "Arthur Pendelton",
                "age": 54,
                "gender": "MALE",
                "height_cm": 178.0,
                "weight_kg": 84.0,
                "clinical_group": "DIABETIC_NON_NEUROPATHIC",
                "diabetes_duration_years": 4.5,
                "foot_ulcer_history": False,
                "symptoms_nss_score": 2,
                "notes": "Type 2 diabetes. Mild distal paresthesia reported in cold weather.",
                "measurements": [
                    {"site": "GREAT_TOE_RIGHT", "trial_1_v": 16.5, "trial_2_v": 17.2, "trial_3_v": 16.8},
                    {"site": "GREAT_TOE_LEFT", "trial_1_v": 15.8, "trial_2_v": 16.4, "trial_3_v": 16.0},
                    {"site": "FIRST_MTH_RIGHT", "trial_1_v": 18.2, "trial_2_v": 18.9, "trial_3_v": 18.4},
                    {"site": "MALLEOLUS_RIGHT", "trial_1_v": 14.5, "trial_2_v": 15.0, "trial_3_v": 14.8},
                ]
            },
            {
                "subject_code": "SUB-103",
                "full_name": "Eleanor Vance",
                "age": 63,
                "gender": "FEMALE",
                "height_cm": 162.0,
                "weight_kg": 76.0,
                "clinical_group": "ESTABLISHED_DPN",
                "diabetes_duration_years": 12.0,
                "foot_ulcer_history": False,
                "symptoms_nss_score": 6,
                "notes": "Confirmed diabetic peripheral neuropathy. Nocturnal burning sensations.",
                "measurements": [
                    {"site": "GREAT_TOE_RIGHT", "trial_1_v": 22.8, "trial_2_v": 23.4, "trial_3_v": 23.0},
                    {"site": "GREAT_TOE_LEFT", "trial_1_v": 21.5, "trial_2_v": 22.2, "trial_3_v": 21.9},
                    {"site": "FIRST_MTH_RIGHT", "trial_1_v": 24.1, "trial_2_v": 24.8, "trial_3_v": 24.5},
                    {"site": "MALLEOLUS_RIGHT", "trial_1_v": 20.2, "trial_2_v": 21.0, "trial_3_v": 20.6},
                ]
            },
            {
                "subject_code": "SUB-104",
                "full_name": "Robert Henderson",
                "age": 71,
                "gender": "MALE",
                "height_cm": 182.0,
                "weight_kg": 92.0,
                "clinical_group": "ESTABLISHED_DPN",
                "diabetes_duration_years": 21.0,
                "foot_ulcer_history": True,
                "symptoms_nss_score": 8,
                "notes": "Previous plantar ulceration under 1st metatarsal. Severe loss of protective sensation.",
                "measurements": [
                    {"site": "GREAT_TOE_RIGHT", "trial_1_v": 32.5, "trial_2_v": 33.2, "trial_3_v": 32.8},
                    {"site": "GREAT_TOE_LEFT", "trial_1_v": 30.8, "trial_2_v": 31.4, "trial_3_v": 31.0},
                    {"site": "FIRST_MTH_RIGHT", "trial_1_v": 36.2, "trial_2_v": 37.0, "trial_3_v": 36.5},
                    {"site": "MALLEOLUS_RIGHT", "trial_1_v": 27.5, "trial_2_v": 28.2, "trial_3_v": 27.8},
                ]
            },
        ]

        # Check if participants already seeded
        part_check = await session.execute(select(Participant).limit(1))
        if not part_check.scalars().first():
            for s in sample_subjects:
                p_obj = await participant_service.create_participant(session, s)
                await session.flush()
                await participant_service.record_qst_session(session, p_obj.id, {
                    "device_name": "Digital Biothesiometer Pro-V",
                    "frequency_hz": 100,
                    "ramp_rate_v_per_sec": 1.0,
                    "protocol_name": "Standard 4-Point QST Trial",
                    "measurements": s["measurements"],
                })
            print("[Lifespan] Seeded 4 clinical research study subjects with complete QST measurements.")

        await session.commit()

    yield

    # Teardown
    await engine.dispose()
    print("[Lifespan] VPT Sense AI engine cleanly disposed.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Research-Grade Vibration Perception Threshold (VPT) & Quantitative Sensory Testing Platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health Check"])
async def root():
    return {
        "status": "online",
        "service": "VPT Sense AI - Vibration Perception Threshold Research Platform",
        "version": "2.0.0",
        "api_docs": "/docs",
        "endpoints": {
            "vpt_estimation": f"{settings.API_V1_STR}/vpt/estimate-reference",
            "live_device": f"{settings.API_V1_STR}/vpt/device/state",
            "participants": f"{settings.API_V1_STR}/vpt/participants",
            "vpt_analytics": f"{settings.API_V1_STR}/vpt/analytics/overview",
            "research_reports": f"{settings.API_V1_STR}/vpt/reports/summary",
            "device_settings": f"{settings.API_V1_STR}/vpt/device-settings",
        }
    }
