'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  Activity,
  AlertCircle,
  BrainCircuit,
  Info,
  Calendar,
  User
} from 'lucide-react';
import { getHealthReport, getExportCsvUrl } from '@/lib/api';
import { HealthReport } from '@/lib/types';
import { TimeInRangeDonut } from '@/components/charts/TimeInRangeDonut';

export default function ReportsPage() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const data = await getHealthReport();
        setReport(data);
      } catch (err) {
        console.error('Failed to load clinical report:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-500 text-sm">
        Compiling ambulatory glycemic metrics and generating clinical report...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-500 text-sm">
        Unable to load health report. Please verify connection to the backend.
      </div>
    );
  }

  const s = report.telemetry_statistics;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0">
      {/* Action Bar (hidden in print) */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Clinical Health Summary &amp; Export
          </h1>
          <p className="text-xs text-slate-500">
            Standardized Ambulatory Glucose Profile (AGP) report for patient consultations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
          <a
            href={getExportCsvUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download Raw CSV
          </a>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-xl space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
                GP
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                GlycoPulse AI Ambulatory Report
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Standardized Glycemic Quality Assessment &amp; Clinical Decision Support
            </p>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-1">
            <p><strong>Report ID:</strong> {report.report_id}</p>
            <p><strong>Generated:</strong> {new Date(report.generated_at).toLocaleString()}</p>
            <p><strong>Monitoring Period:</strong> {report.monitoring_period}</p>
          </div>
        </div>

        {/* Patient Demographics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
            <span className="font-semibold text-slate-900 dark:text-white">{report.patient_name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Identifier</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{report.patient_id.slice(0, 13)}...</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Diabetes Classification</span>
            <span className="font-semibold text-teal-600 dark:text-teal-400">{report.diabetes_type}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Readings Analyzed</span>
            <span className="font-semibold text-slate-900 dark:text-white">{s.readings_count} data points</span>
          </div>
        </div>

        {/* Key AGP Metrics Table */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Consensus Glycemic Metrics (ADA / EASD Benchmark)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Metric</th>
                    <th className="px-4 py-2.5">Patient Value</th>
                    <th className="px-4 py-2.5">Clinical Consensus Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Time in Range (TIR: 70–180 mg/dL)</td>
                    <td className="px-4 py-2.5 font-bold text-emerald-600">{s.time_in_range_percent}%</td>
                    <td className="px-4 py-2.5 text-slate-500">&gt; 70% of readings</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Time Below Range (TBR: &lt;70 mg/dL)</td>
                    <td className="px-4 py-2.5 font-bold text-rose-600">{s.time_below_range_percent}%</td>
                    <td className="px-4 py-2.5 text-slate-500">&lt; 4% (&lt;1% for Level 2)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Time Above Range (TAR: &gt;180 mg/dL)</td>
                    <td className="px-4 py-2.5 font-bold text-amber-600">{s.time_above_range_percent}%</td>
                    <td className="px-4 py-2.5 text-slate-500">&lt; 25%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Mean Interstitial Glucose</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{s.mean_glucose} mg/dL</td>
                    <td className="px-4 py-2.5 text-slate-500">Optimal: 90–130 mg/dL</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Glucose Management Indicator (GMI)</td>
                    <td className="px-4 py-2.5 font-bold text-teal-600">{s.glucose_management_indicator}%</td>
                    <td className="px-4 py-2.5 text-slate-500">&lt; 7.0% (individualized)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Glycemic Variability (%CV)</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{s.glycemic_variability_cv}%</td>
                    <td className="px-4 py-2.5 text-slate-500">≤ 36% (stable baseline)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center">
              <TimeInRangeDonut
                inRange={s.time_in_range_percent}
                belowRange={s.time_below_range_percent}
                aboveRange={s.time_above_range_percent}
                height={180}
              />
            </div>
          </div>
        </div>

        {/* Latest Machine Learning Risk Assessment */}
        {report.latest_risk_assessment && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-teal-600" />
                Integrated Machine Learning Diabetes Risk Profile
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                {report.latest_risk_assessment.risk_category} RISK ({report.latest_risk_assessment.risk_percentage}%)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {report.latest_risk_assessment.clinical_summary}
            </p>
          </div>
        )}

        {/* Automated Clinical Notes */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Automated Clinical Impressions
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            {report.clinical_notes}
          </p>
        </div>

        {/* Mandatory Medical Safety Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            Medical Disclaimer &amp; Verification Protocol
          </p>
          <p>{report.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
