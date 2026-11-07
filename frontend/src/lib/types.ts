/**
 * VPT Sense AI - TypeScript Type Definitions
 * Vibration Perception Threshold (VPT) & Quantitative Sensory Testing Platform
 */

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'RESEARCHER' | 'PARTICIPANT' | 'ADMIN' | 'DOCTOR' | 'PATIENT';
  is_active: boolean;
  created_at: string;
}

export type ClinicalGroup =
  | 'HEALTHY_CONTROL'
  | 'DIABETIC_NON_NEUROPATHIC'
  | 'ESTABLISHED_DPN'
  | 'CIPN'
  | 'OTHER';

export type SensoryClassification =
  | 'PRESERVED'
  | 'MILD_BLUNTING'
  | 'MODERATE_NEUROPATHY'
  | 'SEVERE_LOPS'
  | 'REFERENCE_ONLY'
  | 'NOT_TESTED';

export type UlcerRiskCategory = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface Participant {
  id: string;
  subject_code: string;
  full_name: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  bmi: number;
  clinical_group: ClinicalGroup;
  diabetes_duration_years: number;
  foot_ulcer_history: boolean;
  symptoms_nss_score: number;
  notes?: string;
  latest_vpt_voltage?: number;
  latest_classification?: SensoryClassification;
  ulcer_risk_category?: UlcerRiskCategory;
  sessions_count?: number;
  created_at: string;
}

export interface VPTMeasurement {
  site: string;
  trial_1_v: number;
  trial_2_v: number;
  trial_3_v: number;
  mean_vpt_v: number;
  sd_vpt_v: number;
  normative_expected_v: number;
  z_score: number;
  percentile: number;
  loss_grade: SensoryClassification;
}

export interface VPTSession {
  id: string;
  tested_at: string;
  device_name: string;
  frequency_hz: number;
  mean_great_toe_v?: number;
  max_site_voltage_v?: number;
  bilateral_asymmetry_v: number;
  overall_classification: SensoryClassification;
  ulcer_risk_category: UlcerRiskCategory;
  clinical_summary?: string;
  measurements: VPTMeasurement[];
}

export interface ParticipantDetail extends Participant {
  sessions: VPTSession[];
}

export interface LiveDeviceState {
  device_id: string;
  device_name: string;
  status: 'READY' | 'RAMPING' | 'THRESHOLD_CAPTURED' | 'SAFETY_STOP' | 'PAUSED';
  active_site: string;
  current_voltage_v: number;
  frequency_hz: number;
  ramp_rate_v_per_sec: number;
  contact_force_g: number;
  probe_contact_ok: boolean;
  trial_number: number;
  max_trials: number;
  captured_trials: number[];
  mean_voltage_v?: number;
  subject_button_pressed: boolean;
  timestamp: string;
}

export interface FeatureImpact {
  feature_name: string;
  feature_label: string;
  feature_value: string;
  voltage_impact_v: number;
  description: string;
}

export interface VPTEstimationInput {
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  anatomical_site: string;
  measured_vpt_v?: number;
}

export interface VPTEstimationOutput {
  expected_mean_vpt_v: number;
  upper_limit_normal_95_v: number;
  lower_limit_normal_5_v: number;
  standard_deviation_v: number;
  measured_vpt_v?: number;
  z_score?: number;
  percentile_rank?: number;
  sensory_classification: SensoryClassification;
  ulceration_risk_multiplier: number;
  ulcer_risk_category: UlcerRiskCategory;
  feature_impacts: FeatureImpact[];
  clinical_interpretation: string;
  research_recommendation: string;
  disclaimer: string;
}

export interface CohortAnalytics {
  total_subjects: number;
  total_sessions: number;
  mean_cohort_vpt_v: number;
  mean_bilateral_asymmetry_v: number;
  classification_breakdown: { name: string; value: number; color: string }[];
  site_comparison: { site: string; voltage_v: number }[];
  age_regression_scatter: {
    subject_code: string;
    age: number;
    measured_vpt: number;
    normative_ref: number;
    group: string;
  }[];
}

export interface ResearchReport {
  report_id: string;
  generated_at: string;
  subject_code: string;
  full_name: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  bmi: number;
  clinical_group: string;
  diabetes_duration_years: number;
  foot_ulcer_history: boolean;
  symptoms_nss_score: number;
  tested_at?: string;
  device_name: string;
  frequency_hz: number;
  mean_vpt_v?: number;
  max_site_voltage_v?: number;
  bilateral_asymmetry_v: number;
  overall_classification: SensoryClassification;
  ulcer_risk_category: UlcerRiskCategory;
  clinical_notes: string;
  measurements: VPTMeasurement[];
  disclaimer: string;
}

export interface DeviceSettings {
  id?: string;
  device_name: string;
  serial_number: string;
  port_mode: string;
  frequency_hz: number;
  ramp_rate_v_per_sec: number;
  max_voltage_safety_v: number;
  contact_force_target_g: number;
  calibration_status: string;
  is_active: boolean;
}

export interface VPTAlert {
  id: string;
  participant_id: string;
  created_at: string;
  alert_level: 'INFO' | 'WARNING' | 'CRITICAL';
  alert_type: string;
  metric_value: number;
  site?: string;
  message: string;
  is_acknowledged: boolean;
}
