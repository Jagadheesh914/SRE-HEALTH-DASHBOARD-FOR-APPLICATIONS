import type { DashboardData, AgentInsight } from "@/lib/types";
import { MOCK_DASHBOARD, MOCK_INSIGHTS } from "./mock";

// ---------------------------------------------------------------------------
// Data provider abstraction.
//
// The UI only ever talks to `dataProvider`. Today it returns mock data; to go
// live, implement `ApiDataProvider` against your observability backend
// (Prometheus/Datadog/ELK via the API routes) and flip NEXT_PUBLIC_DATA_SOURCE.
// ---------------------------------------------------------------------------

export interface DataProvider {
  getDashboard(): Promise<DashboardData>;
  getInsights(): Promise<AgentInsight[]>;
}

class MockDataProvider implements DataProvider {
  async getDashboard(): Promise<DashboardData> {
    // Simulate a small network delay so loading states are exercised.
    await new Promise((r) => setTimeout(r, 150));
    return MOCK_DASHBOARD;
  }
  async getInsights(): Promise<AgentInsight[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_INSIGHTS;
  }
}

class ApiDataProvider implements DataProvider {
  constructor(private baseUrl = "") {}
  async getDashboard(): Promise<DashboardData> {
    const res = await fetch(`${this.baseUrl}/api/metrics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`metrics ${res.status}`);
    return res.json();
  }
  async getInsights(): Promise<AgentInsight[]> {
    const res = await fetch(`${this.baseUrl}/api/insights`, { cache: "no-store" });
    if (!res.ok) throw new Error(`insights ${res.status}`);
    return res.json();
  }
}

const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock";

export const dataProvider: DataProvider =
  source === "api" ? new ApiDataProvider() : new MockDataProvider();
