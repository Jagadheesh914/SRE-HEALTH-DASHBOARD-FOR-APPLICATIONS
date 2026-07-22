"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Panel } from "@/components/ui/Panel";
import type { CategoryDatum } from "@/lib/types";

/**
 * Generic donut for "applications grouped by <category>" widgets
 * (e.g. by medal tier, or by availability status). The center shows the total.
 */
export function CategoryDonut({
  title,
  data,
  centerLabel = "Apps",
}: {
  title: string;
  data: CategoryDatum[];
  centerLabel?: string;
}) {
  const slices = data.filter((d) => d.count > 0);
  const total = slices.reduce((a, d) => a + d.count, 0);
  return (
    <Panel title={title}>
      <div className="flex flex-1 items-center gap-3">
        <div className="relative h-[130px] w-[130px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="count"
                nameKey="name"
                innerRadius="62%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                paddingAngle={1}
              >
                {slices.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-bold text-ink">{total}</span>
            <span className="text-[10.5px] text-ink-muted">{centerLabel}</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-2.5 text-[10.5px]">
          {data.map((d) => {
            const pct = total ? ((d.count / total) * 100).toFixed(1) : "0.0";
            return (
              <div key={d.name} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="h-2 w-2 flex-shrink-0 rounded-sm" style={{ background: d.color }} />
                {d.name}
                <span className="ml-auto pl-2 text-ink-muted">
                  {d.count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
