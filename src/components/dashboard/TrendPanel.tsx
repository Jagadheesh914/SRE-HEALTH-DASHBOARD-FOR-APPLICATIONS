"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel } from "@/components/ui/Panel";
import type { TimeSeries } from "@/lib/types";

export function TrendPanel({
  title,
  series,
  color,
  legend,
}: {
  title: string;
  series: TimeSeries;
  color: string;
  legend: string;
}) {
  const fmt = (v: number) =>
    series.unit === "ms" ? `${Math.round(v)} ms` : `${v.toFixed(series.unit === "%" ? 1 : 0)}${series.unit}`;

  return (
    <Panel title={title}>
      <div className="min-h-[150px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series.points} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id={`t-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e3ebf6" vertical={false} />
            <XAxis
              dataKey="t"
              tick={{ fill: "#8b9bc0", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[series.min ?? "auto", series.max ?? "auto"]}
              tick={{ fill: "#8b9bc0", fontSize: 10 }}
              tickFormatter={fmt}
              axisLine={false}
              tickLine={false}
              width={44}
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
              formatter={(v: number) => [fmt(v), legend]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#t-${title})`}
              dot={{ r: 2, fill: color }}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1.5 flex flex-shrink-0 justify-center gap-2 text-[10.5px] text-ink-muted">
        <span className="flex items-center gap-1">
          <i className="inline-block h-0.5 w-3.5 rounded" style={{ background: color }} />
          {legend}
        </span>
      </div>
    </Panel>
  );
}
