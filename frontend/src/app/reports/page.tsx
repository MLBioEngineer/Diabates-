'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Building,
  UserCheck,
  Calendar,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { getResearchReport, getParticipants, getExportCsvUrl, downloadClientSideCsv } from '@/lib/api';
import { ResearchReport, Participant } from '@/lib/types';

export default function ReportsPage() {
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadData = async (subId?: string) => {
    setLoading(true);
    try {
      const rep = await getResearchReport(subId);
      setReport(rep);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getParticipants().then((list) => {
      setParticipants(list);
      if (list.length > 0) {
        setSelectedSubId(list[0].id);
        loadData(list[0].id);
      } else {
        loadData();
      }
    });
  }, []);

  const handleParticipantChange = (id: string) => {
    setSelectedSubId(id);
    loadData(id);
  };

  const handleDownloadCsv = () => {
    if (report) {
      downloadClientSideCsv(report);
    } else {
      window.open(getExportCsvUrl(), '_blank');
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Action / Toolbar Header (Hidden during print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5 text-purple-500" />
            Standardized Clinical QST Trial Documentation
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Research Reports & Export
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publication-ready Quantitative Sensory Testing documentation, raw dataset export, and podiatric triage
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Select Participant */}
          <select
            value={selectedSubId}
            onChange={(e) => handleParticipantChange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
          >
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.subject_code} - {p.full_name}
              </option>
            ))}
          </select>

          {/* Export CSV */}
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV (R/SPSS)</span>
          </button>

          {/* Print Report */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all hover:scale-[1.02]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Printable Clinical Report Paper */}
      {report && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900 dark:border-white pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-black text-sm">
                  VPT
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  VPT Sense AI &middot; Clinical Research Consortium
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Quantitative Sensory Testing (QST) & Vibration Perception Threshold Report
              </p>
            </div>

            <div className="text-left sm:text-right space-y-0.5 text-xs text-slate-500">
              <p className="font-mono font-bold text-slate-900 dark:text-white">
                REPORT #{report.report_id}
              </p>
              <p>Protocol: QST-IRB-2026-X8</p>
              <p>Generated: {new Date(report.generated_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Subject Demographics Grid */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Subject Profile & Medical Stratification
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Subject Code</span>
                <span className="font-mono font-bold text-cyan-600 text-sm">{report.subject_code}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Full Name</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{report.full_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Demographics</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {report.age} yrs &middot; {report.gender} &middot; {report.height_cm} cm
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Body Mass Index</span>
                <span className="font-bold text-slate-900 dark:text-white">{report.bmi} kg/m²</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Clinical Cohort</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {report.clinical_group.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Diabetes Duration</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {report.diabetes_duration_years > 0 ? `${report.diabetes_duration_years} Years` : 'None'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Ulcer History</span>
                <span className={`font-bold ${report.foot_ulcer_history ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300'}`}>
                  {report.foot_ulcer_history ? 'Positive History' : 'Negative'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Instrument</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {report.device_name} ({report.frequency_hz} Hz)
                </span>
              </div>
            </div>
          </div>

          {/* Sensory Neuropathy Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[10px] uppercase font-bold text-slate-400">Mean Great Toe VPT</span>
              <div className="text-2xl font-black text-cyan-600 mt-1">
                {report.mean_vpt_v ? `${report.mean_vpt_v} V` : '—'}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Hallux reference site</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[10px] uppercase font-bold text-slate-400">Sensory Classification</span>
              <div
                className={`text-base font-black mt-2 ${
                  report.overall_classification === 'SEVERE_LOPS'
                    ? 'text-rose-600'
                    : report.overall_classification === 'MODERATE_NEUROPATHY'
                    ? 'text-orange-500'
                    : report.overall_classification === 'MILD_BLUNTING'
                    ? 'text-amber-500'
                    : 'text-emerald-600'
                }`}
              >
                {report.overall_classification.replace(/_/g, ' ')}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">International QST Standard</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[10px] uppercase font-bold text-slate-400">Diabetic Foot Ulcer Risk</span>
              <div
                className={`text-base font-black mt-2 ${
                  report.ulcer_risk_category === 'CRITICAL'
                    ? 'text-rose-600'
                    : report.ulcer_risk_category === 'HIGH'
                    ? 'text-orange-500'
                    : 'text-emerald-600'
                }`}
              >
                {report.ulcer_risk_category} RISK
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Asymmetry: {report.bilateral_asymmetry_v} V</p>
            </div>
          </div>

          {/* Triplicate Measurements Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Standardized Anatomical Site Trial Records
            </h3>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Anatomical Site</th>
                    <th className="px-4 py-3 font-mono">Trial 1 (V)</th>
                    <th className="px-4 py-3 font-mono">Trial 2 (V)</th>
                    <th className="px-4 py-3 font-mono">Trial 3 (V)</th>
                    <th className="px-4 py-3 font-mono">Mean ± SD</th>
                    <th className="px-4 py-3 font-mono">Normative Expected</th>
                    <th className="px-4 py-3 font-mono">Z-Score</th>
                    <th className="px-4 py-3">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {report.measurements.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {m.site}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                        {m.trial_1_v} V
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                        {m.trial_2_v} V
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                        {m.trial_3_v} V
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-cyan-600">
                        {m.mean_vpt_v} ± {m.sd_vpt_v} V
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">
                        {m.normative_expected_v} V
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">
                        {m.z_score > 0 ? `+${m.z_score}` : m.z_score}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {m.loss_grade.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Interpretation & Podiatric Advice */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Clinical Interpretation & Podiatric Triage:
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {report.clinical_notes}
            </p>
          </div>

          {/* Investigator Sign-off */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="text-slate-400 mb-8">Principal Investigator Sign-off:</p>
              <div className="border-b border-slate-400 w-48 mb-1" />
              <p className="font-bold text-slate-800 dark:text-white">Prof. Elena Rostova, MD, PhD</p>
              <p className="text-slate-500 text-[10px]">Metabolic Neurology Research Unit</p>
            </div>

            <div className="text-right">
              <p className="text-slate-400 mb-8">Clinical Center Verification:</p>
              <div className="border-b border-slate-400 w-48 ml-auto mb-1" />
              <p className="font-bold text-slate-800 dark:text-white">QST Lab Accreditation #ISO-13485</p>
              <p className="text-slate-500 text-[10px]">Automated Electronic Record</p>
            </div>
          </div>

          {/* Regulatory Disclaimer */}
          <p className="text-[10px] text-slate-400 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
            {report.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
