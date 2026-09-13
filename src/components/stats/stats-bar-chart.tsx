"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface StatsBarChartProps {
  data: { label: string; value: number; color: string }[];
}

export default function StatsBarChart({ data }: StatsBarChartProps) {
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#444653" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#444653" }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
