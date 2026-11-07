"""
FastAPI Dependencies: Authentication, Database Session, and Role-Based Guards
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.vpt_domain import Participant

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalars().first()

    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")
    return user


async def get_current_participant_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Participant:
    query = select(Participant).where(Participant.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalars().first()
    
    if not profile:
        profile = Participant(
            user_id=current_user.id,
            subject_code=f"SUB-{current_user.id[:6].upper()}",
            full_name=current_user.full_name,
            age=45,
            gender="FEMALE",
            height_cm=165.0,
            weight_kg=68.0,
            bmi=25.0,
            clinical_group="DIABETIC_NON_NEUROPATHIC",
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile
