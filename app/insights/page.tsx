"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoodScoreChart } from "@/components/mood-chart";
import { getMoodLevel } from "@/lib/emotions";
import type { MoodStats } from "@/lib/types";

function getPeriodDates(offset: number) {
  const end = new Date();
  end.setMonth(end.getMonth() - offset * 3);
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setMonth(start.getMonth() - 3);
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function InsightsPage() {
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [periodOffset, setPeriodOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const { start, end } = getPeriodDates(periodOffset);
    const params = new URLSearchParams({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
    const res = await fetch(`/api/mood/stats?${params}`);
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }, [periodOffset]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const { start, end } = getPeriodDates(periodOffset);
  const dateRange = `${formatDate(start)} — ${formatDate(end)}`;

  const scoreLabel =
    stats && stats.avgScore !== 0
      ? getMoodLevel(Math.round(stats.avgScore)).label
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-muted-foreground">Your mood patterns and trends</p>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPeriodOffset((o) => o + 1)}
        >
          &larr; Previous 3 months
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {dateRange}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={periodOffset === 0}
          onClick={() => setPeriodOffset((o) => o - 1)}
        >
          Next 3 months &rarr;
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">
          Analyzing your mood patterns...
        </p>
      ) : !stats || stats.totalEntries === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No data for this period. Start logging moods to see insights!
        </p>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.totalEntries}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Avg Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {stats.avgScore > 0 ? "+" : ""}
                  {stats.avgScore}
                </p>
                {scoreLabel && (
                  <p className="text-xs text-muted-foreground">{scoreLabel}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Top Mood
                </CardTitle>
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
              <CardTitle>Mood Score Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <MoodScoreChart data={stats.dailyScores} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
