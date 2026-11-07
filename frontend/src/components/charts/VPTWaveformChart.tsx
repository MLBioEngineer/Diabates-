'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface WaveformPoint {
  time: string;
  voltage: number;
  contact_force?: number;
}

interface Props {
  data: WaveformPoint[];
  height?: number;
}

export const VPTWaveformChart: React.FC<Props> = ({ data, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400"
      >
        Waiting for Biothesiometer oscillation signal... Click &quot;Start Voltage Ramp&quot;
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="voltageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
          <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis domain={[0, 50]} stroke="#64748b" fontSize={11} unit="V" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#fff',
            }}
            formatter={(value: any) => [`${value} Volts`, 'Stimulus Amplitude']}
          />
          {/* Clinical Reference Thresholds */}
          <ReferenceLine
            y={15}
            stroke="#10b981"
            strokeDasharray="4 4"
            label={{ value: 'Normal Cutoff (15V)', fill: '#10b981', fontSize: 10, position: 'insideTopLeft' }}
          />
          <ReferenceLine
            y={20}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{ value: 'Mild Neuropathy (20V)', fill: '#f59e0b', fontSize: 10, position: 'insideTopLeft' }}
          />
          <ReferenceLine
            y={25}
            stroke="#ef4444"
            strokeDasharray="4 4"
            label={{ value: 'Severe LOPS / Ulcer Risk (25V)', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft' }}
          />
          <Area
            type="monotone"
            dataKey="voltage"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#voltageGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
