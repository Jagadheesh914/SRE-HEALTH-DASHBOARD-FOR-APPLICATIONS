"use client";

import { useEffect, useState } from "react";
import { Building2, RefreshCw, Sparkles } from "lucide-react";
import { useAppShell } from "@/lib/context/AppShell";
import { Dropdown } from "@/components/ui/Dropdown";
import type { TierSelection } from "@/lib/types";

/** Application tier options shown by the "All Applications" dropdown. */
const APP_TIERS: TierSelection[] = ["All Applications", "Gold", "Silver", "Bronze"];

/** Format a timestamp the same way as the reference mockup. */
function formatUpdated(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function TopBar({
  onRefresh,
  onOpenAgent,
}: {
  onRefresh: () => void;
  onOpenAgent: () => void;
}) {
  // Live "Last Updated" timestamp. Computed on the client (after mount to avoid
  // a hydration mismatch) and refreshed every 30s so it is always current.
  const [updatedAt, setUpdatedAt] = useState<string>("…");
  useEffect(() => {
    const tick = () => setUpdatedAt(formatUpdated(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  // Tier + tower selections live in the shared AppShell context so changing
  // either refetches and refreshes the whole dashboard.
  const { tier, setTier, tower, setTower, loading } = useAppShell();

  // Distinct tower list for the tower dropdown (loaded once from the CSV).
  const [towers, setTowers] = useState<string[]>([]);
  useEffect(() => {
    let alive = true;
    fetch("/api/towers", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((t: string[]) => alive && setTowers(Array.isArray(t) ? t : []))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-shrink-0 items-center gap-3.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/conedison-logo.svg" alt="Con Edison" className="h-[26px] w-auto" />
        <span className="h-6 w-px bg-panel-border" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/orange-rockland-logo.svg" alt="Orange & Rockland" className="h-[26px] w-auto" />
      </div>

      <div className="min-w-[220px] flex-1 text-center">
        <h1 className="font-display text-[19px] font-bold tracking-tight text-ink">
          SRE HEALTH DASHBOARD FOR APPLICATIONS
        </h1>
        <p className="text-[12.5px] text-ink-muted">
          Reliability, Performance &amp; User Experience at a Glance
        </p>
      </div>

      <div className="flex flex-shrink-0 flex-wrap items-stretch gap-2">
        <Dropdown
          ariaLabel="Filter by application tier"
          value={tier}
          options={APP_TIERS}
          onChange={(v) => setTier(v as TierSelection)}
        />
        <Dropdown
          ariaLabel="Filter by tower"
          value={tower}
          options={["All Towers", ...towers]}
          onChange={setTower}
          minWidth={200}
          leadingIcon={<Building2 className="h-3.5 w-3.5 text-ink-muted" />}
        />
        <div className="ctrl flex-col !items-start !gap-0 leading-tight">
          <span className="text-[10.5px] text-ink-muted">Compare to</span>
          <span className="text-xs text-ink">Previous 7 Days</span>
        </div>
        <div className="ctrl flex-col !items-start !gap-0 leading-tight">
          <span className="text-[10.5px] text-ink-muted">Last Updated</span>
          <span className="text-xs text-ink">{updatedAt}</span>
        </div>
        <button
          onClick={onOpenAgent}
          className="flex items-center gap-2 rounded-lg border border-brand-blue/50 bg-brand-blue/10 px-3 py-2 text-xs font-semibold text-brand-blue transition-colors hover:bg-brand-blue/20"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Ask the Agent
        </button>
        <button
          onClick={onRefresh}
          aria-label="Refresh"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-panel-border bg-panel text-ink-muted transition-colors hover:border-brand-blue hover:text-brand-blue"
        >
          <RefreshCw className={`h-[15px] w-[15px] ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
}
