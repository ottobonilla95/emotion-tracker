"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { getMoodLevel } from "@/lib/emotions";
import type { MoodStats } from "@/lib/types";

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

interface MoodScoreChartProps {
  data: MoodStats["dailyScores"];
}

const SCORE_LABELS: Record<number, string> = {
  2: "Super Good",
  1: "Good",
  0: "Neutral",
  "-1": "Bad",
  "-2": "Very Bad",
};

const SCORE_LABELS_SHORT: Record<number, string> = {
  2: "+2",
  1: "+1",
  0: "0",
  "-1": "-1",
  "-2": "-2",
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const score = payload[0].value;
  const level = getMoodLevel(Math.round(score));
  return (
    <div className="bg-popover border rounded-lg p-2 shadow-md text-sm">
      <p className="font-medium">
        {level.emoji} {level.label}
      </p>
      <p className="text-muted-foreground">Score: {score}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}

export function MoodScoreChart({ data }: MoodScoreChartProps) {
  const isMobile = useIsMobile();
  const labels = isMobile ? SCORE_LABELS_SHORT : SCORE_LABELS;
  const yAxisWidth = isMobile ? 35 : 80;

  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.date + "T00:00:00").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  }));

  if (chartData.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        No data for this period.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
            <stop offset="50%" stopColor="#9ca3af" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[-2, 2]}
          ticks={[-2, -1, 0, 1, 2]}
          tick={{ fontSize: 11 }}
          tickFormatter={(value: number) => labels[value] || String(value)}
          width={yAxisWidth}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="4 4" />
        <Area
          type="monotone"
          dataKey="avgScore"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#scoreGradient)"
          dot={{ r: 3, fill: "#6366f1" }}
          activeDot={{ r: 5 }}
          name="Mood Score"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
