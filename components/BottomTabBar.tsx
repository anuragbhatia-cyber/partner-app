"use client";

import Link from "next/link";
import { Home, ClipboardList, Bell, User } from "lucide-react";
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
  { key: "incidents", label: "Incidents", href: "/incidents", icon: ClipboardList },
  { key: "notifications", label: "Alerts", href: "/notifications", icon: Bell, badge: 3 },
  { key: "profile", label: "Profile", href: "/profile", icon: User },
];

export function BottomTabBar({ active }: { active: string }) {
  return (
    <nav className="sticky bottom-0 z-30 bg-white border-t border-[var(--border-subtle)] mt-auto">
      <div className="grid grid-cols-4 h-16 pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 relative transition-colors",
                isActive ? "text-primary-600" : "text-neutral-500"
              )}
            >
              <div className="relative">
                <Icon size={22} className={isActive ? "" : ""} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-error text-white t-micro font-semibold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "t-micro",
                  isActive ? "text-primary-600" : "text-neutral-500"
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
