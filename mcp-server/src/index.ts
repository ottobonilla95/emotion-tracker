import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = process.env.EMOTION_TRACKER_API_URL || "https://emotion-tracker-alpha.vercel.app";

const server = new McpServer({
  name: "emotion-tracker",
  version: "2.0.0",
});

const SCORE_LABELS: Record<number, string> = {
  2: "Super Good",
  1: "Good",
  0: "Neutral",
  [-1]: "Bad",
  [-2]: "Very Bad",
};

// Tool: log_mood
server.tool(
  "log_mood",
  "Log a mood entry on a 5-point scale. Use this when the user describes how they're feeling. Map their feeling to a score: +2 (Super Good), +1 (Good), 0 (Neutral), -1 (Bad), -2 (Very Bad).",
  {
    emoji: z.string().describe("Emoji representing the mood: 😄 (+2), 🙂 (+1), 😐 (0), 😕 (-1), 😞 (-2)"),
    label: z.string().describe("Label: Super Good, Good, Neutral, Bad, or Very Bad"),
    score: z.number().min(-2).max(2).describe("Mood score from -2 (Very Bad) to +2 (Super Good)"),
    notes: z.string().optional().describe("Optional free-form notes about the mood"),
  },
  async ({ emoji, label, score, notes }) => {
    const res = await fetch(`${API_BASE}/api/mood`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji, label, score, notes: notes || null }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      return { content: [{ type: "text" as const, text: `Error logging mood: ${err.error}` }] };
    }

    const data = await res.json();
    const scoreStr = score > 0 ? `+${score}` : `${score}`;
    return {
      content: [
        {
          type: "text" as const,
          text: `Logged: ${emoji} ${label} (score ${scoreStr})${notes ? ` — "${notes}"` : ""}\nEntry ID: ${data.id}`,
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
    const res = await fetch(`${API_BASE}/api/mood?days=${days}`);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      return { content: [{ type: "text" as const, text: `Error fetching history: ${err.error}` }] };
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      return { content: [{ type: "text" as const, text: `No mood entries found in the last ${days} days.` }] };
    }

    const lines = data.map((entry: { emoji: string; label: string; score: number; notes: string | null; created_at: string }) => {
      const date = new Date(entry.created_at).toLocaleString();
      const scoreStr = entry.score > 0 ? `+${entry.score}` : `${entry.score}`;
      const entryLabel = SCORE_LABELS[entry.score] || entry.label;
      return `${entry.emoji} ${entryLabel} (${scoreStr}) — ${date}${entry.notes ? `\n   Notes: ${entry.notes}` : ""}`;
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
    const res = await fetch(`${API_BASE}/api/mood/stats?days=${days}`);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      return { content: [{ type: "text" as const, text: `Error fetching stats: ${err.error}` }] };
    }

    const stats = await res.json();

    if (stats.totalEntries === 0) {
      return { content: [{ type: "text" as const, text: `No mood entries found in the last ${days} days.` }] };
    }

    const avgScoreStr = stats.avgScore > 0 ? `+${stats.avgScore}` : `${stats.avgScore}`;
    const topMood = stats.mostFrequentMood;

    const freqLines = stats.moodFrequency
      .map((m: { emoji: string; label: string; count: number }) => `  ${m.emoji} ${m.label}: ${m.count} times`)
      .join("\n");

    return {
      content: [
        {
          type: "text" as const,
          text: `Mood stats (last ${days} days):\n\nTotal entries: ${stats.totalEntries}\nAverage score: ${avgScoreStr} (${SCORE_LABELS[Math.round(stats.avgScore)] || "Mixed"})\nMost frequent mood: ${topMood.emoji} ${topMood.label} (${topMood.count} times)\n\nBreakdown:\n${freqLines}`,
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
    const res = await fetch(`${API_BASE}/api/mood/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      return { content: [{ type: "text" as const, text: `Error deleting entry: ${err.error}` }] };
    }

    return { content: [{ type: "text" as const, text: `Deleted mood entry #${id}.` }] };
  }
);

// Tool: get_dashboard_link
server.tool(
  "get_dashboard_link",
  "Get the link to the mood tracker dashboard. Use this when the user asks to see their mood chart, report, insights, summary, or dashboard.",
  {},
  async () => {
    return {
      content: [
        {
          type: "text" as const,
          text: `Here's your mood tracker dashboard:\n\n📊 Insights & Chart: https://emotion-tracker-alpha.vercel.app/insights\n📋 Mood History: https://emotion-tracker-alpha.vercel.app/history\n🏠 Log a Mood: https://emotion-tracker-alpha.vercel.app`,
        },
      ],
    };
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
