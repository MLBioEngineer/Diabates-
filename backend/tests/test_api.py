"""
VPT Sense AI - Backend Integration & Unit Tests
Verifies VPT Reference Estimation, Device Simulation, Participant Management, and Research Reports.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.core.database import engine, Base


@pytest.mark.asyncio
async def test_root_health_check():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert "VPT Sense AI" in data["service"]


@pytest.mark.asyncio
async def test_vpt_reference_estimation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "age": 45,
            "gender": "FEMALE",
            "height_cm": 165.0,
            "weight_kg": 65.0,
            "anatomical_site": "GREAT_TOE_RIGHT",
            "measured_vpt_v": 16.5
        }
        res = await client.post("/api/v1/vpt/estimate-reference", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "expected_mean_vpt_v" in data
        assert "upper_limit_normal_95_v" in data
        assert data["sensory_classification"] == "MILD_BLUNTING"
        assert data["ulcer_risk_category"] == "MODERATE"
        assert len(data["feature_impacts"]) >= 3


@pytest.mark.asyncio
async def test_live_device_simulation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Check initial state
        res = await client.get("/api/v1/vpt/device/state")
        assert res.status_code == 200
        data = res.json()
        assert "current_voltage_v" in data

        # Start ramp
        res = await client.post("/api/v1/vpt/device/start-ramp")
        assert res.status_code == 200
        assert res.json()["status"] == "RAMPING"

        # Step simulation
        res = await client.post("/api/v1/vpt/device/step?delta_time_sec=1.0")
        assert res.status_code == 200
        assert res.json()["current_voltage_v"] > 0.0

        # Trigger perception
        res = await client.post("/api/v1/vpt/device/trigger-perception")
        assert res.status_code == 200
        assert res.json()["status"] == "THRESHOLD_CAPTURED"
        assert res.json()["subject_button_pressed"] is True


@pytest.mark.asyncio
async def test_participants_and_analytics():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create a test participant
        p_res = await client.post("/api/v1/vpt/participants", json={
            "full_name": "Test Subject Alpha",
            "age": 42,
            "gender": "MALE",
            "height_cm": 175.0,
            "weight_kg": 75.0,
            "clinical_group": "HEALTHY_CONTROL"
        })
        assert p_res.status_code == 201

        # List participants
        res = await client.get("/api/v1/vpt/participants")
        assert res.status_code == 200
        participants = res.json()
        assert len(participants) >= 1

        # Analytics
        res = await client.get("/api/v1/vpt/analytics/overview")
        assert res.status_code == 200
        analytics = res.json()
        assert "mean_cohort_vpt_v" in analytics
        assert "classification_breakdown" in analytics

        # Research report
        res = await client.get("/api/v1/vpt/reports/summary")
        assert res.status_code == 200
        report = res.json()
        assert "report_id" in report
        assert "subject_code" in report
