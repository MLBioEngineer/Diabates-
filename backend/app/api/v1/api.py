"""
V1 API Router aggregator for VPT Sense AI
"""

from fastapi import APIRouter
from backend.app.api.v1 import auth, vpt_routes

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & User"])
api_router.include_router(vpt_routes.router, prefix="/vpt", tags=["VPT Sense AI Core Services"])
