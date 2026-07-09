"use client";

import { Panel } from "@/components/ui/Panel";
import type { ErrorType } from "@/lib/types";

export function TopErrorTypes({ rows }: { rows: ErrorType[] }) {
  return (
    <Panel title="Top Error Types (All Applications)">
      <div className="flex-1 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-panel-border text-[9.5px] font-bold uppercase tracking-wide text-ink-muted">
              <th className="px-1 pb-2 text-left">Error Type</th>
              <th className="px-1 pb-2 text-right">Count</th>
              <th className="px-1 pb-2 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.type} className="border-b border-white/5 last:border-0">
                <td className="px-1 py-1.5 text-[11px] text-ink">{e.type}</td>
                <td className="px-1 py-1.5 text-right text-[11px] text-ink">{e.count}</td>
                <td className="px-1 py-1.5 text-right text-[11px] text-ink-muted">{e.pct}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
