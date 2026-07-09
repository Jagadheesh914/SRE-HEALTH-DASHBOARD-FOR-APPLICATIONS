"use client";

import { Panel } from "@/components/ui/Panel";
import type { AlertItem } from "@/lib/types";

const SEV_COLOR: Record<string, string> = {
  P1: "#e0384a",
  P2: "#e8720c",
  P3: "#d97706",
  P4: "#16a34a",
};

export function AlertsPanel({ alerts }: { alerts: AlertItem[] }) {
  return (
    <Panel title="Alerts">
      <div className="flex-1">
        {alerts.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-2 border-b border-white/5 py-1.5 last:border-0"
          >
            <span
              className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full"
              style={{ background: SEV_COLOR[a.severity] }}
            />
            <span className="flex-1 text-[11.5px] leading-snug text-ink">{a.text}</span>
            <span className="flex-shrink-0 whitespace-nowrap text-[10.5px] text-ink-faint">
              {a.time}
            </span>
          </div>
        ))}
      </div>
      <a href="#" className="mt-2.5 flex-shrink-0 text-[11.5px] font-semibold text-brand-blue">
        View all alerts →
      </a>
    </Panel>
  );
}
