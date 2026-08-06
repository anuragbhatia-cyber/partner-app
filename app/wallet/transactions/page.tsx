"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Card, Chip, SectionLabel } from "@/components/ui";
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
} from "lucide-react";

const TXN = [
  { day: "Aug 3", items: [
    { type: "earning", title: "LWY-2026-00842", subtitle: "Traffic Challan", amount: "+₹850", status: "pending" },
    { type: "deduction", title: "TDS on ₹850", amount: "-₹85", status: "" },
  ]},
  { day: "Aug 2", items: [
    { type: "earning", title: "LWY-2026-00838", subtitle: "RTO Renewal", amount: "+₹700", status: "settled" },
    { type: "payout", title: "HDFC ****4521", subtitle: "UTR: N123456789", amount: "-₹8,000", status: "paid" },
  ]},
  { day: "Aug 1", items: [
    { type: "deduction", title: "Late arrival penalty", subtitle: "Case LWY-...00821", amount: "-₹200", status: "review" },
  ]},
];

export default function TransactionsPage() {
  return (
    <PhoneFrame label="Wallet · Transactions">
      <AppBar
        back
        href="/wallet"
        title="Transactions"
        action={
          <div className="flex items-center gap-1">
            <button className="w-10 h-10 flex items-center justify-center rounded-full">
              <Search size={18} className="text-neutral-700" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full">
              <Filter size={18} className="text-neutral-700" />
            </button>
          </div>
        }
      />

      <div className="px-4 py-4 pb-24 space-y-4">
        <Card padding="lg" className="bg-primary-50/60 border-primary-100">
          <div className="t-caption font-semibold uppercase tracking-wider text-primary-700 mb-1">
            Aug 2026
          </div>
          <div className="t-h1 font-bold tabular text-neutral-800">
            ₹28,400 earned
          </div>
        </Card>

        {TXN.map((day) => (
          <div key={day.day}>
            <SectionLabel className="mb-2">{day.day}</SectionLabel>
            <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
              {day.items.map((t, i) => (
                <TxnRow key={i} {...(t as any)} />
              ))}
            </Card>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

function TxnRow({
  type,
  title,
  subtitle,
  amount,
  status,
}: {
  type: "earning" | "payout" | "deduction";
  title: string;
  subtitle?: string;
  amount: string;
  status?: string;
}) {
  const cfg = {
    earning: { icon: ArrowUpRight, bg: "bg-success-subtle", fg: "text-success-bold" },
    payout: { icon: ArrowDownLeft, bg: "bg-info-subtle", fg: "text-info-bold" },
    deduction: { icon: ArrowDownRight, bg: "bg-warning-subtle", fg: "text-warning-bold" },
  }[type];
  const Icon = cfg.icon;

  const chip =
    status === "pending" ? (
      <Chip tone="warning" size="sm" dot>Pending</Chip>
    ) : status === "settled" ? (
      <Chip tone="success" size="sm">✓ Settled</Chip>
    ) : status === "paid" ? (
      <Chip tone="info" size="sm">✓ Paid</Chip>
    ) : status === "review" ? (
      <Chip tone="warning" size="sm">Under review</Chip>
    ) : null;

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
        <Icon size={16} className={cfg.fg} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="t-body font-medium text-neutral-800 truncate">
              {title}
            </div>
            {subtitle && (
              <div className="t-caption text-neutral-500 mt-0.5 truncate">
                {subtitle}
              </div>
            )}
            {chip && <div className="mt-1.5">{chip}</div>}
          </div>
          <div className={`t-body font-semibold tabular font-mono shrink-0 ${cfg.fg}`}>
            {amount}
          </div>
        </div>
      </div>
    </div>
  );
}
