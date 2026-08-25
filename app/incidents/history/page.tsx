"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Card, Chip, SectionLabel } from "@/components/ui";
import { Search, ChevronRight, Download, Inbox } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type HistoryStatus = "completed" | "cancelled";
type FilterKey = "all" | HistoryStatus;

type HistoryItem = {
  date: string;
  time: string;
  id: string;
  type: string;
  amount?: string;
  status: HistoryStatus;
};

const HISTORY: HistoryItem[] = [
  { date: "Aug 3", time: "10:24", id: "IRN-100842", type: "Challan", amount: "₹850", status: "completed" },
  { date: "Aug 2", time: "14:12", id: "IRN-100838", type: "RTO Renewal", amount: "₹700", status: "completed" },
  { date: "Aug 2", time: "09:30", id: "IRN-100834", type: "Challan Dispute", amount: "₹450", status: "completed" },
  { date: "Aug 1", time: "16:22", id: "IRN-100821", type: "RTO Documentation", amount: "₹950", status: "completed" },
  { date: "Jul 31", time: "11:00", id: "IRN-100817", type: "Traffic Case", status: "cancelled" },
  { date: "Jul 30", time: "18:45", id: "IRN-100810", type: "Accident Scene", amount: "₹1,200", status: "completed" },
];

function downloadReceipt(h: HistoryItem) {
  const lines = [
    "LAWYERED PARTNER — CASE RECEIPT",
    "",
    `Case ID:     ${h.id}`,
    `Service:     ${h.type}`,
    `Date:        ${h.date}, ${h.time}`,
    `Status:      ${h.status.toUpperCase()}`,
    `Payout:      ${h.amount ?? "—"}`,
    "",
    "Partner:     Advocate Priya Sharma",
    "Bar Council: KA/1234/2018",
    "PAN:         ABCDE1234F",
    "",
    "This is a system-generated receipt.",
    `Generated:   ${new Date().toISOString()}`,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${h.id}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function IncidentHistoryPage() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    let completed = 0;
    let cancelled = 0;
    for (const h of HISTORY) {
      if (h.status === "completed") completed += 1;
      else cancelled += 1;
    }
    return { all: HISTORY.length, completed, cancelled };
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? HISTORY : HISTORY.filter((h) => h.status === filter)),
    [filter]
  );

  const total = filtered
    .filter((h) => h.status === "completed")
    .reduce((sum, h) => sum + parseInt((h.amount || "0").replace(/[₹,]/g, "")), 0);

  return (
    <PhoneFrame label="Incidents · History">
      <AppBar
        back
        href="/incidents"
        title="History"
        action={
          <button className="w-10 h-10 flex items-center justify-center rounded-full">
            <Search size={20} className="text-neutral-700" />
          </button>
        }
      />

      <div className="px-4 py-4 pb-24 space-y-4">
        <Card padding="lg" className="bg-primary-50/60 border-primary-100">
          <div className="t-caption font-semibold uppercase tracking-wider text-primary-700 mb-1">
            Aug 2026
          </div>
          <div>
            <div className="t-h1 font-bold tabular text-neutral-800">
              {filtered.length} case{filtered.length === 1 ? "" : "s"}
            </div>
            <div className="t-body-sm text-neutral-500 mt-0.5">
              ₹{total.toLocaleString("en-IN")} earned
            </div>
          </div>
        </Card>

        <div className="flex gap-2 -mx-1 px-1 overflow-x-auto no-scrollbar">
          <FilterPill
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="All"
            count={counts.all}
          />
          <FilterPill
            active={filter === "completed"}
            onClick={() => setFilter("completed")}
            label="Completed"
            count={counts.completed}
          />
          <FilterPill
            active={filter === "cancelled"}
            onClick={() => setFilter("cancelled")}
            label="Cancelled"
            count={counts.cancelled}
          />
        </div>

        <SectionLabel className="mb-2">
          {filter === "all" ? "This Month" : `${counts[filter]} shown`}
        </SectionLabel>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-white/60 px-5 py-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary-50 text-primary-700 flex items-center justify-center mb-3">
              <Inbox size={22} />
            </div>
            <h3 className="t-body-lg font-semibold text-neutral-800">
              No {filter} cases yet
            </h3>
            <p className="t-body-sm text-neutral-500 mt-1">
              They&apos;ll appear here after you close them.
            </p>
          </div>
        ) : (
          <Card
            padding="none"
            className="overflow-hidden divide-y divide-[var(--border-subtle)]"
          >
            {filtered.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50/50"
              >
                <Link
                  href="/incidents/active"
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {h.status === "completed" ? (
                      <Chip tone="success" size="sm">✓ Completed</Chip>
                    ) : (
                      <Chip tone="error" size="sm">✕ Cancelled</Chip>
                    )}
                    <span className="t-caption text-neutral-400">
                      · {h.date}, {h.time}
                    </span>
                  </div>
                  <div className="t-body-sm font-mono text-neutral-500">
                    {h.id}
                  </div>
                  <div className="t-body text-neutral-800 mt-0.5">{h.type}</div>
                </Link>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {h.amount && (
                    <div className="t-body-lg font-semibold text-neutral-800 tabular">
                      {h.amount}
                    </div>
                  )}
                  {h.status === "completed" ? (
                    <button
                      type="button"
                      onClick={() => downloadReceipt(h)}
                      aria-label={`Download receipt for ${h.id}`}
                      className="inline-flex items-center gap-1 t-caption font-semibold text-primary-600 hover:text-primary-700"
                    >
                      <Download size={12} />
                      Receipt
                    </button>
                  ) : (
                    <ChevronRight size={16} className="text-neutral-300" />
                  )}
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </PhoneFrame>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border transition-colors ${
        active
          ? "bg-primary-600 border-primary-600 text-white"
          : "bg-white border-[var(--border-default)] text-neutral-700 hover:border-primary-300"
      }`}
    >
      <span className="t-body-sm font-semibold">{label}</span>
      <span
        className={`min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full t-caption font-semibold tabular ${
          active
            ? "bg-white/20 text-white"
            : "bg-neutral-100 text-neutral-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
