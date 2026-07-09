"use client";

import type { ReactNode } from "react";
import {
  ArrowUp,
  ArrowDown,
  Rocket,
  FileText,
  Download,
  ShieldCheck,
  Server,
  Sparkles,
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { PageHeader } from "@/components/views/PageHeader";
import { SloPanel } from "@/components/dashboard/SloPanel";
import { TrendPanel } from "@/components/dashboard/TrendPanel";
import { HealthTable } from "@/components/dashboard/HealthTable";
import { IncidentsDonut } from "@/components/dashboard/IncidentsDonut";
import { IncidentsOverTime } from "@/components/dashboard/IncidentsOverTime";
import { TopErrorTypes } from "@/components/dashboard/TopErrorTypes";
import { InfraHealth } from "@/components/dashboard/InfraHealth";
import { ApdexGauge } from "@/components/dashboard/ApdexGauge";
import { SlowTransactions } from "@/components/dashboard/SlowTransactions";
import { ChangeFailureRate } from "@/components/dashboard/ChangeFailureRate";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { ACCENTS, type DashboardData, type HealthStatus, type Tier } from "@/lib/types";
import { useAppShell } from "@/lib/context/AppShell";
import { useApplications } from "@/lib/hooks/useDashboard";

/* ---------------------------- shared building blocks --------------------------- */

function StatTile({
  label,
  value,
  sub,
  accent = ACCENTS.blue,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="panel p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold text-ink" style={{ color: accent }}>
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-ink-muted">{sub}</div>}
    </div>
  );
}

const DOT: Record<HealthStatus, string> = {
  Healthy: "#16a34a",
  Warning: "#d97706",
  Critical: "#e0384a",
};
const BADGE: Record<HealthStatus, string> = {
  Healthy: "bg-sev-green/15 text-sev-green",
  Warning: "bg-sev-yellow/15 text-sev-yellow",
  Critical: "bg-sev-red/15 text-sev-red",
};
const SEV_COLOR: Record<string, string> = { P1: "#e0384a", P2: "#e8720c", P3: "#d97706", P4: "#16a34a" };

/* --------------------------------- Applications -------------------------------- */

const TIER_BADGE: Record<Tier, string> = {
  Gold: "bg-[#e8a33d]/15 text-[#b8791f]",
  Silver: "bg-[#8494b8]/15 text-[#5b6a8c]",
  Bronze: "bg-[#c67b45]/15 text-[#a05a2c]",
};

export function ApplicationsView() {
  // Two sources on this page:
  //  - dashboard health data (useAppShell) → restored health summary tiles,
  //    per-app health cards, and the Health table (tier-scoped).
  //  - the STORED data/applications.csv (useApplications) → full inventory list.
  const { data, tier, tower } = useAppShell();
  const { data: apps, loading } = useApplications(tier, tower);
  const list = apps ?? [];
  const health = data?.health ?? [];

  const counts = health.reduce(
    (a, r) => ((a[r.status] = (a[r.status] ?? 0) + 1), a),
    {} as Record<HealthStatus, number>,
  );

  const scope = [
    tier === "All Applications" ? "all tiers" : `${tier} tier`,
    tower === "All Towers" ? null : tower,
  ]
    .filter(Boolean)
    .join(" · ");
  const busy = loading && !apps;

  return (
    <>
      <PageHeader title="Applications" subtitle={`Reliability posture & stored inventory — ${scope}.`} />

      {/* Restored health summary tiles */}
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total Applications" value={busy ? "…" : String(list.length)} accent={ACCENTS.blue} />
        <StatTile label="Healthy" value={String(counts.Healthy ?? 0)} accent="#16a34a" />
        <StatTile label="Warning" value={String(counts.Warning ?? 0)} accent="#d97706" />
        <StatTile label="Critical" value={String(counts.Critical ?? 0)} accent="#e0384a" />
      </div>

      {/* Restored per-application health cards */}
      {health.length > 0 && (
        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {health.map((app) => (
            <div key={app.app} className="panel p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <span className="h-2 w-2 rounded-full" style={{ background: DOT[app.status] }} />
                  {app.app}
                </span>
                <span className={`badge ${BADGE[app.status]}`}>{app.status}</span>
              </div>
              <dl className="grid grid-cols-2 gap-y-1.5 text-[11.5px]">
                <dt className="text-ink-muted">Availability</dt>
                <dd className="text-right text-ink">{app.availability}</dd>
                <dt className="text-ink-muted">SLO</dt>
                <dd className="text-right text-ink">{app.slo}</dd>
                <dt className="text-ink-muted">Error Rate</dt>
                <dd className="text-right text-ink">{app.errorRate}</dd>
                <dt className="text-ink-muted">P95 Latency</dt>
                <dd className="text-right text-ink">{app.p95Latency}</dd>
              </dl>
            </div>
          ))}
        </div>
      )}

      {/* Restored Health by Application table */}
      {health.length > 0 && (
        <div className="mb-3">
          <HealthTable rows={health} />
        </div>
      )}

      {/* Stored application inventory from applications.csv */}
      <Panel title={`Applications (${busy ? "…" : list.length})`}>
        {busy ? (
          <div className="py-10 text-center text-[12px] text-ink-muted">Loading applications…</div>
        ) : list.length === 0 ? (
          <div className="py-10 text-center text-[12px] text-ink-muted">No applications found for this tier.</div>
        ) : (
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full min-w-[520px] border-collapse">
              <thead className="sticky top-0 bg-panel">
                <tr className="border-b border-panel-border text-left text-[9.5px] font-bold uppercase tracking-wide text-ink-muted">
                  <th className="px-1 pb-2 pt-1">#</th>
                  <th className="px-1 pb-2 pt-1">Application</th>
                  <th className="px-1 pb-2 pt-1">Business Criticality</th>
                  <th className="px-1 pb-2 pt-1">Tier</th>
                  <th className="px-1 pb-2 pt-1">Tower</th>
                </tr>
              </thead>
              <tbody>
                {list.map((app, i) => (
                  <tr key={`${app.name}-${i}`} className="border-b border-[#eef2f9] text-[11px] text-ink last:border-none">
                    <td className="px-1 py-1.5 text-ink-faint">{i + 1}</td>
                    <td className="px-1 py-1.5 font-medium">{app.name}</td>
                    <td className="px-1 py-1.5 text-ink-muted">{app.businessCriticality}</td>
                    <td className="px-1 py-1.5">
                      {app.tier ? (
                        <span className={`badge ${TIER_BADGE[app.tier]}`}>{app.tier}</span>
                      ) : (
                        <span className="text-ink-faint">—</span>
                      )}
                    </td>
                    <td className="px-1 py-1.5">{app.tower || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

/* ----------------------------------- SLIs/SLOs --------------------------------- */

export function SloView({ data }: { data: DashboardData }) {
  return (
    <>
      <PageHeader title="SLIs / SLOs" subtitle="Service-level objectives and error-budget compliance." />
      <div className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
        <SloPanel slo={data.slo} />
        <TrendPanel title="Availability Over Time" series={data.availability} color={ACCENTS.blue} legend="Availability (%)" />
      </div>
      <Panel title="SLO Targets vs Actual">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse">
            <thead>
              <tr className="border-b border-panel-border text-left text-[9.5px] font-bold uppercase tracking-wide text-ink-muted">
                <th className="px-1 pb-2">Service</th>
                <th className="px-1 pb-2">Target</th>
                <th className="px-1 pb-2">Actual</th>
                <th className="px-1 pb-2">Error Budget</th>
                <th className="px-1 pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.slo.map((s) => {
                const target = 99;
                const budget = (((s.value - target) / (100 - target)) * 100).toFixed(0);
                const ok = s.value >= target;
                return (
                  <tr key={s.name} className="border-b border-white/5 last:border-0">
                    <td className="px-1 py-1.5 text-[11px] text-ink">{s.name}</td>
                    <td className="px-1 py-1.5 text-[11px] text-ink-muted">{target}%</td>
                    <td className="px-1 py-1.5 text-[11px] text-ink">{s.value}%</td>
                    <td className="px-1 py-1.5 text-[11px]" style={{ color: ok ? "#16a34a" : "#e0384a" }}>
                      {ok ? `${budget}% left` : "Exhausted"}
                    </td>
                    <td className="px-1 py-1.5">
                      <span className={`badge ${ok ? "bg-sev-green/15 text-sev-green" : "bg-sev-red/15 text-sev-red"}`}>
                        {ok ? "Met" : "At Risk"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

/* ------------------------------------ Alerts ----------------------------------- */

export function AlertsView({ data }: { data: DashboardData }) {
  return (
    <>
      <PageHeader title="Alerts" subtitle="Active alerts across all services, newest first." />
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Active Alerts" value={String(data.alerts.length)} accent={ACCENTS.orange} />
        <StatTile label="P1" value={String(data.alerts.filter((a) => a.severity === "P1").length)} accent="#e0384a" />
        <StatTile label="P2" value={String(data.alerts.filter((a) => a.severity === "P2").length)} accent="#e8720c" />
        <StatTile label="Muted" value="0" accent={ACCENTS.blue} />
      </div>
      <Panel title="All Alerts">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse">
            <thead>
              <tr className="border-b border-panel-border text-left text-[9.5px] font-bold uppercase tracking-wide text-ink-muted">
                <th className="px-1 pb-2">Severity</th>
                <th className="px-1 pb-2">Alert</th>
                <th className="px-1 pb-2">Triggered</th>
              </tr>
            </thead>
            <tbody>
              {data.alerts.map((a) => (
                <tr key={a.id} className="border-b border-white/5 last:border-0">
                  <td className="px-1 py-2">
                    <span className="badge" style={{ background: `${SEV_COLOR[a.severity]}22`, color: SEV_COLOR[a.severity] }}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="px-1 py-2 text-[11.5px] text-ink">{a.text}</td>
                  <td className="px-1 py-2 text-[11px] text-ink-faint">{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

/* ---------------------------------- Incidents ---------------------------------- */

export function IncidentsView({ data }: { data: DashboardData }) {
  return (
    <>
      <PageHeader title="Incidents" subtitle="Incident volume, severity mix, and trend." />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <IncidentsDonut buckets={data.incidentsBySeverity} total={data.incidentsTotal} />
        <IncidentsOverTime data={data.incidentsOverTime} />
      </div>
    </>
  );
}

/* -------------------------------- Error Tracking ------------------------------- */

export function ErrorTrackingView({ data }: { data: DashboardData }) {
  return (
    <>
      <PageHeader title="Error Tracking" subtitle="Error rate trend and breakdown by type." />
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <TrendPanel title="Error Rate Over Time" series={data.errorRate} color={ACCENTS.red} legend="Error Rate (%)" />
        <TopErrorTypes rows={data.errorTypes} />
      </div>
    </>
  );
}

/* --------------------------------- Performance --------------------------------- */

export function PerformanceView({ data }: { data: DashboardData }) {
  return (
    <>
      <PageHeader title="Performance" subtitle="Latency, throughput, and user-experience health." />
      <div className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_1fr]">
        <TrendPanel title="Latency (P95) Over Time" series={data.latency} color={ACCENTS.purple} legend="P95 Latency (ms)" />
        <ApdexGauge value={data.apdex} />
      </div>
      <SlowTransactions rows={data.slowTransactions} />
    </>
  );
}

/* --------------------------------- Availability -------------------------------- */

export function AvailabilityView({ data }: { data: DashboardData }) {
  return (
    <>
      <PageHeader title="Availability" subtitle="Uptime trend and per-service availability." />
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Avg Availability" value="99.92%" accent="#16a34a" sub="Last 7 days" />
        <StatTile label="Best" value="99.98%" accent="#16a34a" sub="Checkout Service" />
        <StatTile label="Worst" value="98.90%" accent="#e0384a" sub="Recommendation Service" />
        <StatTile label="Downtime" value="~48 min" accent={ACCENTS.orange} sub="Across all apps" />
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <TrendPanel title="Availability Over Time" series={data.availability} color={ACCENTS.blue} legend="Availability (%)" />
        <HealthTable rows={data.health} />
      </div>
    </>
  );
}

/* -------------------------------- Infrastructure ------------------------------- */

export function InfrastructureView({ data }: { data: DashboardData }) {
  const nodes = [
    { node: "app-node-1", role: "Application", cpu: "54%", mem: "61%", status: "Healthy" as HealthStatus },
    { node: "app-node-2", role: "Application", cpu: "58%", mem: "63%", status: "Healthy" as HealthStatus },
    { node: "app-node-3", role: "Application", cpu: "82%", mem: "71%", status: "Warning" as HealthStatus },
    { node: "es-data-1", role: "Search / ES", cpu: "47%", mem: "68%", status: "Warning" as HealthStatus },
    { node: "db-primary", role: "Database", cpu: "39%", mem: "55%", status: "Healthy" as HealthStatus },
  ];
  return (
    <>
      <PageHeader title="Infrastructure" subtitle="Compute, memory, disk, and network health." />
      <div className="mb-3">
        <InfraHealth metrics={data.infra} />
      </div>
      <Panel title="Nodes">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse">
            <thead>
              <tr className="border-b border-panel-border text-left text-[9.5px] font-bold uppercase tracking-wide text-ink-muted">
                <th className="px-1 pb-2">Node</th>
                <th className="px-1 pb-2">Role</th>
                <th className="px-1 pb-2">CPU</th>
                <th className="px-1 pb-2">Memory</th>
                <th className="px-1 pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((n) => (
                <tr key={n.node} className="border-b border-white/5 last:border-0">
                  <td className="px-1 py-1.5 text-[11px] text-ink">
                    <span className="flex items-center gap-1.5">
                      <Server className="h-3.5 w-3.5 text-ink-muted" />
                      {n.node}
                    </span>
                  </td>
                  <td className="px-1 py-1.5 text-[11px] text-ink-muted">{n.role}</td>
                  <td className="px-1 py-1.5 text-[11px] text-ink">{n.cpu}</td>
                  <td className="px-1 py-1.5 text-[11px] text-ink">{n.mem}</td>
                  <td className="px-1 py-1.5">
                    <span className={`badge ${BADGE[n.status]}`}>{n.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

/* ---------------------------------- Capacity ----------------------------------- */

export function CapacityView({ data }: { data: DashboardData }) {
  const headroom = [
    { name: "CPU", used: 58, color: "#e8720c" },
    { name: "Memory", used: 63, color: "#3c66ce" },
    { name: "Disk", used: 47, color: "#16a34a" },
    { name: "Network", used: 34, color: "#7c5cd6" },
  ];
  return (
    <>
      <PageHeader title="Capacity" subtitle="Resource utilization and headroom forecasting." />
      <div className="mb-3">
        <InfraHealth metrics={data.infra} />
      </div>
      <Panel title="Headroom (used vs available)">
        <div className="flex flex-col gap-4 py-1">
          {headroom.map((h) => (
            <div key={h.name}>
              <div className="mb-1 flex justify-between text-[11.5px]">
                <span className="text-ink">{h.name}</span>
                <span className="text-ink-muted">{h.used}% used · {100 - h.used}% free</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded bg-[#eef2f9]">
                <div className="h-full rounded" style={{ width: `${h.used}%`, background: h.color }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-ink-muted">
          At the current growth rate, CPU is projected to reach 80% capacity in ~6 weeks. Consider
          scaling app-node pool before the next quarterly traffic peak.
        </p>
      </Panel>
    </>
  );
}

/* -------------------------------- Change Health -------------------------------- */

export function ChangeHealthView({ data }: { data: DashboardData }) {
  const deploys = [
    { svc: "search-svc", ver: "1.8.2", when: "May 17, 09:12", result: "Failed" },
    { svc: "checkout-svc", ver: "3.2.0", when: "May 18, 14:05", result: "Success" },
    { svc: "recommendation-svc", ver: "0.9.7", when: "May 18, 16:40", result: "Failed" },
    { svc: "user-svc", ver: "2.1.4", when: "May 19, 11:20", result: "Success" },
    { svc: "order-svc", ver: "4.0.1", when: "May 20, 08:00", result: "Success" },
  ];
  return (
    <>
      <PageHeader title="Change Health" subtitle="Deployment frequency and change failure rate." />
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Deployments" value="18" accent={ACCENTS.teal} sub="+4 vs prev 7 days" />
        <StatTile label="Change Failure Rate" value={data.changeFailureRate.value} accent="#e0384a" sub={`▲ ${data.changeFailureRate.delta}`} />
        <StatTile label="Failed Deploys" value="2" accent="#e8720c" sub="Last 7 days" />
        <StatTile label="Mean Time to Restore" value="42 min" accent={ACCENTS.blue} />
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <ChangeFailureRate
          value={data.changeFailureRate.value}
          delta={data.changeFailureRate.delta}
          series={data.changeFailureRate.series}
        />
        <Panel title="Recent Deployments">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px] border-collapse">
              <thead>
                <tr className="border-b border-panel-border text-left text-[9.5px] font-bold uppercase tracking-wide text-ink-muted">
                  <th className="px-1 pb-2">Service</th>
                  <th className="px-1 pb-2">Version</th>
                  <th className="px-1 pb-2">When</th>
                  <th className="px-1 pb-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {deploys.map((d, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="px-1 py-1.5 text-[11px] text-ink">
                      <span className="flex items-center gap-1.5">
                        <Rocket className="h-3.5 w-3.5 text-ink-muted" />
                        {d.svc}
                      </span>
                    </td>
                    <td className="px-1 py-1.5 text-[11px] text-ink-muted">{d.ver}</td>
                    <td className="px-1 py-1.5 text-[11px] text-ink-muted">{d.when}</td>
                    <td className="px-1 py-1.5">
                      <span className={`badge ${d.result === "Success" ? "bg-sev-green/15 text-sev-green" : "bg-sev-red/15 text-sev-red"}`}>
                        {d.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}

/* ----------------------------------- Reports ----------------------------------- */

export function ReportsView() {
  const reports = [
    { name: "Weekly Reliability Summary", desc: "SLO compliance, incidents, and error budget for the last 7 days.", cadence: "Weekly" },
    { name: "Monthly Executive Report", desc: "High-level availability and business-impact rollup.", cadence: "Monthly" },
    { name: "Incident Postmortem Digest", desc: "All resolved P1/P2 incidents with root-cause narratives.", cadence: "On demand" },
    { name: "Capacity Forecast", desc: "Resource utilization trends and scaling recommendations.", cadence: "Monthly" },
  ];
  return (
    <>
      <PageHeader title="Reports" subtitle="Generate and export reliability reports." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {reports.map((r) => (
          <div key={r.name} className="panel flex items-start gap-3 p-4">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-blue/15 text-brand-blue">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-ink">{r.name}</span>
                <span className="badge bg-panel-hover text-ink-muted">{r.cadence}</span>
              </div>
              <p className="mt-1 text-[11.5px] text-ink-muted">{r.desc}</p>
              <button className="mt-2 flex items-center gap-1.5 rounded-md border border-panel-border px-2.5 py-1 text-[11px] font-semibold text-ink transition-colors hover:border-brand-blue/60 hover:text-brand-blue">
                <Download className="h-3 w-3" />
                Generate
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ----------------------------------- Settings ---------------------------------- */

export function SettingsView() {
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock";
  const Row = ({ label, hint, control }: { label: string; hint: string; control: ReactNode }) => (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-0">
      <div>
        <div className="text-[12.5px] font-semibold text-ink">{label}</div>
        <div className="text-[11px] text-ink-muted">{hint}</div>
      </div>
      <div className="flex-shrink-0">{control}</div>
    </div>
  );
  const Select = ({ options }: { options: string[] }) => (
    <select className="rounded-lg border border-panel-border bg-panel px-3 py-1.5 text-[12px] text-ink outline-none focus:border-brand-blue/60">
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
  return (
    <>
      <PageHeader title="Settings" subtitle="Dashboard configuration and data sources." />
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Panel title="Data Source">
          <Row label="Provider" hint={`Currently: ${source} (set NEXT_PUBLIC_DATA_SOURCE)`} control={<Select options={["mock", "api"]} />} />
          <Row label="Refresh interval" hint="How often KPIs and charts refresh." control={<Select options={["Off", "30s", "1m", "5m"]} />} />
          <Row label="Time zone" hint="Display time zone for all timestamps." control={<Select options={["IST", "UTC", "Local"]} />} />
        </Panel>
        <Panel title="Experience">
          <Row label="Role view" hint="Personalized landing view per role." control={<Select options={["On-call Engineer", "Manager", "Executive"]} />} />
          <Row label="Theme" hint="Dashboard color theme." control={<Select options={["Dark", "Light"]} />} />
          <Row
            label="Proactive agent insights"
            hint="Show SLO burn-rate risk and correlated-alert cards."
            control={<span className="badge bg-sev-green/15 text-sev-green">Enabled</span>}
          />
        </Panel>
      </div>
      <div className="panel mt-3 flex items-start gap-3 p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-blue" />
        <p className="text-[11.5px] text-ink-muted">
          These controls are UI stubs wired to sensible defaults. Persisting them (and enforcing
          role-based views via SSO) is part of the backend integration described in the proposal.
        </p>
      </div>
    </>
  );
}

/* --------------------------- placeholder for unknown --------------------------- */

export function ComingSoonView({ title }: { title: string }) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-2 p-16 text-center">
      <Sparkles className="h-6 w-6 text-brand-blue" />
      <div className="text-[15px] font-semibold text-ink">{title}</div>
      <p className="max-w-sm text-[12px] text-ink-muted">This section is scaffolded and ready for its data wiring.</p>
    </div>
  );
}
