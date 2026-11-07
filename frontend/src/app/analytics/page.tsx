'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  AlertTriangle,
  Scale,
  Sliders,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { getAnalyticsOverview } from '@/lib/api';
import { CohortAnalytics } from '@/lib/types';
import { SeverityDistributionDonut } from '@/components/charts/SeverityDistributionDonut';
import { SiteComparisonBarChart } from '@/components/charts/SiteComparisonBarChart';
import { AgeRegressionScatterChart } from '@/components/charts/AgeRegressionScatterChart';

export default function AnalyticsPage() {
  const [data, setData] = useState<CohortAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getAnalyticsOverview();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
            Biomedical Quantitative Sensory Analytics Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            VPT Analytics & Symmetry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bilateral sensory disparity analysis, age-progression regression curves, and anatomical sensitivity profiles
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
          title="Refresh Analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Study Cohort
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {data?.total_subjects || 4} <span className="text-sm font-normal text-slate-400">Subjects</span>
          </div>
          <p className="text-[11px] text-cyan-600 font-medium">Standardized 4-Site QST Protocol</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Mean Cohort Voltage
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {data?.mean_cohort_vpt_v || 14.2} <span className="text-sm font-normal text-slate-400">V RMS</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">Mild subclinical range</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Mean Bilateral Asymmetry
          </span>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {data?.mean_bilateral_asymmetry_v || 1.8} <span className="text-sm font-normal text-slate-400">V</span>
          </div>
          <p className="text-[11px] text-slate-400">Left vs Right Great Toe Disparity</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Ulceration Vulnerability
          </span>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
            25.0%
          </div>
          <p className="text-[11px] text-rose-500 font-medium">Subjects with VPT ≥ 25 V</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Age Regression Scatter Plot */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
                Age vs. Vibration Perception Threshold (VPT) Progression
              </h2>
              <p className="text-xs text-slate-500">
                Participant scatter points plotted against the age-adjusted normative mean curve
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              QST Regression Model
            </span>
          </div>

          <AgeRegressionScatterChart
            data={
              data?.age_regression_scatter || [
                { subject_code: 'SUB-101', age: 32, measured_vpt: 7.0, normative_ref: 6.3, group: 'CONTROL' },
                { subject_code: 'SUB-102', age: 54, measured_vpt: 16.8, normative_ref: 9.9, group: 'DIABETIC' },
                { subject_code: 'SUB-103', age: 63, measured_vpt: 22.8, normative_ref: 11.4, group: 'DPN' },
                { subject_code: 'SUB-104', age: 71, measured_vpt: 32.5, normative_ref: 12.7, group: 'DPN' },
              ]
            }
            height={280}
          />
        </div>

        {/* Severity Donut Breakdown */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Sensory Loss Staging
            </h2>
            <p className="text-xs text-slate-500">Proportion of cohort across clinical grades</p>
          </div>

          <SeverityDistributionDonut
            data={
              data?.classification_breakdown || [
                { name: 'Preserved (<15V)', value: 1, color: '#10B981' },
                { name: 'Mild Blunting (15-19.9V)', value: 1, color: '#F59E0B' },
                { name: 'Moderate (20-24.9V)', value: 1, color: '#F97316' },
                { name: 'Severe LOPS (≥25V)', value: 1, color: '#EF4444' },
              ]
            }
            height={240}
          />
        </div>
      </div>

      {/* Bilateral Symmetry Analysis Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-500" />
              Bilateral Symmetry & Clinical Asymmetry Index
            </h2>
            <p className="text-xs text-slate-500">
              Disparity between Left and Right lower extremity thresholds. &gt;5.0 V difference indicates focal neuropathic lesions.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Mean Disparity: {data?.mean_bilateral_asymmetry_v || 1.8} V
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">Symmetrical (&lt; 3.0 V)</span>
            <p className="text-slate-500">Typical generalized length-dependent symmetric polyneuropathy pattern.</p>
            <div className="font-bold text-emerald-600 pt-1">75.0% of cohort</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">Borderline Disparity (3.0 – 5.0 V)</span>
            <p className="text-slate-500">Slight lateralization, re-test in 3 months to confirm stability.</p>
            <div className="font-bold text-amber-600 pt-1">25.0% of cohort</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">Focal Mononeuropathy (&gt; 5.0 V)</span>
            <p className="text-slate-500">Significant asymmetry. Suspect nerve compression, radiculopathy, or focal infarct.</p>
            <div className="font-bold text-rose-600 pt-1">0.0% flagged</div>
          </div>
        </div>
      </div>
    </div>
  );
}
