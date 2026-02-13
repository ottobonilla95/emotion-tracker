import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const days = request.nextUrl.searchParams.get("days");

  let query = supabase
    .from("mood_entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (days) {
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

  const { emoji, label, intensity, notes } = body;

  if (!emoji || !label || !intensity) {
    return NextResponse.json(
      { error: "emoji, label, and intensity are required" },
      { status: 400 }
    );
  }

  if (intensity < 1 || intensity > 10) {
    return NextResponse.json(
      { error: "intensity must be between 1 and 10" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("mood_entries")
    .insert({ emoji, label, intensity, notes: notes || null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
