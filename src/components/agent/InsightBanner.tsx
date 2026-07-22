"use client";

import { AlertTriangle, Activity, Info, X } from "lucide-react";
import { useState } from "react";
import type { AgentInsight } from "@/lib/types";

const KIND_META = {
  risk: { icon: AlertTriangle, color: "#e0384a", label: "SLO Risk" },
  anomaly: { icon: Activity, color: "#e8720c", label: "Anomaly" },
  info: { icon: Info, color: "#3c66ce", label: "Insight" },
} as const;

/**
 * Adaptive-UI placeholder: a strip of agent-generated proactive insights that
 * would, in the live system, reorder/promote the widgets below. For now it
 * renders the mock insights and lets the user ask the agent to dig in.
 */
export function InsightBanner({
  insights,
}: {
  insights: AgentInsight[];
}) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = insights.filter((i) => !dismissed.includes(i.id));
  if (visible.length === 0) return null;

  return (
    <div className="mb-3 grid grid-cols-1 gap-2.5 md:grid-cols-2">
      {visible.map((ins) => {
        const meta = KIND_META[ins.kind];
        const Icon = meta.icon;
        return (
          <div
            key={ins.id}
            className="panel animate-fade-in flex items-start gap-3 border-l-2 p-3"
            style={{ borderLeftColor: meta.color }}
          >
            <span
              className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md"
              style={{ background: `${meta.color}22`, color: meta.color }}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                  style={{ background: `${meta.color}22`, color: meta.color }}
                >
                  {meta.label}
                </span>
                <span className="truncate text-[12px] font-semibold text-ink">{ins.title}</span>
              </div>
              <p className="mt-1 text-[11.5px] leading-snug text-ink-muted">{ins.detail}</p>
            </div>
            <button
              onClick={() => setDismissed((d) => [...d, ins.id])}
              aria-label="Dismiss"
              className="flex-shrink-0 text-ink-faint hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
