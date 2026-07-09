"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import type { TimeSeries } from "@/lib/types";

export function ChangeFailureRate({
  value,
  delta,
  series,
}: {
  value: string;
  delta: string;
  series: TimeSeries;
}) {
  return (
    <Panel title="Change Failure Rate">
      <div className="mb-2 flex flex-shrink-0 items-baseline gap-2">
        <span className="font-display text-[26px] font-bold text-ink">{value}</span>
        <span className="flex items-center gap-0.5 text-[11.5px] font-bold text-sev-red">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {delta}
        </span>
      </div>
      <div className="min-h-[110px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series.points} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cfr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e0384a" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#e0384a" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" tick={{ fill: "#8b9bc0", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis
              domain={[0, series.max ?? "auto"]}
              tick={{ fill: "#8b9bc0", fontSize: 10 }}
              tickFormatter={(v: number) => `${Math.round(v)}%`}
              axisLine={false}
              tickLine={false}
              width={34}
            />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid rgba(60,102,206,0.2)",
                borderRadius: 8,
                fontSize: 12,
                color: "#0a1a3d",
                boxShadow: "0 4px 14px rgba(10,26,61,0.12)",
              }}
              labelStyle={{ color: "#5b6a8c" }}
              formatter={(v: number) => [`${v}%`, "CFR"]}
            />
            <Area type="monotone" dataKey="value" stroke="#e0384a" strokeWidth={2} fill="url(#cfr)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
