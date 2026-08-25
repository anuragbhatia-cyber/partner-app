"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Button, Card, SectionLabel } from "@/components/ui";
import {
  Check,
  IndianRupee,
  ShieldCheck,
  Siren,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";
export default function NotificationsPage() {
  return (
    <PhoneFrame label="Notifications">
      <AppBar back href="/home" title="Notifications" />

      <div className="px-4 pt-4 pb-24 space-y-4">
        <div>
          <SectionLabel className="mb-2">Today</SectionLabel>
          <div className="space-y-2">
            <TeamInviteCard />
            <NotifCard
              icon={IndianRupee}
              iconBg="bg-accent-100 text-accent-700"
              title="₹850 credited"
              body="Case IRN-100842"
              time="2 min ago"
              unread
              href="/wallet/transactions"
            />
            <NotifCard
              icon={Siren}
              iconBg="bg-error-subtle text-error-bold"
              title="New case assigned"
              body="Traffic Challan · HIGH · MG Road · 3.2 km"
              time="10:24"
              href="/leads"
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
              href="/wallet/transactions"
            />
            <NotifCard
              icon={ShieldCheck}
              iconBg="bg-success-subtle text-success-bold"
              title="KYC approved"
              body="Welcome aboard!"
              time="09:30"
              href="/profile/documents"
            />
          </div>
        </div>

      </div>

      <BottomTabBar active="notifications" />
    </PhoneFrame>
  );
}

function TeamInviteCard() {
  const [state, setState] = useState<"pending" | "accepted" | "declined">(
    "pending"
  );
  const [busy, setBusy] = useState<null | "accept" | "decline">(null);

  const handle = (kind: "accept" | "decline") => {
    if (busy) return;
    setBusy(kind);
    window.setTimeout(() => {
      setState(kind === "accept" ? "accepted" : "declined");
      setBusy(null);
    }, 500);
  };

  return (
    <Card padding="none">
      <div className="flex items-start gap-3 p-3.5">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            state === "accepted"
              ? "bg-success-subtle text-success-bold"
              : state === "declined"
                ? "bg-neutral-100 text-neutral-500"
                : "bg-primary-50 text-primary-700"
          }`}
        >
          <UserPlus size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="t-body font-semibold text-neutral-800">
              Team invite
            </div>
            {state === "pending" && (
              <span className="w-2 h-2 rounded-full bg-error shrink-0 mt-1.5" />
            )}
          </div>
          <div className="t-body-sm text-neutral-600 mt-0.5">
            You&apos;ve been requested to join{" "}
            <span className="font-semibold text-neutral-800">Anurag&apos;s team</span>
            .
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="t-caption text-neutral-400">Just now</span>
          </div>

          {state === "pending" ? (
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<X size={14} />}
                loading={busy === "decline"}
                disabled={busy !== null}
                onClick={() => handle("decline")}
              >
                Decline
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Check size={14} />}
                loading={busy === "accept"}
                disabled={busy !== null}
                onClick={() => handle("accept")}
              >
                Accept
              </Button>
            </div>
          ) : (
            <div
              className={`mt-3 inline-flex items-center gap-1.5 t-body-sm font-semibold ${
                state === "accepted"
                  ? "text-success-bold"
                  : "text-neutral-500"
              }`}
            >
              {state === "accepted" ? (
                <>
                  <Check size={14} strokeWidth={3} />
                  Joined Anurag&apos;s team
                </>
              ) : (
                <>
                  <X size={14} strokeWidth={3} />
                  Invite declined
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
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
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  chip?: React.ReactNode;
  href?: string;
}) {
  const content = (
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
  );

  if (href) {
    return (
      <Card padding="none" className="overflow-hidden">
        <a
          href={href}
          className="block hover:bg-neutral-50/50 active:bg-neutral-50 transition-colors"
        >
          {content}
        </a>
      </Card>
    );
  }
  return <Card padding="none">{content}</Card>;
}
