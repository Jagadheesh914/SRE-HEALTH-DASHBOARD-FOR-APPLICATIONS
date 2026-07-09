"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Panel } from "@/components/ui/Panel";
import type { IncidentBucket } from "@/lib/types";

const COLORS: Record<string, string> = {
  P1: "#e0384a",
  P2: "#e8720c",
  P3: "#d97706",
  P4: "#16a34a",
};

export function IncidentsDonut({
  buckets,
  total,
}: {
  buckets: IncidentBucket[];
  total: number;
}) {
  const data = buckets.filter((b) => b.count > 0);
  return (
    <Panel title="Incidents by Severity">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative h-[130px] w-[130px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                innerRadius="62%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                paddingAngle={1}
              >
                {data.map((b) => (
                  <Cell key={b.severity} fill={COLORS[b.severity]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-bold text-ink">{total}</span>
            <span className="text-[10.5px] text-ink-muted">Total</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-2.5 text-[10.5px]">
          {buckets.map((b) => (
            <div key={b.severity} className="flex items-center gap-1.5 whitespace-nowrap">
              <span
                className="h-2 w-2 flex-shrink-0 rounded-sm"
                style={{ background: COLORS[b.severity] }}
              />
              {b.label}
              <span className="ml-auto pl-2 text-ink-muted">
                {b.count} ({b.pct})
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
