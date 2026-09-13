"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface StatsLineChartProps {
  data: { label: string; value: number }[];
}

export default function StatsLineChart({ data }: StatsLineChartProps) {
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dde1ff" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#444653" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#444653" }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#00288e"
            strokeWidth={2}
            fill="url(#lineFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
