'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Radio,
  Users,
  BarChart3,
  FileText,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  Activity,
  Layers,
  Award
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-bold tracking-wide uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            Biomedical Quantitative Sensory Testing (QST) Suite
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Vibration Perception Threshold{' '}
            <span className="bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
              Research Platform
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            <strong>VPT Sense AI</strong> is a research-grade platform dedicated to Quantitative Sensory Testing (QST).
            Accelerate research into diabetic peripheral neuropathy, evaluate large myelinated A-beta nerve fiber function,
            and monitor real-time biothesiometer voltage oscillations with normative AI reference estimation.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm shadow-lg shadow-cyan-600/25 transition-all hover:scale-[1.02]"
            >
              <span>Launch Research Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/reference-estimation"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span>VPT Reference Estimation</span>
            </Link>

            <Link
              href="/live-monitoring"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm transition-all"
            >
              <Radio className="w-4 h-4 text-emerald-500" />
              <span>Live Device Monitor</span>
            </Link>
          </div>

          {/* Hero Feature Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 text-left">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 uppercase">Stimulus Range</span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">0 – 50 Volts</div>
              <p className="text-[11px] text-slate-400 mt-1">100Hz / 120Hz oscillating probe</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 uppercase">Ulcer Risk Cutoff</span>
              <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">≥ 25.0 V</div>
              <p className="text-[11px] text-slate-400 mt-1">Loss of protective sensation (LOPS)</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 uppercase">Normative Model</span>
              <div className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-0.5">Age & Height</div>
              <p className="text-[11px] text-slate-400 mt-1">95th percentile Upper Limit of Normal</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 uppercase">QST Protocol</span>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">6-Point Bilateral</div>
              <p className="text-[11px] text-slate-400 mt-1">Hallux, 1st MTH & Malleolus</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Integrated Research Architecture
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Engineered for clinical diabetologists, podiatrists, and biomedical investigators conducting sensory neuropathy trials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Reference Estimation */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              VPT Reference Estimation
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Biomedical regression model predicting expected vibration thresholds across age, height, and anatomical site. 
              Computes Z-scores, percentiles, and individual feature contributions.
            </p>
            <Link
              href="/reference-estimation"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700"
            >
              <span>Explore Estimator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 2. Live Device Monitoring */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Live Device Monitoring
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-time interface simulating digital biothesiometer voltage ramping (0–50V) at 100/120Hz.
              Captures perceptual sensation points, probe contact force (20-25g), and triplicate trials.
            </p>
            <Link
              href="/live-monitoring"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <span>Launch Device Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3. Participant Management */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Participant Management
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Manage clinical research cohorts across Healthy Controls, Diabetic Non-Neuropathic, Established DPN, and CIPN.
              Track past sessions, ulcer histories, and symptom scores.
            </p>
            <Link
              href="/participants"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              <span>Manage Subjects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4. VPT Analytics */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              VPT Analytics & Symmetry
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Analyze bilateral Left vs Right disparity (&gt;5V asymmetry alerts), site-wise sensitivity profiles, 
              and age-matched regression scatter against normative reference curves.
            </p>
            <Link
              href="/analytics"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 5. Research Reports */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Research Reports & Export
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Standardized trial documentation formatted for print and PDF export. Includes triplicate means,
              Z-scores, ulcer risk stratification, and raw CSV download for SPSS/R.
            </p>
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700"
            >
              <span>Generate Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 6. Device Settings */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Device Settings & Calibration
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Configure biothesiometer driver parameters: oscillation frequency (100Hz/120Hz), voltage ramping speeds,
              contact force targets, and hardware serial communication modes.
            </p>
            <Link
              href="/device-settings"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              <span>Configure Device</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Clinical Risk Stratification Standards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Clinical Standards</span>
              <h3 className="text-xl font-bold mt-1">Quantitative Sensory Neuropathy Grading Scale</h3>
            </div>
            <span className="text-xs text-slate-400">Based on International Consensus on the Diabetic Foot</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">Preserved Sensation</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">&lt; 15.0 V</span>
              </div>
              <p className="text-xs text-slate-300">Intact large A-beta mechanoreceptor function. Baseline annual follow-up.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">Mild Sensory Blunting</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">15.0 – 19.9 V</span>
              </div>
              <p className="text-xs text-slate-300">Early subclinical large-fiber impairment. Recommend 6-month re-testing.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-orange-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-400">Moderate Neuropathy</span>
                <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">20.0 – 24.9 V</span>
              </div>
              <p className="text-xs text-slate-300">Clinically significant hypesthesia. Pressure-relieving diabetic footwear indicated.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400">Severe LOPS</span>
                <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">≥ 25.0 V</span>
              </div>
              <p className="text-xs text-slate-300">Loss of protective sensation. 7.8x relative risk of neuropathic foot ulceration.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
