"""
Core configuration settings using Pydantic Settings
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Diabetes Prediction & Real-Time Monitoring"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-healthcare-cdss-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database URL: SQLite async by default for local setup, supports PostgreSQL via env
    DATABASE_URL: str = "sqlite+aiosqlite:///./diabetes_platform.db"
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://*.vercel.app"
    ]

    # Clinical Alert Thresholds (American Diabetes Association / AACE Guidelines)
    THRESHOLD_HYPO_CRITICAL: float = 54.0   # mg/dL (Level 2 Hypoglycemia)
    THRESHOLD_HYPO_WARNING: float = 70.0    # mg/dL (Level 1 Hypoglycemia)
    THRESHOLD_TARGET_LOW: float = 70.0      # mg/dL (Time In Range Lower Bound)
    THRESHOLD_TARGET_HIGH: float = 180.0    # mg/dL (Time In Range Upper Bound)
    THRESHOLD_HYPER_WARNING: float = 180.0  # mg/dL (Postprandial Hyperglycemia)
    THRESHOLD_HYPER_CRITICAL: float = 250.0 # mg/dL (Ketosis risk / acute hyper)

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")


settings = Settings()
