'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { getParticipants, createParticipant, getParticipantDetail } from '@/lib/api';
import { Participant, ParticipantDetail } from '@/lib/types';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('ALL');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSub, setNewSub] = useState({
    full_name: '',
    age: 48,
    gender: 'FEMALE',
    height_cm: 165.0,
    weight_kg: 70.0,
    clinical_group: 'DIABETIC_NON_NEUROPATHIC',
    diabetes_duration_years: 5.0,
    foot_ulcer_history: false,
    symptoms_nss_score: 2,
    notes: '',
  });

  const [selectedDetail, setSelectedDetail] = useState<ParticipantDetail | null>(null);

  const loadList = async () => {
    setLoading(true);
    try {
      const list = await getParticipants(search, groupFilter);
      setParticipants(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [groupFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadList();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createParticipant(newSub);
      setShowAddModal(false);
      loadList();
    } catch (err) {
      console.error('Failed to create participant:', err);
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const det = await getParticipantDetail(id);
      setSelectedDetail(det);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            Clinical Research Cohort Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Participant Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Subject demographics, clinical neuropathy classification, and historical QST trial sessions
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all hover:scale-[1.02]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Enroll New Subject</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or SUB- code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium"
          />
        </form>

        {/* Group Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {[
            { id: 'ALL', label: 'All Cohorts' },
            { id: 'HEALTHY_CONTROL', label: 'Healthy Control' },
            { id: 'DIABETIC_NON_NEUROPATHIC', label: 'Diabetic Non-DPN' },
            { id: 'ESTABLISHED_DPN', label: 'Established DPN' },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => setGroupFilter(g.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                groupFilter === g.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Participants Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Subject ID</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Demographics & BMI</th>
                <th className="px-4 py-3">Clinical Cohort</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Latest VPT</th>
                <th className="px-4 py-3">Loss Grade</th>
                <th className="px-4 py-3">Ulcer Risk</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {participants.map((p) => {
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
                    <td className="px-4 py-3.5 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {p.subject_code}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      {p.full_name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {p.age}y &middot; {p.gender[0]} &middot; {p.height_cm}cm &middot;{' '}
                      <span className="font-mono">{p.bmi} kg/m²</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                      {p.clinical_group.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono">
                      {p.diabetes_duration_years > 0 ? `${p.diabetes_duration_years} yrs` : 'None'}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {p.latest_vpt_voltage ? `${p.latest_vpt_voltage} V` : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                        {p.latest_classification?.replace(/_/g, ' ') || 'NOT TESTED'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
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
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleViewDetails(p.id)}
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        QST History
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Participant QST History Detail Drawer / Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-600">
                  {selectedDetail.subject_code}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedDetail.full_name}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedDetail.age} years old &middot; {selectedDetail.gender} &middot;{' '}
                  {selectedDetail.height_cm} cm &middot; {selectedDetail.clinical_group.replace(/_/g, ' ')}
                </p>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sessions History List */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Quantitative Sensory Testing Sessions ({selectedDetail.sessions.length})
              </h3>

              {selectedDetail.sessions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
                  No biothesiometer test trials recorded for this subject yet.
                </div>
              ) : (
                selectedDetail.sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {sess.protocol_name}
                        </span>
                        <span className="text-slate-400 ml-2">
                          {new Date(sess.tested_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-cyan-600">
                        Max: {sess.max_site_voltage_v} V &middot; Asymmetry: {sess.bilateral_asymmetry_v} V
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-200/60 dark:bg-slate-900 text-slate-500 uppercase text-[9px]">
                          <tr>
                            <th className="px-3 py-1.5">Site</th>
                            <th className="px-3 py-1.5">Trial 1</th>
                            <th className="px-3 py-1.5">Trial 2</th>
                            <th className="px-3 py-1.5">Trial 3</th>
                            <th className="px-3 py-1.5">Mean VPT</th>
                            <th className="px-3 py-1.5">Expected</th>
                            <th className="px-3 py-1.5">Z-Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800">
                          {sess.measurements.map((m, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-1.5 font-bold">{m.site.replace(/_/g, ' ')}</td>
                              <td className="px-3 py-1.5 font-mono">{m.trial_1_v}V</td>
                              <td className="px-3 py-1.5 font-mono">{m.trial_2_v}V</td>
                              <td className="px-3 py-1.5 font-mono">{m.trial_3_v}V</td>
                              <td className="px-3 py-1.5 font-mono font-bold text-cyan-600">
                                {m.mean_vpt_v}V
                              </td>
                              <td className="px-3 py-1.5 font-mono text-slate-400">
                                {m.normative_expected_v}V
                              </td>
                              <td className="px-3 py-1.5 font-mono font-bold">
                                {m.z_score > 0 ? `+${m.z_score}` : m.z_score}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enroll New Participant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-600" />
                Enroll Study Participant
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Legal / Study Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Miller"
                  value={newSub.full_name}
                  onChange={(e) => setNewSub({ ...newSub, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Age (yrs)
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="95"
                    required
                    value={newSub.age}
                    onChange={(e) => setNewSub({ ...newSub, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="130"
                    max="220"
                    required
                    value={newSub.height_cm}
                    onChange={(e) => setNewSub({ ...newSub, height_cm: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="35"
                    max="200"
                    required
                    value={newSub.weight_kg}
                    onChange={(e) => setNewSub({ ...newSub, weight_kg: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Biological Sex
                  </label>
                  <select
                    value={newSub.gender}
                    onChange={(e) => setNewSub({ ...newSub, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Clinical Cohort
                  </label>
                  <select
                    value={newSub.clinical_group}
                    onChange={(e) => setNewSub({ ...newSub, clinical_group: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="HEALTHY_CONTROL">Healthy Control</option>
                    <option value="DIABETIC_NON_NEUROPATHIC">Diabetic Non-Neuropathic</option>
                    <option value="ESTABLISHED_DPN">Established DPN</option>
                    <option value="CIPN">Chemo-Induced (CIPN)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Diabetes Duration (Years)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={newSub.diabetes_duration_years}
                  onChange={(e) => setNewSub({ ...newSub, diabetes_duration_years: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ulcerCheck"
                  checked={newSub.foot_ulcer_history}
                  onChange={(e) => setNewSub({ ...newSub, foot_ulcer_history: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-600"
                />
                <label htmlFor="ulcerCheck" className="text-slate-700 dark:text-slate-300 font-semibold">
                  History of neuropathic foot ulceration
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-md shadow-cyan-600/20"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
