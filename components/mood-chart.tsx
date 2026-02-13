"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { EMOTIONS } from "@/lib/emotions";
import type { MoodStats } from "@/lib/types";

interface MoodFrequencyChartProps {
  data: MoodStats["moodFrequency"];
}

export function MoodFrequencyChart({ data }: MoodFrequencyChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    name: `${item.emoji} ${item.label}`,
    color: EMOTIONS.find((e) => e.emoji === item.emoji)?.color || "#9E9E9E",
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface IntensityTrendChartProps {
  data: MoodStats["recentTrend"];
}

export function IntensityTrendChart({ data }: IntensityTrendChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis domain={[1, 10]} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="avgIntensity"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Avg Intensity"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
