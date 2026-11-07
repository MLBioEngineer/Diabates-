'use client';

import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Line,
  ComposedChart
} from 'recharts';

interface ScatterPoint {
  subject_code: string;
  age: number;
  measured_vpt: number;
  normative_ref: number;
  group: string;
}

interface Props {
  data: ScatterPoint[];
  height?: number;
}

export const AgeRegressionScatterChart: React.FC<Props> = ({ data, height = 280 }) => {
  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
          <XAxis
            dataKey="age"
            name="Age"
            unit=" yrs"
            domain={[20, 85]}
            type="number"
            stroke="#64748b"
            fontSize={11}
          />
          <YAxis
            dataKey="measured_vpt"
            name="VPT"
            unit=" V"
            domain={[0, 45]}
            stroke="#64748b"
            fontSize={11}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#fff',
            }}
            formatter={(val: any, name: any, item: any) => {
              if (name === 'Normative Mean Curve') return [`${val} V`, name];
              return [`${val} V (Age ${item.payload.age})`, `Subject ${item.payload.subject_code}`];
            }}
          />
          {/* Normative Reference Curve */}
          <Line
            type="monotone"
            dataKey="normative_ref"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            name="Normative Mean Curve"
          />
          {/* Participant Scatter points */}
          <Scatter
            name="Study Participants"
            dataKey="measured_vpt"
            fill="#f43f5e"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
