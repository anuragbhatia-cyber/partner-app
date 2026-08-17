"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card } from "@/components/ui";
import { CommissionCard } from "@/components/CommissionCard";
import {
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Range = "7d" | "30d" | "90d";

const RANGE_DATA: Record<
  Range,
  { title: string; total: number; bars: { label: string; amount: number }[] }
> = {
  "7d": {
    title: "Last 7 Days",
    total: 4200,
    bars: [
      { label: "Mon", amount: 650 },
      { label: "Tue", amount: 480 },
      { label: "Wed", amount: 900 },
      { label: "Thu", amount: 720 },
      { label: "Fri", amount: 850 },
      { label: "Sat", amount: 400 },
      { label: "Sun", amount: 200 },
    ],
  },
  "30d": {
    title: "Last 30 Days",
    total: 17800,
    bars: [
      { label: "W1", amount: 3900 },
      { label: "W2", amount: 4600 },
      { label: "W3", amount: 5100 },
      { label: "W4", amount: 4200 },
    ],
  },
  "90d": {
    title: "Last 90 Days",
    total: 52400,
    bars: [
      { label: "Jun", amount: 16200 },
      { label: "Jul", amount: 18400 },
      { label: "Aug", amount: 17800 },
    ],
  },
};

export default function WalletHomePage() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [range, setRange] = useState<Range>("7d");
  const rangeData = RANGE_DATA[range];

  return (
    <PhoneFrame label="Wallet · Home">
      <AppBar
        title="Wallet"
        back
        href="/home"
        centered
        action={
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            aria-label="How wallet works"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-50"
          >
            <HelpCircle size={20} className="text-neutral-700" />
          </button>
        }
      />

      <WalletHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      <div className="px-4 py-4 pb-8 space-y-4">
        {/* Balance hero */}
        <Card padding="lg">
          <div className="t-body font-semibold text-neutral-600 mb-2">
            Available to withdraw
          </div>
          <div className="t-hero font-bold tabular text-neutral-800 leading-none tracking-tight font-mono">
            ₹4,250
          </div>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            href="/wallet/payout"
            className="mt-5"
          >
            Request Payout
          </Button>
        </Card>

        <CommissionCard />

        {/* Earnings chart with range selector */}
        <Card padding="lg">
          <div className="flex items-baseline justify-between mb-5">
            <span className="t-h3 font-semibold text-neutral-800">
              {rangeData.title}
            </span>
            <span className="t-h2 font-bold tabular font-mono text-neutral-800">
              ₹{rangeData.total.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex gap-1.5 mb-6 bg-neutral-100 rounded-lg p-1">
            {([
              { value: "7d", label: "7 days" },
              { value: "30d", label: "30 days" },
              { value: "90d", label: "90 days" },
            ] as { value: Range; label: string }[]).map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRange(r.value)}
                className={`flex-1 h-8 rounded-md t-caption font-semibold transition-colors ${
                  range === r.value
                    ? "bg-white text-neutral-800 shadow-e1"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <EarningsChart bars={rangeData.bars} />
        </Card>

        {/* Transactions */}
        <Card padding="none">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <span className="t-h3 font-semibold text-neutral-800">
              Transactions
            </span>
            <Link
              href="/wallet/transactions"
              className="t-caption font-semibold text-primary-600"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)]">
            <TxnRow
              type="earning"
              title="Challan IRN-100842"
              date="Aug 3"
              amount="+₹850"
            />
            <TxnRow
              type="payout"
              title="Payout to HDFC ****4521"
              date="Aug 2"
              amount="-₹8,000"
            />
            <TxnRow
              type="earning"
              title="RTO IRN-100838"
              date="Aug 2"
              amount="+₹700"
            />
            <TxnRow
              type="deduction"
              title="TDS on ₹850"
              date="Aug 1"
              amount="-₹85"
            />
          </div>
        </Card>
      </div>

    </PhoneFrame>
  );
}

function TxnRow({
  type,
  title,
  date,
  amount,
  status,
}: {
  type: "earning" | "payout" | "deduction";
  title: string;
  date: string;
  amount: string;
  status?: string;
}) {
  const config = {
    earning: {
      icon: ArrowUpRight,
      bg: "bg-success-subtle",
      color: "text-success-bold",
      amountColor: "text-success-bold",
    },
    payout: {
      icon: ArrowDownLeft,
      bg: "bg-error-subtle",
      color: "text-error-bold",
      amountColor: "text-error-bold",
    },
    deduction: {
      icon: ArrowDownRight,
      bg: "bg-error-subtle",
      color: "text-error-bold",
      amountColor: "text-error-bold",
    },
  }[type];
  const Icon = config.icon;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}
      >
        <Icon size={14} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="t-body font-medium text-neutral-800 truncate">
          {title}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="t-caption text-neutral-500">{date}</span>
          {status && (
            <>
              <span className="t-caption text-neutral-300">·</span>
              <span className="t-caption text-neutral-500">{status}</span>
            </>
          )}
        </div>
      </div>
      <div
        className={`t-body font-semibold tabular font-mono shrink-0 ${config.amountColor}`}
      >
        {amount}
      </div>
    </div>
  );
}

function EarningsChart({
  bars,
}: {
  bars: Array<{ label: string; amount: number }>;
}) {
  const max = Math.max(...bars.map((d) => d.amount), 1);
  const lastIdx = bars.length - 1;
  const compact = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`;
  return (
    <div className="flex gap-3 items-end">
      {bars.map((d, i) => {
        const pct = Math.max(Math.round((d.amount / max) * 100), 8);
        const isLast = i === lastIdx;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-4 min-w-0">
            <span
              className={`t-caption tabular font-mono ${
                isLast ? "text-success-bold font-semibold" : "text-neutral-500"
              }`}
            >
              ₹{compact(d.amount)}
            </span>
            <div className="h-24 w-full flex items-end">
              <div
                className={`w-full rounded-md ${
                  isLast ? "bg-success-bold" : "bg-success"
                }`}
                style={{ height: `${pct}%` }}
                aria-label={`${d.label}: ₹${d.amount}`}
              />
            </div>
            <span
              className={`t-caption font-semibold ${
                isLast ? "text-success-bold" : "text-neutral-500"
              }`}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function WalletHelpModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 ${
        open ? "" : "pointer-events-none"
      }`}
      aria-hidden={!open}
      role="dialog"
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative w-full max-w-sm bg-white rounded-2xl shadow-e3 p-5 transition-all duration-200 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center mb-3">
          <HelpCircle size={20} />
        </div>
        <h2 className="t-h3 font-bold text-neutral-800">How wallet works</h2>
        <p className="t-body text-neutral-600 mt-2 leading-relaxed">
          Every completed case adds to your wallet balance. Deductions like TDS
          are applied automatically. You can request a payout to your linked
          bank account anytime — funds usually arrive within 1–2 business days.
        </p>
        <Button variant="primary" fullWidth className="mt-5" onClick={onClose}>
          Okay
        </Button>
      </div>
    </div>
  );
}
