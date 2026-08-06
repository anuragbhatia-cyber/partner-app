"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Card, SectionLabel } from "@/components/ui";
import { IndianRupee, Siren, ShieldCheck, Sparkles } from "lucide-react";

export default function NotificationsPage() {
  return (
    <PhoneFrame label="Notifications">
      <AppBar back href="/home" title="Notifications" />

      <div className="px-4 pt-4 pb-24 space-y-4">
        <div>
          <SectionLabel className="mb-2">Today</SectionLabel>
          <div className="space-y-2">
            <NotifCard
              icon={IndianRupee}
              iconBg="bg-accent-100 text-accent-700"
              title="₹850 credited"
              body="Case IRN-100842"
              time="2 min ago"
              unread
            />
            <NotifCard
              icon={Siren}
              iconBg="bg-error-subtle text-error-bold"
              title="New case assigned"
              body="Traffic Challan · HIGH · MG Road · 3.2 km"
              time="10:24"
            />
          </div>
        </div>

        <div>
          <SectionLabel className="mb-2">Yesterday</SectionLabel>
          <div className="space-y-2">
            <NotifCard
              icon={IndianRupee}
              iconBg="bg-accent-100 text-accent-700"
              title="₹8,000 paid to bank"
              body="HDFC ****4521 · UTR: N123456789"
              time="18:22"
            />
            <NotifCard
              icon={ShieldCheck}
              iconBg="bg-success-subtle text-success-bold"
              title="KYC approved"
              body="Welcome aboard!"
              time="09:30"
            />
          </div>
        </div>

        <div>
          <SectionLabel className="mb-2">This Week</SectionLabel>
          <div className="space-y-2">
            <NotifCard
              icon={Sparkles}
              iconBg="bg-neutral-100 text-neutral-600"
              title="Weekly summary"
              body="You earned ₹9,200 across 12 cases"
              time="Sun 8:00"
            />
          </div>
        </div>
      </div>

      <BottomTabBar active="notifications" />
    </PhoneFrame>
  );
}

function NotifCard({
  icon: Icon,
  iconBg,
  title,
  body,
  time,
  unread,
  chip,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  chip?: React.ReactNode;
}) {
  return (
    <Card padding="none">
      <div className="flex items-start gap-3 p-3.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div
              className={`t-body ${
                unread ? "font-semibold text-neutral-800" : "font-medium text-neutral-800"
              }`}
            >
              {title}
            </div>
            {unread && (
              <span className="w-2 h-2 rounded-full bg-error shrink-0 mt-1.5" />
            )}
          </div>
          <div className="t-body-sm text-neutral-500 mt-0.5">{body}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="t-caption text-neutral-400">{time}</span>
            {chip}
          </div>
        </div>
      </div>
    </Card>
  );
}
