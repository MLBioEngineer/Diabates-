'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  HelpCircle,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { estimateVPTReference } from '@/lib/api';
import { VPTEstimationOutput, VPTEstimationInput } from '@/lib/types';

export default function ReferenceEstimationPage() {
  const [formData, setFormData] = useState<VPTEstimationInput>({
    age: 52,
    gender: 'MALE',
    height_cm: 175.0,
    weight_kg: 78.0,
    anatomical_site: 'GREAT_TOE_RIGHT',
    measured_vpt_v: 16.5,
  });

  const [result, setResult] = useState<VPTEstimationOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateEstimation = async (overrideData?: VPTEstimationInput) => {
    setLoading(true);
    try {
      const res = await estimateVPTReference(overrideData || formData);
      setResult(res);
    } catch (err) {
      console.error('Error calculating VPT estimation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateEstimation();
  }, []);

  const handlePreset = (preset: 'YOUNG' | 'MIDDLE' | 'ELDERLY_LOPS') => {
    let presetData: VPTEstimationInput;
    if (preset === 'YOUNG') {
      presetData = {
        age: 28,
        gender: 'FEMALE',
        height_cm: 165.0,
        weight_kg: 60.0,
        anatomical_site: 'GREAT_TOE_RIGHT',
        measured_vpt_v: 7.2,
      };
    } else if (preset === 'MIDDLE') {
      presetData = {
        age: 54,
        gender: 'MALE',
        height_cm: 176.0,
        weight_kg: 82.0,
        anatomical_site: 'GREAT_TOE_RIGHT',
        measured_vpt_v: 17.5,
      };
    } else {
      presetData = {
        age: 72,
        gender: 'MALE',
        height_cm: 182.0,
        weight_kg: 94.0,
        anatomical_site: 'GREAT_TOE_RIGHT',
        measured_vpt_v: 32.0,
      };
    }
    setFormData(presetData);
    calculateEstimation(presetData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            Biomedical Normative QST Reference Model
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            VPT Reference Estimation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Age, height, and anatomical site-adjusted normative vibration perception threshold estimation
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Presets:</span>
          <button
            onClick={() => handlePreset('YOUNG')}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
          >
            Normal (28y)
          </button>
          <button
            onClick={() => handlePreset('MIDDLE')}
            className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 hover:bg-amber-100"
          >
            Mild (54y)
          </button>
          <button
            onClick={() => handlePreset('ELDERLY_LOPS')}
            className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800 hover:bg-rose-100"
          >
            Severe LOPS (72y)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-600" />
            Participant Parameters
          </h2>

          <div className="space-y-4 text-xs">
            {/* Age */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Age: <span className="text-cyan-600 font-black">{formData.age} years</span>
              </label>
              <input
                type="range"
                min="18"
                max="90"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full accent-cyan-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>18 yrs</span>
                <span>50 yrs</span>
                <span>90 yrs</span>
              </div>
            </div>

            {/* Height */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Height: <span className="text-cyan-600 font-black">{formData.height_cm} cm</span>
                <span className="text-[10px] text-slate-400 font-normal ml-2">
                  (Axonal length factor)
                </span>
              </label>
              <input
                type="range"
                min="140"
                max="210"
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: Number(e.target.value) })}
                className="w-full accent-cyan-600"
              />
            </div>

            {/* Gender & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Biological Sex
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="35"
                  max="200"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Anatomical Site */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Testing Anatomical Site
              </label>
              <select
                value={formData.anatomical_site}
                onChange={(e) => setFormData({ ...formData, anatomical_site: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="GREAT_TOE_RIGHT">Great Toe (Hallux) Right</option>
                <option value="GREAT_TOE_LEFT">Great Toe (Hallux) Left</option>
                <option value="FIRST_MTH_RIGHT">1st Metatarsal Head (Plantar) Right</option>
                <option value="FIRST_MTH_LEFT">1st Metatarsal Head (Plantar) Left</option>
                <option value="MALLEOLUS_RIGHT">Medial Malleolus Right</option>
                <option value="MALLEOLUS_LEFT">Medial Malleolus Left</option>
                <option value="INDEX_FINGER_R">Index Fingertip (Upper Limb Control)</option>
              </select>
            </div>

            {/* Measured Voltage */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Actual Measured VPT Voltage (Volts RMS)
                <span className="text-[10px] text-cyan-600 ml-1 font-semibold">(Optional)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  placeholder="e.g. 16.5"
                  value={formData.measured_vpt_v ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      measured_vpt_v: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                />
                <span className="text-slate-400 font-bold">Volts</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Enter trial reading to compute Z-score, percentile, and ulcer risk multiplier.
              </p>
            </div>

            <button
              onClick={() => calculateEstimation()}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/25 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Recalculate Normative Target</span>
            </button>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <>
              {/* Primary Reference Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-4">
                  <div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      Reference Normative Interval
                    </span>
                    <h3 className="text-lg font-extrabold mt-0.5">
                      Estimated Normal Threshold Target
                    </h3>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                    QST 95% Confidence Interval
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Expected Mean</span>
                    <div className="text-2xl font-black text-white mt-1">
                      {result.expected_mean_vpt_v} <span className="text-xs font-normal text-slate-400">V</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">95% Upper Limit (ULN)</span>
                    <div className="text-2xl font-black text-rose-400 mt-1">
                      {result.upper_limit_normal_95_v} <span className="text-xs font-normal text-slate-400">V</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">5% Lower Limit (LLN)</span>
                    <div className="text-2xl font-black text-emerald-400 mt-1">
                      {result.lower_limit_normal_5_v} <span className="text-xs font-normal text-slate-400">V</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Cohort SD (σ)</span>
                    <div className="text-2xl font-black text-cyan-400 mt-1">
                      ±{result.standard_deviation_v} <span className="text-xs font-normal text-slate-400">V</span>
                    </div>
                  </div>
                </div>

                {/* Measured Voltage Evaluation (if provided) */}
                {result.measured_vpt_v !== null && result.measured_vpt_v !== undefined && (
                  <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">
                        Evaluated Reading: <strong className="text-white">{result.measured_vpt_v} V</strong>
                      </span>
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          result.sensory_classification === 'SEVERE_LOPS'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : result.sensory_classification === 'MODERATE_LOSS'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                            : result.sensory_classification === 'MILD_BLUNTING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {result.sensory_classification.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-slate-900/60">
                        <span className="text-[10px] text-slate-400">Z-Score</span>
                        <div className="font-mono font-bold text-white text-base">
                          {result.z_score !== null && result.z_score !== undefined
                            ? result.z_score > 0 ? `+${result.z_score}` : result.z_score
                            : '—'}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60">
                        <span className="text-[10px] text-slate-400">Percentile Rank</span>
                        <div className="font-mono font-bold text-cyan-400 text-base">
                          {result.percentile_rank}%
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60">
                        <span className="text-[10px] text-slate-400">Foot Ulcer Risk</span>
                        <div className="font-mono font-bold text-rose-400 text-base">
                          {result.ulceration_risk_multiplier}x
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Explainability Breakdown (Feature Impacts) */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-600" />
                    Biomedical Contributing Factors
                  </h3>
                  <span className="text-[11px] text-slate-400">Impact on Baseline Voltage</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.feature_impacts.map((f) => (
                    <div
                      key={f.feature_name}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {f.feature_label}
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            f.voltage_impact_v > 0
                              ? 'text-cyan-600 dark:text-cyan-400'
                              : f.voltage_impact_v < 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {f.voltage_impact_v > 0 ? `+${f.voltage_impact_v} V` : `${f.voltage_impact_v} V`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {f.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Recommendation & Research Advice */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Clinical Decision Support Guidance
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {result.clinical_interpretation}
                </p>
                <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900 text-xs text-cyan-800 dark:text-cyan-200">
                  <strong>Research Protocol Action:</strong> {result.research_recommendation}
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  {result.disclaimer}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
