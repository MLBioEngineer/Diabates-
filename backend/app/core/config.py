"""
Core configuration settings using Pydantic Settings
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "VPT Sense AI - Vibration Perception Threshold Research Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-healthcare-cdss-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database URL: SQLite async by default for local dev, supports PostgreSQL via env
    DATABASE_URL: str = "sqlite+aiosqlite:///./vpt_sense.db"
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://*.vercel.app"
    ]

    # Vibration Perception Threshold (VPT) Clinical & Research Norms (Volts RMS)
    VPT_NORMAL_MAX: float = 15.0         # Normal / Preserved sensation (<15 V)
    VPT_MILD_MAX: float = 19.9           # Mild sensory blunting (15.0 - 19.9 V)
    VPT_MODERATE_MAX: float = 24.9       # Moderate neuropathy (20.0 - 24.9 V)
    VPT_CRITICAL_CUTOFF: float = 25.0    # Loss of Protective Sensation (>= 25 V: High Ulcer Risk)
    VPT_ASYMMETRY_THRESHOLD: float = 5.0 # Bilateral L vs R discrepancy (> 5 V indicates focal loss)
    VPT_DEFAULT_FREQUENCY_HZ: int = 100  # Standard biothesiometer tuning fork frequency (100 Hz / 120 Hz)
    VPT_MAX_RAMP_VOLTAGE: float = 50.0   # Device safety voltage cutoff (50 V)

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")


settings = Settings()
