"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { CommissionCard } from "@/components/CommissionCard";
import { Chip } from "@/components/ui";
import { Clock, Inbox } from "lucide-react";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  assignLead,
  CATEGORY_LABELS,
  CATEGORY_TONE,
  Lead,
  LeadCategory,
  skipLead,
  useLeadsStore,
} from "@/lib/leads-store";

type Filter = "all" | LeadCategory;

function fmtTime(min: number) {
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  return `${h}h ago`;
}

export default function LeadsPage() {
  const { leads } = useLeadsStore();
  const [filter, setFilter] = useState<Filter>("all");
  const toast = useToast();

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: leads.length,
      case: 0,
      challan: 0,
      rto: 0,
    };
    leads.forEach((l) => {
      c[l.category] += 1;
    });
    return c;
  }, [leads]);

  const filtered = filter === "all" ? leads : leads.filter((l) => l.category === filter);

  const handleAssign = (lead: Lead) => {
    assignLead(lead.id);
    toast.show(`${lead.type} assigned to you`);
  };

  const handleReject = (lead: Lead) => {
    skipLead(lead.id);
    toast.show(`${lead.id} rejected`);
  };

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
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white border border-[var(--border-default)] shadow-e1 px-3 py-3">
            <div className="t-body-sm font-semibold text-neutral-700">Open to assign</div>
            <div className="t-h1 font-bold tabular text-primary-600 mt-0.5">
              {filtered.length}
            </div>
          </div>
          <div className="rounded-xl bg-white border border-[var(--border-default)] shadow-e1 px-3 py-3">
            <div className="t-body-sm font-semibold text-neutral-700">Total batches</div>
            <div className="t-h1 font-bold tabular text-primary-600 mt-0.5">
              {filtered.length}
            </div>
          </div>
        </div>
        {/* <CommissionCard /> */}
      </div>

      <div className="sticky top-16 z-20 px-4 pt-2 pb-3 bg-[var(--surface-bg)] border-b border-[var(--border-subtle)]">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {(["all", "case", "challan", "rto"] as Filter[]).map((f) => (
            <FilterPill
              key={f}
              active={filter === f}
              onClick={() => setFilter(f)}
              label={f === "all" ? "All" : CATEGORY_LABELS[f]}
              count={counts[f]}
            />
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 pb-24 space-y-3">
        {filtered.length === 0 ? (
          <LeadsEmpty
            filter={filter}
            noneAtAll={leads.length === 0}
            onShowAll={() => setFilter("all")}
          />
        ) : (
          filtered.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onAssign={() => handleAssign(lead)}
              onReject={() => handleReject(lead)}
            />
          ))
        )}
      </div>

      <BottomTabBar active="requests" />
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

function LeadCard({
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
            <div className="t-body-lg font-semibold text-neutral-900">
              {lead.id}
            </div>
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

function LeadsEmpty({
  filter,
  noneAtAll,
  onShowAll,
}: {
  filter: Filter;
  noneAtAll: boolean;
  onShowAll: () => void;
}) {
  const isFiltered = filter !== "all";
  const label = isFiltered ? CATEGORY_LABELS[filter as LeadCategory] : "";

  let title: string;
  let subtitle: string;
  if (noneAtAll) {
    title = "You're all caught up";
    subtitle =
      "No open assignments in your area right now. New ones land here in real time.";
  } else if (isFiltered) {
    title = `No open ${label} assignments`;
    subtitle = "Try another category or check back in a few minutes.";
  } else {
    title = "No open assignments right now";
    subtitle = "New assignments land here as they come in.";
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
      {isFiltered && !noneAtAll && (
        <button
          type="button"
          onClick={onShowAll}
          className="mt-4 h-9 px-3.5 rounded-full border border-[var(--border-default)] text-neutral-700 t-body-sm font-semibold hover:border-primary-300"
        >
          Show all
        </button>
      )}
    </div>
  );
}

