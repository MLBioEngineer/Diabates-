import { User, TelemetryReading, TelemetryStatistics, RiskPredictionResult, HealthAlert, HealthReport, DoctorPatientSummary } from './types';

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

// Authentication
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

export async function registerUser(email: string, password: string, full_name: string, role: string = 'PATIENT') {
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

// Machine Learning
export async function predictDiabetesRisk(payload: {
  pregnancies: number;
  glucose: number;
  blood_pressure: number;
  skin_thickness: number;
  insulin: number;
  bmi: number;
  diabetes_pedigree_function: number;
  age: number;
}): Promise<RiskPredictionResult> {
  return request<RiskPredictionResult>('/ml/predict-risk', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getModelInfo(): Promise<any> {
  return request<any>('/ml/model-info');
}

// Telemetry
export async function getTelemetryHistory(hours: number = 24): Promise<TelemetryReading[]> {
  return request<TelemetryReading[]>(`/telemetry/history?hours=${hours}`);
}

export async function getTelemetryStatistics(hours: number = 24): Promise<TelemetryStatistics> {
  return request<TelemetryStatistics>(`/telemetry/statistics?hours=${hours}`);
}

export async function triggerSimulatedReading(eventOverride?: string): Promise<TelemetryReading> {
  const q = eventOverride ? `?event_override=${eventOverride}` : '';
  return request<TelemetryReading>(`/telemetry/simulate-stream${q}`, { method: 'POST' });
}

export async function seedSampleHistory(hours: number = 24) {
  return request<any>(`/telemetry/seed-sample-history?hours=${hours}`, { method: 'POST' });
}

// Alerts
export async function getActiveAlerts(): Promise<HealthAlert[]> {
  return request<HealthAlert[]>('/alerts/active');
}

export async function acknowledgeAlert(alertId: string): Promise<HealthAlert> {
  return request<HealthAlert>(`/alerts/${alertId}/ack`, { method: 'POST' });
}

// Reports
export async function getHealthReport(): Promise<HealthReport> {
  return request<HealthReport>('/reports/summary');
}

export function getExportCsvUrl(): string {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
  return `${API_BASE}/reports/export-csv`;
}

// Doctor Dashboard
export async function getDoctorPatientRoster(): Promise<DoctorPatientSummary[]> {
  return request<DoctorPatientSummary[]>('/doctor/patients');
}

export async function getPatientClinicalDetails(patientId: string): Promise<any> {
  return request<any>(`/doctor/patients/${patientId}/details`);
}
