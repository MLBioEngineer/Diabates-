'use client';

import React, { useState } from 'react';
import {
  BrainCircuit,
  Activity,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { predictDiabetesRisk } from '@/lib/api';
import { RiskPredictionResult } from '@/lib/types';
import { SHAPWaterfallChart } from '@/components/ml/SHAPWaterfallChart';

export default function AssessmentPage() {
  const [formData, setFormData] = useState({
    pregnancies: 1,
    glucose: 125,
    blood_pressure: 75,
    skin_thickness: 26,
    insulin: 110,
    bmi: 29.5,
    diabetes_pedigree_function: 0.48,
    age: 42,
  });

  const [result, setResult] = useState<RiskPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clinical preset values
  const applyPreset = (type: 'HEALTHY' | 'PRE_DIABETES' | 'HIGH_RISK') => {
    if (type === 'HEALTHY') {
      setFormData({
        pregnancies: 0,
        glucose: 88,
        blood_pressure: 70,
        skin_thickness: 18,
        insulin: 60,
        bmi: 22.4,
        diabetes_pedigree_function: 0.22,
        age: 28,
      });
    } else if (type === 'PRE_DIABETES') {
      setFormData({
        pregnancies: 2,
        glucose: 115,
        blood_pressure: 78,
        skin_thickness: 28,
        insulin: 110,
        bmi: 28.6,
        diabetes_pedigree_function: 0.45,
        age: 45,
      });
    } else {
      setFormData({
        pregnancies: 4,
        glucose: 168,
        blood_pressure: 88,
        skin_thickness: 35,
        insulin: 190,
        bmi: 36.2,
        diabetes_pedigree_function: 0.85,
        age: 56,
      });
    }
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const prediction = await predictDiabetesRisk(formData);
      setResult(prediction);
    } catch (err: any) {
      setError(err.message || 'Risk assessment calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold">
          <BrainCircuit className="w-3.5 h-3.5" />
          Clinical Decision Support Module
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          AI Diabetes Risk Assessment Engine
        </h1>
        <p className="text-xs text-slate-500 max-w-3xl">
          Estimates the multi-year probability of Type 2 Diabetes based on validated metabolic biomarkers using a 
          cross-validated Random Forest ensemble with SHAP (SHapley Additive exPlanations).
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          Quick Clinical Presets:
        </span>
        <button
          type="button"
          onClick={() => applyPreset('HEALTHY')}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
        >
          Optimal / Low Risk
        </button>
        <button
          type="button"
          onClick={() => applyPreset('PRE_DIABETES')}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
        >
          Borderline / Pre-Diabetes
        </button>
        <button
          type="button"
          onClick={() => applyPreset('HIGH_RISK')}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors"
        >
          Metabolic Syndrome / High Risk
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            Patient Clinical Biomarkers
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Glucose */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Plasma Glucose (mg/dL) *
                </label>
                <input
                  type="number"
                  required
                  min={40}
                  max={400}
                  step="0.5"
                  value={formData.glucose}
                  onChange={(e) => setFormData({ ...formData, glucose: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Normal fasting: 70–99 mg/dL</span>
              </div>

              {/* BMI */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Body Mass Index (BMI, kg/m²) *
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  max={70}
                  step="0.1"
                  value={formData.bmi}
                  onChange={(e) => setFormData({ ...formData, bmi: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Healthy range: 18.5–24.9</span>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  required
                  min={18}
                  max={120}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Blood Pressure */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Diastolic Blood Pressure (mm Hg)
                </label>
                <input
                  type="number"
                  min={40}
                  max={160}
                  value={formData.blood_pressure}
                  onChange={(e) => setFormData({ ...formData, blood_pressure: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Optimal: &lt; 80 mm Hg</span>
              </div>

              {/* Insulin */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  2-Hour Serum Insulin (µU/ml)
                </label>
                <input
                  type="number"
                  min={5}
                  max={600}
                  value={formData.insulin}
                  onChange={(e) => setFormData({ ...formData, insulin: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Skinfold Thickness */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Triceps Skinfold (mm)
                </label>
                <input
                  type="number"
                  min={5}
                  max={99}
                  value={formData.skin_thickness}
                  onChange={(e) => setFormData({ ...formData, skin_thickness: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Pedigree Function */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Diabetes Pedigree Function
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0.05}
                  max={2.5}
                  value={formData.diabetes_pedigree_function}
                  onChange={(e) => setFormData({ ...formData, diabetes_pedigree_function: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Genetic lineage risk (0.1–2.0)</span>
              </div>

              {/* Pregnancies */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pregnancy Count
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={formData.pregnancies}
                  onChange={(e) => setFormData({ ...formData, pregnancies: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 disabled:opacity-50 transition-all shadow-md shadow-teal-600/25 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Evaluating Model & SHAP Attributions...' : 'Run Diabetes Risk Prediction'}
            </button>
          </form>
        </div>

        {/* Results & SHAP Explainer Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Model Output ({result.model_name})
                </span>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    result.risk_category === 'LOW'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : result.risk_category === 'MODERATE'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                  }`}
                >
                  {result.risk_category} RISK
                </span>
              </div>

              {/* Score Display */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center space-y-1">
                <p className="text-xs text-slate-500">Estimated Diabetes Probability</p>
                <p className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {result.risk_percentage}%
                </p>
                <p className="text-[11px] text-slate-400">Score: {result.risk_score.toFixed(4)}</p>
              </div>

              {/* SHAP Waterfall Chart */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-teal-600" />
                  SHAP Factor Attribution (Local Explainability)
                </h3>
                <SHAPWaterfallChart contributions={result.shap_contributions} />
              </div>

              {/* Clinical Guidance */}
              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-900 dark:text-teal-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-teal-600 shrink-0" />
                  Clinical Decision Support Summary
                </p>
                <p>{result.clinical_summary}</p>
              </div>

              {/* Regulatory Notice */}
              <p className="text-[10px] text-slate-400 italic">
                {result.disclaimer}
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/40 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 mx-auto flex items-center justify-center">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Awaiting Patient Clinical Input
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Fill in the metabolic biomarkers on the left or click a preset to generate predictive risk and SHAP factor attribution.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
