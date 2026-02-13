import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const days = request.nextUrl.searchParams.get("days");
  const startDate = request.nextUrl.searchParams.get("startDate");
  const endDate = request.nextUrl.searchParams.get("endDate");

  let query = supabase
    .from("mood_entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (startDate && endDate) {
    query = query.gte("created_at", startDate).lte("created_at", endDate);
  } else if (days) {
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));
    query = query.gte("created_at", since.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { emoji, label, score, notes } = body;

  if (!emoji || !label || score === undefined || score === null) {
    return NextResponse.json(
      { error: "emoji, label, and score are required" },
      { status: 400 }
    );
  }

  if (score < -2 || score > 2) {
    return NextResponse.json(
      { error: "score must be between -2 and 2" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("mood_entries")
    .insert({ emoji, label, score, notes: notes || null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
