'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

interface SiteData {
  site: string;
  voltage_v: number;
}

interface Props {
  data: SiteData[];
  height?: number;
}

export const SiteComparisonBarChart: React.FC<Props> = ({ data, height = 240 }) => {
  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
          <XAxis dataKey="site" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis domain={[0, 40]} stroke="#64748b" fontSize={11} unit="V" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#fff',
            }}
            formatter={(value: any) => [`${value} Volts`, 'Mean Perception Threshold']}
          />
          <ReferenceLine y={15} stroke="#10b981" strokeDasharray="3 3" />
          <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="3 3" />
          <Bar dataKey="voltage_v" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => {
              let fill = '#10b981'; // normal
              if (entry.voltage_v >= 25) fill = '#ef4444';
              else if (entry.voltage_v >= 20) fill = '#f97316';
              else if (entry.voltage_v >= 15) fill = '#f59e0b';
              return <Cell key={`bar-${index}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
