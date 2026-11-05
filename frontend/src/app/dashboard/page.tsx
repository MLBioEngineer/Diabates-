'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Heart,
  Droplet,
  Wind,
  Footprints,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Utensils,
  Dumbbell
} from 'lucide-react';
import {
  getTelemetryHistory,
  getTelemetryStatistics,
  getActiveAlerts,
  acknowledgeAlert,
  triggerSimulatedReading,
  seedSampleHistory
} from '@/lib/api';
import { TelemetryReading, TelemetryStatistics, HealthAlert } from '@/lib/types';
import { GlucoseTrendChart } from '@/components/charts/GlucoseTrendChart';
import { TimeInRangeDonut } from '@/components/charts/TimeInRangeDonut';
import { ProvenanceBadge } from '@/components/telemetry/ProvenanceBadge';

export default function PatientDashboard() {
  const [history, setHistory] = useState<TelemetryReading[]>([]);
  const [stats, setStats] = useState<TelemetryStatistics | null>(null);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const loadData = async () => {
    try {
      // 1. Seed initial data if newly registered user
      await seedSampleHistory(24).catch(() => {});
      
      const [histData, statsData, alertsData] = await Promise.all([
        getTelemetryHistory(24),
        getTelemetryStatistics(24),
        getActiveAlerts(),
      ]);
      setHistory(histData);
      setStats(statsData);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000); // 20s auto poll fallback
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async (override?: string) => {
    setSimulating(true);
    try {
      const newReading = await triggerSimulatedReading(override);
      setHistory((prev) => [...prev, newReading]);
      // refresh stats and alerts
      const [newStats, newAlerts] = await Promise.all([
        getTelemetryStatistics(24),
        getActiveAlerts(),
      ]);
      setStats(newStats);
      setAlerts(newAlerts);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleAckAlert = async (id: string) => {
    try {
      await acknowledgeAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Alert acknowledgment error:', err);
    }
  };

  const latest = stats?.latest_reading || (history.length > 0 ? history[history.length - 1] : null);

  // Glucose state determination
  let glucoseStatus = { label: 'Optimal Range', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' };
  if (latest) {
    if (latest.glucose_mg_dl < 70) {
      glucoseStatus = { label: 'Hypoglycemia Warning', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' };
    } else if (latest.glucose_mg_dl > 180) {
      glucoseStatus = { label: 'Hyperglycemia Warning', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' };
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Patient Telemetry Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Continuous glucose monitoring, vital parameters, and glycemic stability indicators
          </p>
        </div>

        {/* Live Simulation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulate()}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
            Push Reading
          </button>
          <button
            onClick={() => handleSimulate('MEAL')}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
            title="Simulate Postprandial Glucose Rise"
          >
            <Utensils className="w-3.5 h-3.5" />
            + Meal Spike
          </button>
          <button
            onClick={() => handleSimulate('EXERCISE')}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
            title="Simulate Exercise Exertion Drop"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            + Exercise
          </button>
        </div>
      </div>

      {/* Critical Early Warning Alerts Banner */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                alert.alert_level === 'CRITICAL'
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">{alert.alert_level} ALERT</p>
                  <p className="text-xs">{alert.message}</p>
                </div>
              </div>
              <button
                onClick={() => handleAckAlert(alert.id)}
                className="shrink-0 px-3 py-1 text-xs font-semibold rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 hover:bg-white transition-all shadow-sm text-slate-800 dark:text-slate-200"
              >
                Acknowledge
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Primary Vital Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Glucose Main Card */}
        <div className={`p-5 rounded-2xl border ${glucoseStatus.bg} shadow-sm space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-teal-600" />
              Blood Glucose
            </span>
            {latest && <ProvenanceBadge provenance={latest.provenance} size="sm" />}
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {latest ? latest.glucose_mg_dl : '--'}
              </span>
              <span className="text-xs text-slate-500 ml-1.5">mg/dL</span>
            </div>
            {latest && (
              <span className={`text-xs font-bold flex items-center gap-1 ${glucoseStatus.color}`}>
                {latest.glucose_trend_velocity > 0.5 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : latest.glucose_trend_velocity < -0.5 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                {latest.glucose_trend_velocity > 0 ? '+' : ''}
                {latest.glucose_trend_velocity} mg/dL/min
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
            <span>Status: <strong className={glucoseStatus.color}>{glucoseStatus.label}</strong></span>
            <span>Target: 70–180</span>
          </div>
        </div>

        {/* Heart Rate */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              Heart Rate
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Resting</span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {latest?.heart_rate_bpm || 72}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">BPM</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <span>Normal: 60-100</span>
            <span className="text-emerald-600 font-semibold">Normal Sinus</span>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-500" />
              Blood Pressure
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Sys / Dia</span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {latest ? `${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}` : '120/80'}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">mm Hg</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <span>Target: &lt;120/80</span>
            <span className="text-emerald-600 font-semibold">Pre-hypertension</span>
          </div>
        </div>

        {/* SpO2 & Steps */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-cyan-500" />
              Pulse Oxygen (SpO2)
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Oxygenation</span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {latest?.spo2_percentage || 98.2}%
            </span>
            <span className="text-xs text-slate-500 ml-2">
              • {latest?.physical_activity_steps || 0} steps
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <span>Normal: &gt;95%</span>
            <span className="text-emerald-600 font-semibold">Adequate</span>
          </div>
        </div>
      </div>

      {/* Main Continuous Glucose Monitoring Graph & Time-in-Range Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Graph */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Continuous Glucose Profile (Last 24 Hours)
              </h2>
              <p className="text-xs text-slate-500">
                Green shaded band denotes clinical target range (70 to 180 mg/dL)
              </p>
            </div>
            <Link
              href="/live-monitor"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              Expand Real-Time
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <GlucoseTrendChart data={history} height={320} />
        </div>

        {/* Time-in-Range (TIR) Summary */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Glycemic Quality Indices
            </h2>
            <p className="text-xs text-slate-500">
              International Consensus on Time-in-Range (TIR) metrics
            </p>
          </div>

          <TimeInRangeDonut
            inRange={stats?.time_in_range_percent || 85}
            belowRange={stats?.time_below_range_percent || 2}
            aboveRange={stats?.time_above_range_percent || 13}
            height={190}
          />

          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Mean Interstitial Glucose:</span>
              <strong className="text-slate-900 dark:text-white">{stats?.mean_glucose || 108} mg/dL</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Estimated HbA1c (GMI):</span>
              <strong className="text-teal-600 dark:text-teal-400 font-bold">{stats?.glucose_management_indicator || 5.8}%</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Glycemic Variability (%CV):</span>
              <strong className="text-slate-900 dark:text-white">{stats?.glycemic_variability_cv || 18.2}% (&lt;36% target)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: AI Risk Assessment Teaser & Clinical Reports Quick Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ML Assessment Promo */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-slate-900 border border-teal-200 dark:border-teal-800/60 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-teal-600" />
            Machine Learning Diabetes Risk Assessment
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Obtain an individualized, multi-parameter risk evaluation using our cross-validated Random Forest model with explainable SHAP feature attribution.
          </p>
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-teal-800 pt-2"
          >
            Launch Risk Assessment Engine
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Reports & PDF Export */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Clinical Records & Data Export
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Generate comprehensive AGP (Ambulatory Glucose Profile) reports for your endocrinologist or export full CSV telemetry records.
          </p>
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 hover:text-teal-700 pt-2"
          >
            View Clinical Reports
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
