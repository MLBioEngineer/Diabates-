'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Filter, Download, Droplet, Heart, Activity, Search, RefreshCw } from 'lucide-react';
import { getTelemetryHistory, getExportCsvUrl } from '@/lib/api';
import { TelemetryReading } from '@/lib/types';
import { ProvenanceBadge } from '@/components/telemetry/ProvenanceBadge';

export default function HistoryPage() {
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState(48);
  const [filterProvenance, setFilterProvenance] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getTelemetryHistory(hours);
      setReadings(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [hours]);

  const filtered = readings.filter((r) => {
    if (filterProvenance !== 'ALL' && r.provenance !== filterProvenance) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const dateStr = new Date(r.recorded_at).toLocaleString().toLowerCase();
      const glucoseStr = r.glucose_mg_dl.toString();
      return dateStr.includes(term) || glucoseStr.includes(term);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Ambulatory Audit Log
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Patient Telemetry History &amp; Records
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of continuous glucose readings and multi-parameter vital signs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={getExportCsvUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
          <button
            onClick={loadHistory}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search date, glucose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Provenance Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-medium">Provenance:</span>
          <select
            value={filterProvenance}
            onChange={(e) => setFilterProvenance(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Sources</option>
            <option value="SIMULATED">Simulated Only</option>
            <option value="DEXCOM_G7">Dexcom G7</option>
            <option value="ABBOTT_FREESTYLE">Abbott FreeStyle</option>
            <option value="MANUAL">Manual Logs</option>
          </select>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-medium">Period:</span>
          <select
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value))}
            className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value={12}>Last 12 Hours</option>
            <option value={24}>Last 24 Hours</option>
            <option value={48}>Last 48 Hours</option>
            <option value={168}>Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Glucose</th>
                <th className="px-5 py-3">Rate of Change</th>
                <th className="px-5 py-3">Heart Rate</th>
                <th className="px-5 py-3">Blood Pressure</th>
                <th className="px-5 py-3">SpO2</th>
                <th className="px-5 py-3">Steps</th>
                <th className="px-5 py-3">Data Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length > 0 ? (
                filtered.slice().reverse().map((r) => {
                  const isHypo = r.glucose_mg_dl < 70;
                  const isHyper = r.glucose_mg_dl > 180;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400 font-mono">
                        {new Date(r.recorded_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 font-bold">
                        <span
                          className={
                            isHypo
                              ? 'text-rose-600 dark:text-rose-400'
                              : isHyper
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-teal-600 dark:text-teal-400'
                          }
                        >
                          {r.glucose_mg_dl} mg/dL
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 font-mono">
                        {r.glucose_trend_velocity > 0 ? '+' : ''}
                        {r.glucose_trend_velocity} mg/dL/min
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        {r.heart_rate_bpm || 72} BPM
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        {r.blood_pressure_systolic}/{r.blood_pressure_diastolic}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        {r.spo2_percentage}%
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        {r.physical_activity_steps}
                      </td>
                      <td className="px-5 py-3">
                        <ProvenanceBadge provenance={r.provenance} size="sm" />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500">
                    No matching telemetry logs found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
