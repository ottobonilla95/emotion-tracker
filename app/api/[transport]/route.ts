import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "log_mood",
      {
        title: "Log Mood",
        description:
          "Log a mood entry on a 5-point scale. Use this when the user describes how they're feeling. Map their feeling to a score: +2 (Super Good), +1 (Good), 0 (Neutral), -1 (Bad), -2 (Very Bad).",
        inputSchema: {
          emoji: z
            .string()
            .describe(
              "Emoji representing the mood: 😄 (+2), 🙂 (+1), 😐 (0), 😕 (-1), 😞 (-2)"
            ),
          label: z
            .string()
            .describe("Label: Super Good, Good, Neutral, Bad, or Very Bad"),
          score: z
            .number()
            .min(-2)
            .max(2)
            .describe("Mood score from -2 (Very Bad) to +2 (Super Good)"),
          notes: z
            .string()
            .optional()
            .describe("Optional free-form notes about the mood"),
        },
      },
      async ({ emoji, label, score, notes }) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://emotion-tracker-alpha.vercel.app";
        const res = await fetch(`${baseUrl}/api/mood`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emoji, label, score, notes: notes || null }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          return {
            content: [{ type: "text" as const, text: `Error logging mood: ${err.error}` }],
          };
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

    server.registerTool(
      "get_mood_history",
      {
        title: "Get Mood History",
        description:
          "Get recent mood entries. Use this when the user asks about their recent moods or mood history.",
        inputSchema: {
          days: z
            .number()
            .optional()
            .default(7)
            .describe("Number of days to look back (default 7)"),
        },
      },
      async ({ days }) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://emotion-tracker-alpha.vercel.app";
        const res = await fetch(`${baseUrl}/api/mood?days=${days}`);

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          return {
            content: [{ type: "text" as const, text: `Error fetching history: ${err.error}` }],
          };
        }

        const data = await res.json();

        if (!data || data.length === 0) {
          return {
            content: [
              { type: "text" as const, text: `No mood entries found in the last ${days} days.` },
            ],
          };
        }

        const SCORE_LABELS: Record<number, string> = {
          2: "Super Good",
          1: "Good",
          0: "Neutral",
          [-1]: "Bad",
          [-2]: "Very Bad",
        };

        const lines = data.map(
          (entry: {
            emoji: string;
            label: string;
            score: number;
            notes: string | null;
            created_at: string;
          }) => {
            const date = new Date(entry.created_at).toLocaleString();
            const scoreStr = entry.score > 0 ? `+${entry.score}` : `${entry.score}`;
            const entryLabel = SCORE_LABELS[entry.score] || entry.label;
            return `${entry.emoji} ${entryLabel} (${scoreStr}) — ${date}${entry.notes ? `\n   Notes: ${entry.notes}` : ""}`;
          }
        );

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

    server.registerTool(
      "get_mood_stats",
      {
        title: "Get Mood Stats",
        description:
          "Get mood statistics and trends. Use this when the user asks about patterns, averages, or their most common mood.",
        inputSchema: {
          days: z
            .number()
            .optional()
            .default(30)
            .describe("Number of days to analyze (default 30)"),
        },
      },
      async ({ days }) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://emotion-tracker-alpha.vercel.app";
        const res = await fetch(`${baseUrl}/api/mood/stats?days=${days}`);

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          return {
            content: [{ type: "text" as const, text: `Error fetching stats: ${err.error}` }],
          };
        }

        const stats = await res.json();

        if (stats.totalEntries === 0) {
          return {
            content: [
              { type: "text" as const, text: `No mood entries found in the last ${days} days.` },
            ],
          };
        }

        const SCORE_LABELS: Record<number, string> = {
          2: "Super Good",
          1: "Good",
          0: "Neutral",
          [-1]: "Bad",
          [-2]: "Very Bad",
        };

        const avgScoreStr =
          stats.avgScore > 0 ? `+${stats.avgScore}` : `${stats.avgScore}`;
        const topMood = stats.mostFrequentMood;

        const freqLines = stats.moodFrequency
          .map(
            (m: { emoji: string; label: string; count: number }) =>
              `  ${m.emoji} ${m.label}: ${m.count} times`
          )
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

    server.registerTool(
      "delete_mood",
      {
        title: "Delete Mood",
        description: "Delete a mood entry by its ID.",
        inputSchema: {
          id: z.number().describe("The ID of the mood entry to delete"),
        },
      },
      async ({ id }) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://emotion-tracker-alpha.vercel.app";
        const res = await fetch(`${baseUrl}/api/mood/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          return {
            content: [{ type: "text" as const, text: `Error deleting entry: ${err.error}` }],
          };
        }

        return {
          content: [{ type: "text" as const, text: `Deleted mood entry #${id}.` }],
        };
      }
    );
  },
  {},
  {
    basePath: "/api",
    maxDuration: 60,
  }
);

export { handler as GET, handler as POST };
