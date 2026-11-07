"""
VPT Sense AI - Biothesiometer & Quantitative Sensory Testing Device Simulation Service
Simulates precise electro-mechanical vibration probe ramping (0 - 50V),
100Hz/120Hz oscillating driver, contact pressure transducer, and participant response triggers.
"""

import math
import random
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class LiveDeviceState(BaseModel):
    device_id: str = "BIO-THESIO-2026-X8"
    device_name: str = "Digital Biothesiometer Pro-V"
    status: str = "READY" # READY, RAMPING, THRESHOLD_CAPTURED, SAFETY_STOP, PAUSED
    active_site: str = "GREAT_TOE_RIGHT"
    current_voltage_v: float = 0.0
    frequency_hz: int = 100
    ramp_rate_v_per_sec: float = 1.0
    contact_force_g: float = 22.4 # Target 20.0 - 25.0 g
    probe_contact_ok: bool = True
    trial_number: int = 1
    max_trials: int = 3
    captured_trials: List[float] = []
    mean_voltage_v: Optional[float] = None
    subject_button_pressed: bool = False
    timestamp: str = ""


class VPTDeviceService:

    def __init__(self):
        self.state = LiveDeviceState(
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
        self._is_running = False
        self._participant_threshold_v = 14.5 # Default simulated perceptual threshold

    def configure(
        self,
        frequency_hz: int = 100,
        ramp_rate: float = 1.0,
        site: str = "GREAT_TOE_RIGHT",
        simulated_patient_neuropathy_level: str = "MILD"
    ):
        self.state.frequency_hz = frequency_hz
        self.state.ramp_rate_v_per_sec = ramp_rate
        self.state.active_site = site
        self.state.current_voltage_v = 0.0
        self.state.status = "READY"
        self.state.subject_button_pressed = False
        
        # Configure simulated participant reaction point
        if simulated_patient_neuropathy_level == "PRESERVED":
            self._participant_threshold_v = random.uniform(6.5, 11.0)
        elif simulated_patient_neuropathy_level == "MILD":
            self._participant_threshold_v = random.uniform(15.5, 18.5)
        elif simulated_patient_neuropathy_level == "MODERATE":
            self._participant_threshold_v = random.uniform(21.0, 24.0)
        else: # SEVERE_LOPS
            self._participant_threshold_v = random.uniform(28.0, 36.0)

    def start_ramp(self) -> LiveDeviceState:
        self.state.status = "RAMPING"
        self.state.subject_button_pressed = False
        self.state.timestamp = datetime.utcnow().isoformat() + "Z"
        return self.state

    def step_simulation(self, delta_time_sec: float = 0.25) -> LiveDeviceState:
        """
        Advances the vibration voltage waveform by delta_time_sec.
        Generates realistic transducer noise and contact sensor feedback.
        """
        if self.state.status == "RAMPING":
            increment = self.state.ramp_rate_v_per_sec * delta_time_sec
            self.state.current_voltage_v = round(
                min(50.0, self.state.current_voltage_v + increment), 2
            )

            # Transducer contact force micro-fluctuation around 22.5g
            self.state.contact_force_g = round(22.5 + random.gauss(0, 0.4), 1)
            self.state.probe_contact_ok = 18.0 <= self.state.contact_force_g <= 28.0

            # Automatic simulated response trigger when voltage crosses patient's sensory threshold
            if self.state.current_voltage_v >= self._participant_threshold_v:
                return self.trigger_perception_detected(manual=False)

            # Safety voltage ceiling check
            if self.state.current_voltage_v >= 50.0:
                self.state.status = "SAFETY_STOP"
                self.state.current_voltage_v = 50.0

        self.state.timestamp = datetime.utcnow().isoformat() + "Z"
        return self.state

    def trigger_perception_detected(self, manual: bool = True) -> LiveDeviceState:
        """Called when participant signals they first feel vibration."""
        self.state.subject_button_pressed = True
        self.state.status = "THRESHOLD_CAPTURED"
        captured_v = round(self.state.current_voltage_v, 1)
        self.state.captured_trials.append(captured_v)
        
        # Calculate running mean
        if self.state.captured_trials:
            self.state.mean_voltage_v = round(
                sum(self.state.captured_trials) / len(self.state.captured_trials), 1
            )
        
        self.state.timestamp = datetime.utcnow().isoformat() + "Z"
        return self.state

    def next_trial_or_site(self, next_site: Optional[str] = None) -> LiveDeviceState:
        if len(self.state.captured_trials) >= self.state.max_trials:
            # Advance to next site
            self.state.trial_number = 1
            self.state.captured_trials = []
            self.state.mean_voltage_v = None
            if next_site:
                self.state.active_site = next_site
        else:
            self.state.trial_number += 1
            
        self.state.current_voltage_v = 0.0
        self.state.status = "READY"
        self.state.subject_button_pressed = False
        self.state.timestamp = datetime.utcnow().isoformat() + "Z"
        return self.state

    def reset(self) -> LiveDeviceState:
        self.state.current_voltage_v = 0.0
        self.state.status = "READY"
        self.state.subject_button_pressed = False
        self.state.captured_trials = []
        self.state.mean_voltage_v = None
        self.state.trial_number = 1
        self.state.timestamp = datetime.utcnow().isoformat() + "Z"
        return self.state


vpt_device_service = VPTDeviceService()
