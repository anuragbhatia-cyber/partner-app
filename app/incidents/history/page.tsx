"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Card, Chip, SectionLabel } from "@/components/ui";
import { Search, Filter, ChevronRight } from "lucide-react";
import Link from "next/link";

const HISTORY = [
  { date: "Aug 3", time: "10:24", id: "LWY-2026-00842", type: "Challan", amount: "₹850", status: "completed" as const },
  { date: "Aug 2", time: "14:12", id: "LWY-2026-00838", type: "RTO Renewal", amount: "₹700", status: "completed" as const },
  { date: "Aug 2", time: "09:30", id: "LWY-2026-00834", type: "Challan Dispute", amount: "₹450", status: "completed" as const },
  { date: "Aug 1", time: "16:22", id: "LWY-2026-00821", type: "RTO Documentation", amount: "₹950", status: "completed" as const },
  { date: "Jul 31", time: "11:00", id: "LWY-2026-00817", type: "Traffic Case", status: "cancelled" as const },
  { date: "Jul 30", time: "18:45", id: "LWY-2026-00810", type: "Accident Scene", amount: "₹1,200", status: "completed" as const },
];

export default function IncidentHistoryPage() {
  const total = HISTORY.filter(h => h.status === "completed").reduce((sum, h) => {
    const n = parseInt((h.amount || "0").replace(/[₹,]/g, ""));
    return sum + n;
  }, 0);

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
          <div className="flex items-baseline justify-between">
            <div>
              <div className="t-h1 font-bold tabular text-neutral-800">
                {HISTORY.length} cases
              </div>
              <div className="t-body-sm text-neutral-500 mt-0.5">
                ₹{total.toLocaleString("en-IN")} earned
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-white shadow-e1 flex items-center justify-center">
              <Filter size={16} className="text-neutral-600" />
            </button>
          </div>
        </Card>

        <SectionLabel className="mb-2">This Week</SectionLabel>
        <Card padding="none" className="overflow-hidden divide-y divide-[var(--border-subtle)]">
          {HISTORY.map((h) => (
            <Link
              key={h.id}
              href="/incidents/active"
              className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50/50"
            >
              <div className="flex-1 min-w-0">
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
                <div className="t-body-sm font-mono text-neutral-500">{h.id}</div>
                <div className="t-body text-neutral-800 mt-0.5">{h.type}</div>
              </div>
              {h.amount && (
                <div className="t-body-lg font-semibold text-neutral-800 tabular shrink-0">
                  {h.amount}
                </div>
              )}
              <ChevronRight size={16} className="text-neutral-300 shrink-0" />
            </Link>
          ))}
        </Card>
      </div>
    </PhoneFrame>
  );
}
