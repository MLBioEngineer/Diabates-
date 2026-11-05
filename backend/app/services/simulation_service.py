"""
Physiological Telemetry Simulation Engine
Generates realistic multi-vital telemetry and continuous glucose dynamics
based on diurnal variation, meal spikes, and physical exertion.
"""

import math
import random
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any


class SimulationEngine:
    """
    Simulates continuous physiological parameters with realistic dynamics.
    Strictly tags all generated readings with provenance="SIMULATED".
    """

    def __init__(self):
        # Baseline personal parameters
        self.baseline_glucose = 105.0 # mg/dL fasting baseline
        self.baseline_hr = 72 # BPM
        self.baseline_bp_sys = 120
        self.baseline_bp_dia = 80
        self.baseline_temp = 36.8 # C
        self.baseline_spo2 = 98.2 # %

    def generate_single_reading(
        self,
        current_time: datetime = None,
        last_glucose: float = None,
        event_override: str = None
    ) -> Dict[str, Any]:
        """
        Generates one telemetry reading at a specific timestamp.
        """
        if current_time is None:
            current_time = datetime.now(timezone.utc)

        hour = current_time.hour + (current_time.minute / 60.0)

        # 1. Circadian diurnal variation (Dawn phenomenon early morning rise, nocturnal dip)
        # Circadian wave: trough at 03:00, peak at 07:00
        circadian_effect = 8.0 * math.sin((hour - 3.0) * (2 * math.pi / 24.0))

        # 2. Meal Excursions (Postprandial spikes around 08:30, 13:00, 19:30)
        meal_spike = 0.0
        # Breakfast (8:00 - 10:00)
        if 8.0 <= hour <= 10.5:
            dt = hour - 8.5
            meal_spike += 45.0 * math.exp(-0.5 * (dt / 0.8) ** 2)
        # Lunch (12:30 - 15:00)
        elif 12.5 <= hour <= 15.0:
            dt = hour - 13.2
            meal_spike += 55.0 * math.exp(-0.5 * (dt / 0.9) ** 2)
        # Dinner (19:00 - 22:00)
        elif 19.0 <= hour <= 22.0:
            dt = hour - 19.8
            meal_spike += 50.0 * math.exp(-0.5 * (dt / 1.0) ** 2)

        # 3. Exercise / Event override
        activity_steps = int(random.uniform(5, 50))
        if event_override == "EXERCISE":
            meal_spike -= 30.0
            activity_steps = random.randint(150, 400)
        elif event_override == "MEAL":
            meal_spike += 60.0

        # Random Brownian drift
        noise = random.gauss(0, 1.8)

        # Target glucose
        target_glucose = self.baseline_glucose + circadian_effect + meal_spike + noise

        if last_glucose is not None:
            # Smooth transition (glucose changes smoothly in physiological systems: max 2-3 mg/dL/min)
            alpha = 0.25
            glucose = (1 - alpha) * last_glucose + alpha * target_glucose
            velocity = round((glucose - last_glucose) / 5.0, 2) # rate of change over 5 min interval
        else:
            glucose = target_glucose
            velocity = 0.1

        glucose = max(45.0, min(350.0, glucose)) # Physiological bounds

        # Heart rate dynamics correlated with activity and glucose
        hr = int(self.baseline_hr + (glucose - 100.0) * 0.08 + (activity_steps / 10.0) + random.gauss(0, 2.5))
        hr = max(50, min(180, hr))

        # Blood pressure
        bp_sys = int(self.baseline_bp_sys + (glucose - 100.0) * 0.05 + random.gauss(0, 3.0))
        bp_dia = int(self.baseline_bp_dia + (glucose - 100.0) * 0.03 + random.gauss(0, 2.0))

        # SpO2 and Temperature
        spo2 = round(max(92.0, min(100.0, self.baseline_spo2 + random.gauss(0, 0.4))), 1)
        temp = round(max(36.0, min(39.0, self.baseline_temp + random.gauss(0, 0.15))), 1)

        return {
            "glucose_mg_dl": round(glucose, 1),
            "glucose_trend_velocity": velocity,
            "heart_rate_bpm": hr,
            "blood_pressure_systolic": bp_sys,
            "blood_pressure_diastolic": bp_dia,
            "body_temperature_c": temp,
            "spo2_percentage": spo2,
            "physical_activity_steps": activity_steps,
            "provenance": "SIMULATED",
            "recorded_at": current_time,
        }

    def generate_historical_series(self, hours: int = 24, interval_minutes: int = 15) -> List[Dict[str, Any]]:
        """
        Generates a continuous time-series of readings for initial dashboard seeding.
        """
        now = datetime.now(timezone.utc)
        start_time = now - timedelta(hours=hours)
        readings = []
        
        current_t = start_time
        last_g = 100.0

        while current_t <= now:
            reading = self.generate_single_reading(current_time=current_t, last_glucose=last_g)
            last_g = reading["glucose_mg_dl"]
            readings.append(reading)
            current_t += timedelta(minutes=interval_minutes)

        return readings


simulation_engine = SimulationEngine()
