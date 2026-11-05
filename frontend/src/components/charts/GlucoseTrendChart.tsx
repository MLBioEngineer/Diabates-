import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { TelemetryReading } from '@/lib/types';

interface Props {
  data: TelemetryReading[];
  height?: number;
}

export const GlucoseTrendChart: React.FC<Props> = ({ data, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 text-sm">
        No continuous telemetry recorded yet. Trigger simulation to view live stream.
      </div>
    );
  }

  const chartData = data.map((d) => {
    const date = new Date(d.recorded_at);
    return {
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      glucose: d.glucose_mg_dl,
      velocity: d.glucose_trend_velocity,
      provenance: d.provenance,
      rawDate: d.recorded_at,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      const velocityText =
        p.velocity > 0.5 ? '↑ Rising fast' : p.velocity < -0.5 ? '↓ Falling fast' : '→ Stable';

      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl text-xs space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">{p.time}</p>
          <p className="text-sm font-bold text-teal-600 dark:text-teal-400">
            {p.glucose} mg/dL{' '}
            <span className="text-xs font-normal text-slate-500">({velocityText})</span>
          </p>
          <p className="text-[10px] text-slate-400">Source: {p.provenance}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          {/* ADA Target Glycemic Range 70 - 180 mg/dL */}
          <ReferenceArea
            y1={70}
            y2={180}
            fill="#10b981"
            fillOpacity={0.08}
            stroke="#10b981"
            strokeOpacity={0.2}
          />
          {/* Critical Threshold Lines */}
          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
          <ReferenceLine y={180} stroke="#f59e0b" strokeDasharray="3 3" />

          <XAxis
            dataKey="time"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            domain={[40, 300]}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
            ticks={[50, 70, 100, 140, 180, 250]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="glucose"
            stroke="#0d9488"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
