"use client";

import { useAppShell } from "@/lib/context/AppShell";
import { OverviewView } from "@/components/views/OverviewView";
import { LoadingGrid } from "@/components/views/LoadingGrid";

export default function OverviewPage() {
  const { data, loading, insights, ask } = useAppShell();
  if (loading || !data) return <LoadingGrid />;
  return <OverviewView data={data} insights={insights} onAsk={ask} />;
}
