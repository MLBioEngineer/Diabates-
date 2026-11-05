'use client';

import React, { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Radio,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Key,
  Save,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    fullName: 'Sarah Jenkins',
    email: 'patient@demo.com',
    diabetesType: 'PRE_DIABETES',
    heightCm: 168,
    weightKg: 72.5,
  });

  const [thresholds, setThresholds] = useState({
    hypoCritical: 54,
    hypoWarning: 70,
    targetLow: 70,
    targetHigh: 180,
    hyperWarning: 180,
    hyperCritical: 250,
  });

  const [cgmSettings, setCgmSettings] = useState({
    activeSource: 'SIMULATED', // 'SIMULATED', 'DEXCOM_G7', 'ABBOTT_FREESTYLE'
    dexcomClientId: 'dx_prod_demo_491028',
    dexcomConnected: false,
    abbottSensorSerial: 'LIBRE3-US-98124',
    abbottConnected: false,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold">
          <Settings className="w-3.5 h-3.5" />
          System Preferences &amp; Integration Hub
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          Profile, Alert Thresholds &amp; Device Pairing
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure clinical boundaries, patient biometrics, and CGM hardware cloud adapters
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings successfully updated and persisted across telemetry pipeline.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Patient Biometrics */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            Patient Biometric Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Diabetes Classification
              </label>
              <select
                value={profile.diabetesType}
                onChange={(e) => setProfile({ ...profile, diabetesType: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="NONE">None / Screening</option>
                <option value="PRE_DIABETES">Pre-Diabetes / Impaired Glucose</option>
                <option value="TYPE_1">Type 1 Diabetes</option>
                <option value="TYPE_2">Type 2 Diabetes</option>
                <option value="GESTATIONAL">Gestational Diabetes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Alert Thresholds */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-600" />
              Configurable Notification &amp; Anomaly Thresholds (mg/dL)
            </h2>
            <span className="text-[10px] text-slate-400">ADA Clinical Standard</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
                Critical Hypoglycemia (&lt;=)
              </label>
              <input
                type="number"
                value={thresholds.hypoCritical}
                onChange={(e) => setThresholds({ ...thresholds, hypoCritical: parseInt(e.target.value) || 54 })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Level 2 Emergency (54 mg/dL)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                Target Glycemic Range (TIR)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={thresholds.targetLow}
                  onChange={(e) => setThresholds({ ...thresholds, targetLow: parseInt(e.target.value) || 70 })}
                  className="w-1/2 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="number"
                  value={thresholds.targetHigh}
                  onChange={(e) => setThresholds({ ...thresholds, targetHigh: parseInt(e.target.value) || 180 })}
                  className="w-1/2 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <span className="text-[10px] text-slate-400">Target Range (70–180 mg/dL)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                Hyperglycemia Warning (&gt;)
              </label>
              <input
                type="number"
                value={thresholds.hyperWarning}
                onChange={(e) => setThresholds({ ...thresholds, hyperWarning: parseInt(e.target.value) || 180 })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 text-slate-900 dark:text-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Postprandial elevation (180 mg/dL)</span>
            </div>
          </div>
        </div>

        {/* Section 3: Continuous Glucose Monitoring (CGM) Hardware Integration */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-teal-600" />
              Continuous Glucose Monitor (CGM) Integration Architecture
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your telemetry data source. The platform strictly enforces data provenance transparency.
            </p>
          </div>

          {/* Source Selector Radio Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Simulated */}
            <div
              onClick={() => setCgmSettings({ ...cgmSettings, activeSource: 'SIMULATED' })}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                cgmSettings.activeSource === 'SIMULATED'
                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 ring-2 ring-teal-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Cpu className="w-5 h-5 text-teal-600" />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                  Active
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Physiological Simulator</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Generates realistic circadian, meal, and exercise patterns (Bergman Minimal Model).
              </p>
            </div>

            {/* Dexcom G7 */}
            <div
              onClick={() => setCgmSettings({ ...cgmSettings, activeSource: 'DEXCOM_G7' })}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                cgmSettings.activeSource === 'DEXCOM_G7'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Radio className="w-5 h-5 text-emerald-600" />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Driver Ready
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Dexcom API v3 (G6 / G7)</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                OAuth2 Egv authentication driver for authorized personal Dexcom account pairing.
              </p>
            </div>

            {/* Abbott Libre */}
            <div
              onClick={() => setCgmSettings({ ...cgmSettings, activeSource: 'ABBOTT_FREESTYLE' })}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                cgmSettings.activeSource === 'ABBOTT_FREESTYLE'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Driver Ready
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Abbott FreeStyle Libre</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                LibreView cloud webhook integration driver for Libre 2 and Libre 3 sensors.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p>
              When a hardware provider is selected, the platform connects to authorized developer endpoints. In research prototype mode, telemetry packets are clearly stamped with their verified provenance tag to protect against false clinical attribution.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/25 transition-all"
          >
            <Save className="w-4 h-4" />
            Save System Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
