"use client";

import { Panel } from "@/components/ui/Panel";
import { STATUS_COLORS, type AppOpsRow, type HealthStatus } from "@/lib/types";

const BADGE: Record<HealthStatus, string> = {
  Healthy: "bg-sev-green/15 text-sev-green",
  Warning: "bg-sev-yellow/15 text-sev-yellow",
  Critical: "bg-sev-red/15 text-sev-red",
};

function StatusBadge({ status }: { status: HealthStatus }) {
  return <span className={`badge ${BADGE[status]}`}>{status}</span>;
}

export function HealthByApplication({ rows }: { rows: AppOpsRow[] }) {
  return (
    <Panel title="Health by Application">
      <div className="min-w-0 flex-1 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="border-b border-panel-border text-left text-[9.5px] font-bold uppercase tracking-wide text-ink-muted">
              <th className="px-1 pb-2">Application</th>
              <th className="px-1 pb-2">Availability</th>
              <th className="px-1 pb-2">Job Status</th>
              <th className="px-1 pb-2">Interface / Service</th>
              <th className="px-1 pb-2">Health Check</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.app} className="border-b border-white/5 last:border-0">
                <td className="px-1 py-1.5 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ background: STATUS_COLORS[r.status] }}
                    />
                    {r.app}
                  </span>
                </td>
                <td className="px-1 py-1.5 text-[11px] text-ink">{r.availability}</td>
                <td className="px-1 py-1.5"><StatusBadge status={r.jobStatus} /></td>
                <td className="px-1 py-1.5"><StatusBadge status={r.serviceStatus} /></td>
                <td className="px-1 py-1.5"><StatusBadge status={r.healthCheckStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
