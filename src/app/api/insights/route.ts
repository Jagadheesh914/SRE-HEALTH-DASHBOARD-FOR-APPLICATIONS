import { NextResponse } from "next/server";
import { MOCK_INSIGHTS } from "@/lib/data/mock";

export const runtime = "nodejs";

// API-ready endpoint. In the live system an agent runs on a schedule/stream
// trigger and writes proactive insights here (SLO burn-rate, correlated alerts).
export async function GET() {
  return NextResponse.json(MOCK_INSIGHTS, {
    headers: { "Cache-Control": "no-store" },
  });
}
