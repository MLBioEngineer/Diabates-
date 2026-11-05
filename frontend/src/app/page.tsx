import React from 'react';
import Link from 'next/link';
import {
  Activity,
  BrainCircuit,
  ShieldCheck,
  Radio,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Stethoscope,
  Heart,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
          <BrainCircuit className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          Rigorous Machine Learning & Continuous Glucose Telemetry Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
          AI-Powered Diabetes Risk Prediction &{' '}
          <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
            Real-Time Health Monitoring
          </span>
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Predict multi-year metabolic risk using cross-validated machine learning with SHAP explainability.
          Monitor real-time continuous glucose (CGM) telemetry with early warning thresholds and clinician triage.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/assessment"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-lg shadow-teal-600/25 transition-all"
          >
            Assess Diabetes Risk Now
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 font-semibold text-sm shadow-sm transition-all"
          >
            Launch Patient Dashboard
          </Link>
          <Link
            href="/doctor"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all"
          >
            <Stethoscope className="w-4 h-4 text-teal-600" />
            Clinician Portal
          </Link>
        </div>

        {/* Clinical Disclaimer Banner */}
        <div className="pt-6">
          <p className="text-xs text-slate-500 max-w-xl mx-auto italic">
            * Designed as an academic Clinical Decision Support System prototype. Clearly differentiates simulated sensor streams from hardware-connected Continuous Glucose Monitors.
          </p>
        </div>
      </section>

      {/* Core Architectural Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Comprehensive Biomedical Architecture
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Engineered to bridge predictive machine learning with live physiological telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Benchmarked ML Risk Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Trained across 5 algorithms (Logistic Regression, Random Forest, XGBoost, SVM, LightGBM) with KNN missing value imputation, Stratified 5-Fold Cross Validation, and SHAP factor attribution.
            </p>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                Random Forest Selected: 82.5% Clinical Sensitivity
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                Local SHAP Waterfall Explanations
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Live Continuous Glucose (CGM)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Low-latency WebSocket telemetry hub with Bergman-inspired physiological simulation, meal postprandial spikes, diurnal circadian rhythms, and ADA threshold warning rules.
            </p>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Time-in-Range (TIR 70-180 mg/dL) Tracking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Hypoglycemia Alert Trigger (&lt;70 &amp; &lt;54 mg/dL)
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              CGM Device Integration Layer
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Standardized architectural driver adapters for Dexcom API v3 (OAuth2 Egv) and Abbott FreeStyle LibreView webhooks with verifiable provenance tagging.
            </p>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                Strict Data Provenance Tagging
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                No Fabricated Hardware Telemetry
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Quick-Start CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-lg">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Explore Clinical Telemetry?
            </h3>
            <p className="text-sm text-teal-100 leading-relaxed">
              Sign in with one-click demo credentials as a patient or doctor to interact with live streaming sensors, AI risk assessments, and clinical export reports.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-white text-teal-900 font-bold text-sm hover:bg-teal-50 transition-colors shadow-md text-center"
            >
              Demo Patient Portal
            </Link>
            <Link
              href="/doctor"
              className="px-6 py-3 rounded-xl bg-teal-900/60 border border-teal-500/40 text-white font-bold text-sm hover:bg-teal-900 transition-colors text-center"
            >
              Doctor Triage View
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
