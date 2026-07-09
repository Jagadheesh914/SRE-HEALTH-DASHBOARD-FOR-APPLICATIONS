"use client";

import { useEffect, useState } from "react";
import type { DashboardData, AgentInsight, TierSelection, StoredApp } from "@/lib/types";
import { dataProvider } from "@/lib/data/provider";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Loads the full dashboard payload from the live health-check endpoint, scoped
 * to the selected metal tier. Refetches (and shows a loading state) whenever
 * the tier changes, so the whole dashboard refreshes on dropdown selection.
 */
export function useDashboard(
  tier: TierSelection = "All Applications",
  tower = "All Towers",
): AsyncState<DashboardData> {
  const [state, setState] = useState<AsyncState<DashboardData>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    fetch(`/api/health?tier=${encodeURIComponent(tier)}&tower=${encodeURIComponent(tower)}`, {
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`health ${res.status}`);
        return res.json() as Promise<DashboardData>;
      })
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((e) => alive && setState({ data: null, loading: false, error: String(e) }));
    return () => {
      alive = false;
    };
  }, [tier, tower]);

  return state;
}

/**
 * Loads the stored application inventory (data/applications.csv) via the
 * /api/applications endpoint, scoped to the selected tier. Refetches on change.
 */
export function useApplications(
  tier: TierSelection = "All Applications",
  tower = "All Towers",
): AsyncState<StoredApp[]> {
  const [state, setState] = useState<AsyncState<StoredApp[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    fetch(`/api/applications?tier=${encodeURIComponent(tier)}&tower=${encodeURIComponent(tower)}`, {
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`applications ${res.status}`);
        return res.json() as Promise<StoredApp[]>;
      })
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((e) => alive && setState({ data: null, loading: false, error: String(e) }));
    return () => {
      alive = false;
    };
  }, [tier, tower]);

  return state;
}

/** Loads agent-generated proactive insights (adaptive-UI signal). */
export function useInsights(): AsyncState<AgentInsight[]> {
  const [state, setState] = useState<AsyncState<AgentInsight[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    dataProvider
      .getInsights()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((e) => alive && setState({ data: null, loading: false, error: String(e) }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
