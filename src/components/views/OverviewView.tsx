"use client";

import { KpiRow } from "@/components/dashboard/KpiRow";
import { TrendPanel } from "@/components/dashboard/TrendPanel";
import { CategoryDonut } from "@/components/dashboard/CategoryDonut";
import { HealthByApplication } from "@/components/dashboard/HealthByApplication";
import { IncidentsDonut } from "@/components/dashboard/IncidentsDonut";
import { ChangeFailureRate } from "@/components/dashboard/ChangeFailureRate";
import { ChangeSuccessRate } from "@/components/dashboard/ChangeSuccessRate";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { InsightBanner } from "@/components/agent/InsightBanner";
import { ACCENTS, type DashboardData, type AgentInsight } from "@/lib/types";

export function OverviewView({
  data,
  insights,
}: {
  data: DashboardData;
  insights: AgentInsight[] | null;
}) {
  // Row 1 KPIs — Apps, Availability, Incidents, Deployments.
  const rowOneKeys = ["apps", "avail", "inc", "dep"];
  const rowOneKpis = rowOneKeys
    .map((k) => data.kpis.find((kpi) => kpi.key === k))
    .filter((k): k is NonNullable<typeof k> => Boolean(k));

  return (
    <>
      {insights && insights.length > 0 && <InsightBanner insights={insights} />}

      {/* Row 1 — headline counts */}
      <KpiRow kpis={rowOneKpis} gridClassName="grid-cols-2 xl:grid-cols-4" />

      {/* Row 2 — app distribution donuts + availability trend */}
      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <CategoryDonut title="Applications by Medal" data={data.appsByTier} />
        <CategoryDonut title="Applications by Availability" data={data.appsByAvailability} />
        <TrendPanel title="Availability Over Time" series={data.availability} color={ACCENTS.blue} legend="Availability (%)" />
      </div>

      {/* Row 3 — incidents + change health + P1/P2 incidents */}
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <IncidentsDonut buckets={data.incidentsBySeverity} total={data.incidentsTotal} />
        <ChangeSuccessRate
          value={data.changeSuccessRate.value}
          delta={data.changeSuccessRate.delta}
          series={data.changeSuccessRate.series}
        />
        <ChangeFailureRate
          value={data.changeFailureRate.value}
          delta={data.changeFailureRate.delta}
          series={data.changeFailureRate.series}
        />
        <AlertsPanel alerts={data.criticalIncidents} title="P1 / P2 Incidents" linkText="View all incidents →" />
      </div>

      {/* Row 4 — per-application operational health */}
      <div className="mb-3">
        <HealthByApplication rows={data.healthOps} />
      </div>

      <div className="flex flex-wrap gap-4 px-1 pt-1 text-[10.5px] text-ink-faint">
        <span><b className="text-ink-muted">All times shown in IST</b></span>
        <span><b className="text-ink-muted">Availability</b> = (Total Time − Downtime) / Total Time</span>
      </div>
    </>
  );
}
