import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { MoodEntry, MoodStats } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
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
  // Build full date range so every day appears in the chart
  const rangeStart = startDate && endDate
    ? new Date(startDate)
    : (() => { const d = new Date(); d.setDate(d.getDate() - parseInt(days || "90")); return d; })();
  const rangeEnd = startDate && endDate ? new Date(endDate) : new Date();

  const dailyScores: { date: string; avgScore: number | null }[] = [];
  const cursor = new Date(rangeStart);
  cursor.setUTCHours(0, 0, 0, 0);
  const endDay = new Date(rangeEnd);
  endDay.setUTCHours(0, 0, 0, 0);

  while (cursor <= endDay) {
    const dateStr = cursor.toISOString().split("T")[0];
    const entry = dailyMap.get(dateStr);
    dailyScores.push({
      date: dateStr,
      avgScore: entry ? Math.round((entry.sum / entry.count) * 10) / 10 : null,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const stats: MoodStats = {
    totalEntries,
    avgScore,
    mostFrequentMood,
    moodFrequency,
    dailyScores,
  };

  return NextResponse.json(stats);
  } catch (err) {
    console.error("GET /api/mood/stats error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
