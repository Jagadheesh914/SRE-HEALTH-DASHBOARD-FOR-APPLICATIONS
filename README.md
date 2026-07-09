# SRE Health Dashboard for Applications

A responsive, agent-ready SRE health dashboard — Next.js + TypeScript + Tailwind + Recharts.
It mirrors the reliability/performance/UX overview of the original static mockup and adds an
**agentic layer**: proactive insight cards and a conversational **SRE Agent** side panel.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

Build for production:

```bash
npm run build && npm start
```

## What's here

- **Responsive dashboard** — KPI row, SLO compliance, availability/error/latency trends,
  health-by-application table, incidents (donut + stacked timeline), top error types,
  infrastructure health, Apdex gauge, slow transactions, change failure rate, alerts.
  Reflows from a 7-column desktop grid down to single-column on mobile.
- **Agent chat stub** — the "Ask the Agent" button (and every insight card) opens a
  streaming chat panel backed by `POST /api/agent`. It returns keyword-routed canned
  answers today; the file documents a drop-in Claude backend.
- **Adaptive-UI placeholder** — `InsightBanner` renders agent-generated proactive insights
  (SLO burn-rate risk, correlated alerts) that, in the live system, would reorder widgets.

## Architecture

Each sidebar section is a real, deep-linkable route (`/`, `/incidents`, `/performance`, …)
under a shared `(dashboard)` layout. The layout (sidebar + top bar + agent panel) persists
across navigation; data and agent state live in one React context fetched once.

```
src/
  app/
    layout.tsx            # root: fonts + metadata
    (dashboard)/
      layout.tsx          # client shell: AppShellProvider + Sidebar + TopBar + AgentChatPanel
      page.tsx            # "/"  Overview
      applications/       # "/applications"
      slos/ alerts/ incidents/ errors/ performance/ availability/
      infrastructure/ capacity/ change-health/ reports/ settings/
    api/
      agent/route.ts      # streaming chat endpoint (stub → Claude drop-in documented)
      metrics/route.ts    # DashboardData as JSON (API-ready)
      insights/route.ts   # proactive insights as JSON
  components/
    layout/               # Sidebar (next/link + usePathname), TopBar
    dashboard/            # one component per panel
    views/                # one view per route (OverviewView, SectionViews)
    agent/                # InsightBanner, AgentChatPanel
    charts/               # dependency-free Sparkline
    ui/                   # Panel wrapper
  lib/
    types.ts              # domain contracts (DashboardData, AgentMessage, ...)
    context/AppShell.tsx  # shared data + agent context
    data/
      mock.ts             # canonical mock dataset
      provider.ts         # DataProvider interface (mock | api)
    hooks/useDashboard.ts # React data hooks
```

## Data layer (mock → live)

The UI only talks to `dataProvider` (`src/lib/data/provider.ts`). It ships with a
`MockDataProvider`; an `ApiDataProvider` is included that fetches `/api/metrics` and
`/api/insights`. Flip the source with an env var:

```bash
# .env.local
NEXT_PUBLIC_DATA_SOURCE=api
```

To go fully live, implement the query against Prometheus/Datadog/ELK inside the API
routes (or a new provider) so it returns the `DashboardData` shape in `lib/types.ts`.

## Wiring the real agent (Claude)

`src/app/api/agent/route.ts` streams plain text so the UI renders tokens live. To make it
real:

1. `npm i @anthropic-ai/sdk`
2. Set `ANTHROPIC_API_KEY` in `.env.local`
3. Replace the `POST` handler with the documented `client.messages.stream(...)` block
   (model `claude-opus-4-8`), exposing MCP-backed tools for metrics, incidents, and runbooks.

## Notes

- Dark navy theme matches the reference design. Colors and severity tokens live in
  `tailwind.config.ts` and `lib/types.ts`.
- Charts are `recharts`; KPI/infra sparklines are a tiny dependency-free SVG component.
