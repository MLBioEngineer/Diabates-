"""
V1 API Router aggregator
"""

from fastapi import APIRouter
from backend.app.api.v1 import auth, ml_predict, telemetry, alerts, reports, doctor

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & User"])
api_router.include_router(ml_predict.router, prefix="/ml", tags=["Machine Learning Prediction & SHAP"])
api_router.include_router(telemetry.router, prefix="/telemetry", tags=["Real-Time Health Telemetry & CGM"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Health Alerts & Warnings"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Health Data Export"])
api_router.include_router(doctor.router, prefix="/doctor", tags=["Clinician & Doctor Dashboard"])
