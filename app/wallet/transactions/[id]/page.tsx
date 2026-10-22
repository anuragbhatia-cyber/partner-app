"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Card, Chip, SectionLabel } from "@/components/ui";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Check,
  Clock,
  ChevronRight,
  Receipt,
  Package,
  XCircle,
} from "lucide-react";
import {
  EarningTxn,
  PayoutTxn,
  DeductionTxn,
  getTxn,
  TRANSACTIONS,
  usePreviewTxnId,
} from "@/lib/wallet-store";

export default function TxnDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const previewId = usePreviewTxnId();
  const routeId =
    typeof params?.id === "string" && params.id ? decodeURIComponent(params.id) : "";
  const id = routeId || previewId || "";
  const txn = getTxn(id);

  if (!txn) {
    return (
      <PhoneFrame label="Wallet · Transaction">
        <AppBar back href="/wallet/transactions" title="Transaction" centered />
        <div className="px-4 py-10 text-center">
          <div className="t-body text-neutral-500 mb-4">
            Transaction not found.
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="t-body font-semibold text-primary-600"
          >
            Go back
          </button>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame label="Wallet · Transaction">
      <AppBar back href="/wallet/transactions" title="Transaction" centered />
      <div className="px-4 py-4 pb-10 space-y-4">
        {txn.kind === "earning" ? (
          <EarningView txn={txn} />
        ) : txn.kind === "payout" ? (
          <PayoutView txn={txn} />
        ) : (
          <DeductionView txn={txn} />
        )}
      </div>
    </PhoneFrame>
  );
}

/* ------------------------------- EARNING ------------------------------- */

function EarningView({ txn }: { txn: EarningTxn }) {
  const resolved = txn.closure === "resolved";
  return (
    <>
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              resolved
                ? "bg-success-subtle text-success-bold"
                : "bg-error-subtle text-error-bold"
            }`}
          >
            {resolved ? <ArrowUpRight size={18} /> : <XCircle size={18} />}
          </span>
          <div className="flex-1">
            <div className="t-caption font-semibold uppercase tracking-wide text-neutral-500">
              Credited
            </div>
            <div className="t-caption text-neutral-500">{txn.closedAt}</div>
          </div>
          <Chip tone={resolved ? "success" : "error"} size="sm" dot>
            {resolved ? "Resolved" : "Cancelled"}
          </Chip>
        </div>
        <div className="t-hero font-bold tabular text-success-bold font-mono leading-none">
          +₹{txn.net.toLocaleString("en-IN")}
        </div>
        {txn.closureNote && (
          <p className="t-body-sm text-neutral-600 mt-3">{txn.closureNote}</p>
        )}
      </Card>

      <div>
        <SectionLabel className="mb-2">Batch</SectionLabel>
        <Link href={`/leads/${txn.batchId}`}>
          <Card padding="lg" className="hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                <Package size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="t-body font-semibold text-neutral-800 truncate">
                  {txn.batchId}
                </div>
                <div className="t-caption text-neutral-500 truncate">
                  {txn.batchType} · {txn.state}
                </div>
              </div>
              <ChevronRight size={18} className="text-neutral-400" />
            </div>
          </Card>
        </Link>
      </div>

      <div>
        <SectionLabel className="mb-2">Incident</SectionLabel>
        <Card padding="lg">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
              <Receipt size={18} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="t-body font-semibold text-neutral-800 truncate">
                {txn.incidentId}
              </div>
              <div className="t-caption text-neutral-500 truncate">
                Closed · {txn.closedAt}
              </div>
            </div>
            {resolved ? (
              <Chip tone="success" size="sm">
                <Check size={10} className="-ml-0.5" />
                Done
              </Chip>
            ) : (
              <Chip tone="error" size="sm">
                Cancelled
              </Chip>
            )}
          </div>
        </Card>
      </div>

      <div>
        <SectionLabel className="mb-2">Amount breakdown</SectionLabel>
        <Card padding="lg">
          <BreakdownRow label="Base payout" value={`₹${txn.gross.toLocaleString("en-IN")}`} />
          <BreakdownRow label="Platform fee" value={`− ₹${txn.platformFee.toLocaleString("en-IN")}`} muted />
          <BreakdownRow label={`TDS (${Math.round((txn.tds / txn.gross) * 100)}%)`} value={`− ₹${txn.tds.toLocaleString("en-IN")}`} muted />
          <div className="border-t border-[var(--border-subtle)] my-2" />
          <BreakdownRow
            label="Credited to wallet"
            value={`₹${txn.net.toLocaleString("en-IN")}`}
            emphasize
          />
        </Card>
      </div>
    </>
  );
}

/* -------------------------------- PAYOUT ------------------------------- */

function PayoutView({ txn }: { txn: PayoutTxn }) {
  const pending = txn.status === "pending";
  return (
    <>
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              pending
                ? "bg-warning-subtle text-warning-bold"
                : "bg-error-subtle text-error-bold"
            }`}
          >
            {pending ? <Clock size={18} /> : <ArrowDownLeft size={18} />}
          </span>
          <div className="flex-1">
            <div className="t-caption font-semibold uppercase tracking-wide text-neutral-500">
              Withdrawn
            </div>
            <div className="t-caption text-neutral-500">
              Requested · {txn.requestedAt}
            </div>
          </div>
          <Chip tone={pending ? "warning" : "success"} size="sm" dot>
            {pending ? "Pending" : "Settled"}
          </Chip>
        </div>
        <div
          className={`t-hero font-bold tabular font-mono leading-none ${
            pending ? "text-warning-bold" : "text-error-bold"
          }`}
        >
          −₹{txn.amount.toLocaleString("en-IN")}
        </div>
      </Card>

      <div>
        <SectionLabel className="mb-2">Bank account</SectionLabel>
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="t-body font-semibold text-neutral-800">
                {txn.bank}
              </div>
              <div className="t-caption text-neutral-500 mt-0.5">
                {txn.utr ? `UTR · ${txn.utr}` : `Reference · ${txn.id}`}
              </div>
            </div>
            {txn.settledAt && (
              <div className="text-right">
                <div className="t-caption text-neutral-500">Settled</div>
                <div className="t-caption font-semibold text-neutral-700">
                  {txn.settledAt}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div>
        <SectionLabel className="mb-2">
          Drawn from · {txn.sources.length} incident
          {txn.sources.length === 1 ? "" : "s"}
        </SectionLabel>
        <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
          {txn.sources.map((s) => (
            <Link
              key={s.earningId}
              href={`/wallet/transactions/${s.earningId}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
            >
              <span className="w-7 h-7 rounded-lg bg-success-subtle text-success-bold flex items-center justify-center shrink-0">
                <ArrowUpRight size={14} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="t-body font-medium text-neutral-800 truncate">
                  {s.incidentId}
                </div>
                <div className="t-caption text-neutral-500 truncate">
                  {s.batchId}
                </div>
              </div>
              <div className="t-body font-semibold tabular font-mono text-success-bold shrink-0">
                +₹{s.net.toLocaleString("en-IN")}
              </div>
              <ChevronRight size={16} className="text-neutral-400 shrink-0" />
            </Link>
          ))}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-50">
            <span className="t-body font-semibold text-neutral-700">Total</span>
            <span className="t-body font-bold tabular font-mono text-neutral-800">
              ₹{txn.sources.reduce((s, x) => s + x.net, 0).toLocaleString("en-IN")}
            </span>
          </div>
        </Card>
      </div>
    </>
  );
}

/* ------------------------------- DEDUCTION ----------------------------- */

function DeductionView({ txn }: { txn: DeductionTxn }) {
  const linked = TRANSACTIONS.find(
    (t) => t.id === txn.linkedEarningId && t.kind === "earning",
  ) as EarningTxn | undefined;

  return (
    <>
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-9 h-9 rounded-xl bg-error-subtle text-error-bold flex items-center justify-center">
            <ArrowDownRight size={18} />
          </span>
          <div className="flex-1">
            <div className="t-caption font-semibold uppercase tracking-wide text-neutral-500">
              Deducted
            </div>
            <div className="t-caption text-neutral-500">{txn.day}</div>
          </div>
          <Chip tone="error" size="sm">
            {txn.reason}
          </Chip>
        </div>
        <div className="t-hero font-bold tabular font-mono text-error-bold leading-none">
          −₹{txn.amount.toLocaleString("en-IN")}
        </div>
        <p className="t-body-sm text-neutral-600 mt-3">
          {txn.reason === "TDS"
            ? `Tax deducted at source at ${txn.ratePct}% on an earning of ₹${txn.gross.toLocaleString("en-IN")}.`
            : `Platform fee of ${txn.ratePct}% applied on an earning of ₹${txn.gross.toLocaleString("en-IN")}.`}
        </p>
      </Card>

      <div>
        <SectionLabel className="mb-2">Breakdown</SectionLabel>
        <Card padding="lg">
          <BreakdownRow label="Gross earning" value={`₹${txn.gross.toLocaleString("en-IN")}`} />
          <BreakdownRow label={`${txn.reason} rate`} value={`${txn.ratePct}%`} muted />
          <div className="border-t border-[var(--border-subtle)] my-2" />
          <BreakdownRow
            label="Deducted"
            value={`− ₹${txn.amount.toLocaleString("en-IN")}`}
            emphasize
          />
        </Card>
      </div>

      {linked && (
        <div>
          <SectionLabel className="mb-2">Linked earning</SectionLabel>
          <Link href={`/wallet/transactions/${linked.id}`}>
            <Card padding="lg" className="hover:bg-neutral-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-success-subtle text-success-bold flex items-center justify-center shrink-0">
                  <ArrowUpRight size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="t-body font-semibold text-neutral-800 truncate">
                    {linked.incidentId}
                  </div>
                  <div className="t-caption text-neutral-500 truncate">
                    {linked.batchId} · {linked.state}
                  </div>
                </div>
                <div className="t-body font-semibold tabular font-mono text-success-bold shrink-0">
                  +₹{linked.net.toLocaleString("en-IN")}
                </div>
                <ChevronRight size={16} className="text-neutral-400 shrink-0" />
              </div>
            </Card>
          </Link>
        </div>
      )}
    </>
  );
}

/* --------------------------------- UTIL -------------------------------- */

function BreakdownRow({
  label,
  value,
  muted,
  emphasize,
}: {
  label: string;
  value: string;
  muted?: boolean;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span
        className={`t-body ${
          emphasize ? "font-semibold text-neutral-800" : "text-neutral-600"
        }`}
      >
        {label}
      </span>
      <span
        className={`t-body tabular font-mono ${
          emphasize
            ? "font-bold text-neutral-900"
            : muted
              ? "text-neutral-500"
              : "font-semibold text-neutral-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
