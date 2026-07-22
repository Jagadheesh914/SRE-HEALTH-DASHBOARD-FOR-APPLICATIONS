"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  LayoutGrid,
  Target,
  Bell,
  AlertTriangle,
  Bug,
  LineChart,
  ShieldCheck,
  Server,
  BarChart3,
  GitCompare,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";

// NOTE: entries with `hidden: true` are kept for future reference but are
// not rendered in the sidebar navigation.
export const NAV: { href: string; label: string; icon: LucideIcon; hidden?: boolean }[] = [
  { href: "/", label: "Overview", icon: Activity },
  { href: "/applications", label: "Applications", icon: LayoutGrid, hidden: true },
  { href: "/slos", label: "SLIs / SLOs", icon: Target, hidden: true },
  { href: "/alerts", label: "Alerts", icon: Bell, hidden: true },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle, hidden: true },
  { href: "/errors", label: "Error Tracking", icon: Bug, hidden: true },
  { href: "/performance", label: "Performance", icon: LineChart, hidden: true },
  { href: "/availability", label: "Availability", icon: ShieldCheck, hidden: true },
  { href: "/infrastructure", label: "Infrastructure", icon: Server, hidden: true },
  { href: "/capacity", label: "Capacity", icon: BarChart3, hidden: true },
  { href: "/change-health", label: "Change Health", icon: GitCompare, hidden: true },
  { href: "/reports", label: "Reports", icon: FileText, hidden: true },
  { href: "/settings", label: "Settings", icon: Settings, hidden: true },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-[190px] flex-shrink-0 border-r border-panel-border bg-panel p-3 lg:block">
      <div className="mb-3 flex items-center gap-2 border-b border-panel-border px-2 pb-4 pt-1">
        <Activity className="h-[18px] w-[18px] text-brand-blue" strokeWidth={2.2} />
        <span className="font-display text-[15px] font-bold text-ink">SRE</span>
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV.filter((item) => !item.hidden).map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] font-medium transition-colors",
                isActive
                  ? "bg-gradient-to-r from-brand-blue/10 to-brand-coned/5 text-brand-blue"
                  : "text-ink-muted hover:bg-panel-hover hover:text-ink",
              ].join(" ")}
            >
              <Icon className="h-[15px] w-[15px] flex-shrink-0" strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
