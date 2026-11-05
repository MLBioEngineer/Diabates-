'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Activity,
  Radio,
  Play,
  Square,
  Utensils,
  Dumbbell,
  AlertTriangle,
  Heart,
  Droplet,
  Wind,
  Thermometer,
  Footprints,
  Cpu,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { getTelemetryHistory, triggerSimulatedReading, getActiveAlerts } from '@/lib/api';
import { TelemetryReading, HealthAlert } from '@/lib/types';
import { GlucoseTrendChart } from '@/components/charts/GlucoseTrendChart';
import { ProvenanceBadge } from '@/components/telemetry/ProvenanceBadge';

export default function LiveMonitorPage() {
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStreamData = async () => {
    try {
      const [hist, actAlerts] = await Promise.all([
        getTelemetryHistory(12),
        getActiveAlerts(),
      ]);
      setReadings(hist);
      setAlerts(actAlerts);
    } catch (err) {
      console.error('Live telemetry fetch error:', err);
    }
  };

  useEffect(() => {
    fetchStreamData();
  }, []);

  // Live Auto-Stream simulation loop
  useEffect(() => {
    if (isLiveStreaming) {
      timerRef.current = setInterval(async () => {
        try {
          const newReading = await triggerSimulatedReading();
          setReadings((prev) => [...prev.slice(-40), newReading]);
          const latestAlerts = await getActiveAlerts();
          setAlerts(latestAlerts);
        } catch (e) {
          console.error('Simulation streaming step error:', e);
        }
      }, 6000); // Step every 6 seconds
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLiveStreaming]);

  const handleManualEvent = async (event: 'MEAL' | 'EXERCISE') => {
    setLoading(true);
    try {
      const res = await triggerSimulatedReading(event);
      setReadings((prev) => [...prev, res]);
      const act = await getActiveAlerts();
      setAlerts(act);
    } finally {
      setLoading(false);
    }
  };

  const latest = readings.length > 0 ? readings[readings.length - 1] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Streaming Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            Continuous Sensor Telemetry Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Real-Time Health Parameter Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Live interstitial glucose updates, physiological rate of change, and vital sign streams
          </p>
        </div>

        {/* Streaming Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isLiveStreaming
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-100'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isLiveStreaming ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isLiveStreaming ? 'Pause Sensor Stream' : 'Resume Live Stream'}
          </button>

          <button
            onClick={() => handleManualEvent('MEAL')}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
          >
            <Utensils className="w-3.5 h-3.5" />
            Inject Meal Bolus
          </button>

          <button
            onClick={() => handleManualEvent('EXERCISE')}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Inject Exertion
          </button>
        </div>
      </div>

      {/* Provenance Notice */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-teal-600" />
          <span className="text-slate-700 dark:text-slate-300">
            Active Data Feed: <strong className="text-teal-600">Simulated Telemetry Stream (Bergman Model)</strong>
          </span>
        </div>
        <span className="text-slate-500">
          CGM Device Adapter Status: <strong className="text-emerald-600">Dexcom / Abbott OAuth2 Driver Ready</strong>
        </span>
      </div>

      {/* Main Gauges Display */}
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Glucose */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Glucose</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {latest.glucose_mg_dl} <span className="text-xs font-normal text-slate-500">mg/dL</span>
            </div>
            <p className="text-[11px] font-semibold text-teal-600">
              {latest.glucose_trend_velocity > 0 ? '+' : ''}
              {latest.glucose_trend_velocity} mg/dL/min
            </p>
          </div>

          {/* Heart Rate */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Heart Rate</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {latest.heart_rate_bpm || 72} <span className="text-xs font-normal text-slate-500">BPM</span>
            </div>
            <p className="text-[11px] text-slate-400">Resting Sinus</p>
          </div>

          {/* BP */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Blood Pressure</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {latest.blood_pressure_systolic}/{latest.blood_pressure_diastolic}
            </div>
            <p className="text-[11px] text-slate-400">Sys / Dia mm Hg</p>
          </div>

          {/* SpO2 */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Oxygen (SpO2)</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {latest.spo2_percentage || 98.2}%
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold">Adequate</p>
          </div>

          {/* Temp */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Temperature</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {latest.body_temperature_c || 36.8} <span className="text-xs font-normal text-slate-500">°C</span>
            </div>
            <p className="text-[11px] text-slate-400">Normothermic</p>
          </div>

          {/* Steps */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Step Activity</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {latest.physical_activity_steps}
            </div>
            <p className="text-[11px] text-slate-400">Cadence steps</p>
          </div>
        </div>
      )}

      {/* Main Real-Time Waveform Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Real-Time Dynamic Ambulatory Waveform
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Buffer: {readings.length} data packets
          </span>
        </div>

        <GlucoseTrendChart data={readings} height={360} />
      </div>

      {/* Live Stream Packets Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Raw Ingestion Telemetry Stream
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-2.5 rounded-l-lg">Timestamp</th>
                <th className="px-4 py-2.5">Glucose</th>
                <th className="px-4 py-2.5">Velocity</th>
                <th className="px-4 py-2.5">Heart Rate</th>
                <th className="px-4 py-2.5">Blood Pressure</th>
                <th className="px-4 py-2.5">SpO2</th>
                <th className="px-4 py-2.5 rounded-r-lg">Data Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {readings.slice(-10).reverse().map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400 font-mono">
                    {new Date(r.recorded_at).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2 font-bold text-teal-600 dark:text-teal-400">
                    {r.glucose_mg_dl} mg/dL
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400 font-mono">
                    {r.glucose_trend_velocity > 0 ? '+' : ''}
                    {r.glucose_trend_velocity}
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                    {r.heart_rate_bpm || 72} BPM
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                    {r.blood_pressure_systolic}/{r.blood_pressure_diastolic}
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                    {r.spo2_percentage}%
                  </td>
                  <td className="px-4 py-2">
                    <ProvenanceBadge provenance={r.provenance} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
