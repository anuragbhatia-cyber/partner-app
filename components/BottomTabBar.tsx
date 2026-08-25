"use client";

import Link from "next/link";
import { Home, ClipboardList, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeadsStore } from "@/lib/leads-store";

interface Tab {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

const BASE_TABS: Omit<Tab, "badge">[] = [
  { key: "home", label: "Home", href: "/home", icon: Home },
  { key: "leads", label: "Leads", href: "/leads", icon: Users },
  { key: "incidents", label: "Incidents", href: "/incidents", icon: ClipboardList },
  { key: "profile", label: "Profile", href: "/profile", icon: User },
];

function formatBadge(n: number): string {
  if (n <= 0) return "";
  if (n > 99) return "99+";
  return String(n);
}

export function BottomTabBar({ active }: { active: string }) {
  const { leads, assigned } = useLeadsStore();
  // Show a dot when there are new leads, but no number.
  const showLeadsDot = leads.length > 0;
  const badges: Record<string, number> = {
    incidents: assigned.length,
  };

  return (
    <nav className="sticky bottom-0 z-30 bg-white border-t border-[var(--border-subtle)] mt-auto shadow-[0_-2px_6px_-2px_rgba(15,23,42,0.08)]">
      <div className="grid grid-cols-4 h-20">
        {BASE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          const badgeLabel = formatBadge(badges[tab.key] ?? 0);
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 relative transition-colors overflow-hidden",
                isActive
                  ? "text-primary-600 bg-gradient-to-b from-primary-50 to-transparent"
                  : "text-neutral-500"
              )}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-10 rounded-full bg-primary-600"
                />
              )}
              <div className="relative">
                <Icon size={28} />
                {badgeLabel && (
                  <span
                    aria-label={`${badgeLabel} unread`}
                    className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white t-micro font-semibold flex items-center justify-center ring-2 ring-white"
                  >
                    {badgeLabel}
                  </span>
                )}
                {tab.key === "leads" && showLeadsDot && !badgeLabel && (
                  <span
                    aria-label="New leads available"
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-white"
                  />
                )}
              </div>
              <span
                className={cn(
                  "t-body-sm",
                  isActive ? "font-bold text-primary-600" : "font-medium text-neutral-500"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
