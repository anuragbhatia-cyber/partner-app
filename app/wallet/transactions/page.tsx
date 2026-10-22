"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Card, SectionLabel } from "@/components/ui";
import { TxnRow } from "@/components/TxnRow";
import {
  TRANSACTIONS,
  WalletTxn,
  EarningTxn,
  txnTitle,
  txnSignedAmount,
  groupByDay,
} from "@/lib/wallet-store";
import Link from "next/link";
import {
  Search,
  X,
  Download,
  Package,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { useMemo, useState } from "react";

type Tab = "all" | "batch" | "incidents";

function csvEscape(v: string) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function txnReference(t: WalletTxn): string {
  if (t.kind === "payout") return t.utr ? `UTR: ${t.utr}` : t.id;
  if (t.kind === "earning") return `${t.batchId} · ${t.incidentId}`;
  return `Linked to ${t.linkedEarningId}`;
}

function downloadStatement() {
  const rows = [["Date", "Type", "Title", "Reference", "Amount"]];
  for (const t of TRANSACTIONS) {
    rows.push([
      t.day,
      t.kind,
      txnTitle(t),
      txnReference(t),
      txnSignedAmount(t),
    ]);
  }
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wallet-statement-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function matches(t: WalletTxn, q: string) {
  if (!q) return true;
  return [txnTitle(t), txnReference(t), txnSignedAmount(t), t.day]
    .filter(Boolean)
    .some((v) => v.toLowerCase().includes(q));
}

export default function TransactionsPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const q = query.trim().toLowerCase();

  const allGrouped = useMemo(
    () => groupByDay(TRANSACTIONS.filter((t) => matches(t, q))),
    [q],
  );

  const earnings = useMemo(
    () =>
      TRANSACTIONS.filter(
        (t): t is EarningTxn => t.kind === "earning" && matches(t, q),
      ),
    [q],
  );

  const incidentsGrouped = useMemo(() => groupByDay(earnings), [earnings]);

  const batchGroups = useMemo(() => {
    const map = new Map<
      string,
      { batchId: string; batchType: string; state: string; items: EarningTxn[]; total: number }
    >();
    for (const e of earnings) {
      const g = map.get(e.batchId) ?? {
        batchId: e.batchId,
        batchType: e.batchType,
        state: e.state,
        items: [],
        total: 0,
      };
      g.items.push(e);
      g.total += e.net;
      map.set(e.batchId, g);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.items[0].date < b.items[0].date ? 1 : -1,
    );
  }, [earnings]);

  const counts = {
    all: TRANSACTIONS.length,
    batch: new Set(TRANSACTIONS.filter((t) => t.kind === "earning").map((t) => (t as EarningTxn).batchId)).size,
    incidents: TRANSACTIONS.filter((t) => t.kind === "earning").length,
  };

  const isEmpty =
    (tab === "all" && allGrouped.length === 0) ||
    (tab === "batch" && batchGroups.length === 0) ||
    (tab === "incidents" && incidentsGrouped.length === 0);

  return (
    <PhoneFrame label="Wallet · Transactions">
      <AppBar
        back
        href="/wallet"
        title="Transactions"
        action={
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={downloadStatement}
              aria-label="Download statement CSV"
              title="Download CSV"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-50"
            >
              <Download size={18} className="text-neutral-700" />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen((s) => !s)}
              aria-label={searchOpen ? "Close search" : "Search"}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-50"
            >
              {searchOpen ? (
                <X size={18} className="text-neutral-700" />
              ) : (
                <Search size={18} className="text-neutral-700" />
              )}
            </button>
          </div>
        }
      />

      {searchOpen && (
        <div className="px-4 pt-3 bg-white border-b border-[var(--border-subtle)] sticky top-16 z-20">
          <div className="flex items-center gap-2 h-11 px-3 rounded-lg border border-[var(--border-default)] bg-white focus-within:border-primary-500 transition-colors">
            <Search size={16} className="text-neutral-600 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions"
              className="flex-1 min-w-0 t-body text-neutral-800 bg-transparent focus:outline-none focus-visible:outline-none placeholder:text-neutral-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="shrink-0 text-neutral-500 hover:text-neutral-700"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="h-3" />
        </div>
      )}

      <div className="px-4 pt-3">
        <div className="flex gap-1.5 bg-neutral-100 rounded-lg p-1">
          {(
            [
              { value: "all", label: "All", count: counts.all },
              { value: "batch", label: "Batch", count: counts.batch },
              { value: "incidents", label: "Incidents", count: counts.incidents },
            ] as { value: Tab; label: string; count: number }[]
          ).map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={`flex-1 h-8 rounded-md t-caption font-semibold transition-colors inline-flex items-center justify-center gap-1.5 ${
                tab === t.value
                  ? "bg-white text-neutral-800 shadow-e1"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full t-micro font-semibold tabular ${
                  tab === t.value
                    ? "bg-neutral-100 text-neutral-700"
                    : "bg-white text-neutral-500"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 pb-24 space-y-4">
        {isEmpty ? (
          <div className="pt-10 text-center t-body text-neutral-500">
            {q
              ? `No transactions match “${query}”`
              : "Nothing to show here yet."}
          </div>
        ) : tab === "all" ? (
          allGrouped.map((day) => (
            <div key={day.day}>
              <SectionLabel className="mb-2">{day.day}</SectionLabel>
              <Card
                padding="none"
                className="divide-y divide-[var(--border-subtle)]"
              >
                {day.items.map((t) => (
                  <TxnRow key={t.id} txn={t} variant="detailed" />
                ))}
              </Card>
            </div>
          ))
        ) : tab === "incidents" ? (
          incidentsGrouped.map((day) => (
            <div key={day.day}>
              <SectionLabel className="mb-2">{day.day}</SectionLabel>
              <Card
                padding="none"
                className="divide-y divide-[var(--border-subtle)]"
              >
                {day.items.map((t) => (
                  <TxnRow key={t.id} txn={t} variant="detailed" />
                ))}
              </Card>
            </div>
          ))
        ) : (
          batchGroups.map((g) => <BatchGroup key={g.batchId} group={g} />)
        )}
      </div>
    </PhoneFrame>
  );
}

function BatchGroup({
  group,
}: {
  group: {
    batchId: string;
    batchType: string;
    state: string;
    items: EarningTxn[];
    total: number;
  };
}) {
  return (
    <div>
      <Link
        href={`/leads/${group.batchId}`}
        className="flex items-center gap-3 px-1 mb-2 group"
      >
        <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
          <Package size={16} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="t-body font-semibold text-neutral-800 truncate group-hover:text-primary-700">
            {group.batchId}
          </div>
          <div className="t-caption text-neutral-500 truncate">
            {group.batchType} · {group.state}
          </div>
        </div>
        <div className="t-body font-bold tabular font-mono text-success-bold shrink-0">
          +₹{group.total.toLocaleString("en-IN")}
        </div>
        <ChevronRight
          size={16}
          className="text-neutral-400 shrink-0 group-hover:text-primary-600"
        />
      </Link>
      <Card
        padding="none"
        className="divide-y divide-[var(--border-subtle)]"
      >
        {group.items.map((e) => (
          <Link
            key={e.id}
            href={`/wallet/transactions/${e.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
          >
            <span className="w-7 h-7 rounded-lg bg-success-subtle text-success-bold flex items-center justify-center shrink-0">
              <ArrowUpRight size={14} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="t-body font-medium text-neutral-800 truncate">
                {e.incidentId}
              </div>
              <div className="t-caption text-neutral-500 truncate">
                {e.day} · {e.closure === "resolved" ? "Resolved" : "Cancelled"}
              </div>
            </div>
            <div className="t-body font-semibold tabular font-mono text-success-bold shrink-0">
              +₹{e.net.toLocaleString("en-IN")}
            </div>
          </Link>
        ))}
      </Card>
    </div>
  );
}
