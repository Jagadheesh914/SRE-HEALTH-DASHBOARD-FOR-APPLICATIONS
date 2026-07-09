"use client";

import { Panel } from "@/components/ui/Panel";
import type { SloCompliance } from "@/lib/types";

function barColor(v: number): string {
  if (v >= 98) return "#16a34a";
  if (v >= 95) return "#84cc16";
  if (v >= 93) return "#d97706";
  return "#e8720c";
}

export function SloPanel({ slo }: { slo: SloCompliance[] }) {
  return (
    <Panel title="SLO Compliance by Application">
      <div className="mb-2 flex justify-between pl-1 text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted">
        <span>Application</span>
        <span>SLO Compliance</span>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2">
        {slo.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span className="w-[124px] flex-shrink-0 truncate text-[11px] text-ink">{s.name}</span>
            <span className="relative block h-3 flex-1 overflow-hidden rounded bg-[#eef2f9]">
              <span
                className="absolute inset-y-0 left-0 rounded"
                style={{ width: `${s.value}%`, background: barColor(s.value) }}
              />
            </span>
            <span className="w-10 flex-shrink-0 text-right text-[11.5px] font-semibold text-ink">
              {s.value}%
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between pl-[132px] pr-10 text-[10px] text-ink-faint">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </Panel>
  );
}
