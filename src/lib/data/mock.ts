import type { DashboardData, AgentInsight } from "@/lib/types";

// Deterministic label helper so server & client render identical day labels.
function lastNDays(n: number, ref = new Date("2024-05-20T10:30:00")): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(ref);
    d.setDate(ref.getDate() - i);
    out.push(d.toLocaleString("en-US", { month: "short", day: "numeric" }));
  }
  return out;
}

const days = lastNDays(7);
const ts = (unit: string, vals: number[], min?: number, max?: number) => ({
  unit,
  min,
  max,
  points: vals.map((value, i) => ({ t: days[i], value })),
});

/**
 * The canonical mock dataset. Mirrors the original static dashboard so the UI
 * renders standalone with zero backend. A live provider returns the same shape.
 */
export const MOCK_DASHBOARD: DashboardData = {
  updatedAt: "May 20, 2024 10:30 AM",
  days,
  kpis: [
    { key: "apps", label: "Applications", value: "24", delta: "2 vs prev 7 days", direction: "up", positive: true, accent: "blue", spark: [19, 20, 21, 21, 22, 23, 24] },
    { key: "slo", label: "SLO Compliance", value: "96.2%", delta: "2.4%", direction: "up", positive: true, accent: "green", spark: [92, 93, 94, 94.5, 95.2, 95.8, 96.2] },
    { key: "avail", label: "Availability (Avg)", value: "99.92%", delta: "0.15%", direction: "up", positive: true, accent: "blue", spark: [99.6, 99.65, 99.7, 99.78, 99.83, 99.88, 99.92] },
    { key: "err", label: "Error Rate (Avg)", value: "0.35%", delta: "0.12%", direction: "down", positive: true, accent: "red", spark: [0.58, 0.52, 0.5, 0.46, 0.42, 0.38, 0.35] },
    { key: "lat", label: "Latency (P95)", value: "312 ms", delta: "28 ms", direction: "down", positive: true, accent: "purple", spark: [345, 338, 330, 325, 320, 316, 312] },
    { key: "inc", label: "Incidents (P1/P2)", value: "7", delta: "3", direction: "down", positive: true, accent: "orange", spark: [13, 12, 11, 10, 9, 8, 7] },
    { key: "dep", label: "Deployments", value: "18", delta: "4", direction: "up", positive: true, accent: "teal", spark: [9, 10, 12, 13, 14, 16, 18] },
  ],
  slo: [
    { name: "Checkout Service", value: 99.9 },
    { name: "User Service", value: 99.6 },
    { name: "Order Service", value: 98.7 },
    { name: "Payment Service", value: 97.2 },
    { name: "Inventory Service", value: 96.1 },
    { name: "Notification Service", value: 94.3 },
    { name: "Search Service", value: 92.7 },
    { name: "Recommendation Service", value: 91.5 },
  ],
  availability: ts("%", [99.3, 99.15, 99.4, 99.35, 99.5, 99.05, 99.4], 98, 100),
  errorRate: ts("%", [0.42, 0.5, 0.7, 1.05, 0.62, 0.45, 0.5], 0, 1.5),
  latency: ts("ms", [280, 300, 340, 430, 370, 300, 312], 0, 600),
  health: [
    { app: "Checkout Service", availability: "99.98%", slo: "99.9%", errorRate: "0.12%", p95Latency: "210 ms", status: "Healthy" },
    { app: "User Service", availability: "99.95%", slo: "99.6%", errorRate: "0.18%", p95Latency: "180 ms", status: "Healthy" },
    { app: "Order Service", availability: "99.93%", slo: "98.7%", errorRate: "0.25%", p95Latency: "250 ms", status: "Healthy" },
    { app: "Payment Service", availability: "99.81%", slo: "97.2%", errorRate: "0.45%", p95Latency: "350 ms", status: "Warning" },
    { app: "Inventory Service", availability: "99.70%", slo: "96.1%", errorRate: "0.55%", p95Latency: "420 ms", status: "Warning" },
    { app: "Notification Service", availability: "99.50%", slo: "94.3%", errorRate: "0.85%", p95Latency: "310 ms", status: "Critical" },
    { app: "Search Service", availability: "99.20%", slo: "92.7%", errorRate: "1.05%", p95Latency: "480 ms", status: "Critical" },
    { app: "Recommendation Service", availability: "98.90%", slo: "91.5%", errorRate: "1.20%", p95Latency: "500 ms", status: "Critical" },
  ],
  appsByTier: [
    { name: "Gold", count: 8, color: "#e8a33d" },
    { name: "Silver", count: 10, color: "#8494b8" },
    { name: "Bronze", count: 6, color: "#c67b45" },
  ],
  appsByAvailability: [
    { name: "Healthy", count: 15, color: "#16a34a" },
    { name: "Warning", count: 6, color: "#d97706" },
    { name: "Critical", count: 3, color: "#e0384a" },
  ],
  healthOps: [
    { app: "Checkout Service", availability: "99.98%", jobStatus: "Healthy", serviceStatus: "Healthy", healthCheckStatus: "Healthy", status: "Healthy" },
    { app: "User Service", availability: "99.95%", jobStatus: "Healthy", serviceStatus: "Healthy", healthCheckStatus: "Healthy", status: "Healthy" },
    { app: "Order Service", availability: "99.93%", jobStatus: "Healthy", serviceStatus: "Warning", healthCheckStatus: "Healthy", status: "Healthy" },
    { app: "Payment Service", availability: "99.81%", jobStatus: "Warning", serviceStatus: "Healthy", healthCheckStatus: "Warning", status: "Warning" },
    { app: "Inventory Service", availability: "99.70%", jobStatus: "Healthy", serviceStatus: "Warning", healthCheckStatus: "Warning", status: "Warning" },
    { app: "Notification Service", availability: "99.50%", jobStatus: "Critical", serviceStatus: "Warning", healthCheckStatus: "Critical", status: "Critical" },
    { app: "Search Service", availability: "99.20%", jobStatus: "Warning", serviceStatus: "Critical", healthCheckStatus: "Critical", status: "Critical" },
    { app: "Recommendation Service", availability: "98.90%", jobStatus: "Critical", serviceStatus: "Critical", healthCheckStatus: "Warning", status: "Critical" },
  ],
  criticalIncidents: [
    { id: "inc1", severity: "P1", text: "Notification Service — high error rate, connection-pool exhaustion", time: "5m ago" },
    { id: "inc2", severity: "P2", text: "Search Service — P95 latency > 500ms after May 17 deploy", time: "22m ago" },
    { id: "inc3", severity: "P1", text: "Payment Service — intermittent 5xx on /checkout/submit", time: "1h ago" },
    { id: "inc4", severity: "P2", text: "Recommendation Service — availability below target", time: "2h ago" },
    { id: "inc5", severity: "P2", text: "Order Service — elevated DB connection errors", time: "3h ago" },
  ],
  incidentsBySeverity: [
    { severity: "P1", label: "P1 - Critical", count: 7, pct: "31.8%" },
    { severity: "P2", label: "P2 - High", count: 15, pct: "68.2%" },
    { severity: "P3", label: "P3 - Medium", count: 0, pct: "0%" },
    { severity: "P4", label: "P4 - Low", count: 0, pct: "0%" },
  ],
  incidentsTotal: 22,
  incidentsOverTime: days.map((t, i) => ({
    t,
    P1: [2, 1, 2, 1, 0, 1, 0][i],
    P2: [3, 4, 3, 2, 3, 2, 3][i],
    P3: [1, 1, 1, 1, 1, 1, 1][i],
    P4: [1, 1, 0, 1, 1, 0, 1][i],
  })),
  errorTypes: [
    { type: "HTTP 5xx", count: "1,248", pct: "38.6%" },
    { type: "Timeout", count: "852", pct: "26.4%" },
    { type: "Database Error", count: "684", pct: "21.2%" },
    { type: "Dependency Error", count: "318", pct: "9.8%" },
    { type: "Validation Error", count: "138", pct: "4.0%" },
  ],
  infra: [
    { key: "cpu", label: "CPU Utilization (Avg)", value: "58%", delta: "6%", direction: "up", positive: false, accent: "orange", spark: [52, 55, 50, 54, 58, 53, 56, 60, 55, 58, 54, 59, 58] },
    { key: "mem", label: "Memory Utilization (Avg)", value: "63%", delta: "4%", direction: "up", positive: false, accent: "blue", spark: [58, 62, 60, 57, 55, 54, 56, 58, 55, 57, 60, 62, 63] },
    { key: "disk", label: "Disk Utilization (Avg)", value: "47%", delta: "3%", direction: "down", positive: true, accent: "green", spark: [52, 50, 53, 49, 51, 48, 49, 47, 48, 46, 47, 48, 47] },
    { key: "net", label: "Network I/O (Avg)", value: "342 Mbps", delta: "12 Mbps", direction: "up", positive: false, accent: "purple", spark: [300, 305, 315, 308, 320, 330, 325, 335, 328, 338, 332, 340, 342] },
  ],
  apdex: 0.87,
  slowTransactions: [
    { tx: "/checkout/submit", p95: "1.82 s", trend: "up" },
    { tx: "/report/generate", p95: "1.35 s", trend: "up" },
    { tx: "/search/query", p95: "1.12 s", trend: "up" },
    { tx: "/user/profile", p95: "0.95 s", trend: "up" },
    { tx: "/order/details", p95: "0.88 s", trend: "up" },
  ],
  changeFailureRate: {
    value: "5.6%",
    delta: "1.2%",
    series: ts("%", [3.5, 4.2, 5.8, 4.4, 6.2, 4.6, 5.6], 0, 10),
  },
  changeSuccessRate: {
    value: "94.4%",
    delta: "1.2%",
    series: ts("%", [96.5, 95.8, 94.2, 95.6, 93.8, 95.4, 94.4], 85, 100),
  },
  alerts: [
    { id: "a1", severity: "P1", text: "High Error Rate in Notification Service", time: "5m ago" },
    { id: "a2", severity: "P2", text: "P95 Latency > 500ms in Search Service", time: "15m ago" },
    { id: "a3", severity: "P2", text: "High CPU Utilization in App Node 3", time: "20m ago" },
    { id: "a4", severity: "P2", text: "Database Connection Errors Elevated", time: "1h ago" },
    { id: "a5", severity: "P2", text: "Disk Utilization > 85% in ES Data Node", time: "2h ago" },
  ],
};

/** Adaptive-UI placeholder: proactive insights an agent would surface. */
export const MOCK_INSIGHTS: AgentInsight[] = [];
