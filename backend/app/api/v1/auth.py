"""
Authentication endpoints: Registration, Login, Current User
Supports RESEARCHER, PARTICIPANT, and ADMIN roles.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from backend.app.models.user import User
from backend.app.models.vpt_domain import Participant
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
    if user_role in ["DOCTOR", "RESEARCHER", "CLINICIAN", "INVESTIGATOR"]:
        user_role = "RESEARCHER"
    elif user_role in ["PATIENT", "PARTICIPANT", "SUBJECT"]:
        user_role = "PARTICIPANT"
    else:
        user_role = "RESEARCHER"

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_role,
    )
    db.add(new_user)
    await db.flush()

    if user_role == "PARTICIPANT":
        # Create corresponding research participant record
        participant_rec = Participant(
            user_id=new_user.id,
            subject_code=f"SUB-{new_user.id[:6].upper()}",
            full_name=new_user.full_name,
            age=45,
            gender="FEMALE",
            height_cm=165.0,
            weight_kg=68.0,
            bmi=25.0,
            clinical_group="DIABETIC_NON_NEUROPATHIC",
            diabetes_duration_years=5.0,
            foot_ulcer_history=False,
            symptoms_nss_score=1,
            notes="Registered via self-service portal.",
        )
        db.add(participant_rec)

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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account")

    token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token,
        role=user.role,
        user_id=user.id,
        full_name=user.full_name
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )
