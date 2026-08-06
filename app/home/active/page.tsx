"use client";

import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import {
  Card,
  Chip,
  SectionLabel,
  Button,
  Timeline,
} from "@/components/ui";
import {
  Bell,
  Menu,
  MapPin,
  Phone,
  MessageCircle,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function HomeActivePage() {
  return (
    <PhoneFrame label="Home · Active Case">
      <header className="px-4 min-h-16 py-3 flex items-center gap-3 bg-white sticky top-0 z-30 border-b border-[var(--border-subtle)]">
        <button className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-neutral-50 shrink-0">
          <Menu size={22} className="text-neutral-700" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="t-body-lg font-semibold text-neutral-800 truncate">
            Hi, Priya
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
            <span className="t-caption font-medium text-neutral-600 truncate">
              Busy · working case
            </span>
          </div>
        </div>
        <Link
          href="/notifications"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-50 relative shrink-0"
        >
          <Bell size={20} className="text-neutral-700" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </Link>
      </header>

      <div className="px-4 pb-24 space-y-4">
        {/* Pending action banner */}
        <Card
          padding="sm"
          className="bg-warning-subtle border-warning/20 flex items-center gap-2"
        >
          <AlertCircle size={16} className="text-warning-bold shrink-0" />
          <div className="flex-1 t-body-sm text-warning-bold font-medium">
            1 pending: Upload client consent
          </div>
          <ChevronRight size={16} className="text-warning-bold shrink-0" />
        </Card>

        {/* Active case hero */}
        <SectionLabel className="mb-2">Active Case</SectionLabel>
        <Card padding="none" className="overflow-hidden">
          {/* Header strip */}
          <div className="px-4 py-3 bg-primary-50/50 border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-1">
              <span className="t-caption font-mono text-neutral-500">
                LWD-00842
              </span>
              <Chip tone="error" dot size="sm">
                HIGH
              </Chip>
            </div>
            <div className="flex items-center gap-2">
              <span className="t-body-lg font-semibold text-neutral-800">
                Traffic Challan
              </span>
              <span className="t-body-sm text-neutral-500">· 22 min</span>
            </div>
          </div>

          {/* Location */}
          <div className="px-4 py-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-info-subtle flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-info-bold" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="t-body font-medium text-neutral-800">
                  MG Road, near Metro
                </div>
                <div className="t-caption text-neutral-500 mt-0.5">
                  Bengaluru 560001 · 3.2 km · ~12 min
                </div>
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="px-4 py-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-600 font-semibold t-body-sm">
                RK
              </div>
              <div className="flex-1 min-w-0">
                <div className="t-body font-medium text-neutral-800">
                  Rajesh Kumar
                </div>
                <div className="t-caption text-neutral-500 mt-0.5 font-mono">
                  KA-01-AB-1234
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-full bg-success-subtle flex items-center justify-center text-success-bold">
                  <Phone size={16} />
                </button>
                <button className="w-10 h-10 rounded-full bg-info-subtle flex items-center justify-center text-info-bold">
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="px-4 py-4">
            <div className="t-caption font-semibold uppercase tracking-wider text-neutral-500 mb-3">
              Progress
            </div>
            <Timeline
              steps={[
                { label: "Accepted", time: "10:24", status: "done" },
                { label: "En route", time: "10:26", status: "done" },
                { label: "Arrived", time: "10:38", status: "done" },
                { label: "In progress", status: "current" },
                { label: "Completed", status: "pending" },
              ]}
            />
          </div>

          {/* CTA */}
          <div className="p-4 pt-0">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              href="/incidents/complete"
              rightIcon={<ChevronRight size={18} />}
            >
              Mark Complete
            </Button>
            <div className="text-center mt-3">
              <Link
                href="/incidents/active"
                className="t-body-sm font-medium text-primary-600"
              >
                Open full case →
              </Link>
            </div>
          </div>
        </Card>

        {/* Today so far */}
        <SectionLabel className="mb-2">Today so far</SectionLabel>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="t-h2 font-bold tabular text-neutral-800">
                ₹1,700
              </div>
              <div className="t-caption text-neutral-500 mt-0.5">
                2 cases · 3.5 hrs
              </div>
            </div>
            <Link
              href="/wallet"
              className="t-body-sm font-medium text-primary-600 flex items-center gap-1"
            >
              Wallet <ChevronRight size={14} />
            </Link>
          </div>
        </Card>
      </div>

      <BottomTabBar active="home" />
    </PhoneFrame>
  );
}
