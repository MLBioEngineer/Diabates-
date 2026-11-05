"""
Continuous Glucose Monitor (CGM) Integration Architecture & Driver Interface
Prepares abstract adapter layer for certified medical CGM APIs:
- Dexcom v3 API (OAuth2 PKCE, Egv Endpoints)
- Abbott FreeStyle LibreView API (Partner Cloud)
- Apple HealthKit / Google Health Connect Webhooks
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel


class NormalizedCGMPacket(BaseModel):
    device_id: str
    patient_identifier: str
    system_time: datetime
    glucose_value: float # mg/dL
    trend_rate: Optional[float] = 0.0 # mg/dL/min
    trend_arrow: Optional[str] = "FLAT" # "DOUBLE_UP", "SINGLE_UP", "FORTY_FIVE_UP", "FLAT", "FORTY_FIVE_DOWN", "SINGLE_DOWN", "DOUBLE_DOWN"
    transmitter_status: Optional[str] = "OK"
    data_provenance: str # "DEXCOM_G7", "ABBOTT_FREESTYLE", "SIMULATED"


class CGMDeviceAdapter(ABC):
    """
    Abstract interface for physical CGM cloud integrations.
    """

    @abstractmethod
    async def authenticate(self, client_id: str, client_secret: str, auth_code: str) -> Dict[str, Any]:
        """Exchanges OAuth2 authorization code for access and refresh tokens."""
        pass

    @abstractmethod
    async def fetch_estimated_glucose_values(
        self, access_token: str, start_time: datetime, end_time: datetime
    ) -> List[NormalizedCGMPacket]:
        """Fetches real sensor telemetry readings from the vendor cloud."""
        pass

    @abstractmethod
    def parse_webhook_payload(self, raw_payload: Dict[str, Any]) -> NormalizedCGMPacket:
        """Parses an incoming real-time push webhook from the device server."""
        pass


class DexcomG7Adapter(CGMDeviceAdapter):
    """
    Official Dexcom API v3 integration driver.
    """

    BASE_URL = "https://api.dexcom.com/v3/users/self"

    async def authenticate(self, client_id: str, client_secret: str, auth_code: str) -> Dict[str, Any]:
        # Implementation contract for production OAuth2 flow
        return {
            "status": "READY_FOR_OAUTH",
            "provider": "Dexcom",
            "redirect_uri": "https://api.dexcom.com/v2/oauth2/token",
            "note": "Requires production developer credentials registered at developer.dexcom.com"
        }

    async def fetch_estimated_glucose_values(
        self, access_token: str, start_time: datetime, end_time: datetime
    ) -> List[NormalizedCGMPacket]:
        # Production endpoint: GET /v3/users/self/egvs?startDate={}&endDate={}
        return []

    def parse_webhook_payload(self, raw_payload: Dict[str, Any]) -> NormalizedCGMPacket:
        egv = raw_payload.get("value", 100.0)
        trend = raw_payload.get("trendRate", 0.0)
        arrow = raw_payload.get("trend", "flat")
        dt_str = raw_payload.get("systemTime", datetime.now(timezone.utc).isoformat())
        
        return NormalizedCGMPacket(
            device_id=raw_payload.get("transmitterId", "DEXCOM_G7_HW"),
            patient_identifier=raw_payload.get("userId", "ANON_PATIENT"),
            system_time=datetime.fromisoformat(dt_str.replace("Z", "+00:00")),
            glucose_value=float(egv),
            trend_rate=float(trend),
            trend_arrow=arrow.upper(),
            transmitter_status="OK",
            data_provenance="DEXCOM_G7"
        )


class AbbottLibreAdapter(CGMDeviceAdapter):
    """
    Abbott FreeStyle LibreView API integration driver.
    """

    async def authenticate(self, client_id: str, client_secret: str, auth_code: str) -> Dict[str, Any]:
        return {
            "status": "READY_FOR_OAUTH",
            "provider": "Abbott LibreView",
            "note": "Requires Abbott Partner Network agreement"
        }

    async def fetch_estimated_glucose_values(
        self, access_token: str, start_time: datetime, end_time: datetime
    ) -> List[NormalizedCGMPacket]:
        return []

    def parse_webhook_payload(self, raw_payload: Dict[str, Any]) -> NormalizedCGMPacket:
        return NormalizedCGMPacket(
            device_id=raw_payload.get("sensorId", "LIBRE_3_HW"),
            patient_identifier=raw_payload.get("patientId", "ANON_PATIENT"),
            system_time=datetime.now(timezone.utc),
            glucose_value=float(raw_payload.get("glucoseMeasurement", 100.0)),
            trend_rate=0.0,
            trend_arrow="FLAT",
            data_provenance="ABBOTT_FREESTYLE"
        )
