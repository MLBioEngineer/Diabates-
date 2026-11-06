"""
Authentication endpoints: Registration, Login, Current User
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from backend.app.models.user import User
from backend.app.models.patient import PatientProfile
from backend.app.models.doctor import DoctorProfile
from backend.app.schemas.auth import UserCreate, UserLogin, Token, UserOut
from backend.app.api.v1.deps import get_current_user

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    existing = await db.execute(select(User).where(User.email == user_in.email))
    if existing.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user_role = user_in.role.upper()
    if user_role not in ["PATIENT", "DOCTOR"]:
        user_role = "PATIENT"

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_role,
    )
    db.add(new_user)
    await db.flush() # Flush to populate new_user.id

    if user_role == "PATIENT":
        patient_profile = PatientProfile(user_id=new_user.id)
        db.add(patient_profile)
        await db.flush()

        # Seed initial 24 hours of telemetry for newly registered patient
        from backend.app.services.simulation_service import simulation_engine
        from backend.app.models.telemetry import TelemetryReading
        initial_series = simulation_engine.generate_historical_series(hours=24, interval_minutes=15)
        for s in initial_series:
            r = TelemetryReading(
                patient_id=patient_profile.id,
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
            db.add(r)
    elif user_role == "DOCTOR":
        doctor_profile = DoctorProfile(user_id=new_user.id)
        db.add(doctor_profile)

    await db.commit()
    await db.refresh(new_user)

    token = create_access_token(subject=new_user.id, role=new_user.role)
    return Token(
        access_token=token,
        role=new_user.role,
        user_id=new_user.id,
        full_name=new_user.full_name
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalars().first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token,
        role=user.role,
        user_id=user.id,
        full_name=user.full_name
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
