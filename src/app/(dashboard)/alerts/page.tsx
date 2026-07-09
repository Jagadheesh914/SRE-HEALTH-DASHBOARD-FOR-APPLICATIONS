"use client";

import { useAppShell } from "@/lib/context/AppShell";
import { AlertsView } from "@/components/views/SectionViews";
import { LoadingGrid } from "@/components/views/LoadingGrid";

export default function Page() {
  const { data, loading } = useAppShell();
  if (loading || !data) return <LoadingGrid />;
  return <AlertsView data={data} />;
}
