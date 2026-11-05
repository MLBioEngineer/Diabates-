"""
WebSocket Manager for Real-Time Health Telemetry Broadcasting
Supports per-patient rooms, clinician monitoring subscriptions, and alert pushes.
"""

import json
from typing import Dict, Set
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # Maps patient_id -> Set of active WebSockets
        self.active_rooms: Dict[str, Set[WebSocket]] = {}
        # Global clinician monitors
        self.clinician_sockets: Set[WebSocket] = set()

    async def connect_patient(self, websocket: WebSocket, patient_id: str):
        await websocket.accept()
        if patient_id not in self.active_rooms:
            self.active_rooms[patient_id] = set()
        self.active_rooms[patient_id].add(websocket)
        print(f"[WS] Patient connected to room {patient_id}. Total: {len(self.active_rooms[patient_id])}")

    async def connect_clinician(self, websocket: WebSocket):
        await websocket.accept()
        self.clinician_sockets.add(websocket)
        print(f"[WS] Clinician connected to global feed. Total: {len(self.clinician_sockets)}")

    def disconnect(self, websocket: WebSocket, patient_id: str = None):
        if patient_id and patient_id in self.active_rooms:
            self.active_rooms[patient_id].discard(websocket)
            if not self.active_rooms[patient_id]:
                del self.active_rooms[patient_id]
        self.clinician_sockets.discard(websocket)
        print("[WS] Client disconnected.")

    async def broadcast_to_patient(self, patient_id: str, message: dict):
        if patient_id in self.active_rooms:
            dead_sockets = set()
            payload = json.dumps(message, default=str)
            for ws in self.active_rooms[patient_id]:
                try:
                    await ws.send_text(payload)
                except Exception:
                    dead_sockets.add(ws)
            for dead in dead_sockets:
                self.active_rooms[patient_id].discard(dead)

        # Also forward to clinicians monitoring this patient
        if self.clinician_sockets:
            dead_clinicians = set()
            payload = json.dumps(message, default=str)
            for ws in self.clinician_sockets:
                try:
                    await ws.send_text(payload)
                except Exception:
                    dead_clinicians.add(ws)
            for dead in dead_clinicians:
                self.clinician_sockets.discard(dead)


ws_manager = ConnectionManager()
