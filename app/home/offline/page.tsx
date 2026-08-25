"use client";

import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Card, SectionLabel, Button } from "@/components/ui";
import { Bell, Menu, Moon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getStatus, setStatus } from "@/lib/partner-status";

export default function HomeOfflinePage() {
  const [ready, setReady] = useState(false);
  const onlineLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("online");
    if (q === "1") setStatus("online");
    if (getStatus() === "online") {
      onlineLinkRef.current?.click();
      return;
    }
    setReady(true);
  }, []);

  const handleGoOnline = () => {
    setStatus("online");
    onlineLinkRef.current?.click();
  };

  if (!ready) {
    return (
      <PhoneFrame label="Home · Offline">
        <a
          ref={onlineLinkRef}
          href="/home"
          className="hidden"
          aria-hidden
          tabIndex={-1}
        >
          Home
        </a>
        <div className="flex-1" />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame label="Home · Offline">
      <a
        ref={onlineLinkRef}
        href="/home"
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Home
      </a>
      <header className="px-4 min-h-16 py-3 flex items-center gap-3 bg-white sticky top-0 z-30 border-b border-[var(--border-subtle)]">
        <button className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full shrink-0">
          <Menu size={22} className="text-neutral-700" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="t-body-lg font-semibold text-neutral-800 truncate">
            Hi, Priya
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
            <span className="t-caption font-medium text-neutral-600">
              Offline
            </span>
          </div>
        </div>
        <Link
          href="/notifications"
          className="w-10 h-10 flex items-center justify-center rounded-full relative shrink-0"
        >
          <Bell size={20} className="text-neutral-700" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </Link>
      </header>

      <div className="px-4 pb-24 space-y-4">
        <Card padding="lg" className="text-center py-10">
          <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center mb-5">
            <Moon size={28} className="text-neutral-500" />
          </div>
          <h2 className="t-h2 font-semibold text-neutral-800 mb-2">
            You&apos;re Offline
          </h2>
          <p className="t-body text-neutral-500 leading-relaxed max-w-[260px] mx-auto mb-6">
            You won&apos;t receive new assignments while offline
          </p>
          <div className="t-caption text-neutral-400 mb-6">
            Last online: 2h ago
          </div>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleGoOnline}
          >
            Go Online
          </Button>
        </Card>

        <SectionLabel className="mb-2">While you were away</SectionLabel>
        <Card className="bg-warning-subtle/40 border-warning/20">
          <div className="t-body text-warning-bold font-medium">
            3 cases assigned in your area over the last 2 hours
          </div>
        </Card>
      </div>

      <BottomTabBar active="home" />
    </PhoneFrame>
  );
}
