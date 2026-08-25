"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Card, Chip, SectionLabel } from "@/components/ui";
import { Search, X, ArrowDownLeft, Download, Clock } from "lucide-react";
import { useMemo, useState } from "react";

const TXN = [
  { day: "Today", items: [
    { type: "payout", title: "HDFC ****4521", subtitle: "Requested at 09:42 · PYT-56784321", amount: "-₹2,000", status: "pending" },
  ]},
  { day: "Aug 3", items: [
    { type: "payout", title: "HDFC ****4521", subtitle: "UTR: N987654321", amount: "-₹6,500", status: "" },
  ]},
  { day: "Aug 2", items: [
    { type: "payout", title: "HDFC ****4521", subtitle: "UTR: N123456789", amount: "-₹8,000", status: "" },
  ]},
  { day: "Jul 28", items: [
    { type: "payout", title: "HDFC ****4521", subtitle: "UTR: N456789123", amount: "-₹12,400", status: "" },
  ]},
  { day: "Jul 21", items: [
    { type: "payout", title: "HDFC ****4521", subtitle: "UTR: N321654987", amount: "-₹9,750", status: "" },
  ]},
];

function csvEscape(v: string) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadStatement() {
  const rows = [["Date", "Type", "Title", "Reference", "Amount"]];
  for (const day of TXN) {
    for (const t of day.items) {
      rows.push([day.day, t.type, t.title, t.subtitle, t.amount]);
    }
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

export default function TransactionsPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TXN;
    return TXN.map((day) => ({
      ...day,
      items: day.items.filter((t) =>
        [t.title, t.subtitle, t.amount, day.day]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q))
      ),
    })).filter((day) => day.items.length > 0);
  }, [query]);

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

      <div className="px-4 py-4 pb-24 space-y-4">
        {filtered.length === 0 ? (
          <div className="pt-10 text-center t-body text-neutral-500">
            No transactions match &ldquo;{query}&rdquo;
          </div>
        ) : (
          filtered.map((day) => (
            <div key={day.day}>
              <SectionLabel className="mb-2">{day.day}</SectionLabel>
              <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
                {day.items.map((t, i) => (
                  <TxnRow key={i} {...(t as any)} />
                ))}
              </Card>
            </div>
          ))
        )}
      </div>
    </PhoneFrame>
  );
}

function TxnRow({
  title,
  subtitle,
  amount,
  status,
}: {
  type?: string;
  title: string;
  subtitle?: string;
  amount: string;
  status?: string;
}) {
  const chip =
    status === "review" ? (
      <Chip tone="warning" size="sm">Under review</Chip>
    ) : status === "pending" ? (
      <Chip tone="warning" size="sm" dot>Pending · settles in ~48h</Chip>
    ) : null;

  const isPending = status === "pending" || status === "review";

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
          isPending
            ? "bg-warning-subtle text-warning-bold"
            : "bg-error-subtle text-error-bold"
        }`}
      >
        {isPending ? <Clock size={14} /> : <ArrowDownLeft size={14} />}
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
          <div
            className={`t-body font-semibold tabular font-mono shrink-0 ${
              isPending ? "text-warning-bold" : "text-error-bold"
            }`}
          >
            {amount}
          </div>
        </div>
      </div>
    </div>
  );
}
