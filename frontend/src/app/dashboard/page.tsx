'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Radio,
  FileText,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { getAnalyticsOverview, getParticipants, getVPTAlerts, acknowledgeVPTAlert } from '@/lib/api';
import { CohortAnalytics, Participant, VPTAlert } from '@/lib/types';
import { SeverityDistributionDonut } from '@/components/charts/SeverityDistributionDonut';
import { SiteComparisonBarChart } from '@/components/charts/SiteComparisonBarChart';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<CohortAnalytics | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [alerts, setAlerts] = useState<VPTAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [anData, pList, altList] = await Promise.all([
        getAnalyticsOverview(),
        getParticipants(),
        getVPTAlerts(),
      ]);
      setAnalytics(anData);
      setParticipants(pList);
      setAlerts(altList);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAckAlert = async (id: string) => {
    await acknowledgeVPTAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            Clinical Study Console &middot; Protocol QST-2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            VPT Research Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cohort quantitative sensory testing metrics, biothesiometry trials, and neuropathy staging
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/live-monitoring"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all hover:scale-[1.02]"
          >
            <Radio className="w-4 h-4" />
            <span>Launch Live Test</span>
          </Link>

          <Link
            href="/reference-estimation"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-bold transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
            <span>Reference Estimator</span>
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Subjects */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Enrolled Subjects</span>
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {analytics?.total_subjects ?? participants.length}
          </div>
          <p className="text-[11px] text-slate-400">
            {analytics?.total_sessions ?? 0} completed QST sessions
          </p>
        </div>

        {/* Mean Cohort VPT */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Mean Cohort VPT</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {analytics?.mean_cohort_vpt_v ?? 14.2} <span className="text-sm font-normal text-slate-400">V</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Hallux distal phalanx reference
          </p>
        </div>

        {/* Bilateral Asymmetry */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Bilateral Asymmetry</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {analytics?.mean_bilateral_asymmetry_v ?? 1.8} <span className="text-sm font-normal text-slate-400">V</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Alert trigger cutoff: &gt; 5.0 V discrepancy
          </p>
        </div>

        {/* Active Neuropathy Alerts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Alerts</span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
            {alerts.length}
          </div>
          <p className="text-[11px] text-slate-400">
            {alerts.filter(a => a.alert_level === 'CRITICAL').length} severe LOPS (≥25V)
          </p>
        </div>
      </div>

      {/* Critical Alerts Banner (if any) */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-3">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Active Quantitative Sensory Alerts ({alerts.length})
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alt) => (
              <div
                key={alt.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950 text-xs shadow-sm"
              >
                <div>
                  <span className="font-bold text-rose-700 dark:text-rose-400 mr-2">
                    [{alt.alert_type}]
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{alt.message}</span>
                </div>
                <button
                  onClick={() => handleAckAlert(alt.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                >
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cohort Severity Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Cohort Neuropathy Stratification
              </h2>
              <p className="text-xs text-slate-500">Distribution across international QST thresholds</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              Biothesiometer Scale
            </span>
          </div>

          <SeverityDistributionDonut
            data={
              analytics?.classification_breakdown ?? [
                { name: 'Preserved (<15V)', value: 4, color: '#10B981' },
                { name: 'Mild Blunting (15-19.9V)', value: 2, color: '#F59E0B' },
                { name: 'Moderate (20-24.9V)', value: 2, color: '#F97316' },
                { name: 'Severe LOPS (≥25V)', value: 1, color: '#EF4444' },
              ]
            }
            height={220}
          />
        </div>

        {/* Site Comparison */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Anatomical Site Sensitivity Comparison
              </h2>
              <p className="text-xs text-slate-500">Mean vibration perception threshold by anatomical site</p>
            </div>
            <span className="text-[11px] font-semibold text-cyan-600">Volts (RMS)</span>
          </div>

          <SiteComparisonBarChart
            data={
              analytics?.site_comparison ?? [
                { site: 'Great Toe', voltage_v: 14.2 },
                { site: '1st Metatarsal', voltage_v: 16.5 },
                { site: 'Medial Malleolus', voltage_v: 12.8 },
                { site: 'Index Finger', voltage_v: 4.8 },
              ]
            }
            height={220}
          />
        </div>
      </div>

      {/* Participants Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Enrolled Research Participants
            </h2>
            <p className="text-xs text-slate-500">Quantitative Sensory Testing trial records and status</p>
          </div>

          <Link
            href="/participants"
            className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700"
          >
            <span>View All Subjects</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Subject Code</th>
                <th className="px-4 py-3">Participant Name</th>
                <th className="px-4 py-3">Demographics</th>
                <th className="px-4 py-3">Clinical Cohort</th>
                <th className="px-4 py-3">Latest VPT (V)</th>
                <th className="px-4 py-3">Sensory Classification</th>
                <th className="px-4 py-3 rounded-r-lg">Ulcer Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {participants.slice(0, 5).map((p) => {
                let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300';
                if (p.latest_classification === 'SEVERE_LOPS') {
                  badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300';
                } else if (p.latest_classification === 'MODERATE_NEUROPATHY') {
                  badgeColor = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300';
                } else if (p.latest_classification === 'MILD_BLUNTING') {
                  badgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300';
                }

                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {p.subject_code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {p.full_name}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {p.age}y &middot; {p.gender[0]} &middot; {p.height_cm}cm
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {p.clinical_group.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {p.latest_vpt_voltage ? `${p.latest_vpt_voltage} V` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                        {p.latest_classification?.replace(/_/g, ' ') || 'NOT TESTED'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-bold ${
                          p.ulcer_risk_category === 'CRITICAL'
                            ? 'text-rose-600'
                            : p.ulcer_risk_category === 'HIGH'
                            ? 'text-orange-500'
                            : 'text-slate-500'
                        }`}
                      >
                        {p.ulcer_risk_category || 'LOW'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
