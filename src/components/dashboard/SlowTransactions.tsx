"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import type { SlowTransaction } from "@/lib/types";

export function SlowTransactions({ rows }: { rows: SlowTransaction[] }) {
  return (
    <Panel title="Top Slow Transactions (P95)">
      <div className="flex-1 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-panel-border text-[9.5px] font-bold uppercase tracking-wide text-ink-muted">
              <th className="px-1 pb-2 text-left">Transaction</th>
              <th className="px-1 pb-2 text-left">P95 Latency</th>
              <th className="px-1 pb-2 text-left">Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.tx} className="border-b border-white/5 last:border-0">
                <td className="px-1 py-1.5 text-[11px] text-ink">{r.tx}</td>
                <td className="px-1 py-1.5 text-[11px] text-ink">{r.p95}</td>
                <td className="px-1 py-1.5">
                  {r.trend === "up" ? (
                    <ArrowUp className="h-3.5 w-3.5 text-sev-red" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5 text-sev-green" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
