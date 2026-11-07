import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white font-black text-sm">
              VPT
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-800 dark:text-white">
                VPT Sense AI
              </span>
              <p className="text-xs text-slate-500">
                Quantitative Sensory Testing & Vibration Perception Threshold Research Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link href="/reference-estimation" className="hover:text-cyan-600 transition-colors">
              Reference Estimation
            </Link>
            <Link href="/live-monitoring" className="hover:text-cyan-600 transition-colors">
              Device Monitoring
            </Link>
            <Link href="/analytics" className="hover:text-cyan-600 transition-colors">
              QST Analytics
            </Link>
            <Link href="/reports" className="hover:text-cyan-600 transition-colors">
              Trial Reports
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 text-center">
          <p className="text-[11px] text-slate-400">
            <strong>Clinical Research Notice:</strong> VPT Sense AI is designed for biomedical research, 
            large A-beta sensory fiber evaluation, and quantitative sensory testing clinical trials. 
            Does not replace comprehensive medical evaluation.
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            © {new Date().getFullYear()} VPT Sense AI Research Consortium. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
