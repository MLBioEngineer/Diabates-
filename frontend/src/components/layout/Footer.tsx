import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Medical Regulatory Notice */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-semibold">Clinical Decision Support System (CDSS) Research Prototype Disclaimer</p>
            <p>
              GlycoPulse AI is an academic and investigative healthcare software platform. 
              The diabetes risk estimations and simulated continuous glucose streams are provided solely for decision support, patient education, and research evaluation. 
              This software is <strong>not</strong> an FDA-cleared or CE-marked medical device and must never substitute for laboratory HbA1c testing, clinical diagnosis, or physician consultations.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} GlycoPulse AI Health Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-teal-600" />
              Machine Learning Model: Random Forest Ensemble (PR-AUC 0.698, Sensitivity 82.5%)
            </span>
            <Link href="/reports" className="hover:text-teal-600 transition-colors">
              Clinical Export
            </Link>
            <Link href="/settings" className="hover:text-teal-600 transition-colors">
              Device Pairing
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
