/**
 * VPT Sense AI - Frontend API Client
 * Vibration Perception Threshold (VPT) & Quantitative Sensory Testing Platform
 */

import {
  User,
  Participant,
  ParticipantDetail,
  LiveDeviceState,
  VPTEstimationInput,
  VPTEstimationOutput,
  CohortAnalytics,
  ResearchReport,
  DeviceSettings,
  VPTAlert,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errorDetail = 'Network request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

// -------------------------------------------------------------
// Authentication
// -------------------------------------------------------------
export async function loginUser(email: string, password: string) {
  const data = await request<{ access_token: string; role: string; user_id: string; full_name: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('user_id', data.user_id);
    localStorage.setItem('user_name', data.full_name);
  }
  return data;
}

export async function registerUser(email: string, password: string, full_name: string, role: string = 'RESEARCHER') {
  const data = await request<{ access_token: string; role: string; user_id: string; full_name: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name, role }),
  });
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('user_id', data.user_id);
    localStorage.setItem('user_name', data.full_name);
  }
  return data;
}

export async function getCurrentUser(): Promise<User> {
  return request<User>('/auth/me');
}

export function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
  }
}

// -------------------------------------------------------------
// 1. VPT Reference Estimation
// -------------------------------------------------------------
export async function estimateVPTReference(payload: VPTEstimationInput): Promise<VPTEstimationOutput> {
  return request<VPTEstimationOutput>('/vpt/estimate-reference', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// -------------------------------------------------------------
// 2. Live Device Monitoring & Simulation
// -------------------------------------------------------------
export async function getLiveDeviceState(): Promise<LiveDeviceState> {
  return request<LiveDeviceState>('/vpt/device/state');
}

export async function startDeviceRamp(): Promise<LiveDeviceState> {
  return request<LiveDeviceState>('/vpt/device/start-ramp', { method: 'POST' });
}

export async function stepDeviceSimulation(deltaTimeSec: number = 0.25): Promise<LiveDeviceState> {
  return request<LiveDeviceState>(`/vpt/device/step?delta_time_sec=${deltaTimeSec}`, { method: 'POST' });
}

export async function triggerPerception(): Promise<LiveDeviceState> {
  return request<LiveDeviceState>('/vpt/device/trigger-perception', { method: 'POST' });
}

export async function advanceNextTrial(nextSite?: string): Promise<LiveDeviceState> {
  const q = nextSite ? `?next_site=${nextSite}` : '';
  return request<LiveDeviceState>(`/vpt/device/next-trial${q}`, { method: 'POST' });
}

export async function resetDevice(): Promise<LiveDeviceState> {
  return request<LiveDeviceState>('/vpt/device/reset', { method: 'POST' });
}

export async function configureDevice(payload: {
  frequency_hz: number;
  ramp_rate: number;
  site: string;
  simulated_patient_neuropathy_level: string;
}): Promise<LiveDeviceState> {
  return request<LiveDeviceState>('/vpt/device/configure', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// -------------------------------------------------------------
// 3. Participant Management
// -------------------------------------------------------------
export async function getParticipants(search?: string, group?: string): Promise<Participant[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (group) params.append('group', group);
  const q = params.toString() ? `?${params.toString()}` : '';
  return request<Participant[]>(`/vpt/participants${q}`);
}

export async function createParticipant(payload: {
  full_name: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  clinical_group: string;
  diabetes_duration_years: number;
  foot_ulcer_history: boolean;
  symptoms_nss_score: number;
  notes?: string;
}): Promise<any> {
  return request<any>('/vpt/participants', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getParticipantDetail(id: string): Promise<ParticipantDetail> {
  return request<ParticipantDetail>(`/vpt/participants/${id}`);
}

export async function recordQSTSession(participantId: string, payload: any): Promise<any> {
  return request<any>(`/vpt/participants/${participantId}/sessions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// -------------------------------------------------------------
// 4. VPT Analytics
// -------------------------------------------------------------
export async function getAnalyticsOverview(): Promise<CohortAnalytics> {
  return request<CohortAnalytics>('/vpt/analytics/overview');
}

// -------------------------------------------------------------
// 5. Research Reports & Export
// -------------------------------------------------------------
export async function getResearchReport(participantId?: string): Promise<ResearchReport> {
  const q = participantId ? `?participant_id=${participantId}` : '';
  return request<ResearchReport>(`/vpt/reports/summary${q}`);
}

export function getExportCsvUrl(): string {
  return `${API_BASE}/vpt/reports/export-csv`;
}

// -------------------------------------------------------------
// 6. Device Settings
// -------------------------------------------------------------
export async function getDeviceSettings(): Promise<DeviceSettings> {
  return request<DeviceSettings>('/vpt/device-settings');
}

export async function updateDeviceSettings(payload: Partial<DeviceSettings>): Promise<any> {
  return request<any>('/vpt/device-settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// -------------------------------------------------------------
// 7. Alerts
// -------------------------------------------------------------
export async function getVPTAlerts(): Promise<VPTAlert[]> {
  return request<VPTAlert[]>('/vpt/alerts');
}

export async function acknowledgeVPTAlert(alertId: string): Promise<any> {
  return request<any>(`/vpt/alerts/${alertId}/ack`, { method: 'POST' });
}
