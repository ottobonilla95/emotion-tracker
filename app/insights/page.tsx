"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoodFrequencyChart, IntensityTrendChart } from "@/components/mood-chart";
import type { MoodStats } from "@/lib/types";

const FILTER_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

export default function InsightsPage() {
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [filter, setFilter] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [filter]);

  async function fetchStats() {
    setLoading(true);
    const res = await fetch(`/api/mood/stats?days=${filter}`);
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-muted-foreground">Analyzing your mood patterns...</p>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalEntries === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-muted-foreground">
            No data yet. Start logging moods to see insights!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-muted-foreground">Your mood patterns and trends</p>
      </div>

      <div className="flex gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={filter === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalEntries}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avg Intensity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.avgIntensity}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Top Mood</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.mostFrequentMood ? (
              <p className="text-2xl font-bold">
                {stats.mostFrequentMood.emoji}{" "}
                <span className="text-base font-normal">
                  {stats.mostFrequentMood.label}
                </span>
              </p>
            ) : (
              <p className="text-muted-foreground">-</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mood Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodFrequencyChart data={stats.moodFrequency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intensity Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <IntensityTrendChart data={stats.recentTrend} />
        </CardContent>
      </Card>
    </div>
  );
}
