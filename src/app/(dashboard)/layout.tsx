"use client";

import type { ReactNode } from "react";
import { AppShellProvider, useAppShell } from "@/lib/context/AppShell";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { AgentChatPanel } from "@/components/agent/AgentChatPanel";

function Chrome({ children }: { children: ReactNode }) {
  const { agentOpen, openAgent, closeAgent, pending } = useAppShell();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 md:p-5">
        <TopBar onRefresh={() => location.reload()} onOpenAgent={openAgent} />
        {children}
      </main>
      <AgentChatPanel open={agentOpen} onClose={closeAgent} pendingQuestion={pending} />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AppShellProvider>
      <Chrome>{children}</Chrome>
    </AppShellProvider>
  );
}
