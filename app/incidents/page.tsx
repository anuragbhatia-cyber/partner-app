"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Button, Card, Chip } from "@/components/ui";
import {
  Search,
  ChevronRight,
  SlidersHorizontal,
  X,
  Inbox,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ActiveIncident,
  CATEGORY_LABELS,
  LeadCategory,
  useLeadsStore,
} from "@/lib/leads-store";

type Tab = "active" | "past";
type Status = "completed" | "cancelled";
type FilterStatus = "alloted" | "inprogress" | "assigned" | "completed";
type CategoryFilter = "all" | LeadCategory;

type PastCase = {
  caseId: string;
  type: string;
  amount?: string;
  status: Status;
  date: Date;
  category: LeadCategory;
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
  { caseId: "IRN-100838", type: "RTO Renewal", amount: "₹700", status: "completed", date: daysAgo(0, 9, 42), category: "rto" },
  { caseId: "IRN-100821", type: "Challan Mgmt", amount: "₹450", status: "completed", date: daysAgo(1, 18, 14), category: "challan" },
  { caseId: "IRN-100817", type: "Client no-show", status: "cancelled", date: daysAgo(2, 15, 0), category: "case" },
  { caseId: "IRN-100804", type: "Traffic Challan", amount: "₹850", status: "completed", date: daysAgo(3, 11, 20), category: "challan" },
  { caseId: "IRN-100792", type: "Vehicle Transfer", amount: "₹1,200", status: "completed", date: daysAgo(4, 16, 5), category: "rto" },
  { caseId: "IRN-100781", type: "RC Renewal", amount: "₹600", status: "completed", date: daysAgo(7, 10, 30), category: "rto" },
  { caseId: "IRN-100775", type: "Client cancelled", status: "cancelled", date: daysAgo(8, 13, 0), category: "case" },
  { caseId: "IRN-100768", type: "Accident Response", amount: "₹1,500", status: "completed", date: daysAgo(9, 20, 45), category: "case" },
  { caseId: "IRN-100759", type: "Challan Mgmt", amount: "₹450", status: "completed", date: daysAgo(11, 12, 10), category: "challan" },
  { caseId: "IRN-100744", type: "Court Appearance", amount: "₹2,000", status: "completed", date: daysAgo(14, 11, 0), category: "case" },
];

const fmtISO = (d: Date) => d.toISOString().slice(0, 10);
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
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<FilterStatus[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const { assigned } = useLeadsStore();
  const activeCount = assigned.length;

  const activeFilterCount =
    statusFilters.length + (fromDate || toDate ? 1 : 0);

  const categoryCounts = useMemo(() => {
    const source: { category?: LeadCategory }[] =
      tab === "active" ? assigned : PAST_CASES;
    const counts: Record<CategoryFilter, number> = {
      all: source.length,
      case: 0,
      challan: 0,
      rto: 0,
    };
    for (const item of source) {
      if (item.category) counts[item.category] += 1;
    }
    return counts;
  }, [tab, assigned]);

  return (
    <PhoneFrame label="Incidents · List">
      <AppBar title="Incidents" />

      <div className="px-4 pt-5 pb-3 bg-[var(--surface-bg)]">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative rounded-2xl p-4 pb-3 bg-white border border-[var(--border-default)] shadow-e1 overflow-hidden min-h-[132px]">
            <div className="pr-10 t-body-lg font-semibold text-neutral-900 leading-tight">
              Active Incidents
            </div>
            <div className="mt-2 t-display font-extrabold tabular text-primary-700 leading-none">
              {activeCount}
            </div>
            <Image
              src="/active-incident-3d.png"
              alt=""
              width={80}
              height={80}
              className="pointer-events-none absolute bottom-2 right-2 w-[72px] h-[72px] object-contain"
            />
          </div>
          <div className="relative rounded-2xl p-4 pb-3 bg-white border border-[var(--border-default)] shadow-e1 overflow-hidden min-h-[132px]">
            <div className="pr-10 t-body-lg font-semibold text-neutral-900 leading-tight">
              Past Incidents
            </div>
            <div className="mt-2 t-display font-extrabold tabular text-primary-700 leading-none">
              {PAST_CASES.length}
            </div>
            <Image
              src="/past-incident-3d.png"
              alt=""
              width={80}
              height={80}
              className="pointer-events-none absolute bottom-2 right-2 w-[72px] h-[72px] object-contain"
            />
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-20 px-4 pt-3 pb-3 bg-[var(--surface-bg)] space-y-3 border-b border-[var(--border-subtle)]">
        <div className="flex bg-neutral-100 rounded-xl p-1">
          <TabButton active={tab === "active"} onClick={() => setTab("active")}>
            Active
            <span
              className={`ml-1.5 min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full t-caption font-semibold tabular ${
                tab === "active"
                  ? "bg-primary-50 text-primary-700"
                  : "bg-neutral-200 text-neutral-600"
              }`}
            >
              {activeCount}
            </span>
          </TabButton>
          <TabButton active={tab === "past"} onClick={() => setTab("past")}>
            Past incidents
          </TabButton>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 h-11 px-3 rounded-lg border border-[var(--border-default)] bg-white focus-within:border-primary-500 transition-colors min-w-0">
            <Search size={16} className="text-neutral-600 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                tab === "active"
                  ? "Search active"
                  : "Search past"
              }
              className="flex-1 min-w-0 t-body text-neutral-800 bg-transparent focus:outline-none focus-visible:outline-none placeholder:text-neutral-500"
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
            onClick={() => setFilterSheetOpen(true)}
            aria-label="Filters"
            className="relative shrink-0 w-11 h-11 inline-flex items-center justify-center rounded-lg border border-[var(--border-default)] bg-white hover:border-primary-300 transition-colors"
          >
            <SlidersHorizontal size={16} className="text-neutral-600" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary-600 text-white t-micro font-semibold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
          {(["all", "case", "challan", "rto"] as CategoryFilter[]).map((f) => (
            <CategoryPill
              key={f}
              label={f === "all" ? "All" : CATEGORY_LABELS[f]}
              active={categoryFilter === f}
              count={categoryCounts[f]}
              onClick={() => setCategoryFilter(f)}
            />
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-24">
        {tab === "active" ? (
          <ActivePanel
            query={query}
            cases={assigned}
            category={categoryFilter}
          />
        ) : (
          <PastPanel
            query={query}
            fromDate={fromDate}
            toDate={toDate}
            category={categoryFilter}
            onShowAll={() => {
              setFromDate("");
              setToDate("");
            }}
          />
        )}
      </div>

      <BottomTabBar active="incidents" />

      <FilterSheet
        open={filterSheetOpen}
        selected={statusFilters}
        from={fromDate}
        to={toDate}
        onApply={(s, f, t) => {
          setStatusFilters(s);
          setFromDate(f);
          setToDate(t);
          setFilterSheetOpen(false);
        }}
        onClose={() => setFilterSheetOpen(false)}
      />
    </PhoneFrame>
  );
}

function FilterSheet({
  open,
  selected,
  from,
  to,
  onApply,
  onClose,
}: {
  open: boolean;
  selected: FilterStatus[];
  from: string;
  to: string;
  onApply: (s: FilterStatus[], from: string, to: string) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<FilterStatus[]>(selected);
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);
  const invalid = localFrom && localTo && localFrom > localTo;

  const toggle = (s: FilterStatus) => {
    setLocal((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const setPreset = (days: number) => {
    const end = new Date(NOW);
    const start = new Date(NOW);
    start.setDate(start.getDate() - (days - 1));
    setLocalFrom(fmtISO(start));
    setLocalTo(fmtISO(end));
  };

  const clearAll = () => {
    setLocal([]);
    setLocalFrom("");
    setLocalTo("");
  };

  const options: { value: FilterStatus; label: string }[] = [
    { value: "alloted", label: "Alloted" },
    { value: "inprogress", label: "In Progress" },
    { value: "assigned", label: "Assigned" },
    { value: "completed", label: "Completed" },
  ];

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

        <div className="px-4 pt-2 pb-2 flex items-center justify-between gap-3">
          <div className="t-h3 font-bold text-neutral-800">Filters</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 -mr-1 shrink-0 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
          <div>
            <div className="t-caption font-semibold text-neutral-500 mb-2">
              Status
            </div>
            <div className="flex flex-wrap gap-2">
              {options.map((o) => {
                const active = local.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggle(o.value)}
                    className={`px-3 h-8 rounded-full border t-body-sm font-medium transition-colors ${
                      active
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-[var(--border-default)] bg-white text-neutral-700 hover:border-primary-300"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="t-caption font-semibold text-neutral-500 mb-2">
              Date range
            </div>
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
              <div className="t-caption text-error font-medium mt-2">
                &ldquo;From&rdquo; must be on or before &ldquo;To&rdquo;
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: "Last 7 days", days: 7 },
                { label: "Last 14 days", days: 14 },
                { label: "Last 30 days", days: 30 },
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
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={clearAll}
          >
            Clear
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!!invalid}
            onClick={() => onApply(local, localFrom, localTo)}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

function CategoryPill({
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

export const PAST_COUNT = PAST_CASES.length;

function ActivePanel({
  query,
  cases,
  category,
}: {
  query: string;
  cases: ActiveIncident[];
  category: CategoryFilter;
}) {
  const q = query.trim().toLowerCase();
  const filtered = cases.filter((c) => {
    if (category !== "all" && c.category !== category) return false;
    if (!q) return true;
    return (
      c.caseId.toLowerCase().includes(q) ||
      c.vehicle.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) {
    const noneAtAll = cases.length === 0;
    const hasQuery = q.length > 0;
    const hasCategory = category !== "all";

    let title: string;
    let subtitle: string;
    if (noneAtAll) {
      title = "No active cases";
      subtitle = "You're all caught up. New assignments will land here.";
    } else if (hasQuery) {
      title = `No matches for "${query}"`;
      subtitle = "Try a different case ID, vehicle, or status.";
    } else if (hasCategory) {
      title = `No active ${CATEGORY_LABELS[category as LeadCategory]} cases`;
      subtitle = "Try another category or clear the filter.";
    } else {
      title = "No active cases";
      subtitle = "You're all caught up.";
    }

    return (
      <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-white/60 px-5 py-10 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-primary-50 text-primary-700 flex items-center justify-center mb-3">
          <Inbox size={22} />
        </div>
        <h3 className="t-body-lg font-semibold text-neutral-800">{title}</h3>
        <p className="t-body-sm text-neutral-500 mt-1 max-w-[260px] mx-auto">
          {subtitle}
        </p>
        {noneAtAll && (
          <Link
            href="/leads"
            className="inline-flex items-center gap-1 mt-4 h-9 px-3.5 rounded-full bg-primary-600 text-white t-body-sm font-semibold hover:bg-primary-700"
          >
            Browse leads
            <ChevronRight size={14} />
          </Link>
        )}
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

function ActiveCaseCard({ case: c }: { case: ActiveIncident }) {
  const deadlineTone = c.deadlineDays <= 7 ? "error" : "warning";

  return (
    <div className="rounded-xl bg-white shadow-e1 border border-[var(--border-default)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="t-body-lg font-semibold text-neutral-900 truncate">
            {c.vehicle}
          </div>
          <div className="t-caption text-neutral-500 mt-0.5">{c.caseId}</div>
        </div>
        <Chip tone={deadlineTone} size="sm" className="shrink-0">
          Deadline: {c.deadlineDays} DAYS
        </Chip>
      </div>
      <p className="t-body text-neutral-700 mt-2">{c.description}</p>
      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex justify-end">
        <Link
          href="/incidents/active"
          className="t-body-sm font-semibold text-primary-600 inline-flex items-center gap-0.5"
        >
          View <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function PastPanel({
  query,
  fromDate,
  toDate,
  category,
  onShowAll,
}: {
  query: string;
  fromDate: string;
  toDate: string;
  category: CategoryFilter;
  onShowAll: () => void;
}) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = fromDate ? new Date(fromDate + "T00:00:00") : null;
    const to = toDate ? new Date(toDate + "T23:59:59") : null;
    return PAST_CASES.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (from && c.date < from) return false;
      if (to && c.date > to) return false;
      if (!q) return true;
      return (
        c.caseId.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.status.includes(q)
      );
    });
  }, [query, fromDate, toDate, category]);

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
            View full history
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
}: {
  status: Status;
  time: string;
  caseId: string;
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
      </div>
      <ChevronRight size={16} className="text-neutral-300 shrink-0" />
    </Link>
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
