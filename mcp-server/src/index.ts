import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const server = new McpServer({
  name: "emotion-tracker",
  version: "1.0.0",
});

// Tool: log_mood
server.tool(
  "log_mood",
  "Log an emotion/mood entry. Use this when the user describes how they're feeling.",
  {
    emoji: z.string().describe("Emoji representing the mood (e.g. 😊, 😔, 😰)"),
    label: z.string().describe("Human-readable label (e.g. Happy, Sad, Anxious)"),
    intensity: z.number().min(1).max(10).describe("Intensity on a 1-10 scale"),
    notes: z.string().optional().describe("Optional free-form notes about the mood"),
  },
  async ({ emoji, label, intensity, notes }) => {
    const { data, error } = await supabase
      .from("mood_entries")
      .insert({ emoji, label, intensity, notes: notes || null })
      .select()
      .single();

    if (error) {
      return { content: [{ type: "text" as const, text: `Error logging mood: ${error.message}` }] };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Logged: ${emoji} ${label} (intensity ${intensity}/10)${notes ? ` — "${notes}"` : ""}\nEntry ID: ${data.id}`,
        },
      ],
    };
  }
);

// Tool: get_mood_history
server.tool(
  "get_mood_history",
  "Get recent mood entries. Use this when the user asks about their recent moods or mood history.",
  {
    days: z.number().optional().default(7).describe("Number of days to look back (default 7)"),
  },
  async ({ days }) => {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      return { content: [{ type: "text" as const, text: `Error fetching history: ${error.message}` }] };
    }

    if (!data || data.length === 0) {
      return { content: [{ type: "text" as const, text: `No mood entries found in the last ${days} days.` }] };
    }

    const lines = data.map((entry: { emoji: string; label: string; intensity: number; notes: string | null; created_at: string }) => {
      const date = new Date(entry.created_at).toLocaleString();
      return `${entry.emoji} ${entry.label} (${entry.intensity}/10) — ${date}${entry.notes ? `\n   Notes: ${entry.notes}` : ""}`;
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `Mood history (last ${days} days, ${data.length} entries):\n\n${lines.join("\n\n")}`,
        },
      ],
    };
  }
);

// Tool: get_mood_stats
server.tool(
  "get_mood_stats",
  "Get mood statistics and trends. Use this when the user asks about patterns, averages, or their most common mood.",
  {
    days: z.number().optional().default(30).describe("Number of days to analyze (default 30)"),
  },
  async ({ days }) => {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      return { content: [{ type: "text" as const, text: `Error fetching stats: ${error.message}` }] };
    }

    if (!data || data.length === 0) {
      return { content: [{ type: "text" as const, text: `No mood entries found in the last ${days} days.` }] };
    }

    const totalEntries = data.length;
    const avgIntensity = Math.round((data.reduce((sum: number, e: { intensity: number }) => sum + e.intensity, 0) / totalEntries) * 10) / 10;

    const frequencyMap = new Map<string, { emoji: string; label: string; count: number }>();
    for (const entry of data) {
      const existing = frequencyMap.get(entry.emoji);
      if (existing) {
        existing.count++;
      } else {
        frequencyMap.set(entry.emoji, { emoji: entry.emoji, label: entry.label, count: 1 });
      }
    }
    const sorted = Array.from(frequencyMap.values()).sort((a, b) => b.count - a.count);
    const topMood = sorted[0];

    const freqLines = sorted.map((m) => `  ${m.emoji} ${m.label}: ${m.count} times`).join("\n");

    return {
      content: [
        {
          type: "text" as const,
          text: `Mood stats (last ${days} days):\n\nTotal entries: ${totalEntries}\nAverage intensity: ${avgIntensity}/10\nMost frequent mood: ${topMood.emoji} ${topMood.label} (${topMood.count} times)\n\nBreakdown:\n${freqLines}`,
        },
      ],
    };
  }
);

// Tool: delete_mood
server.tool(
  "delete_mood",
  "Delete a mood entry by its ID.",
  {
    id: z.number().describe("The ID of the mood entry to delete"),
  },
  async ({ id }) => {
    const { error } = await supabase.from("mood_entries").delete().eq("id", id);

    if (error) {
      return { content: [{ type: "text" as const, text: `Error deleting entry: ${error.message}` }] };
    }

    return { content: [{ type: "text" as const, text: `Deleted mood entry #${id}.` }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
