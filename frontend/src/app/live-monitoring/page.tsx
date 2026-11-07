'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Play,
  Square,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Save
} from 'lucide-react';
import {
  getLiveDeviceState,
  startDeviceRamp,
  stepDeviceSimulation,
  triggerPerception,
  advanceNextTrial,
  resetDevice,
  configureDevice,
  getParticipants,
  recordQSTSession,
} from '@/lib/api';
import { LiveDeviceState, Participant } from '@/lib/types';
import { VPTWaveformChart } from '@/components/charts/VPTWaveformChart';

export default function LiveMonitoringPage() {
  const [deviceState, setDeviceState] = useState<LiveDeviceState | null>(null);
  const [waveformHistory, setWaveformHistory] = useState<{ time: string; voltage: number }[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
  const [neuropathyLevel, setNeuropathyLevel] = useState<string>('MILD');
  const [savingSession, setSavingSession] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchState = async () => {
    try {
      const state = await getLiveDeviceState();
      setDeviceState(state);
    } catch (err) {
      console.error('Failed to get device state:', err);
    }
  };

  useEffect(() => {
    fetchState();
    getParticipants().then((list) => {
      setParticipants(list);
      if (list.length > 0) setSelectedParticipantId(list[0].id);
    });
  }, []);

  // Live simulation tick interval when ramping
  useEffect(() => {
    if (deviceState?.status === 'RAMPING') {
      timerRef.current = setInterval(async () => {
        try {
          const nextState = await stepDeviceSimulation(0.2);
          setDeviceState(nextState);

          const timeLabel = new Date().toLocaleTimeString('en-US', {
            minute: '2-digit',
            second: '2-digit',
          });
          setWaveformHistory((prev) => [
            ...prev.slice(-30),
            { time: timeLabel, voltage: nextState.current_voltage_v },
          ]);
        } catch (e) {
          console.error('Ramp step error:', e);
        }
      }, 200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [deviceState?.status]);

  const handleStartRamp = async () => {
    const s = await startDeviceRamp();
    setDeviceState(s);
  };

  const handleSubjectResponse = async () => {
    const s = await triggerPerception();
    setDeviceState(s);
  };

  const handleNextTrial = async (site?: string) => {
    const s = await advanceNextTrial(site);
    setDeviceState(s);
  };

  const handleReset = async () => {
    const s = await resetDevice();
    setDeviceState(s);
    setWaveformHistory([]);
  };

  const handleConfigure = async (level: string) => {
    setNeuropathyLevel(level);
    const s = await configureDevice({
      frequency_hz: deviceState?.frequency_hz || 100,
      ramp_rate: deviceState?.ramp_rate_v_per_sec || 1.0,
      site: deviceState?.active_site || 'GREAT_TOE_RIGHT',
      simulated_patient_neuropathy_level: level,
    });
    setDeviceState(s);
  };

  const handleSaveSession = async () => {
    if (!selectedParticipantId || !deviceState || deviceState.captured_trials.length === 0) return;
    setSavingSession(true);
    try {
      const t = deviceState.captured_trials;
      const t1 = t[0] ?? 14.0;
      const t2 = t[1] ?? t1;
      const t3 = t[2] ?? t1;

      await recordQSTSession(selectedParticipantId, {
        device_name: deviceState.device_name,
        frequency_hz: deviceState.frequency_hz,
        ramp_rate_v_per_sec: deviceState.ramp_rate_v_per_sec,
        protocol_name: 'Live QST Trial',
        measurements: [
          {
            site: deviceState.active_site,
            trial_1_v: t1,
            trial_2_v: t2,
            trial_3_v: t3,
          },
        ],
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving QST trial:', err);
    } finally {
      setSavingSession(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            Biothesiometer Hardware Interface & Oscilloscope
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Live Device Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time electromagnetic vibration ramping (0–50V) at 100/120Hz with contact pressure transducer
          </p>
        </div>

        {/* Selected Participant Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Assign to Subject:</span>
          <select
            value={selectedParticipantId}
            onChange={(e) => setSelectedParticipantId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
          >
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.subject_code} - {p.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Gauges & Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Dial & Voltage Readout Card */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-300">
                  {deviceState?.device_name || 'Biothesiometer Pro-V'}
                </span>
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  deviceState?.status === 'RAMPING'
                    ? 'bg-cyan-500/20 text-cyan-400 animate-pulse border border-cyan-500/40'
                    : deviceState?.status === 'THRESHOLD_CAPTURED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {deviceState?.status || 'READY'}
              </span>
            </div>

            {/* Central Voltage Readout */}
            <div className="text-center py-4 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Stimulus Voltage Amplitude
              </span>
              <div className="font-mono text-6xl font-black text-cyan-400 tracking-tight">
                {deviceState?.current_voltage_v?.toFixed(1) ?? '0.0'}
                <span className="text-xl font-normal text-slate-500 ml-2">V RMS</span>
              </div>

              {/* Progress bar across 50V */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full transition-all duration-150 ${
                    (deviceState?.current_voltage_v || 0) >= 25
                      ? 'bg-rose-500'
                      : (deviceState?.current_voltage_v || 0) >= 15
                      ? 'bg-amber-400'
                      : 'bg-cyan-500'
                  }`}
                  style={{
                    width: `${Math.min(100, ((deviceState?.current_voltage_v || 0) / 50.0) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 V</span>
                <span>Normal Cutoff 15V</span>
                <span>LOPS 25V</span>
                <span>50 V</span>
              </div>
            </div>

            {/* Transducer Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-800">
              <div className="p-2.5 rounded-xl bg-slate-850 bg-slate-800/60">
                <span className="text-[10px] text-slate-400">Frequency</span>
                <div className="font-mono font-bold text-white text-sm mt-0.5">
                  {deviceState?.frequency_hz || 100} Hz
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-850 bg-slate-800/60">
                <span className="text-[10px] text-slate-400">Contact Force</span>
                <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                  {deviceState?.contact_force_g || 22.4} g
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-850 bg-slate-800/60">
                <span className="text-[10px] text-slate-400">Ramp Rate</span>
                <div className="font-mono font-bold text-cyan-400 text-sm mt-0.5">
                  {deviceState?.ramp_rate_v_per_sec || 1.0} V/s
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleStartRamp}
                  disabled={deviceState?.status === 'RAMPING'}
                  className="py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Voltage Ramp</span>
                </button>

                <button
                  onClick={handleSubjectResponse}
                  disabled={deviceState?.status !== 'RAMPING'}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all animate-pulse"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Subject Felt Vibration</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleNextTrial()}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>Next Trial ({deviceState?.trial_number || 1}/3)</span>
                </button>

                <button
                  onClick={handleReset}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset 0.0V</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simulation Patient Profiles Switcher */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Simulate Participant Response Profile:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => handleConfigure('PRESERVED')}
                className={`p-2 rounded-xl border text-center font-bold ${
                  neuropathyLevel === 'PRESERVED'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Normal (&lt;15V)
              </button>
              <button
                onClick={() => handleConfigure('MILD')}
                className={`p-2 rounded-xl border text-center font-bold ${
                  neuropathyLevel === 'MILD'
                    ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Mild (15-20V)
              </button>
              <button
                onClick={() => handleConfigure('MODERATE')}
                className={`p-2 rounded-xl border text-center font-bold ${
                  neuropathyLevel === 'MODERATE'
                    ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Moderate (20-25V)
              </button>
              <button
                onClick={() => handleConfigure('SEVERE_LOPS')}
                className={`p-2 rounded-xl border text-center font-bold ${
                  neuropathyLevel === 'SEVERE_LOPS'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Severe LOPS (≥25V)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Oscilloscope Waveform & Captured Trials */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real-Time Waveform Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Real-Time Biothesiometer Oscilloscope Waveform
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Site: {deviceState?.active_site.replace(/_/g, ' ')}
              </span>
            </div>

            <VPTWaveformChart data={waveformHistory} height={260} />
          </div>

          {/* Triplicate Captured Trials Table & Session Saver */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Triplicate QST Trial Thresholds
                </h3>
                <p className="text-xs text-slate-500">Method of limits: Perceptual sensation detection</p>
              </div>

              {deviceState?.mean_voltage_v && (
                <button
                  onClick={handleSaveSession}
                  disabled={savingSession}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saveSuccess ? 'Saved to Subject!' : 'Save Session'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Trial 1</span>
                <div className="text-xl font-mono font-black text-slate-900 dark:text-white mt-1">
                  {deviceState?.captured_trials[0] ? `${deviceState.captured_trials[0]} V` : '—'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Trial 2</span>
                <div className="text-xl font-mono font-black text-slate-900 dark:text-white mt-1">
                  {deviceState?.captured_trials[1] ? `${deviceState.captured_trials[1]} V` : '—'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Trial 3</span>
                <div className="text-xl font-mono font-black text-slate-900 dark:text-white mt-1">
                  {deviceState?.captured_trials[2] ? `${deviceState.captured_trials[2]} V` : '—'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800">
                <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300">Mean VPT</span>
                <div className="text-xl font-mono font-black text-cyan-700 dark:text-cyan-300 mt-1">
                  {deviceState?.mean_voltage_v ? `${deviceState.mean_voltage_v} V` : '—'}
                </div>
              </div>
            </div>

            {/* Quick Testing Site Switcher */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 block">
                Switch Testing Site:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { id: 'GREAT_TOE_RIGHT', label: 'Right Great Toe' },
                  { id: 'GREAT_TOE_LEFT', label: 'Left Great Toe' },
                  { id: 'FIRST_MTH_RIGHT', label: 'Right 1st MTH' },
                  { id: 'FIRST_MTH_LEFT', label: 'Left 1st MTH' },
                  { id: 'MALLEOLUS_RIGHT', label: 'Right Malleolus' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleNextTrial(s.id)}
                    className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                      deviceState?.active_site === s.id
                        ? 'bg-cyan-600 text-white border-cyan-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
