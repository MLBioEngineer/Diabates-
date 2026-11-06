"""
Telemetry processing, statistical metrics (TIR, GMI, CV) and alert rules
"""

import numpy as np
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Tuple
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.telemetry import TelemetryReading
from backend.app.models.alert import HealthAlert
from backend.app.schemas.telemetry import TelemetryCreate, TelemetryOut, TelemetryStatsOut
from backend.app.core.config import settings


class TelemetryService:

    @staticmethod
    async def record_telemetry(db: AsyncSession, patient_id: str, data: TelemetryCreate) -> Tuple[TelemetryReading, List[HealthAlert]]:
        timestamp = data.recorded_at or datetime.utcnow()
        
        reading = TelemetryReading(
            patient_id=patient_id,
            recorded_at=timestamp,
            glucose_mg_dl=data.glucose_mg_dl,
            glucose_trend_velocity=data.glucose_trend_velocity,
            heart_rate_bpm=data.heart_rate_bpm,
            blood_pressure_systolic=data.blood_pressure_systolic,
            blood_pressure_diastolic=data.blood_pressure_diastolic,
            body_temperature_c=data.body_temperature_c,
            spo2_percentage=data.spo2_percentage,
            physical_activity_steps=data.physical_activity_steps,
            provenance=data.provenance,
        )
        db.add(reading)

        # Evaluate clinical threshold rules & generate alerts
        alerts_triggered: List[HealthAlert] = []

        # 1. Hypoglycemia checks
        if data.glucose_mg_dl <= settings.THRESHOLD_HYPO_CRITICAL:
            alert = HealthAlert(
                patient_id=patient_id,
                created_at=timestamp,
                alert_level="CRITICAL",
                metric_type="GLUCOSE_HYPO",
                metric_value=data.glucose_mg_dl,
                message=f"CRITICAL HYPOGLYCEMIA: Glucose is {data.glucose_mg_dl:.1f} mg/dL (<= 54 mg/dL). Consume 15g fast-acting carbs immediately.",
                threshold_rule=f"<= {settings.THRESHOLD_HYPO_CRITICAL} mg/dL",
            )
            db.add(alert)
            alerts_triggered.append(alert)
        elif data.glucose_mg_dl < settings.THRESHOLD_HYPO_WARNING:
            alert = HealthAlert(
                patient_id=patient_id,
                created_at=timestamp,
                alert_level="WARNING",
                metric_type="GLUCOSE_HYPO",
                metric_value=data.glucose_mg_dl,
                message=f"Hypoglycemia Warning: Glucose is {data.glucose_mg_dl:.1f} mg/dL (< 70 mg/dL). Recheck in 15 minutes.",
                threshold_rule=f"< {settings.THRESHOLD_HYPO_WARNING} mg/dL",
            )
            db.add(alert)
            alerts_triggered.append(alert)

        # 2. Hyperglycemia checks
        elif data.glucose_mg_dl >= settings.THRESHOLD_HYPER_CRITICAL:
            alert = HealthAlert(
                patient_id=patient_id,
                created_at=timestamp,
                alert_level="CRITICAL",
                metric_type="GLUCOSE_HYPER",
                metric_value=data.glucose_mg_dl,
                message=f"CRITICAL HYPERGLYCEMIA: Glucose reached {data.glucose_mg_dl:.1f} mg/dL (>= 250 mg/dL). Check ketones and hydrate.",
                threshold_rule=f">= {settings.THRESHOLD_HYPER_CRITICAL} mg/dL",
            )
            db.add(alert)
            alerts_triggered.append(alert)
        elif data.glucose_mg_dl > settings.THRESHOLD_HYPER_WARNING:
            alert = HealthAlert(
                patient_id=patient_id,
                created_at=timestamp,
                alert_level="WARNING",
                metric_type="GLUCOSE_HYPER",
                metric_value=data.glucose_mg_dl,
                message=f"Hyperglycemia Alert: Glucose elevated at {data.glucose_mg_dl:.1f} mg/dL (> 180 mg/dL).",
                threshold_rule=f"> {settings.THRESHOLD_HYPER_WARNING} mg/dL",
            )
            db.add(alert)
            alerts_triggered.append(alert)

        # 3. Tachycardia Check (> 115 BPM at rest)
        if data.heart_rate_bpm and data.heart_rate_bpm > 115 and data.physical_activity_steps < 30:
            alert = HealthAlert(
                patient_id=patient_id,
                created_at=timestamp,
                alert_level="WARNING",
                metric_type="TACHYCARDIA",
                metric_value=float(data.heart_rate_bpm),
                message=f"Elevated resting heart rate detected: {data.heart_rate_bpm} BPM.",
                threshold_rule="> 115 BPM resting",
            )
            db.add(alert)
            alerts_triggered.append(alert)

        # 4. Hypoxia Check (SpO2 < 93%)
        if data.spo2_percentage and data.spo2_percentage < 93.0:
            alert = HealthAlert(
                patient_id=patient_id,
                created_at=timestamp,
                alert_level="CRITICAL" if data.spo2_percentage < 90.0 else "WARNING",
                metric_type="HYPOXIA",
                metric_value=data.spo2_percentage,
                message=f"Low oxygen saturation: SpO2 is {data.spo2_percentage:.1f}%.",
                threshold_rule="< 93.0 %",
            )
            db.add(alert)
            alerts_triggered.append(alert)

        await db.commit()
        await db.refresh(reading)
        return reading, alerts_triggered

    @staticmethod
    async def get_patient_statistics(db: AsyncSession, patient_id: str, hours: int = 24) -> TelemetryStatsOut:
        since_time = datetime.utcnow() - timedelta(hours=hours)
        
        query = (
            select(TelemetryReading)
            .where(TelemetryReading.patient_id == patient_id, TelemetryReading.recorded_at >= since_time)
            .order_by(desc(TelemetryReading.recorded_at))
        )
        result = await db.execute(query)
        readings = result.scalars().all()

        if not readings:
            # Return baseline empty stats
            return TelemetryStatsOut(
                time_in_range_percent=100.0,
                time_below_range_percent=0.0,
                time_above_range_percent=0.0,
                mean_glucose=100.0,
                glucose_management_indicator=5.7,
                glycemic_variability_cv=15.0,
                readings_count=0,
                latest_reading=None,
            )

        glucose_vals = [r.glucose_mg_dl for r in readings]
        arr = np.array(glucose_vals)

        in_range_count = np.sum((arr >= settings.THRESHOLD_TARGET_LOW) & (arr <= settings.THRESHOLD_TARGET_HIGH))
        below_count = np.sum(arr < settings.THRESHOLD_TARGET_LOW)
        above_count = np.sum(arr > settings.THRESHOLD_TARGET_HIGH)
        total = len(arr)

        mean_g = float(np.mean(arr))
        std_g = float(np.std(arr))
        cv = (std_g / mean_g) * 100.0 if mean_g > 0 else 0.0

        # GMI Formula (standard Bergenstal formula): 3.31 + (0.02392 * mean_glucose)
        gmi = 3.31 + (0.02392 * mean_g)

        latest = TelemetryOut.model_validate(readings[0]) if readings else None

        return TelemetryStatsOut(
            time_in_range_percent=round(float((in_range_count / total) * 100.0), 1),
            time_below_range_percent=round(float((below_count / total) * 100.0), 1),
            time_above_range_percent=round(float((above_count / total) * 100.0), 1),
            mean_glucose=round(mean_g, 1),
            glucose_management_indicator=round(float(gmi), 2),
            glycemic_variability_cv=round(float(cv), 1),
            readings_count=total,
            latest_reading=latest,
        )
