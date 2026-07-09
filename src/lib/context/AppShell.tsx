"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useDashboard, useInsights } from "@/lib/hooks/useDashboard";
import type { DashboardData, AgentInsight, TierSelection } from "@/lib/types";

interface AppShellValue {
  data: DashboardData | null;
  loading: boolean;
  insights: AgentInsight[] | null;
  /** Selected metal tier from the "All Applications" dropdown. */
  tier: TierSelection;
  setTier: (t: TierSelection) => void;
  /** Selected tower from the tower dropdown ("All Towers" = no filter). */
  tower: string;
  setTower: (t: string) => void;
  /** Open the agent panel and send it a question. */
  ask: (question: string) => void;
  agentOpen: boolean;
  openAgent: () => void;
  closeAgent: () => void;
  pending?: { text: string; nonce: number };
}

const Ctx = createContext<AppShellValue | null>(null);

export function useAppShell(): AppShellValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppShell must be used within <AppShellProvider>");
  return v;
}

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<TierSelection>("All Applications");
  const [tower, setTower] = useState<string>("All Towers");

  // Reset both dropdowns to their defaults whenever the route changes, so each
  // page starts at "All Applications" / "All Towers".
  const pathname = usePathname();
  useEffect(() => {
    setTier("All Applications");
    setTower("All Towers");
  }, [pathname]);

  const { data, loading } = useDashboard(tier, tower);
  const { data: insights } = useInsights();
  const [agentOpen, setAgentOpen] = useState(false);
  const [pending, setPending] = useState<{ text: string; nonce: number }>();

  const value: AppShellValue = {
    data,
    loading,
    insights,
    tier,
    setTier,
    tower,
    setTower,
    agentOpen,
    openAgent: () => setAgentOpen(true),
    closeAgent: () => setAgentOpen(false),
    pending,
    ask: (question: string) => {
      setAgentOpen(true);
      setPending({ text: question, nonce: Date.now() });
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
