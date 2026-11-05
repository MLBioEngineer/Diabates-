export type DataProvenance = 'SIMULATED' | 'DEXCOM_G7' | 'ABBOTT_FREESTYLE' | 'MANUAL';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  is_active: boolean;
  created_at: string;
}

export interface TelemetryReading {
  id: string;
  patient_id: string;
  recorded_at: string;
  glucose_mg_dl: number;
  glucose_trend_velocity: number;
  heart_rate_bpm?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  body_temperature_c?: number;
  spo2_percentage?: number;
  physical_activity_steps: number;
  provenance: DataProvenance;
}

export interface TelemetryStatistics {
  time_in_range_percent: number;
  time_below_range_percent: number;
  time_above_range_percent: number;
  mean_glucose: number;
  glucose_management_indicator: number;
  glycemic_variability_cv: number;
  readings_count: number;
  latest_reading?: TelemetryReading;
}

export interface SHAPContribution {
  feature: string;
  feature_label: string;
  feature_value: number;
  shap_value: number;
  impact_direction: 'INCREASES_RISK' | 'DECREASES_RISK';
  impact_percentage: number;
}

export interface RiskPredictionResult {
  id?: string;
  patient_id?: string;
  model_name: string;
  risk_score: number;
  risk_percentage: number;
  risk_category: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  clinical_summary: string;
  disclaimer: string;
  shap_contributions: SHAPContribution[];
  created_at: string;
}

export interface HealthAlert {
  id: string;
  patient_id: string;
  created_at: string;
  alert_level: 'INFO' | 'WARNING' | 'CRITICAL';
  metric_type: string;
  metric_value: number;
  message: string;
  threshold_rule: string;
  is_acknowledged: boolean;
  acknowledged_at?: string;
}

export interface HealthReport {
  report_id: string;
  generated_at: string;
  patient_name: string;
  patient_id: string;
  diabetes_type: string;
  monitoring_period: string;
  telemetry_statistics: TelemetryStatistics;
  latest_risk_assessment?: RiskPredictionResult;
  recent_readings_sample: TelemetryReading[];
  recent_alerts: HealthAlert[];
  clinical_notes: string;
  disclaimer: string;
}

export interface DoctorPatientSummary {
  patient_id: string;
  full_name: string;
  email: string;
  diabetes_type: string;
  latest_glucose?: number;
  latest_reading_time?: string;
  risk_score?: number;
  risk_category: string;
  time_in_range_percent: number;
  active_alerts_count: number;
}
