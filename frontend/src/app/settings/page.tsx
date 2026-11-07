'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  Building,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Lock,
  Layers,
  Save
} from 'lucide-react';
import { getCurrentUser, getExportCsvUrl } from '@/lib/api';
import { User as UserType } from '@/lib/types';

export default function SettingsPage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    full_name: 'Prof. Elena Rostova, MD, PhD',
    email: 'researcher@vptsense.ai',
    institution: 'University Metabolic Neurology Research Center',
    department: 'Diabetology & Quantitative Sensory Testing Unit',
    irb_protocol: 'QST-IRB-2026-X8',
    role: 'RESEARCHER',
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        if (u) {
          setUser(u);
          setFormData((prev) => ({
            ...prev,
            full_name: u.full_name,
            email: u.email,
            role: u.role,
          }));
        }
      })
      .catch(() => {
        // Fallback demo user
      });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
            Investigator Profile & Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Profile & Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage principal investigator credentials, clinical study registry, and quantitative research datasets
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-mono font-bold text-xs border border-cyan-200 dark:border-cyan-800">
          Role: {formData.role}
        </span>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Investigator credentials and study affiliation saved.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Investigator Details */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-600" />
            Lead Investigator Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Legal Name & Academic Degrees
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Institutional Affiliation & Study Protocol */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            Clinical Study & Institutional Registry
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Research Institution / Hospital Center
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Department / Laboratory Unit
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                IRB / Clinical Trial Registry Number
              </label>
              <input
                type="text"
                value={formData.irb_protocol}
                onChange={(e) => setFormData({ ...formData, irb_protocol: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                QST Lab Accreditation Standard
              </label>
              <input
                type="text"
                readOnly
                value="ISO-13485 / IEC-60601 Certified"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Dataset Bulk Export Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Raw Research Dataset Export
              </h2>
              <p className="text-xs text-slate-500">
                Download all participant demographic fields and site-wise triplicate trials in CSV format.
              </p>
            </div>

            <a
              href={getExportCsvUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV (R / SPSS)</span>
            </a>
          </div>
        </div>

        {/* Save Changes */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
