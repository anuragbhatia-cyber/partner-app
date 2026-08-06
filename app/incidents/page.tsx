"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Button, Card, Chip } from "@/components/ui";
import {
  Search,
  MapPin,
  ChevronRight,
  Calendar,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tab = "active" | "past";
type Status = "completed" | "cancelled";

type PastCase = {
  caseId: string;
  type: string;
  amount?: string;
  status: Status;
  date: Date;
};

// Fixed reference so "Today" / "Yesterday" labels stay stable in a prototype
const NOW = new Date("2026-08-05T14:00:00");

function daysAgo(n: number, hh = 12, mm = 0): Date {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  d.setHours(hh, mm, 0, 0);
  return d;
}

const PAST_CASES: PastCase[] = [
  { caseId: "LWY-2026-00838", type: "RTO Renewal", amount: "₹700", status: "completed", date: daysAgo(0, 9, 42) },
  { caseId: "LWY-2026-00821", type: "Challan Mgmt", amount: "₹450", status: "completed", date: daysAgo(1, 18, 14) },
  { caseId: "LWY-2026-00817", type: "Client no-show", status: "cancelled", date: daysAgo(2, 15, 0) },
  { caseId: "LWY-2026-00804", type: "Traffic Challan", amount: "₹850", status: "completed", date: daysAgo(3, 11, 20) },
  { caseId: "LWY-2026-00792", type: "Vehicle Transfer", amount: "₹1,200", status: "completed", date: daysAgo(4, 16, 5) },
  { caseId: "LWY-2026-00781", type: "RC Renewal", amount: "₹600", status: "completed", date: daysAgo(7, 10, 30) },
  { caseId: "LWY-2026-00775", type: "Client cancelled", status: "cancelled", date: daysAgo(8, 13, 0) },
  { caseId: "LWY-2026-00768", type: "Accident Response", amount: "₹1,500", status: "completed", date: daysAgo(9, 20, 45) },
  { caseId: "LWY-2026-00759", type: "Challan Mgmt", amount: "₹450", status: "completed", date: daysAgo(11, 12, 10) },
  { caseId: "LWY-2026-00744", type: "Court Appearance", amount: "₹2,000", status: "completed", date: daysAgo(14, 11, 0) },
];

const fmtISO = (d: Date) => d.toISOString().slice(0, 10);
const fmtNice = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtShort = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function relativeTime(d: Date): string {
  const diffMs = NOW.getTime() - d.getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  if (days === 0) return `Today, ${hh}:${mm}`;
  if (days === 1) return `Yesterday, ${hh}:${mm}`;
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "Last week";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function IncidentsListPage() {
  const [tab, setTab] = useState<Tab>("active");
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [dateSheetOpen, setDateSheetOpen] = useState(false);

  const isToday = fromDate === fmtISO(NOW) && toDate === fmtISO(NOW);
  const dateLabel = !fromDate && !toDate
    ? "Any date"
    : fromDate && toDate
      ? isToday
        ? "Today"
        : fromDate === toDate
          ? fmtNice(new Date(fromDate))
          : `${fmtShort(new Date(fromDate))} – ${fmtShort(new Date(toDate))}`
      : fromDate
        ? `From ${fmtShort(new Date(fromDate))}`
        : `Until ${fmtShort(new Date(toDate))}`;

  return (
    <PhoneFrame label="Incidents · List">
      <AppBar title="Incidents" />

      <div className="px-4 pt-5 pb-3 bg-[var(--surface-bg)] space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 h-11 px-3 rounded-lg border border-[var(--border-default)] bg-white focus-within:border-primary-500 transition-colors min-w-0">
            <Search size={16} className="text-neutral-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                tab === "active"
                  ? "Search active"
                  : "Search past"
              }
              className="flex-1 min-w-0 t-body text-neutral-800 bg-transparent focus:outline-none focus-visible:outline-none placeholder:text-neutral-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="t-caption font-semibold text-neutral-500 hover:text-neutral-700 shrink-0"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setDateSheetOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 h-11 px-3 rounded-lg border border-[var(--border-default)] bg-white hover:border-primary-300 transition-colors"
          >
            <Calendar size={16} className="text-neutral-500 shrink-0" />
            <span className="t-body-sm font-medium text-neutral-800 max-w-[110px] truncate">
              {dateLabel}
            </span>
          </button>
        </div>

        <Card padding="lg">
          <h2 className="t-h3 font-semibold text-neutral-900 mb-3">Total incidents</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl px-4 py-3 bg-primary-50 text-primary-700">
              <div className="t-caption font-medium opacity-80">Active</div>
              <div className="t-h1 font-bold tabular mt-1">{ACTIVE_COUNT}</div>
            </div>
            <div className="rounded-xl px-4 py-3 bg-neutral-100 text-neutral-700">
              <div className="t-caption font-medium opacity-80">Past</div>
              <div className="t-h1 font-bold tabular mt-1">{PAST_CASES.length}</div>
            </div>
          </div>
        </Card>

        <div className="flex bg-neutral-100 rounded-xl p-1">
          <TabButton active={tab === "active"} onClick={() => setTab("active")}>
            Active
            <span className="ml-1.5 t-caption font-semibold text-neutral-500">
              {ACTIVE_COUNT}
            </span>
          </TabButton>
          <TabButton active={tab === "past"} onClick={() => setTab("past")}>
            Past incidents
          </TabButton>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24">
        {tab === "active" ? (
          <ActivePanel query={query} />
        ) : (
          <PastPanel
            query={query}
            fromDate={fromDate}
            toDate={toDate}
            onShowAll={() => {
              setFromDate("");
              setToDate("");
            }}
          />
        )}
      </div>

      <BottomTabBar active="incidents" />

      <DateRangeSheet
        open={dateSheetOpen}
        from={fromDate}
        to={toDate}
        onApply={(f, t) => {
          setFromDate(f);
          setToDate(t);
          setDateSheetOpen(false);
        }}
        onClose={() => setDateSheetOpen(false)}
      />
    </PhoneFrame>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 h-10 rounded-lg t-body-sm font-semibold transition-all inline-flex items-center justify-center ${
        active
          ? "bg-white text-neutral-800 shadow-e1"
          : "text-neutral-500 hover:text-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}

type ActiveCase = {
  caseId: string;
  type: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "IN PROGRESS" | "EN ROUTE" | "ARRIVED" | "ACCEPTED";
  elapsed: string;
  location: string;
  client: string;
};

const ACTIVE_CASES: ActiveCase[] = [
  {
    caseId: "LWY-2026-00842",
    type: "Traffic Challan",
    priority: "HIGH",
    status: "IN PROGRESS",
    elapsed: "2 days",
    location: "MG Road · 3.2 km",
    client: "Rajesh Kumar",
  },
  {
    caseId: "LWY-2026-00843",
    type: "Accident Response",
    priority: "HIGH",
    status: "EN ROUTE",
    elapsed: "1 day",
    location: "Silk Board · 5.6 km",
    client: "Anita Verma",
  },
  {
    caseId: "LWY-2026-00844",
    type: "RTO Documentation",
    priority: "MEDIUM",
    status: "ARRIVED",
    elapsed: "5 days",
    location: "Koramangala · 1.2 km",
    client: "Manoj Iyer",
  },
  {
    caseId: "LWY-2026-00845",
    type: "Court Appearance",
    priority: "MEDIUM",
    status: "ACCEPTED",
    elapsed: "3 days",
    location: "City Civil Court · 7.4 km",
    client: "Fatima Sheikh",
  },
];

export const ACTIVE_COUNT = ACTIVE_CASES.length;
export const PAST_COUNT = PAST_CASES.length;

function ActivePanel({ query }: { query: string }) {
  const q = query.trim().toLowerCase();
  const filtered = ACTIVE_CASES.filter((c) =>
    !q
      ? true
      : c.caseId.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.client.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q) ||
        c.priority.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 t-body-sm text-neutral-400">
        No active cases match &ldquo;{query}&rdquo;
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((c) => (
        <ActiveCaseCard key={c.caseId} case={c} />
      ))}
    </div>
  );
}

function ActiveCaseCard({ case: c }: { case: ActiveCase }) {
  const priorityTone =
    c.priority === "HIGH"
      ? ("error" as const)
      : c.priority === "MEDIUM"
        ? ("warning" as const)
        : ("neutral" as const);

  return (
    <Link href="/incidents/active" className="block">
      <Card
        padding="none"
        className="overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="t-body-lg font-semibold text-neutral-800">
                {c.type}
              </div>
              <div className="t-caption font-mono text-neutral-500 mt-0.5">
                {c.caseId} · {c.elapsed}
              </div>
            </div>
            <Chip tone={priorityTone} size="sm">
              {c.priority}
            </Chip>
          </div>
          <div className="flex items-center justify-between gap-2 mt-3">
            <div className="flex items-center gap-2 t-body-sm text-neutral-600 min-w-0">
              <MapPin size={14} className="text-neutral-400 shrink-0" />
              <span className="truncate">{c.location}</span>
            </div>
            <ChevronRight size={16} className="text-primary-500 shrink-0" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function PastPanel({
  query,
  fromDate,
  toDate,
  onShowAll,
}: {
  query: string;
  fromDate: string;
  toDate: string;
  onShowAll: () => void;
}) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = fromDate ? new Date(fromDate + "T00:00:00") : null;
    const to = toDate ? new Date(toDate + "T23:59:59") : null;
    return PAST_CASES.filter((c) => {
      if (from && c.date < from) return false;
      if (to && c.date > to) return false;
      if (!q) return true;
      return (
        c.caseId.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.status.includes(q)
      );
    });
  }, [query, fromDate, toDate]);

  const showingAll = filtered.length === PAST_CASES.length;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 t-body-sm text-neutral-400">
        No past incidents match your filters
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card padding="none" className="overflow-hidden divide-y divide-[var(--border-subtle)]">
        {filtered.map((c) => (
          <RecentRow
            key={c.caseId}
            status={c.status}
            time={relativeTime(c.date)}
            caseId={c.caseId}
            type={c.type}
            amount={c.amount}
          />
        ))}
      </Card>

      {!showingAll && (
        <div className="text-center">
          <button
            type="button"
            onClick={onShowAll}
            className="t-body-sm font-semibold text-primary-600"
          >
            View full history →
          </button>
        </div>
      )}
    </div>
  );
}

function RecentRow({
  status,
  time,
  caseId,
  type,
  amount,
}: {
  status: Status;
  time: string;
  caseId: string;
  type: string;
  amount?: string;
}) {
  return (
    <Link
      href="/incidents/active"
      className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50/50"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {status === "completed" ? (
            <Chip tone="success" size="sm">
              ✓ Completed
            </Chip>
          ) : (
            <Chip tone="error" size="sm">
              ✕ Cancelled
            </Chip>
          )}
          <span className="t-caption text-neutral-400">· {time}</span>
        </div>
        <div className="t-body-sm font-mono text-neutral-500">{caseId}</div>
        <div className="t-body text-neutral-700 mt-0.5">{type}</div>
      </div>
      {amount && (
        <div className="t-body-lg font-semibold text-neutral-800 tabular shrink-0">
          {amount}
        </div>
      )}
      <ChevronRight size={16} className="text-neutral-300 shrink-0" />
    </Link>
  );
}

function DateRangeSheet({
  open,
  from,
  to,
  onApply,
  onClose,
}: {
  open: boolean;
  from: string;
  to: string;
  onApply: (from: string, to: string) => void;
  onClose: () => void;
}) {
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);

  const invalid = localFrom && localTo && localFrom > localTo;

  const setPreset = (days: number) => {
    const end = new Date(NOW);
    const start = new Date(NOW);
    start.setDate(start.getDate() - (days - 1));
    setLocalFrom(fmtISO(start));
    setLocalTo(fmtISO(end));
  };

  const apply = () => {
    if (invalid) return;
    onApply(localFrom, localTo);
  };

  const clear = () => {
    setLocalFrom("");
    setLocalTo("");
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex justify-center">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        <div className="px-4 pt-2 pb-2 flex items-start justify-between gap-3">
          <div>
            <div className="t-h3 font-bold text-neutral-800">Date range</div>
            <div className="t-caption text-neutral-500 mt-0.5">
              Show incidents between these dates
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 -mr-1 shrink-0 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <DateField
              label="From"
              value={localFrom}
              onChange={setLocalFrom}
              max={localTo || undefined}
            />
            <DateField
              label="To"
              value={localTo}
              onChange={setLocalTo}
              min={localFrom || undefined}
              max={fmtISO(NOW)}
            />
          </div>

          {invalid && (
            <div className="t-caption text-error font-medium">
              &ldquo;From&rdquo; must be on or before &ldquo;To&rdquo;
            </div>
          )}

          <div>
            <div className="t-caption font-semibold text-neutral-500 mb-2">
              Quick ranges
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Last 7 days", days: 7 },
                { label: "Last 14 days", days: 14 },
                { label: "Last 30 days", days: 30 },
                { label: "Last 90 days", days: 90 },
              ].map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => setPreset(p.days)}
                  className="px-3 h-8 rounded-full border border-[var(--border-default)] bg-white t-body-sm font-medium text-neutral-700 hover:border-primary-300 hover:text-primary-700 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 pt-2 pb-5 border-t border-[var(--border-subtle)] flex gap-2">
          <Button variant="secondary" size="lg" fullWidth onClick={clear}>
            Clear
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={apply}
            disabled={!!invalid}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="t-caption font-semibold text-neutral-500">{label}</span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full h-11 px-3 rounded-lg border border-[var(--border-default)] bg-white t-body text-neutral-800 focus:outline-none focus:border-primary-500 transition-colors"
      />
    </label>
  );
}
