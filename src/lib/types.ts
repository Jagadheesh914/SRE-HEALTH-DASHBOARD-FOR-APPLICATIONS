// ---------------------------------------------------------------------------
// Domain types for the SRE Health Dashboard.
// These are the contract between the UI and any data provider (mock or live).
// ---------------------------------------------------------------------------

export type HealthStatus = "Healthy" | "Warning" | "Critical";
export type Direction = "up" | "down";
export type Severity = "P1" | "P2" | "P3" | "P4";

/** Metal service-class tiers shown in the "All Applications" dropdown. */
export type Tier = "Gold" | "Silver" | "Bronze";
/** The dropdown selection: a specific tier, or all applications (no filter). */
export type TierSelection = Tier | "All Applications";

/** One application row as loaded from the stored applications.csv. */
export interface StoredApp {
  name: string;
  businessCriticality: string;
  tier: Tier | "";
  tower: string;
}

export interface Kpi {
  key: string;
  label: string;
  value: string;
  delta: string;
  /** Direction of the metric movement (not whether it's good/bad). */
  direction: Direction;
  /** Whether the movement is a good thing (drives color). */
  positive: boolean;
  /** Accent color token, e.g. "blue" | "green" | "red" ... */
  accent: keyof typeof ACCENTS;
  spark: number[];
}

// Accent map kept here so both types and components share one source of truth.
export const ACCENTS = {
  blue: "#3c66ce",
  green: "#16a34a",
  red: "#e0384a",
  purple: "#7c5cd6",
  orange: "#e8720c",
  teal: "#36c0cf",
  coned: "#0099d8",
} as const;

export interface SloCompliance {
  name: string;
  value: number; // percentage 0-100
}

export interface TimePoint {
  t: string; // e.g. "May 14"
  value: number;
}

export interface TimeSeries {
  unit: string;
  min?: number;
  max?: number;
  points: TimePoint[];
}

export interface AppHealthRow {
  app: string;
  availability: string;
  slo: string;
  errorRate: string;
  p95Latency: string;
  status: HealthStatus;
}

/** A labelled slice for a category donut (e.g. apps by tier / by availability). */
export interface CategoryDatum {
  name: string;
  count: number;
  color: string;
}

/** Operational health of one application across its monitored surfaces. */
export interface AppOpsRow {
  app: string;
  availability: string;
  /** Batch / scheduled job health. */
  jobStatus: HealthStatus;
  /** Interface / service (API dependency) health. */
  serviceStatus: HealthStatus;
  /** Synthetic health-check / heartbeat status. */
  healthCheckStatus: HealthStatus;
  /** Overall roll-up status. */
  status: HealthStatus;
}

export interface IncidentBucket {
  severity: Severity;
  label: string;
  count: number;
  pct: string;
}

export interface IncidentTimePoint {
  t: string;
  P1: number;
  P2: number;
  P3: number;
  P4: number;
}

export interface ErrorType {
  type: string;
  count: string;
  pct: string;
}

export interface InfraMetric {
  key: string;
  label: string;
  value: string;
  delta: string;
  direction: Direction;
  positive: boolean;
  accent: keyof typeof ACCENTS;
  spark: number[];
}

export interface SlowTransaction {
  tx: string;
  p95: string;
  trend: Direction;
}

export interface AlertItem {
  id: string;
  severity: Severity;
  text: string;
  time: string;
}

export interface DashboardData {
  updatedAt: string;
  days: string[];
  kpis: Kpi[];
  slo: SloCompliance[];
  availability: TimeSeries;
  errorRate: TimeSeries;
  latency: TimeSeries;
  health: AppHealthRow[];
  /** Applications grouped by medal tier (Gold / Silver / Bronze). */
  appsByTier: CategoryDatum[];
  /** Applications grouped by availability status (Healthy / Warning / Critical). */
  appsByAvailability: CategoryDatum[];
  /** Per-application operational health for the "Health by Application" table. */
  healthOps: AppOpsRow[];
  /** P1/P2 incident descriptions surfaced in the Overview "Incidents" panel. */
  criticalIncidents: AlertItem[];
  incidentsBySeverity: IncidentBucket[];
  incidentsTotal: number;
  incidentsOverTime: IncidentTimePoint[];
  errorTypes: ErrorType[];
  infra: InfraMetric[];
  apdex: number;
  slowTransactions: SlowTransaction[];
  changeFailureRate: { value: string; delta: string; series: TimeSeries };
  changeSuccessRate: { value: string; delta: string; series: TimeSeries };
  alerts: AlertItem[];
}

/** Shared color tokens for the medal tiers, used by tier donuts/badges. */
export const TIER_COLORS: Record<string, string> = {
  Gold: "#e8a33d",
  Silver: "#8494b8",
  Bronze: "#c67b45",
};

/** Shared color tokens for health statuses, used by donuts/tables. */
export const STATUS_COLORS: Record<HealthStatus, string> = {
  Healthy: "#16a34a",
  Warning: "#d97706",
  Critical: "#e0384a",
};

// ------- Agent (chat / insights) contracts -------

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
  /** Optional structured actions the agent surfaces alongside prose. */
  citations?: string[];
}

export interface AgentInsight {
  id: string;
  kind: "risk" | "anomaly" | "info";
  title: string;
  detail: string;
  /** Which widget key(s) this insight suggests promoting. */
  promote?: string[];
}
