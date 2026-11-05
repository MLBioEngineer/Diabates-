"""
FastAPI Backend Integration & Regression Test Suite
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app, lifespan
from backend.app.core.database import engine, Base, AsyncSessionLocal
from backend.app.core.security import get_password_hash
from backend.app.models import User, PatientProfile
from sqlalchemy import select


@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_test_database():
    # Initialize schema
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed demo patient if not present
    async with AsyncSessionLocal() as session:
        user_res = await session.execute(select(User).where(User.email == "patient@demo.com"))
        if not user_res.scalars().first():
            demo_user = User(
                email="patient@demo.com",
                hashed_password=get_password_hash("patient123"),
                full_name="Sarah Jenkins",
                role="PATIENT",
            )
            session.add(demo_user)
            await session.flush()

            patient_prof = PatientProfile(
                user_id=demo_user.id,
                date_of_birth="1984-06-12",
                gender="FEMALE",
                height_cm=168.0,
                baseline_weight_kg=72.5,
                diabetes_type="PRE_DIABETES",
            )
            session.add(patient_prof)
            await session.commit()

    yield


@pytest.mark.asyncio
async def test_root_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
    assert "cgm_integration_ready" in data


@pytest.mark.asyncio
async def test_auth_and_login_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login with seeded demo patient
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "patient@demo.com", "password": "patient123"},
        )
        assert login_res.status_code == 200
        token_data = login_res.json()
        assert "access_token" in token_data
        assert token_data["role"] == "PATIENT"
        token = token_data["access_token"]

        # 2. Get /me
        me_res = await ac.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me_res.status_code == 200
        assert me_res.json()["email"] == "patient@demo.com"


@pytest.mark.asyncio
async def test_ml_risk_prediction():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Login
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "patient@demo.com", "password": "patient123"},
        )
        token = login_res.json()["access_token"]

        # Predict Risk
        ml_res = await ac.post(
            "/api/v1/ml/predict-risk",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "pregnancies": 2,
                "glucose": 145.0,
                "blood_pressure": 80.0,
                "skin_thickness": 28.0,
                "insulin": 120.0,
                "bmi": 32.5,
                "diabetes_pedigree_function": 0.55,
                "age": 48,
            },
        )
        assert ml_res.status_code == 200
        data = ml_res.json()
        assert "risk_score" in data
        assert "risk_category" in data
        assert "shap_contributions" in data
        assert len(data["shap_contributions"]) > 0
        assert "disclaimer" in data


@pytest.mark.asyncio
async def test_telemetry_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "patient@demo.com", "password": "patient123"},
        )
        token = login_res.json()["access_token"]

        # 1. Simulate reading
        sim_res = await ac.post(
            "/api/v1/telemetry/simulate-stream",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert sim_res.status_code == 200
        assert sim_res.json()["provenance"] == "SIMULATED"

        # 2. Fetch history
        hist_res = await ac.get(
            "/api/v1/telemetry/history?hours=24",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert hist_res.status_code == 200
        readings = hist_res.json()
        assert len(readings) > 0

        # 3. Fetch statistics
        stats_res = await ac.get(
            "/api/v1/telemetry/statistics?hours=24",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert stats_res.status_code == 200
        stats = stats_res.json()
        assert "time_in_range_percent" in stats
        assert "glucose_management_indicator" in stats


@pytest.mark.asyncio
async def test_health_reports():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "patient@demo.com", "password": "patient123"},
        )
        token = login_res.json()["access_token"]

        report_res = await ac.get(
            "/api/v1/reports/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert report_res.status_code == 200
        report = report_res.json()
        assert "report_id" in report
        assert "telemetry_statistics" in report
        assert "clinical_notes" in report
