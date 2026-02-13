import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { MoodEntry, MoodStats } from "@/lib/types";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const days = request.nextUrl.searchParams.get("days") || "30";

  const since = new Date();
  since.setDate(since.getDate() - parseInt(days));

  const { data, error } = await supabase
    .from("mood_entries")
    .select("*")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries = data as MoodEntry[];

  // Calculate stats
  const totalEntries = entries.length;

  const avgIntensity =
    totalEntries > 0
      ? Math.round(
          (entries.reduce((sum, e) => sum + e.intensity, 0) / totalEntries) * 10
        ) / 10
      : 0;

  // Mood frequency
  const frequencyMap = new Map<string, { emoji: string; label: string; count: number }>();
  for (const entry of entries) {
    const key = entry.emoji;
    const existing = frequencyMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      frequencyMap.set(key, { emoji: entry.emoji, label: entry.label, count: 1 });
    }
  }
  const moodFrequency = Array.from(frequencyMap.values()).sort(
    (a, b) => b.count - a.count
  );
  const mostFrequentMood = moodFrequency[0] || null;

  // Daily average intensity trend
  const dailyMap = new Map<string, { sum: number; count: number }>();
  for (const entry of entries) {
    const date = entry.created_at.split("T")[0];
    const existing = dailyMap.get(date);
    if (existing) {
      existing.sum += entry.intensity;
      existing.count++;
    } else {
      dailyMap.set(date, { sum: entry.intensity, count: 1 });
    }
  }
  const recentTrend = Array.from(dailyMap.entries()).map(([date, { sum, count }]) => ({
    date,
    avgIntensity: Math.round((sum / count) * 10) / 10,
  }));

  const stats: MoodStats = {
    totalEntries,
    avgIntensity,
    mostFrequentMood,
    moodFrequency,
    recentTrend,
  };

  return NextResponse.json(stats);
}
