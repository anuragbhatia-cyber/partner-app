"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Button, Card, Chip, SectionLabel } from "@/components/ui";
import {
  Info,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function WalletHomePage() {
  return (
    <PhoneFrame label="Wallet · Home">
      <AppBar
        title="Wallet"
        action={
          <button className="w-10 h-10 flex items-center justify-center rounded-full">
            <Info size={20} className="text-neutral-700" />
          </button>
        }
      />

      <div className="px-4 py-4 pb-24 space-y-4">
        {/* Balance hero */}
        <Card padding="lg" className="text-center">
          <div className="t-caption font-semibold uppercase tracking-wider text-neutral-500 mb-2">
            Available Balance
          </div>
          <div className="t-hero font-bold tabular text-neutral-800 leading-none tracking-tight font-mono">
            ₹4,250
          </div>
          <div className="t-body-sm text-neutral-500 mt-2">
            Ready to withdraw
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

        {/* This month */}
        <div>
          <SectionLabel className="mb-2">This Month</SectionLabel>
          <Card>
            <div className="space-y-2">
              <SummaryRow label="Earned" value="₹28,400" />
              <SummaryRow label="Deductions" value="-₹1,200" muted />
              <SummaryRow label="Payouts" value="-₹22,950" muted />
              <div className="pt-2 mt-2 border-t border-[var(--border-subtle)]">
                <SummaryRow label="Balance" value="₹4,250" bold />
              </div>
            </div>
            <button className="mt-3 pt-3 border-t border-[var(--border-subtle)] w-full flex items-center justify-between t-body-sm font-medium text-primary-600">
              View full statement
              <ChevronRight size={14} />
            </button>
          </Card>
        </div>

        {/* Recent activity */}
        <div>
          <SectionLabel
            className="mb-2"
            action={
              <Link
                href="/wallet/transactions"
                className="t-caption font-semibold text-primary-600"
              >
                View all →
              </Link>
            }
          >
            Recent Activity
          </SectionLabel>
          <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
            <TxnRow
              type="earning"
              title="Challan IRN-100842"
              date="Aug 3"
              amount="+₹850"
              status="Pending"
            />
            <TxnRow
              type="payout"
              title="Payout to HDFC ****4521"
              date="Aug 2"
              amount="-₹8,000"
              status="Paid"
            />
            <TxnRow
              type="earning"
              title="RTO IRN-100838"
              date="Aug 2"
              amount="+₹700"
              status="Settled"
            />
            <TxnRow
              type="deduction"
              title="TDS on ₹850"
              date="Aug 1"
              amount="-₹85"
            />
          </Card>
        </div>
      </div>

      <BottomTabBar active="wallet" />
    </PhoneFrame>
  );
}

function SummaryRow({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between t-body">
      <span
        className={
          bold
            ? "font-semibold text-neutral-800"
            : "text-neutral-600"
        }
      >
        {label}
      </span>
      <span
        className={`tabular font-mono ${
          bold
            ? "t-h3 font-bold text-neutral-800"
            : muted
              ? "text-neutral-500"
              : "text-neutral-800 font-semibold"
        }`}
      >
        {value}
      </span>
    </div>
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
      bg: "bg-info-subtle",
      color: "text-info-bold",
      amountColor: "text-info-bold",
    },
    deduction: {
      icon: ArrowDownRight,
      bg: "bg-warning-subtle",
      color: "text-warning-bold",
      amountColor: "text-warning-bold",
    },
  }[type];
  const Icon = config.icon;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}
      >
        <Icon size={16} className={config.color} />
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
