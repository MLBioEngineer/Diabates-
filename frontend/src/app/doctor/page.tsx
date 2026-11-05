'use client';

import React, { useEffect, useState } from 'react';
import {
  Stethoscope,
  Users,
  AlertTriangle,
  Activity,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  X,
  FileText
} from 'lucide-react';
import { getDoctorPatientRoster, getPatientClinicalDetails } from '@/lib/api';
import { DoctorPatientSummary } from '@/lib/types';
import { GlucoseTrendChart } from '@/components/charts/GlucoseTrendChart';

export default function DoctorDashboard() {
  const [roster, setRoster] = useState<DoctorPatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    async function loadRoster() {
      try {
        const data = await getDoctorPatientRoster();
        setRoster(data);
      } catch (err) {
        console.error('Failed to load clinician roster:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRoster();
  }, []);

  const openPatientDetails = async (patientId: string) => {
    setModalLoading(true);
    try {
      const details = await getPatientClinicalDetails(patientId);
      setSelectedPatient(details);
    } catch (err) {
      console.error('Failed to load patient drilldown:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const filtered = roster.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return p.full_name.toLowerCase().includes(term) || p.email.toLowerCase().includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Clinician Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Stethoscope className="w-3.5 h-3.5" />
            Healthcare Provider Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Clinician Patient Roster &amp; Risk Triage
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Multi-patient cohort monitoring, ambulatory glycemic stability triage, and early warning surveillance
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Monitored Cohort</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-base">
              {roster.length} Active Patients
            </span>
          </div>
        </div>
      </div>

      {/* Triage Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patient name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Cohort Triage Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Patient Name</th>
                <th className="px-5 py-3">Classification</th>
                <th className="px-5 py-3">Current Glucose</th>
                <th className="px-5 py-3">Time in Range</th>
                <th className="px-5 py-3">AI Risk Assessment</th>
                <th className="px-5 py-3">Active Alerts</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((p) => {
                const isHypo = (p.latest_glucose || 0) < 70 && p.latest_glucose !== null;
                const isHyper = (p.latest_glucose || 0) > 180;

                return (
                  <tr key={p.patient_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{p.full_name}</p>
                      <p className="text-[11px] text-slate-400">{p.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {p.diabetes_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.latest_glucose ? (
                        <span
                          className={`font-bold ${
                            isHypo
                              ? 'text-rose-600 dark:text-rose-400'
                              : isHyper
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {p.latest_glucose} mg/dL
                        </span>
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {p.time_in_range_percent}%
                        </span>
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${p.time_in_range_percent}%` }}
                            className="bg-emerald-500 h-full rounded-full"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                          p.risk_category === 'LOW'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : p.risk_category === 'MODERATE'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : p.risk_category === 'HIGH' || p.risk_category === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {p.risk_category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.active_alerts_count > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                          <AlertTriangle className="w-3 h-3" />
                          {p.active_alerts_count} Unack
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Nominal
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openPatientDetails(p.patient_id)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 hover:bg-teal-100 transition-colors"
                      >
                        Review Charts
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Drilldown Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedPatient.full_name} — Clinical Telemetry Review
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedPatient.email} • {selectedPatient.diabetes_type}
                </p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px]">Time in Range (TIR)</span>
                <span className="text-base font-bold text-emerald-600">
                  {selectedPatient.statistics_48h.time_in_range_percent}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px]">Estimated A1c (GMI)</span>
                <span className="text-base font-bold text-teal-600">
                  {selectedPatient.statistics_48h.glucose_management_indicator}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px]">Variability (%CV)</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedPatient.statistics_48h.glycemic_variability_cv}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px]">Mean Glucose</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedPatient.statistics_48h.mean_glucose} mg/dL
                </span>
              </div>
            </div>

            {/* Continuous Waveform */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Continuous Waveform (Last 48 Hours)
              </h4>
              <GlucoseTrendChart data={selectedPatient.recent_readings} height={280} />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                Close Clinical Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
