"use client";

import { Panel } from "@/components/ui/Panel";
import type { AppHealthRow, HealthStatus } from "@/lib/types";

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

export function HealthTable({ rows }: { rows: AppHealthRow[] }) {
  return (
    <Panel title="Health by Application">
      <div className="min-w-0 flex-1 overflow-x-auto">
        <table className="w-full min-w-[430px] border-collapse">
          <thead>
            <tr className="border-b border-panel-border text-left text-[9.5px] font-bold uppercase tracking-wide text-ink-muted">
              <th className="px-1 pb-2">Application</th>
              <th className="px-1 pb-2">Availability</th>
              <th className="px-1 pb-2">SLO</th>
              <th className="px-1 pb-2">Error Rate</th>
              <th className="px-1 pb-2">P95</th>
              <th className="px-1 pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.app} className="border-b border-white/5 last:border-0">
                <td className="px-1 py-1.5 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ background: DOT[r.status] }}
                    />
                    {r.app}
                  </span>
                </td>
                <td className="px-1 py-1.5 text-[11px] text-ink">{r.availability}</td>
                <td className="px-1 py-1.5 text-[11px] text-ink">{r.slo}</td>
                <td className="px-1 py-1.5 text-[11px] text-ink">{r.errorRate}</td>
                <td className="px-1 py-1.5 text-[11px] text-ink">{r.p95Latency}</td>
                <td className="px-1 py-1.5">
                  <span className={`badge ${BADGE[r.status]}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
