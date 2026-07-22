"use client";

import {
  LayoutGrid,
  Target,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Flame,
  Rocket,
  ArrowUpRight,
  ArrowDownRight,
  type LucideIcon,
} from "lucide-react";
import { ACCENTS, type Kpi } from "@/lib/types";
import { Sparkline } from "@/components/charts/Sparkline";

const ICONS: Record<string, LucideIcon> = {
  apps: LayoutGrid,
  slo: Target,
  avail: ShieldCheck,
  err: AlertTriangle,
  lat: Clock,
  inc: Flame,
  dep: Rocket,
};

export function KpiRow({
  kpis,
  gridClassName = "grid-cols-2 sm:grid-cols-3 xl:grid-cols-7",
}: {
  kpis: Kpi[];
  /** Tailwind grid-cols classes controlling how many KPIs sit per row. */
  gridClassName?: string;
}) {
  return (
    <div className={`mb-3 grid gap-2.5 ${gridClassName}`}>
      {kpis.map((k) => {
        const Icon = ICONS[k.key] ?? LayoutGrid;
        const color = ACCENTS[k.accent];
        const Arrow = k.direction === "up" ? ArrowUpRight : ArrowDownRight;
        return (
          <div key={k.key} className="panel p-3">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md"
                style={{ background: `${color}22`, color }}
              >
                <Icon className="h-[13px] w-[13px]" strokeWidth={2} />
              </span>
              <span className="truncate text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                {k.label}
              </span>
            </div>
            <div className="font-display text-[21px] font-bold text-ink">{k.value}</div>
            <div
              className={`mb-2 flex items-center gap-1 text-[11px] font-semibold ${
                k.positive ? "text-sev-green" : "text-sev-red"
              }`}
            >
              <Arrow className="h-3 w-3" />
              {k.delta}
            </div>
            <Sparkline data={k.spark} color={color} height={32} />
          </div>
        );
      })}
    </div>
  );
}
