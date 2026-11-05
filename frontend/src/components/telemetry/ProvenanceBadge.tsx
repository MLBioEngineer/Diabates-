import React from 'react';
import { DataProvenance } from '@/lib/types';
import { Cpu, Radio, ShieldCheck, Edit3 } from 'lucide-react';

interface Props {
  provenance: DataProvenance;
  size?: 'sm' | 'md';
}

export const ProvenanceBadge: React.FC<Props> = ({ provenance, size = 'md' }) => {
  const configs = {
    SIMULATED: {
      label: 'Simulated Research Data',
      icon: Cpu,
      classes: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700',
      tooltip: 'Generated via Bergman Physiological Simulation Engine (Not actual patient hardware)',
    },
    DEXCOM_G7: {
      label: 'Dexcom G7 Certified',
      icon: Radio,
      classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
      tooltip: 'Authenticated CGM Sensor Cloud Telemetry',
    },
    ABBOTT_FREESTYLE: {
      label: 'Abbott FreeStyle Libre',
      icon: ShieldCheck,
      classes: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700',
      tooltip: 'Authenticated FreeStyle LibreView Cloud Telemetry',
    },
    MANUAL: {
      label: 'Manual Glucometer Log',
      icon: Edit3,
      classes: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-700',
      tooltip: 'Capillary blood glucose fingerstick manual entry',
    },
  };

  const current = configs[provenance] || configs.SIMULATED;
  const Icon = current.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      title={current.tooltip}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full cursor-help ${padding} ${current.classes}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {current.label}
    </span>
  );
};
