"use client";

import { Cpu, MemoryStick, HardDrive, Network, ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Sparkline } from "@/components/charts/Sparkline";
import { ACCENTS, type InfraMetric } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  cpu: Cpu,
  mem: MemoryStick,
  disk: HardDrive,
  net: Network,
};

export function InfraHealth({ metrics }: { metrics: InfraMetric[] }) {
  return (
    <Panel title="Infrastructure Health">
      <div className="flex flex-1 flex-col justify-between gap-3">
        {metrics.map((m) => {
          const Icon = ICONS[m.key] ?? Cpu;
          const color = ACCENTS[m.accent];
          const Arrow = m.direction === "up" ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={m.key} className="flex items-center gap-3">
              <span
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: color }}
              >
                <Icon className="h-4 w-4 text-white" strokeWidth={1.8} />
              </span>
              <div className="w-[118px] flex-shrink-0">
                <div className="truncate text-[10.5px] text-ink-muted">{m.label}</div>
                <div className="text-[15px] font-bold text-ink">{m.value}</div>
                <div
                  className={`flex items-center gap-0.5 text-[10.5px] font-semibold ${
                    m.positive ? "text-sev-green" : "text-ink-muted"
                  }`}
                >
                  <Arrow className="h-3 w-3" />
                  {m.delta}
                </div>
              </div>
              <div className="min-w-[50px] flex-1">
                <Sparkline data={m.spark} color={color} dots height={38} />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
