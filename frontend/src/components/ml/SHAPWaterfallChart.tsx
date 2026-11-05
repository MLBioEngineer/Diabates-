import React from 'react';
import { SHAPContribution } from '@/lib/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  contributions: SHAPContribution[];
}

export const SHAPWaterfallChart: React.FC<Props> = ({ contributions }) => {
  if (!contributions || contributions.length === 0) {
    return (
      <p className="text-xs text-slate-400">No feature attribution data available for this prediction.</p>
    );
  }

  // Display top 6 contributing clinical features
  const displayFeatures = contributions.slice(0, 6);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-200 dark:border-slate-800">
        <span>Clinical Marker (Value)</span>
        <span>SHAP Risk Contribution</span>
      </div>

      {displayFeatures.map((item, idx) => {
        const isRiskIncrease = item.impact_direction === 'INCREASES_RISK';
        const barWidth = Math.min(100, item.impact_percentage * 2.5);

        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {item.feature_label}{' '}
                <span className="text-slate-400 font-normal">({item.feature_value})</span>
              </span>
              <span
                className={`flex items-center gap-1 font-semibold ${
                  isRiskIncrease ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isRiskIncrease ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isRiskIncrease ? '+' : ''}
                {item.shap_value.toFixed(3)} ({item.impact_percentage}%)
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
              {isRiskIncrease ? (
                <>
                  <div className="w-1/2" />
                  <div
                    style={{ width: `${barWidth / 2}%` }}
                    className="bg-rose-500 h-full rounded-r-full"
                  />
                </>
              ) : (
                <>
                  <div
                    style={{ width: `${barWidth / 2}%`, marginLeft: 'auto' }}
                    className="bg-emerald-500 h-full rounded-l-full"
                  />
                  <div className="w-1/2" />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
