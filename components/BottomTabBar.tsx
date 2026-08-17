"use client";

import Link from "next/link";
import { Home, ClipboardList, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

const TABS: Tab[] = [
  { key: "home", label: "Home", href: "/home", icon: Home },
  { key: "leads", label: "Leads", href: "/leads", icon: Users },
  { key: "incidents", label: "Incidents", href: "/incidents", icon: ClipboardList },
  { key: "profile", label: "Profile", href: "/profile", icon: User },
];

export function BottomTabBar({ active }: { active: string }) {
  return (
    <nav className="sticky bottom-0 z-30 bg-white border-t border-[var(--border-subtle)] mt-auto shadow-[0_-2px_6px_-2px_rgba(15,23,42,0.08)]">
      <div className="grid grid-cols-4 h-20">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
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
                <Icon size={28} className={isActive ? "" : ""} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-error text-white t-micro font-semibold flex items-center justify-center">
                    {tab.badge}
                  </span>
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
