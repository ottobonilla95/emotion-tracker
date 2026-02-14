# Emotion Tracker

## Overview
A mood tracking app with a 5-point scale (-2 to +2) that logs moods via a web UI or AI assistants (OpenClaw via MCP). Deployed on Vercel with a Supabase PostgreSQL backend.

**Production URL:** https://emotion-tracker-alpha.vercel.app

## Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **Database:** Supabase (PostgreSQL)
- **Charts:** Recharts
- **MCP:** mcp-handler (Streamable HTTP transport via `/api/mcp`)
- **Deployment:** Vercel (auto-deploys from `main` branch)
- **MCP Server (standalone):** `mcp-server/` directory (stdio transport, for local use)

## Project Structure
```
app/
  page.tsx              # Home — 5-button mood picker + notes
  history/page.tsx      # Mood history list with filter buttons
  insights/page.tsx     # 90-day navigable chart with period navigation
  api/
    mood/route.ts       # GET (list entries), POST (log mood with score)
    mood/[id]/route.ts  # DELETE entry
    mood/stats/route.ts # GET stats (avgScore, dailyScores, frequency)
    [transport]/route.ts # MCP HTTP endpoint (Streamable HTTP)
components/
  emoji-picker.tsx      # MoodPicker — 5 buttons: Very Bad → Super Good
  mood-card.tsx         # Entry card with color-coded score badge
  mood-chart.tsx        # MoodScoreChart — AreaChart with [-2, +2] Y-axis
  nav.tsx               # Top navigation bar
  ui/                   # shadcn/ui primitives (button, card, slider, textarea)
lib/
  types.ts              # MoodEntry, MoodLevel, MoodStats interfaces
  emotions.ts           # MOOD_LEVELS array, getMoodLevel(), legacy EMOTIONS
  supabase/server.ts    # Supabase SSR client (cookie-based)
  utils.ts              # cn() utility
mcp-server/             # Standalone MCP server (stdio transport)
  src/index.ts          # Tools: log_mood, get_mood_history, get_mood_stats, delete_mood, get_dashboard_link
supabase/
  migration.sql         # V1 schema (original)
  migration_v2.sql      # V2: adds score column, backfills from old labels
```

## 5-Point Mood Scale
| Score | Emoji | Label      | Color   |
|-------|-------|------------|---------|
| +2    | 😄    | Super Good | #22c55e |
| +1    | 🙂    | Good       | #3b82f6 |
|  0    | 😐    | Neutral    | #9ca3af |
| -1    | 😕    | Bad        | #f97316 |
| -2    | 😞    | Very Bad   | #ef4444 |

## Database
- **Table:** `mood_entries`
- **Columns:** `id`, `emoji`, `label`, `score` (integer, -2 to +2), `intensity` (nullable, legacy), `notes`, `created_at`
- **Env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (in `.env.local` and Vercel)

## MCP Endpoint
- **URL:** `https://emotion-tracker-alpha.vercel.app/api/mcp`
- **Transport:** Streamable HTTP (POST for JSON-RPC, SSE responses)
- **Tools:** `log_mood`, `get_mood_history`, `get_mood_stats`, `delete_mood`, `get_dashboard_link`
- **Connected to OpenClaw** via mcporter on a DigitalOcean droplet

## Commands
```bash
npm run dev          # Local dev server
npm run build        # Production build (also verifies TypeScript)
npm run lint         # ESLint

# MCP server (standalone)
cd mcp-server && npm run build   # Compile TypeScript
cd mcp-server && npm start       # Run stdio server

# Deploy
git push             # Auto-deploys to Vercel from main
```

## Key Patterns
- API routes use Supabase SSR client (`lib/supabase/server.ts`) with cookie-based auth
- MCP route (`[transport]/route.ts`) uses plain `@supabase/supabase-js` client directly (no cookies) to avoid serverless self-call deadlock on Vercel
- Insights page uses `periodOffset` state for 3-month period navigation (offset 0 = current)
- MoodPicker displays buttons in reverse order (sad left → happy right)
- Chart Y-axis shows full labels on desktop, short labels (+2, +1, 0, -1, -2) on mobile
