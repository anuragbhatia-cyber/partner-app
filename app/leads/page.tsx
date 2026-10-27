"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Chip } from "@/components/ui";
import {
  Check,
  CheckCircle2,
  Clock,
  Inbox,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  XCircle,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArchivedLead,
  assignLead,
  CATEGORY_LABELS,
  CATEGORY_TONE,
  Lead,
  LeadCategory,
  LeadItem,
  skipLead,
  useLeadsStore,
} from "@/lib/leads-store";

type View = "batch" | "single";
type Status = "open" | "completed" | "rejected";
type CategoryFilter = "all" | LeadCategory;
const LOCATION_ALL = "__all__";

type SingleEntry = {
  key: string;
  batchId: string;
  category: LeadCategory;
  itemLabel: string;
  tat: string;
  postedMinAgo: number;
  item: LeadItem;
};

function leadMatchesQuery(lead: Lead, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase().trim();
  if (!needle) return true;
  if (lead.id.toLowerCase().includes(needle)) return true;
  if (lead.type.toLowerCase().includes(needle)) return true;
  if (lead.location.toLowerCase().includes(needle)) return true;
  return lead.items.some(
    (i) =>
      i.incidentId.toLowerCase().includes(needle) ||
      i.vehicleNumber.toLowerCase().includes(needle) ||
      i.challanNumber.toLowerCase().includes(needle) ||
      i.state.toLowerCase().includes(needle)
  );
}

function fmtTime(min: number) {
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function fmtRelative(ms: number) {
  const diff = Date.now() - ms;
  const minutes = Math.max(0, Math.floor(diff / 60000));
  return fmtTime(minutes);
}

function flattenSingles(leads: Lead[]): SingleEntry[] {
  const list: SingleEntry[] = [];
  leads.forEach((lead) => {
    lead.items.forEach((item, idx) => {
      list.push({
        key: `${lead.id}-${idx}`,
        batchId: lead.id,
        category: lead.category,
        itemLabel: lead.itemLabel.replace(/s$/, "").replace("'s", ""),
        tat: item.tatDeadline,
        postedMinAgo: lead.postedMinAgo,
        item,
      });
    });
  });
  return list;
}

export default function LeadsPage() {
  const { leads, rejected, completed } = useLeadsStore();
  const [view, setView] = useState<View>("batch");
  const [status, setStatus] = useState<Status>("open");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [locationFilter, setLocationFilter] = useState<string>(LOCATION_ALL);
  const [filterOpen, setFilterOpen] = useState(false);
  const toast = useToast();

  const sourceLeads: Lead[] = useMemo(() => {
    if (status === "open") return leads;
    if (status === "completed") return completed;
    return rejected;
  }, [status, leads, completed, rejected]);

  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    [...leads, ...completed, ...rejected].forEach((l) => set.add(l.location));
    return Array.from(set).sort();
  }, [leads, completed, rejected]);

  const activeFilterCount =
    (categoryFilter !== "all" ? 1 : 0) +
    (locationFilter !== LOCATION_ALL ? 1 : 0);

  const filteredLeads = useMemo(
    () =>
      sourceLeads.filter((l) => {
        if (!leadMatchesQuery(l, query)) return false;
        if (categoryFilter !== "all" && l.category !== categoryFilter)
          return false;
        if (locationFilter !== LOCATION_ALL && l.location !== locationFilter)
          return false;
        return true;
      }),
    [sourceLeads, query, categoryFilter, locationFilter]
  );

  const singles = useMemo(() => {
    const flat = flattenSingles(filteredLeads);
    return flat;
  }, [filteredLeads]);

  const handleAssign = (lead: Lead) => {
    assignLead(lead.id);
    toast.show(`${lead.type} assigned to you`);
  };

  const handleReject = (lead: Lead) => {
    skipLead(lead.id);
    toast.show(`${lead.id} rejected`);
  };

  const openBatchCount = leads.length;
  const totalItemsInView = useMemo(
    () => filteredLeads.reduce((sum, l) => sum + l.items.length, 0),
    [filteredLeads]
  );

  return (
    <PhoneFrame label="Assignments">
      <AppBar
        title="Assignments"
        action={
          <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-success-subtle">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="t-micro font-bold uppercase tracking-wider text-success-bold">
              Live
            </span>
          </span>
        }
      />

      <div className="px-4 pt-4 pb-3 space-y-3">
        <ViewToggle view={view} onChange={setView} />

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label={view === "batch" ? "Batches" : "Single items"}
            value={view === "batch" ? filteredLeads.length : singles.length}
          />
          <StatCard
            label={
              status === "open"
                ? "Open to assign"
                : status === "completed"
                ? "Completed"
                : "Rejected"
            }
            value={status === "open" ? openBatchCount : view === "batch" ? filteredLeads.length : totalItemsInView}
          />
        </div>
      </div>

      <div className="sticky top-16 z-20 bg-[var(--surface-bg)]">
        <div className="px-4 pt-3 flex items-center gap-2">
          <div className="flex-1">
            <SearchInput value={query} onChange={setQuery} />
          </div>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            aria-label="Filter"
            className={`relative shrink-0 h-10 w-10 rounded-full flex items-center justify-center border transition-colors ${
              activeFilterCount > 0
                ? "bg-primary-600 border-primary-600 text-white"
                : "bg-white border-[var(--border-default)] text-neutral-700 hover:border-primary-300"
            }`}
          >
            <SlidersHorizontal size={16} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-500 text-primary-900 t-micro font-bold flex items-center justify-center ring-2 ring-[var(--surface-bg)]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        <div className="px-4 pt-3">
          <StatusTabs
            status={status}
            onChange={setStatus}
            counts={{
              open: leads.length,
              completed: completed.length,
              rejected: rejected.length,
            }}
          />
        </div>
      </div>

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        category={categoryFilter}
        onCategoryChange={setCategoryFilter}
        location={locationFilter}
        onLocationChange={setLocationFilter}
        locations={availableLocations}
        onClearAll={() => {
          setCategoryFilter("all");
          setLocationFilter(LOCATION_ALL);
        }}
      />

      <div className="px-4 pt-3 pb-24 space-y-3">
        {view === "batch" ? (
          filteredLeads.length === 0 ? (
            <EmptyState
              status={status}
              query={query}
              hasFilters={activeFilterCount > 0}
              onClearSearch={() => setQuery("")}
              onClearFilters={() => {
                setCategoryFilter("all");
                setLocationFilter(LOCATION_ALL);
              }}
            />
          ) : status === "open" ? (
            filteredLeads.map((lead) => (
              <OpenBatchCard
                key={lead.id}
                lead={lead}
                onAssign={() => handleAssign(lead)}
                onReject={() => handleReject(lead)}
              />
            ))
          ) : (
            (filteredLeads as ArchivedLead[]).map((lead) => (
              <ArchivedBatchCard key={lead.id} lead={lead} status={status} />
            ))
          )
        ) : singles.length === 0 ? (
          <EmptyState
            status={status}
            query={query}
            hasFilters={activeFilterCount > 0}
            onClearSearch={() => setQuery("")}
            onClearFilters={() => {
              setCategoryFilter("all");
              setLocationFilter(LOCATION_ALL);
            }}
            singles
          />
        ) : (
          singles.map((entry) => (
            <SingleCard key={entry.key} entry={entry} status={status} />
          ))
        )}
      </div>

      <BottomTabBar active="requests" />
    </PhoneFrame>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white border border-[var(--border-default)] shadow-e1 px-3 py-3">
      <div className="t-body-sm font-semibold text-neutral-700">{label}</div>
      <div className="t-h1 font-bold tabular text-primary-600 mt-0.5">{value}</div>
    </div>
  );
}

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div
      role="tablist"
      aria-label="View type"
      className="relative grid grid-cols-2 bg-neutral-100 rounded-full p-1 border border-[var(--border-subtle)]"
    >
      <span
        aria-hidden
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white shadow-e1 transition-transform duration-200 ${
          view === "batch" ? "translate-x-1" : "translate-x-[calc(100%+3px)]"
        }`}
      />
      {(["batch", "single"] as View[]).map((v) => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={view === v}
          onClick={() => onChange(v)}
          className={`relative z-10 h-9 rounded-full t-body-sm font-semibold transition-colors ${
            view === v ? "text-primary-700" : "text-neutral-600"
          }`}
        >
          {v === "batch" ? "Batch" : "Single"}
        </button>
      ))}
    </div>
  );
}

function StatusTabs({
  status,
  onChange,
  counts,
}: {
  status: Status;
  onChange: (s: Status) => void;
  counts: Record<Status, number>;
}) {
  const items: { key: Status; label: string }[] = [
    { key: "open", label: "Open" },
    { key: "completed", label: "Completed" },
    { key: "rejected", label: "Rejected" },
  ];
  return (
    <div role="tablist" className="flex gap-5 border-b border-[var(--border-subtle)]">
      {items.map((it) => {
        const active = status === it.key;
        return (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.key)}
            className={`relative pb-2 inline-flex items-center gap-1.5 t-body-sm font-semibold transition-colors ${
              active ? "text-primary-700" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <span>{it.label}</span>
            <span
              className={`min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full t-caption font-semibold tabular ${
                active ? "bg-primary-50 text-primary-700" : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {counts[it.key]}
            </span>
            {active && (
              <span className="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
        <Search size={16} />
      </span>
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search batch, vehicle, incident…"
        className="w-full h-10 pl-9 pr-9 rounded-full bg-white border border-[var(--border-default)] t-body-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute inset-y-0 right-2 my-auto h-6 w-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function OpenBatchCard({
  lead,
  onAssign,
  onReject,
}: {
  lead: Lead;
  onAssign: () => void;
  onReject: () => void;
}) {
  return (
    <div className="rounded-xl bg-white shadow-e1 border border-[var(--border-default)] overflow-hidden transition-shadow hover:shadow-e2">
      <Link
        href={`/leads/${encodeURIComponent(lead.id)}`}
        className="block p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-t-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="t-body-lg font-semibold text-neutral-900">{lead.id}</div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Chip tone={CATEGORY_TONE[lead.category]} size="sm">
              {CATEGORY_LABELS[lead.category]}
            </Chip>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <div className="t-caption text-neutral-500">
              Number of {lead.itemLabel.toLowerCase()}
            </div>
            <div className="mt-0.5 t-h2 font-extrabold tabular text-neutral-800 leading-none">
              {lead.items.length}
            </div>
          </div>
          <div>
            <div className="t-caption text-neutral-500">Accept by</div>
            <div className="mt-0.5 t-h3 font-bold text-neutral-800 leading-none">
              {lead.items[0]?.tatDeadline ?? "—"}
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pt-3 pb-4 border-t border-[var(--border-subtle)] flex flex-col gap-3">
        <div className="inline-flex items-center gap-1 t-caption text-neutral-500">
          <Clock size={12} />
          {fmtTime(lead.postedMinAgo)}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReject}
            className="h-11 px-5 rounded-full border border-[var(--border-default)] bg-white t-body-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={onAssign}
            className="flex-1 h-11 rounded-full bg-primary-600 text-white t-body-sm font-semibold hover:bg-primary-700 active:scale-[0.99] transition-all"
          >
            Click to accept
          </button>
        </div>
      </div>
    </div>
  );
}

function ArchivedBatchCard({
  lead,
  status,
}: {
  lead: ArchivedLead;
  status: Exclude<Status, "open">;
}) {
  const isCompleted = status === "completed";
  return (
    <Link
      href={`/leads/${encodeURIComponent(lead.id)}?status=${status}`}
      className="block rounded-xl bg-white shadow-e1 border border-[var(--border-default)] overflow-hidden transition-shadow hover:shadow-e2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="t-body-lg font-semibold text-neutral-900">{lead.id}</div>
          </div>
          <Chip tone={CATEGORY_TONE[lead.category]} size="sm">
            {CATEGORY_LABELS[lead.category]}
          </Chip>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <div className="t-caption text-neutral-500">
              Number of {lead.itemLabel.toLowerCase()}
            </div>
            <div className="mt-0.5 t-h2 font-extrabold tabular text-neutral-800 leading-none">
              {lead.items.length}
            </div>
          </div>
          <div>
            <div className="t-caption text-neutral-500">
              {isCompleted ? "Completed on" : "Rejected on"}
            </div>
            <div className="mt-0.5 t-h3 font-bold text-neutral-800 leading-none">
              {new Date(lead.archivedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 pt-3 pb-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <div
          className={`inline-flex items-center gap-1.5 t-caption font-semibold ${
            isCompleted ? "text-success-bold" : "text-neutral-500"
          }`}
        >
          {isCompleted ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {isCompleted ? "Closed" : "Rejected"} · {fmtRelative(lead.archivedAt)}
        </div>
      </div>
    </Link>
  );
}

function SingleCard({ entry, status }: { entry: SingleEntry; status: Status }) {
  const isOpen = status === "open";
  return (
    <div className="rounded-xl bg-white shadow-e1 border border-[var(--border-default)] overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="t-body-lg font-semibold text-neutral-900 truncate">
              {entry.item.incidentId}
            </div>
            <div className="t-caption text-neutral-500 mt-0.5">
              {entry.batchId} · {entry.item.vehicleNumber}
            </div>
          </div>
          <Chip tone={CATEGORY_TONE[entry.category]} size="sm">
            {CATEGORY_LABELS[entry.category]}
          </Chip>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <div className="t-caption text-neutral-500">State</div>
            <div className="mt-0.5 t-body font-semibold text-neutral-800 leading-tight">
              {entry.item.state}
            </div>
          </div>
          <div>
            <div className="t-caption text-neutral-500">
              {isOpen ? "Accept by" : status === "completed" ? "Closed on" : "Rejected on"}
            </div>
            <div className="mt-0.5 t-body font-semibold text-neutral-800 leading-tight">
              {entry.item.tatDeadline}
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 pt-3 pb-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <div className="inline-flex items-center gap-1 t-caption text-neutral-500">
          <Clock size={12} />
          {fmtTime(entry.postedMinAgo)}
        </div>
        <Link
          href={
            isOpen
              ? `/leads/${encodeURIComponent(entry.batchId)}`
              : `/leads/${encodeURIComponent(entry.batchId)}?status=${status}`
          }
          className="h-9 px-4 inline-flex items-center rounded-full bg-primary-600 text-white t-body-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          View batch
        </Link>
      </div>
    </div>
  );
}

function EmptyState({
  status,
  query,
  hasFilters,
  onClearSearch,
  onClearFilters,
  singles,
}: {
  status: Status;
  query: string;
  hasFilters: boolean;
  onClearSearch: () => void;
  onClearFilters: () => void;
  singles?: boolean;
}) {
  const hasQuery = query.trim().length > 0;
  const unit = singles ? "items" : "batches";

  let title: string;
  let subtitle: string;
  if (hasQuery) {
    title = `No ${unit} match "${query.trim()}"`;
    subtitle = "Try a different batch ID, vehicle, or incident.";
  } else if (hasFilters) {
    title = `No ${unit} match your filters`;
    subtitle = "Try changing or clearing the filters.";
  } else if (status === "completed") {
    title = `No completed ${unit} yet`;
    subtitle = "Finished work shows up here.";
  } else if (status === "rejected") {
    title = `No rejected ${unit}`;
    subtitle = "Anything you reject will land here.";
  } else {
    title = "You're all caught up";
    subtitle = "New assignments land here in real time.";
  }

  return (
    <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-white/60 px-5 py-10 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-primary-50 text-primary-700 flex items-center justify-center mb-3">
        <Inbox size={22} />
      </div>
      <h3 className="t-body-lg font-semibold text-neutral-800">{title}</h3>
      <p className="t-body-sm text-neutral-500 mt-1 max-w-[260px] mx-auto">{subtitle}</p>
      <div className="mt-4 flex items-center justify-center gap-2">
        {hasQuery && (
          <button
            type="button"
            onClick={onClearSearch}
            className="h-9 px-3.5 rounded-full border border-[var(--border-default)] text-neutral-700 t-body-sm font-semibold hover:border-primary-300"
          >
            Clear search
          </button>
        )}
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="h-9 px-3.5 rounded-full border border-[var(--border-default)] text-neutral-700 t-body-sm font-semibold hover:border-primary-300"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function FilterSheet({
  open,
  onClose,
  category,
  onCategoryChange,
  location,
  onLocationChange,
  locations,
  onClearAll,
}: {
  open: boolean;
  onClose: () => void;
  category: CategoryFilter;
  onCategoryChange: (c: CategoryFilter) => void;
  location: string;
  onLocationChange: (l: string) => void;
  locations: string[];
  onClearAll: () => void;
}) {
  const [locQuery, setLocQuery] = useState("");
  const categoryOptions: { key: CategoryFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "case", label: "Cases" },
    { key: "challan", label: "Challans" },
    { key: "rto", label: "RTO" },
  ];
  const matchedLocations = useMemo(() => {
    const q = locQuery.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((l) => l.toLowerCase().includes(q));
  }, [locations, locQuery]);
  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none"
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-label="Filters"
        className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl pointer-events-auto transition-transform duration-200 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex items-center justify-center">
          <span className="w-10 h-1 rounded-full bg-neutral-300" />
        </div>
        <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b border-[var(--border-subtle)]">
          <h3 className="t-h3 font-bold text-neutral-900">Filters</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pt-4 pb-2 max-h-[55vh] overflow-y-auto no-scrollbar">
          <div>
            <div className="t-caption font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Type
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((opt) => {
                const active = category === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => onCategoryChange(opt.key)}
                    className={`h-9 px-3.5 rounded-full border t-body-sm font-semibold transition-colors ${
                      active
                        ? "bg-primary-600 border-primary-600 text-white"
                        : "bg-white border-[var(--border-default)] text-neutral-700 hover:border-primary-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <div className="t-caption font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Location
            </div>

            <div className="relative mb-2">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <Search size={14} />
              </span>
              <input
                type="search"
                value={locQuery}
                onChange={(e) => setLocQuery(e.target.value)}
                placeholder="Search location…"
                className="w-full h-10 pl-9 pr-9 rounded-full bg-white border border-[var(--border-default)] t-body-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors"
              />
              {locQuery && (
                <button
                  type="button"
                  onClick={() => setLocQuery("")}
                  aria-label="Clear"
                  className="absolute inset-y-0 right-2 my-auto h-6 w-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="rounded-xl border border-[var(--border-default)] bg-white overflow-hidden max-h-64 overflow-y-auto">
              <LocationRow
                label="All locations"
                selected={location === LOCATION_ALL}
                onSelect={() => onLocationChange(LOCATION_ALL)}
              />
              {matchedLocations.length === 0 ? (
                <div className="px-4 py-5 text-center t-caption text-neutral-500 border-t border-[var(--border-subtle)]">
                  No locations match &ldquo;{locQuery.trim()}&rdquo;
                </div>
              ) : (
                matchedLocations.map((loc) => (
                  <LocationRow
                    key={loc}
                    icon={<MapPin size={13} />}
                    label={loc}
                    selected={location === loc}
                    onSelect={() => onLocationChange(loc)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="px-5 pt-3 pb-4 border-t border-[var(--border-subtle)] flex items-center gap-2">
          <button
            type="button"
            onClick={onClearAll}
            className="h-11 px-4 rounded-full border border-[var(--border-default)] bg-white t-body-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-full bg-primary-600 text-white t-body-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}

function LocationRow({
  icon,
  label,
  selected,
  onSelect,
}: {
  icon?: React.ReactNode;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left border-t first:border-t-0 border-[var(--border-subtle)] transition-colors ${
        selected ? "bg-primary-50 text-primary-700" : "hover:bg-neutral-50 text-neutral-800"
      }`}
    >
      {icon && (
        <span
          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
            selected ? "bg-primary-100 text-primary-700" : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {icon}
        </span>
      )}
      <span className="flex-1 t-body-sm font-medium truncate">{label}</span>
      {selected && (
        <span className="shrink-0 w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
