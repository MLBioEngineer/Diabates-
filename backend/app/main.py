"""
FastAPI ASGI Application Entrypoint
AI-Powered Diabetes Prediction & Real-Time Health Monitoring Platform
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, AsyncSessionLocal
from backend.app.core.security import get_password_hash
from backend.app.models import User, PatientProfile, DoctorProfile
from backend.app.api.v1.api import api_router
from backend.app.websockets.live_telemetry import ws_manager
from backend.app.services.simulation_service import simulation_engine
from backend.app.models.telemetry import TelemetryReading


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize SQLite / PostgreSQL tables automatically
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[Lifespan] Database schema tables verified.")

    # 2. Seed Default Demo Accounts (Patient & Doctor)
    async with AsyncSessionLocal() as session:
        # Demo Patient
        patient_q = await session.execute(select(User).where(User.email == "patient@demo.com"))
        if not patient_q.scalars().first():
            demo_patient_user = User(
                email="patient@demo.com",
                hashed_password=get_password_hash("patient123"),
                full_name="Sarah Jenkins",
                role="PATIENT",
            )
            session.add(demo_patient_user)
            await session.flush()

            patient_prof = PatientProfile(
                user_id=demo_patient_user.id,
                date_of_birth="1984-06-12",
                gender="FEMALE",
                height_cm=168.0,
                baseline_weight_kg=72.5,
                diabetes_type="PRE_DIABETES",
                emergency_contact={"name": "Mark Jenkins", "relationship": "Spouse", "phone": "+1-555-0192"},
            )
            session.add(patient_prof)
            await session.flush()

            # Seed 24h realistic simulated telemetry for demo patient
            series = simulation_engine.generate_historical_series(hours=24, interval_minutes=15)
            for s in series:
                r = TelemetryReading(
                    patient_id=patient_prof.id,
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
                session.add(r)
            print("[Lifespan] Seeded demo patient with 24h continuous telemetry.")

        # Demo Doctor
        doc_q = await session.execute(select(User).where(User.email == "doctor@demo.com"))
        if not doc_q.scalars().first():
            demo_doc_user = User(
                email="doctor@demo.com",
                hashed_password=get_password_hash("doctor123"),
                full_name="Dr. Marcus Vance, MD",
                role="DOCTOR",
            )
            session.add(demo_doc_user)
            await session.flush()

            doc_prof = DoctorProfile(
                user_id=demo_doc_user.id,
                specialization="Endocrinology & Diabetology",
                hospital_affiliation="University Metabolic Research Institute",
                license_number="MD-784910-US",
            )
            session.add(doc_prof)
            print("[Lifespan] Seeded demo clinician account.")

        await session.commit()

    yield

    # Teardown
    await engine.dispose()
    print("[Lifespan] Engine cleanly disposed.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Clinical Decision Support System (CDSS) prototype & Continuous Glucose Telemetry Platform",
    lifespan=lifespan,
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock to settings.BACKEND_CORS_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "docs_url": "/docs",
        "cgm_integration_ready": True,
        "disclaimer": "Informational research decision support platform only. Not an FDA-cleared diagnostic device."
    }


@app.websocket("/ws/live-telemetry")
async def websocket_telemetry_endpoint(
    websocket: WebSocket,
    patient_id: str = Query(default="demo-patient"),
    role: str = Query(default="PATIENT"),
):
    if role.upper() == "DOCTOR":
        await ws_manager.connect_clinician(websocket)
        try:
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            ws_manager.disconnect(websocket)
    else:
        await ws_manager.connect_patient(websocket, patient_id)
        try:
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            ws_manager.disconnect(websocket, patient_id)
