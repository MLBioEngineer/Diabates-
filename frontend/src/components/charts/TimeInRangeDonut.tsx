import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Props {
  inRange: number; // 70-180 mg/dL (Green)
  belowRange: number; // < 70 mg/dL (Red)
  aboveRange: number; // > 180 mg/dL (Amber)
  height?: number;
}

export const TimeInRangeDonut: React.FC<Props> = ({
  inRange,
  belowRange,
  aboveRange,
  height = 200,
}) => {
  const chartData = [
    { name: 'Time-in-Range (70-180)', value: inRange, color: '#10b981' },
    { name: 'Time-Above-Range (>180)', value: aboveRange, color: '#f59e0b' },
    { name: 'Time-Below-Range (<70)', value: belowRange, color: '#ef4444' },
  ];

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number) => [`${val}%`, 'Percentage']}
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 w-full text-center text-xs mt-2">
        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
          <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">{inRange}%</p>
          <p className="text-[10px] text-slate-500">In Range (TIR)</p>
        </div>
        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
          <p className="text-amber-700 dark:text-amber-400 font-bold text-sm">{aboveRange}%</p>
          <p className="text-[10px] text-slate-500">Above (&gt;180)</p>
        </div>
        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40">
          <p className="text-rose-700 dark:text-rose-400 font-bold text-sm">{belowRange}%</p>
          <p className="text-[10px] text-slate-500">Below (&lt;70)</p>
        </div>
      </div>
    </div>
  );
};
