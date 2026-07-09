import { NextResponse } from "next/server";
import { loadApplications } from "@/lib/data/loadApplications";
import type { TierSelection } from "@/lib/types";

// ---------------------------------------------------------------------------
//   GET /api/applications?tier=Gold|Silver|Bronze|All%20Applications
//
// Reads the stored inventory from data/applications.csv at request time and
// returns the application list, optionally filtered to a metal tier.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  let apps;
  try {
    apps = await loadApplications();
  } catch (e) {
    return NextResponse.json({ error: `Could not read applications.csv: ${String(e)}` }, { status: 500 });
  }

  const params = new URL(req.url).searchParams;
  const tier = params.get("tier") as TierSelection | null;
  const tower = params.get("tower");
  if (tier && tier !== "All Applications") apps = apps.filter((a) => a.tier === tier);
  if (tower && tower !== "All Towers") apps = apps.filter((a) => a.tower === tower);

  return NextResponse.json(apps, { headers: { "Cache-Control": "no-store" } });
}
