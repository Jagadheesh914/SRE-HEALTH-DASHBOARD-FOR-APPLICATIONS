import { NextResponse } from "next/server";
import { MOCK_DASHBOARD } from "@/lib/data/mock";
import { buildDashboardFromApps } from "@/lib/data/buildDashboard";
import { loadApplications } from "@/lib/data/loadApplications";
import type { TierSelection } from "@/lib/types";

// ---------------------------------------------------------------------------
// Live health-check endpoint.
//
//   GET /api/health?tier=Gold|Silver|Bronze|All%20Applications
//
// Loads the real application inventory (data/applications.csv), scopes it to
// the selected tier, and builds the DashboardData so every page reflects the
// selected applications.
//
// TODO(live): buildDashboardFromApps currently SYNTHESIZES per-app health
// (deterministic, seeded by name). Replace synthHealth with a real
// health-check lookup keyed by app name when the live source is available.
// ---------------------------------------------------------------------------

const VALID: TierSelection[] = ["All Applications", "Gold", "Silver", "Bronze"];

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const raw = params.get("tier") ?? "All Applications";
  const tier: TierSelection = VALID.includes(raw as TierSelection)
    ? (raw as TierSelection)
    : "All Applications";
  const tower = params.get("tower");

  let all;
  try {
    all = await loadApplications();
  } catch (e) {
    return NextResponse.json({ error: `Could not read applications.csv: ${String(e)}` }, { status: 500 });
  }

  const total = all.length || 1;
  let selected = tier === "All Applications" ? all : all.filter((a) => a.tier === tier);
  if (tower && tower !== "All Towers") selected = selected.filter((a) => a.tower === tower);
  const fraction = selected.length / total;

  const seedKey = `${tier}|${tower ?? "All Towers"}`;
  const data = buildDashboardFromApps(selected, MOCK_DASHBOARD, fraction, seedKey);
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
