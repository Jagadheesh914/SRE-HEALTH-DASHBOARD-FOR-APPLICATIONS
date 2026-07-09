"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel } from "@/components/ui/Panel";
import type { IncidentTimePoint } from "@/lib/types";

const SERIES: { key: keyof IncidentTimePoint; label: string; color: string }[] = [
  { key: "P1", label: "P1 - Critical", color: "#e0384a" },
  { key: "P2", label: "P2 - High", color: "#e8720c" },
  { key: "P3", label: "P3 - Medium", color: "#d97706" },
  { key: "P4", label: "P4 - Low", color: "#16a34a" },
];

export function IncidentsOverTime({ data }: { data: IncidentTimePoint[] }) {
  return (
    <Panel title="Incidents Over Time">
      <div className="min-h-[150px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#e3ebf6" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: "#8b9bc0", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8b9bc0", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: "rgba(60,102,206,0.06)" }}
              contentStyle={{
                background: "#ffffff",
                border: "1px solid rgba(60,102,206,0.2)",
                borderRadius: 8,
                fontSize: 12,
                color: "#0a1a3d",
                boxShadow: "0 4px 14px rgba(10,26,61,0.12)",
              }}
              labelStyle={{ color: "#5b6a8c" }}
            />
            {SERIES.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} stackId="a" fill={s.color} radius={[1.5, 1.5, 0, 0]} maxBarSize={30} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1.5 flex flex-shrink-0 flex-wrap justify-center gap-3 text-[10.5px] text-ink-muted">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1">
            <i className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </Panel>
  );
}
