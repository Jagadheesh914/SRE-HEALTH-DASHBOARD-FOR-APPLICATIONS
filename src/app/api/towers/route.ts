import { NextResponse } from "next/server";
import { loadApplications } from "@/lib/data/loadApplications";

// ---------------------------------------------------------------------------
//   GET /api/towers  ->  string[]  (distinct, sorted Tower values from the CSV)
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apps = await loadApplications();
    const towers = Array.from(new Set(apps.map((a) => a.tower).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b),
    );
    return NextResponse.json(towers, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: `Could not read applications.csv: ${String(e)}` }, { status: 500 });
  }
}
