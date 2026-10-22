"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import { Chip } from "@/components/ui";
import {
  WalletTxn,
  txnTitle,
  txnSignedAmount,
} from "@/lib/wallet-store";

type Variant = "compact" | "detailed";

export function TxnRow({
  txn,
  variant = "compact",
  href,
}: {
  txn: WalletTxn;
  variant?: Variant;
  href?: string;
}) {
  const linkHref = href ?? `/wallet/transactions/${txn.id}`;
  const title = txnTitle(txn);
  const amount = txnSignedAmount(txn);

  const isPending = txn.kind === "payout" && txn.status === "pending";
  const isEarning = txn.kind === "earning";

  const bg = isPending
    ? "bg-warning-subtle"
    : isEarning
      ? "bg-success-subtle"
      : "bg-error-subtle";
  const fg = isPending
    ? "text-warning-bold"
    : isEarning
      ? "text-success-bold"
      : "text-error-bold";
  const amountColor = isPending
    ? "text-warning-bold"
    : isEarning
      ? "text-success-bold"
      : "text-error-bold";

  const Icon = isPending
    ? Clock
    : isEarning
      ? ArrowUpRight
      : txn.kind === "payout"
        ? ArrowDownLeft
        : ArrowDownRight;

  const subtitle = (() => {
    if (txn.kind === "payout" && txn.utr) return `UTR: ${txn.utr}`;
    if (txn.kind === "payout") return `Requested · ${txn.id}`;
    if (txn.kind === "earning") return `${txn.batchId} · ${txn.state}`;
    return `Linked to ${txn.linkedEarningId}`;
  })();

  const chip =
    isPending ? (
      <Chip tone="warning" size="sm" dot>
        Pending · settles in ~48h
      </Chip>
    ) : null;

  return (
    <Link
      href={linkHref}
      className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bg}`}
      >
        <Icon size={14} className={fg} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="t-body font-medium text-neutral-800 truncate">
              {title}
            </div>
            <div className="t-caption text-neutral-500 mt-0.5 truncate">
              {variant === "detailed" ? subtitle : txn.day}
            </div>
            {chip && <div className="mt-1.5">{chip}</div>}
          </div>
          <div
            className={`t-body font-semibold tabular font-mono shrink-0 ${amountColor}`}
          >
            {amount}
          </div>
        </div>
      </div>
    </Link>
  );
}
