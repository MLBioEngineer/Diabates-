'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Slice {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: Slice[];
  height?: number;
}

export const SeverityDistributionDonut: React.FC<Props> = ({ data, height = 240 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div style={{ height, width: '100%' }} className="relative flex flex-col items-center justify-center">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#fff',
            }}
            formatter={(value: any, name: any) => [
              `${value} subjects (${total > 0 ? Math.round((Number(value) / total) * 100) : 0}%)`,
              name,
            ]}
          />
          <Legend
            iconType="circle"
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
