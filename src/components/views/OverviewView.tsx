"use client";

import { KpiRow } from "@/components/dashboard/KpiRow";
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
import { InsightBanner } from "@/components/agent/InsightBanner";
import { ACCENTS, type DashboardData, type AgentInsight } from "@/lib/types";

export function OverviewView({
  data,
  insights,
  onAsk,
}: {
  data: DashboardData;
  insights: AgentInsight[] | null;
  onAsk: (q: string) => void;
}) {
  return (
    <>
      {insights && insights.length > 0 && <InsightBanner insights={insights} onAsk={onAsk} />}

      <KpiRow kpis={data.kpis} />

      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <SloPanel slo={data.slo} />
        <TrendPanel title="Availability Over Time" series={data.availability} color={ACCENTS.blue} legend="Availability (%)" />
        <TrendPanel title="Error Rate Over Time" series={data.errorRate} color={ACCENTS.red} legend="Error Rate (%)" />
        <TrendPanel title="Latency (P95) Over Time" series={data.latency} color={ACCENTS.purple} legend="P95 Latency (ms)" />
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.9fr_0.9fr_1fr_0.9fr]">
        <HealthTable rows={data.health} />
        <IncidentsDonut buckets={data.incidentsBySeverity} total={data.incidentsTotal} />
        <IncidentsOverTime data={data.incidentsOverTime} />
        <TopErrorTypes rows={data.errorTypes} />
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <InfraHealth metrics={data.infra} />
        <ApdexGauge value={data.apdex} />
        <SlowTransactions rows={data.slowTransactions} />
        <ChangeFailureRate
          value={data.changeFailureRate.value}
          delta={data.changeFailureRate.delta}
          series={data.changeFailureRate.series}
        />
        <AlertsPanel alerts={data.alerts} />
      </div>

      <div className="flex flex-wrap gap-4 px-1 pt-1 text-[10.5px] text-ink-faint">
        <span><b className="text-ink-muted">All times shown in IST</b></span>
        <span><b className="text-ink-muted">SLO Compliance</b> = % of time SLO was met</span>
        <span><b className="text-ink-muted">Availability</b> = (Total Time − Downtime) / Total Time</span>
      </div>
    </>
  );
}
