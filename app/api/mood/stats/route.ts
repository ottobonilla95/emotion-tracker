import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { MoodEntry, MoodStats } from "@/lib/types";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const startDate = request.nextUrl.searchParams.get("startDate");
  const endDate = request.nextUrl.searchParams.get("endDate");
  const days = request.nextUrl.searchParams.get("days");

  let query = supabase
    .from("mood_entries")
    .select("*")
    .order("created_at", { ascending: true });

  if (startDate && endDate) {
    query = query.gte("created_at", startDate).lte("created_at", endDate);
  } else {
    const d = parseInt(days || "90");
    const since = new Date();
    since.setDate(since.getDate() - d);
    query = query.gte("created_at", since.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries = data as MoodEntry[];
  const totalEntries = entries.length;

  const avgScore =
    totalEntries > 0
      ? Math.round(
          (entries.reduce((sum, e) => sum + (e.score ?? 0), 0) / totalEntries) * 10
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

  // Daily average scores
  const dailyMap = new Map<string, { sum: number; count: number }>();
  for (const entry of entries) {
    const date = entry.created_at.split("T")[0];
    const existing = dailyMap.get(date);
    const score = entry.score ?? 0;
    if (existing) {
      existing.sum += score;
      existing.count++;
    } else {
      dailyMap.set(date, { sum: score, count: 1 });
    }
  }
  const dailyScores = Array.from(dailyMap.entries()).map(([date, { sum, count }]) => ({
    date,
    avgScore: Math.round((sum / count) * 10) / 10,
  }));

  const stats: MoodStats = {
    totalEntries,
    avgScore,
    mostFrequentMood,
    moodFrequency,
    dailyScores,
  };

  return NextResponse.json(stats);
}
