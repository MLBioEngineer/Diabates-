'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Cpu,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Zap,
  ShieldCheck,
  Usb,
  Bluetooth
} from 'lucide-react';
import { getDeviceSettings, updateDeviceSettings } from '@/lib/api';
import { DeviceSettings } from '@/lib/types';

export default function DeviceSettingsPage() {
  const [settings, setSettings] = useState<DeviceSettings>({
    device_name: 'Digital Biothesiometer Pro-V',
    serial_number: 'BIO-THESIO-2026-X8',
    port_mode: 'SIMULATOR',
    frequency_hz: 100,
    ramp_rate_v_per_sec: 1.0,
    max_voltage_safety_v: 50.0,
    contact_force_target_g: 22.5,
    calibration_status: 'CALIBRATED_ISO13485',
    is_active: true,
  });

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    getDeviceSettings().then((cfg) => {
      if (cfg) setSettings(cfg);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDeviceSettings(settings);
      setStatusMsg('Biothesiometer instrument parameters successfully synchronized.');
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to update device settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <Sliders className="w-3.5 h-3.5 text-rose-500" />
            Biothesiometer Calibration & Hardware Interface
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Device Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure electromagnetic oscillating probe frequency, voltage ramp rates, and contact pressure transducer
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            {settings.calibration_status}
          </span>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Hardware Interface Mode Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-600" />
            Instrument Communication Interface
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Simulator Mode */}
            <label
              className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between space-y-2 transition-all ${
                settings.port_mode === 'SIMULATOR'
                  ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-100 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-cyan-600" />
                  Software Simulator
                </span>
                <input
                  type="radio"
                  name="port_mode"
                  checked={settings.port_mode === 'SIMULATOR'}
                  onChange={() => setSettings({ ...settings, port_mode: 'SIMULATOR' })}
                  className="accent-cyan-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Generates realistic 0-50V voltage ramping and transducer response. Zero hardware required.
              </p>
            </label>

            {/* Web Serial API (USB) */}
            <label
              className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between space-y-2 transition-all ${
                settings.port_mode === 'WEB_SERIAL'
                  ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-100 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <Usb className="w-4 h-4 text-indigo-600" />
                  Web Serial (USB COM)
                </span>
                <input
                  type="radio"
                  name="port_mode"
                  checked={settings.port_mode === 'WEB_SERIAL'}
                  onChange={() => setSettings({ ...settings, port_mode: 'WEB_SERIAL' })}
                  className="accent-cyan-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Direct RS232 / USB connection to physical Biothesiometer or Neurothesiometer devices.
              </p>
            </label>

            {/* Web Bluetooth */}
            <label
              className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between space-y-2 transition-all ${
                settings.port_mode === 'WEB_BLUETOOTH'
                  ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-100 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <Bluetooth className="w-4 h-4 text-blue-600" />
                  Bluetooth Low Energy
                </span>
                <input
                  type="radio"
                  name="port_mode"
                  checked={settings.port_mode === 'WEB_BLUETOOTH'}
                  onChange={() => setSettings({ ...settings, port_mode: 'WEB_BLUETOOTH' })}
                  className="accent-cyan-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Connects to wireless digital biothesiometer probes (GATT Nordic UART profile).
              </p>
            </label>
          </div>
        </div>

        {/* Electromagnetic Oscillator & Ramping Parameters */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Vibration Oscillator & Safety Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Frequency Selection */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tuning Fork Oscillation Frequency
              </label>
              <select
                value={settings.frequency_hz}
                onChange={(e) => setSettings({ ...settings, frequency_hz: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value={100}>100 Hz (European / Standard QST Calibration)</option>
                <option value={120}>120 Hz (North American 60Hz 2nd Harmonic)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Calibrated resonant frequency of the electromagnetic tactor rod.
              </p>
            </div>

            {/* Ramp Rate */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Voltage Ramp Speed
              </label>
              <select
                value={settings.ramp_rate_v_per_sec}
                onChange={(e) => setSettings({ ...settings, ramp_rate_v_per_sec: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value={0.5}>0.5 V/s (High-Precision Research Thresholding)</option>
                <option value={1.0}>1.0 V/s (Standard Clinical Screening Ramp)</option>
                <option value={2.0}>2.0 V/s (Rapid Clinical Screening)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Rate of voltage amplitude increment during testing trials.
              </p>
            </div>

            {/* Safety Voltage Ceiling */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Max Safety Voltage Limit (Volts RMS)
              </label>
              <input
                type="number"
                min="30"
                max="50"
                value={settings.max_voltage_safety_v}
                onChange={(e) => setSettings({ ...settings, max_voltage_safety_v: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Automatic safety shutdown ceiling (default 50.0 V).
              </p>
            </div>

            {/* Contact Force Sensor Target */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Contact Force (Grams)
              </label>
              <input
                type="number"
                step="0.5"
                min="15"
                max="35"
                value={settings.contact_force_target_g}
                onChange={(e) => setSettings({ ...settings, contact_force_target_g: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Standard probe pressure on cutaneous surface (20.0 - 25.0 g).
              </p>
            </div>
          </div>
        </div>

        {/* Device Information & Calibration Card */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Instrument Identifier: <strong className="font-mono text-cyan-600">{settings.serial_number}</strong>
            </span>
            <span className="text-[10px] text-slate-400">Firmware: v2.4-QST</span>
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Compliant with ISO 13485 medical device quality standard. Tactor amplitude is factory-calibrated 
            such that 1.0 V corresponds to ~0.5 μm peak-to-peak displacement at 100 Hz.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
