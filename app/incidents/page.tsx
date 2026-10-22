"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Button, Card, Chip } from "@/components/ui";
import {
  Search,
  Check,
  ChevronRight,
  SlidersHorizontal,
  X,
  Inbox,
  CheckCircle2,
  MessageSquare,
  LayoutList,
  Package,
  Upload,
  Download,
  FileSpreadsheet,
  Table2,
  FileUp,
  FolderUp,
  FileText,
  Info,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActiveIncident,
  CATEGORY_LABELS,
  LeadCategory,
  useLeadsStore,
} from "@/lib/leads-store";
import { CompleteCaseSheet } from "@/components/CompleteCaseSheet";

type Tab = "active" | "past";
type Status = "completed" | "cancelled";
type FilterStatus = "breaching" | "breached";
type CategoryFilter = "all" | LeadCategory;
type ActiveView = "incidents" | "batches";
type PastView = "mine" | "all";

type PastCase = {
  caseId: string;
  type: string;
  amount?: string;
  status: Status;
  date: Date;
  category: LeadCategory;
  mine?: boolean;
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
  { caseId: "IRN-100838", type: "RTO Renewal", amount: "₹700", status: "completed", date: daysAgo(0, 9, 42), category: "rto", mine: true },
  { caseId: "IRN-100821", type: "Challan Mgmt", amount: "₹450", status: "completed", date: daysAgo(1, 18, 14), category: "challan", mine: true },
  { caseId: "IRN-100817", type: "Client no-show", status: "cancelled", date: daysAgo(2, 15, 0), category: "case", mine: true },
  { caseId: "IRN-100804", type: "Traffic Challan", amount: "₹850", status: "completed", date: daysAgo(3, 11, 20), category: "challan", mine: true },
  { caseId: "IRN-100792", type: "Vehicle Transfer", amount: "₹1,200", status: "completed", date: daysAgo(4, 16, 5), category: "rto" },
  { caseId: "IRN-100781", type: "RC Renewal", amount: "₹600", status: "completed", date: daysAgo(7, 10, 30), category: "rto", mine: true },
  { caseId: "IRN-100775", type: "Client cancelled", status: "cancelled", date: daysAgo(8, 13, 0), category: "case" },
  { caseId: "IRN-100768", type: "Accident Response", amount: "₹1,500", status: "completed", date: daysAgo(9, 20, 45), category: "case", mine: true },
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
  const [activeView, setActiveView] = useState<ActiveView>("incidents");
  const [pastView, setPastView] = useState<PastView>("mine");
  const [bulkSheetOpen, setBulkSheetOpen] = useState(false);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [tableSheetOpen, setTableSheetOpen] = useState(false);
  const [disposalsSheetOpen, setDisposalsSheetOpen] = useState(false);
  const { assigned, closed } = useLeadsStore();
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
          <StatTabCard
            label="Active Incidents"
            count={activeCount}
            image="/active-incident-3d.png"
            selected={tab === "active"}
            onClick={() => setTab("active")}
          />
          <StatTabCard
            label="Past Incidents"
            count={PAST_CASES.length}
            image="/past-incident-3d.png"
            selected={tab === "past"}
            onClick={() => setTab("past")}
          />
        </div>
      </div>

      <div className="sticky top-16 z-20 px-4 pt-3 pb-3 bg-[var(--surface-bg)] space-y-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 h-11 px-3 rounded-lg border border-[var(--border-default)] bg-white focus-within:border-primary-500 transition-colors min-w-0">
            <Search size={16} className="text-neutral-600 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "active" ? "Search active" : "Search past"}
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
        {tab === "active" && (
          <div className="mb-3 inline-flex bg-neutral-100 rounded-xl p-1 w-full">
            <ViewToggleButton
              active={activeView === "incidents"}
              onClick={() => setActiveView("incidents")}
              icon={LayoutList}
            >
              My Incidents
            </ViewToggleButton>
            <ViewToggleButton
              active={activeView === "batches"}
              onClick={() => setActiveView("batches")}
              icon={Package}
            >
              My Batches
            </ViewToggleButton>
          </div>
        )}
        {tab === "past" && (
          <div className="mb-3 inline-flex bg-neutral-100 rounded-xl p-1 w-full">
            <ViewToggleButton
              active={pastView === "mine"}
              onClick={() => setPastView("mine")}
              icon={LayoutList}
            >
              My Incidents
            </ViewToggleButton>
            <ViewToggleButton
              active={pastView === "all"}
              onClick={() => setPastView("all")}
              icon={Package}
            >
              My Batches
            </ViewToggleButton>
          </div>
        )}
        {tab === "active" ? (
          <ActivePanel
            query={query}
            cases={assigned}
            closed={closed}
            category={categoryFilter}
            view={activeView}
          />
        ) : (
          <PastPanel
            query={query}
            fromDate={fromDate}
            toDate={toDate}
            category={categoryFilter}
            view={pastView}
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

      <button
        type="button"
        onClick={() => setBulkSheetOpen(true)}
        aria-label="Bulk update incidents"
        className="absolute bottom-24 right-4 z-30 h-14 pl-4 pr-5 inline-flex items-center gap-2 rounded-full bg-primary-600 text-white shadow-e3 hover:bg-primary-700 active:scale-[0.98] transition-all"
      >
        <FileUp size={18} />
        <span className="t-body-sm font-semibold">Bulk update</span>
      </button>

      <BulkUpdateSheet
        open={bulkSheetOpen}
        onClose={() => setBulkSheetOpen(false)}
        onPickUpload={() => {
          setBulkSheetOpen(false);
          setUploadSheetOpen(true);
        }}
        onPickTable={() => {
          setBulkSheetOpen(false);
          setTableSheetOpen(true);
        }}
        onPickDisposals={() => {
          setBulkSheetOpen(false);
          setDisposalsSheetOpen(true);
        }}
      />

      <UploadBulkSheet
        open={uploadSheetOpen}
        onClose={() => setUploadSheetOpen(false)}
      />

      <UpdateInTableSheet
        open={tableSheetOpen}
        onClose={() => setTableSheetOpen(false)}
        incidents={assigned}
      />

      <UploadDisposalsSheet
        open={disposalsSheetOpen}
        onClose={() => setDisposalsSheetOpen(false)}
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
    { value: "breaching", label: "Breaching soon" },
    { value: "breached", label: "Breached" },
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
              Deadline
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

export const PAST_COUNT = PAST_CASES.length;

function ActivePanel({
  query,
  cases,
  closed,
  category,
  view,
}: {
  query: string;
  cases: ActiveIncident[];
  closed: ActiveIncident[];
  category: CategoryFilter;
  view: ActiveView;
}) {
  const [completeCase, setCompleteCase] = useState<ActiveIncident | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleSelect = (caseId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(caseId)) next.delete(caseId);
      else next.add(caseId);
      return next;
    });
  };
  const q = query.trim().toLowerCase();
  const filtered = cases.filter((c) => {
    if (category !== "all" && c.category !== category) return false;
    if (!q) return true;
    return (
      c.caseId.toLowerCase().includes(q) ||
      c.vehicle.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q) ||
      (c.batchId?.toLowerCase().includes(q) ?? false)
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
            Browse assignments
            <ChevronRight size={14} />
          </Link>
        )}
      </div>
    );
  }

  const allSelected =
    filtered.length > 0 && filtered.every((c) => selected.has(c.caseId));
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c.caseId)));
    }
  };

  return (
    <>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="t-caption text-neutral-500">
          {selected.size > 0
            ? `${selected.size} selected`
            : `${filtered.length} incident${filtered.length === 1 ? "" : "s"}`}
        </span>
        <button
          type="button"
          onClick={toggleSelectAll}
          className="t-caption font-semibold text-primary-600 hover:text-primary-700"
        >
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </div>
      {view === "batches" ? (
        <div className="space-y-3">
          {groupBatchesWithClosed(filtered, closed, category).map((g) => (
            <BatchCard
              key={g.batchId}
              batchId={g.batchId}
              openItems={g.openItems}
              closedItems={g.closedItems}
              onComplete={(c) => setCompleteCase(c)}
              selected={selected}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <ActiveCaseCard
              key={c.caseId}
              case={c}
              unreadChats={i === 0 ? 2 : 0}
              onComplete={() => setCompleteCase(c)}
              selected={selected.has(c.caseId)}
              onToggleSelect={() => toggleSelect(c.caseId)}
            />
          ))}
        </div>
      )}

      <CompleteCaseSheet
        open={completeCase !== null}
        onClose={() => setCompleteCase(null)}
        caseId={completeCase?.caseId}
        onSubmitted={() => setCompleteCase(null)}
      />
    </>
  );
}

function groupBatchesWithClosed(
  open: ActiveIncident[],
  closed: ActiveIncident[],
  category: CategoryFilter
): {
  batchId: string;
  openItems: ActiveIncident[];
  closedItems: ActiveIncident[];
}[] {
  const openMap = new Map<string, ActiveIncident[]>();
  for (const c of open) {
    const key = c.batchId ?? "UNBATCHED";
    const list = openMap.get(key);
    if (list) list.push(c);
    else openMap.set(key, [c]);
  }
  const closedMap = new Map<string, ActiveIncident[]>();
  for (const c of closed) {
    if (category !== "all" && c.category !== category) continue;
    const key = c.batchId ?? "UNBATCHED";
    const list = closedMap.get(key);
    if (list) list.push(c);
    else closedMap.set(key, [c]);
  }
  return Array.from(openMap.entries()).map(([batchId, items]) => ({
    batchId,
    openItems: items,
    closedItems: closedMap.get(batchId) ?? [],
  }));
}

function BatchCard({
  batchId,
  openItems,
  closedItems,
  onComplete,
  selected,
  onToggleSelect,
}: {
  batchId: string;
  openItems: ActiveIncident[];
  closedItems: ActiveIncident[];
  onComplete: (c: ActiveIncident) => void;
  selected: Set<string>;
  onToggleSelect: (caseId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl bg-white shadow-e1 border border-[var(--border-default)] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((o) => !o)}
        aria-expanded={expanded}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="t-body-lg font-semibold text-neutral-900 truncate min-w-0">
            {batchId === "UNBATCHED" ? "Unbatched" : batchId}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <CountTag label="In progress" count={openItems.length} tone="primary" />
            <CountTag label="Closed" count={closedItems.length} tone="neutral" />
            <ChevronRight
              size={18}
              className={`text-neutral-400 shrink-0 transition-transform ${
                expanded ? "rotate-90" : ""
              }`}
            />
          </div>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-[var(--border-subtle)] bg-neutral-50/40 p-3 space-y-2">
          {openItems.map((inc, i) => (
            <ActiveCaseCard
              key={inc.caseId}
              case={inc}
              unreadChats={i === 0 ? 2 : 0}
              onComplete={() => onComplete(inc)}
              selected={selected.has(inc.caseId)}
              onToggleSelect={() => onToggleSelect(inc.caseId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CountTag({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "primary" | "neutral";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary-50 text-primary-700 border-primary-100"
      : "bg-neutral-100 text-neutral-600 border-[var(--border-subtle)]";
  return (
    <span
      className={`inline-flex items-center gap-1 h-6 px-2 rounded-full border t-caption font-semibold ${toneClass}`}
    >
      {label}
      <span className="tabular">{count}</span>
    </span>
  );
}

function ViewToggleButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 h-10 rounded-lg t-body-sm font-semibold transition-all inline-flex items-center justify-center gap-1.5 ${
        active
          ? "bg-white text-neutral-800 shadow-e1"
          : "text-neutral-500 hover:text-neutral-700"
      }`}
    >
      <Icon size={14} />
      {children}
    </button>
  );
}

const SWIPE_ACTION_WIDTH = 96;
const SWIPE_AUTO_OPEN = 140;

function ActiveCaseCard({
  case: c,
  unreadChats = 0,
  onComplete,
  selected = false,
  onToggleSelect,
}: {
  case: ActiveIncident;
  unreadChats?: number;
  onComplete: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const deadlineTone = c.deadlineDays <= 7 ? "error" : "warning";
  const [dx, setDx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const baseRef = useRef(0);
  const axisRef = useRef<"none" | "x" | "y">("none");
  const containerRef = useRef<HTMLDivElement>(null);

  const settle = (open: boolean) => {
    setRevealed(open);
    setDx(open ? -SWIPE_ACTION_WIDTH : 0);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    draggingRef.current = true;
    axisRef.current = "none";
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    baseRef.current = revealed ? -SWIPE_ACTION_WIDTH : 0;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const rawX = e.clientX - startXRef.current;
    const rawY = e.clientY - startYRef.current;
    if (axisRef.current === "none") {
      if (Math.abs(rawX) < 6 && Math.abs(rawY) < 6) return;
      axisRef.current = Math.abs(rawX) > Math.abs(rawY) ? "x" : "y";
      if (axisRef.current === "x") {
        containerRef.current?.setPointerCapture(e.pointerId);
      }
    }
    if (axisRef.current !== "x") return;
    e.preventDefault();
    const next = Math.min(
      0,
      Math.max(-(SWIPE_ACTION_WIDTH + 60), baseRef.current + rawX)
    );
    setDx(next);
  };

  const finish = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (containerRef.current?.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
    if (axisRef.current !== "x") return;
    if (dx <= -SWIPE_AUTO_OPEN) {
      settle(false);
      onComplete();
      return;
    }
    if (dx <= -SWIPE_ACTION_WIDTH / 2) {
      settle(true);
    } else {
      settle(false);
    }
  };

  const handleActionClick = () => {
    settle(false);
    onComplete();
  };

  return (
    <div className="relative overflow-hidden rounded-md">
      <button
        type="button"
        onClick={handleActionClick}
        aria-label={`Mark ${c.caseId} complete`}
        className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-1 bg-success text-white t-caption font-semibold"
        style={{ width: SWIPE_ACTION_WIDTH }}
      >
        <CheckCircle2 size={20} />
        <span>Complete</span>
      </button>
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        style={{
          transform: `translateX(${dx}px)`,
          transition: draggingRef.current
            ? "none"
            : "transform 220ms cubic-bezier(0.2,0,0,1)",
          touchAction: "pan-y",
        }}
        className={`relative rounded-md bg-white shadow-e1 border p-4 select-none ${
          selected
            ? "border-primary-500 ring-2 ring-primary-100"
            : "border-[var(--border-default)]"
        }`}
      >
        <div className="flex items-start gap-3">
          {onToggleSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
              aria-pressed={selected}
              aria-label={selected ? "Deselect case" : "Select case"}
              className="shrink-0"
            >
              <CaseCheckbox checked={selected} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="t-body-lg font-semibold text-neutral-900 truncate">
                    {c.vehicle}
                  </div>
                  {unreadChats > 0 && (
                    <span
                      aria-label={`${unreadChats} unread chat messages`}
                      className="shrink-0 inline-flex items-center gap-1 h-5 px-1.5 rounded-full bg-error text-white t-micro font-semibold"
                    >
                      <MessageSquare size={10} />
                      {unreadChats}
                    </span>
                  )}
                </div>
                <div className="t-caption text-neutral-500 mt-0.5">
                  {c.caseId}
                </div>
              </div>
              <Chip tone={deadlineTone} size="sm" className="shrink-0">
                Deadline: {c.deadlineDays} DAYS
              </Chip>
            </div>
            <p className="t-body text-neutral-700 mt-2">{c.description}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
          <span className="t-caption text-neutral-400">
            Swipe left to complete
          </span>
          <Link
            href="/incidents/active"
            className="t-body-sm font-semibold text-primary-600 inline-flex items-center gap-0.5"
          >
            View <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function CaseCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 inline-flex w-5 h-5 rounded border-2 items-center justify-center transition-colors ${
        checked
          ? "bg-primary-600 border-primary-600 text-white"
          : "bg-white border-neutral-300"
      }`}
    >
      {checked && <Check size={14} strokeWidth={3} />}
    </span>
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

function StatTabCard({
  label,
  count,
  image,
  selected,
  onClick,
}: {
  label: string;
  count: number;
  image: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative text-left rounded-2xl p-4 pb-3 bg-white border overflow-hidden min-h-[132px] transition-all ${
        selected
          ? "border-primary-500 ring-2 ring-primary-200"
          : "border-[var(--border-default)] hover:border-primary-300"
      }`}
    >
      <div className="pr-10 t-body-lg font-semibold text-neutral-900 leading-tight">
        {label}
      </div>
      <div className="mt-2 t-display font-extrabold tabular text-primary-700 leading-none">
        {count}
      </div>
      <ChevronRight
        size={16}
        className={`absolute top-3 right-3 transition-colors ${
          selected
            ? "text-primary-600"
            : "text-neutral-400 group-hover:text-primary-600"
        }`}
      />
      <Image
        src={image}
        alt=""
        width={80}
        height={80}
        className="pointer-events-none absolute bottom-2 right-2 w-[72px] h-[72px] object-contain"
      />
    </button>
  );
}

function PastPanel({
  query,
  fromDate,
  toDate,
  category,
  view,
  onShowAll,
}: {
  query: string;
  fromDate: string;
  toDate: string;
  category: CategoryFilter;
  view: PastView;
  onShowAll: () => void;
}) {
  const source = useMemo(
    () => (view === "mine" ? PAST_CASES.filter((c) => c.mine) : PAST_CASES),
    [view]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = fromDate ? new Date(fromDate + "T00:00:00") : null;
    const to = toDate ? new Date(toDate + "T23:59:59") : null;
    return source.filter((c) => {
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
  }, [source, query, fromDate, toDate, category]);

  const showingAll = filtered.length === source.length;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 t-body-sm text-neutral-400">
        {view === "mine"
          ? "You don't have any past incidents matching these filters"
          : "No past incidents match your filters"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card
        padding="none"
        className="overflow-hidden divide-y divide-[var(--border-subtle)]"
      >
        {filtered.map((c) => (
          <RecentRow
            key={c.caseId}
            status={c.status}
            time={relativeTime(c.date)}
            caseId={c.caseId}
            amount={c.amount}
            type={c.type}
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
  amount,
  type,
}: {
  status: Status;
  time: string;
  caseId: string;
  amount?: string;
  type: string;
}) {
  const params = new URLSearchParams({ id: caseId, type });
  if (amount) params.set("amount", amount);
  const href =
    status === "completed"
      ? `/incidents/completed?${params.toString()}`
      : `/incidents/cancelled?${params.toString()}`;
  return (
    <Link
      href={href}
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

function SheetShell({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = "80vh",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

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
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-transform duration-300 ease-out flex flex-col ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight }}
      >
        <div className="pt-2 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>
        <div className="px-4 pt-2 pb-3 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="t-h3 font-bold text-neutral-800">{title}</div>
            {subtitle && (
              <div className="t-caption text-neutral-500 mt-0.5">{subtitle}</div>
            )}
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
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function BulkUpdateSheet({
  open,
  onClose,
  onPickUpload,
  onPickTable,
  onPickDisposals,
}: {
  open: boolean;
  onClose: () => void;
  onPickUpload: () => void;
  onPickTable: () => void;
  onPickDisposals: () => void;
}) {
  return (
    <SheetShell
      open={open}
      onClose={onClose}
      title="Bulk update"
      subtitle="Update multiple incidents in one go."
      maxHeight="auto"
    >
      <div className="px-4 pb-8 pt-2 space-y-3">
        <BulkOptionRow
          icon={FileSpreadsheet}
          title="Upload bulk update sheet"
          description="Download the template, fill it, then upload."
          onClick={onPickUpload}
        />
        <BulkOptionRow
          icon={Table2}
          title="Update in table"
          description="Edit professional, challan and government amounts inline."
          onClick={onPickTable}
        />
        <BulkOptionRow
          icon={FolderUp}
          title="Bulk upload disposals"
          description="Attach disposal files — name each file after its challan number."
          onClick={onPickDisposals}
        />
      </div>
    </SheetShell>
  );
}

function BulkOptionRow({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-5 rounded-2xl border border-[var(--border-default)] bg-white hover:border-primary-300 hover:bg-primary-50/40 transition-colors text-left"
    >
      <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="t-body-lg font-semibold text-neutral-800">{title}</div>
        <div className="t-body-sm text-neutral-500 mt-1">{description}</div>
      </div>
      <ChevronRight size={20} className="text-neutral-400 shrink-0" />
    </button>
  );
}

function UploadBulkSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) {
      setFileName(null);
      setUploading(false);
      setDone(false);
    }
  }, [open]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setUploading(true);
    window.setTimeout(() => {
      setUploading(false);
      setDone(true);
    }, 1200);
  };

  return (
    <SheetShell
      open={open}
      onClose={onClose}
      title="Upload bulk update sheet"
      subtitle="Fill the template with incident updates, then upload."
      maxHeight="auto"
    >
      {done ? (
        <div className="px-4 pb-6 pt-2 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-success-subtle text-success-bold flex items-center justify-center mb-3">
            <Check size={28} strokeWidth={3} />
          </div>
          <div className="t-body-lg font-semibold text-neutral-900">
            Upload complete
          </div>
          <div className="t-caption text-neutral-500 mt-1">
            {fileName} was processed successfully.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full h-12 rounded-xl bg-primary-600 text-white t-body font-semibold hover:bg-primary-700 active:scale-[0.99] transition-all"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="px-4 pb-8 pt-2 space-y-3">
          <div className="flex justify-end">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-primary-200 bg-primary-50/60 text-primary-700 t-caption font-semibold hover:bg-primary-50 transition-colors"
            >
              <Download size={14} />
              Download sample
            </a>
          </div>

          <label
            className={`relative w-full flex flex-col items-center justify-center gap-3 px-4 py-10 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50/60 hover:border-primary-400 hover:bg-primary-50/40 transition-colors text-center cursor-pointer ${
              uploading ? "opacity-70 pointer-events-none" : ""
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center">
              <Upload size={26} />
            </div>
            <div>
              <div className="t-body-lg font-semibold text-neutral-800">
                {fileName ?? "Upload bulk sheet"}
              </div>
              <div className="t-body-sm text-neutral-500 mt-1">
                {uploading
                  ? "Uploading…"
                  : fileName
                  ? "Tap below to choose a different file"
                  : "XLSX, XLS or CSV up to 5 MB"}
              </div>
            </div>
            <span className="inline-flex items-center h-11 px-5 rounded-xl bg-primary-600 text-white t-body-sm font-semibold hover:bg-primary-700">
              Choose file
            </span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              className="sr-only"
            />
          </label>
        </div>
      )}
    </SheetShell>
  );
}

function UploadDisposalsSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!open) {
      setFiles([]);
      setUploading(false);
      setDone(false);
      setIsDragging(false);
    }
  }, [open]);

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const next = Array.from(list);
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => f.name));
      return [...prev, ...next.filter((f) => !seen.has(f.name))];
    });
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    setUploading(true);
    window.setTimeout(() => {
      setUploading(false);
      setDone(true);
    }, 1200);
  };

  return (
    <SheetShell
      open={open}
      onClose={onClose}
      title="Bulk upload disposals"
      subtitle="Attach one disposal per challan."
      maxHeight="auto"
    >
      {done ? (
        <div className="px-4 pb-6 pt-2 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-success-subtle text-success-bold flex items-center justify-center mb-3">
            <Check size={28} strokeWidth={3} />
          </div>
          <div className="t-body-lg font-semibold text-neutral-900">
            Upload complete
          </div>
          <div className="t-caption text-neutral-500 mt-1">
            {files.length} {files.length === 1 ? "disposal" : "disposals"}{" "}
            uploaded successfully.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full h-12 rounded-xl bg-primary-600 text-white t-body font-semibold hover:bg-primary-700 active:scale-[0.99] transition-all"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="px-4 pb-8 pt-2 space-y-3">
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-primary-50/70 border border-primary-100 text-primary-800">
            <Info size={16} className="mt-0.5 shrink-0" />
            <div className="t-caption">
              Name each file after its challan number (e.g.{" "}
              <span className="font-semibold">CH-100846.pdf</span>) so it maps
              to the right incident.
            </div>
          </div>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`relative w-full flex flex-col items-center justify-center gap-3 px-4 py-10 rounded-2xl border-2 border-dashed transition-colors text-center cursor-pointer ${
              isDragging
                ? "border-primary-500 bg-primary-50/60"
                : "border-neutral-300 bg-neutral-50/60 hover:border-primary-400 hover:bg-primary-50/40"
            } ${uploading ? "opacity-70 pointer-events-none" : ""}`}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center">
              <FolderUp size={26} />
            </div>
            <div>
              <div className="t-body-lg font-semibold text-neutral-800">
                Drop files here
              </div>
              <div className="t-body-sm text-neutral-500 mt-1">
                PDF, JPG or PNG up to 10 MB each
              </div>
            </div>
            <span className="inline-flex items-center h-11 px-5 rounded-xl bg-primary-600 text-white t-body-sm font-semibold hover:bg-primary-700">
              Choose files
            </span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => addFiles(e.target.files)}
              className="sr-only"
            />
          </label>

          {files.length > 0 && (
            <div className="space-y-2">
              <div className="t-caption text-neutral-500 px-1">
                {files.length} selected
              </div>
              <div className="rounded-xl border border-[var(--border-default)] divide-y divide-neutral-100 overflow-hidden">
                {files.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center gap-3 px-3 py-2.5 bg-white"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="t-body-sm font-medium text-neutral-800 truncate">
                        {f.name}
                      </div>
                      <div className="t-caption text-neutral-500">
                        {(f.size / 1024).toFixed(0)} KB
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(f.name)}
                      aria-label={`Remove ${f.name}`}
                      className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="w-full h-12 rounded-xl bg-primary-600 text-white t-body font-semibold hover:bg-primary-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {uploading
              ? "Uploading…"
              : files.length === 0
              ? "Upload disposals"
              : `Upload ${files.length} ${files.length === 1 ? "file" : "files"}`}
          </button>
        </div>
      )}
    </SheetShell>
  );
}

type RowValues = {
  miscFees: string;
  challanAmount: string;
  professionalAmount: string;
  governmentAmount: string;
};

function UpdateInTableSheet({
  open,
  onClose,
  incidents,
}: {
  open: boolean;
  onClose: () => void;
  incidents: ActiveIncident[];
}) {
  const [rows, setRows] = useState<Record<string, RowValues>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) {
      setSaved(false);
      return;
    }
    const next: Record<string, RowValues> = {};
    for (const inc of incidents) {
      next[inc.caseId] = {
        miscFees: "",
        challanAmount: "",
        professionalAmount: "",
        governmentAmount: "",
      };
    }
    setRows(next);
  }, [open, incidents]);

  const updateCell = (
    caseId: string,
    key: keyof RowValues,
    value: string
  ) => {
    setRows((prev) => ({
      ...prev,
      [caseId]: { ...prev[caseId], [key]: value },
    }));
  };

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(onClose, 800);
  };

  return (
    <SheetShell
      open={open}
      onClose={onClose}
      title="Update in table"
      subtitle="Fill the amounts for each incident, then save."
      maxHeight="88vh"
    >
      <div className="px-4 pb-3">
        <div className="rounded-xl border border-[var(--border-default)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-neutral-50">
                <tr>
                  <Th>Challan number</Th>
                  <Th>Misc fees</Th>
                  <Th>Challan amount</Th>
                  <Th>Professional amount</Th>
                  <Th>Government amount</Th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => {
                  const row = rows[inc.caseId];
                  if (!row) return null;
                  return (
                    <tr
                      key={inc.caseId}
                      className="border-t border-[var(--border-subtle)]"
                    >
                      <td className="px-3 py-2 t-body-sm font-mono text-neutral-800 whitespace-nowrap bg-neutral-50/60">
                        {inc.vehicle}
                      </td>
                      <AmountCell
                        value={row.miscFees}
                        onChange={(v) =>
                          updateCell(inc.caseId, "miscFees", v)
                        }
                      />
                      <AmountCell
                        value={row.challanAmount}
                        onChange={(v) =>
                          updateCell(inc.caseId, "challanAmount", v)
                        }
                      />
                      <AmountCell
                        value={row.professionalAmount}
                        onChange={(v) =>
                          updateCell(inc.caseId, "professionalAmount", v)
                        }
                      />
                      <AmountCell
                        value={row.governmentAmount}
                        onChange={(v) =>
                          updateCell(inc.caseId, "governmentAmount", v)
                        }
                      />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="px-4 pb-5 pt-2 border-t border-[var(--border-subtle)] bg-white">
        <button
          type="button"
          onClick={handleSave}
          disabled={saved}
          className="w-full h-12 rounded-xl bg-primary-600 text-white t-body font-semibold hover:bg-primary-700 active:scale-[0.99] transition-all disabled:opacity-70"
        >
          {saved ? "Saved ✓" : "Save updates"}
        </button>
      </div>
    </SheetShell>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left t-caption font-semibold text-neutral-600 whitespace-nowrap">
      {children}
    </th>
  );
}

function AmountCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <td className="px-2 py-1.5">
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-28 h-9 px-2 rounded-md border border-[var(--border-default)] bg-white t-body-sm tabular text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500"
      />
    </td>
  );
}
