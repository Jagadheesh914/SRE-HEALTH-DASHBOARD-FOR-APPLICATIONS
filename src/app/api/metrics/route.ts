import { NextResponse } from "next/server";
import { MOCK_DASHBOARD } from "@/lib/data/mock";

export const runtime = "nodejs";

// API-ready endpoint. Swap MOCK_DASHBOARD for a real query against your
// observability backend (Prometheus/Datadog/ELK) that maps into DashboardData.
export async function GET() {
  return NextResponse.json(MOCK_DASHBOARD, {
    headers: { "Cache-Control": "no-store" },
  });
}
