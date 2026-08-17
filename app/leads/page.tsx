"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { CommissionCard } from "@/components/CommissionCard";
import { Button, Chip } from "@/components/ui";
import { MapPin, IndianRupee, Clock, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  assignLead,
  CATEGORY_LABELS,
  CATEGORY_TONE,
  Lead,
  LeadCategory,
  LeadUrgency,
  skipLead,
  useLeadsStore,
} from "@/lib/leads-store";

const urgencyTone: Record<LeadUrgency, "error" | "warning" | "neutral"> = {
  high: "error",
  medium: "warning",
  low: "neutral",
};

const urgencyLabel: Record<LeadUrgency, string> = {
  high: "HIGH",
  medium: "MED",
  low: "LOW",
};

type Filter = "all" | LeadCategory;

function fmtAmount(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function fmtTime(min: number) {
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  return `${h}h ago`;
}

export default function LeadsPage() {
  const { leads } = useLeadsStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

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
  const totalValue = filtered.reduce((sum, l) => sum + l.amount, 0);

  const handleAssign = (lead: Lead) => {
    assignLead(lead.id);
    setToast(`${lead.type} assigned to you`);
  };

  return (
    <PhoneFrame label="Leads">
      <AppBar
        title="Leads"
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
            <div className="t-body-sm font-semibold text-neutral-700">Open leads</div>
            <div className="t-h1 font-bold tabular text-neutral-900 mt-0.5">
              {filtered.length}
            </div>
          </div>
          <div className="rounded-xl bg-white border border-[var(--border-default)] shadow-e1 px-3 py-3">
            <div className="t-body-sm font-semibold text-neutral-700">Total value</div>
            <div className="t-h1 font-bold tabular text-success-bold mt-0.5">
              {fmtAmount(totalValue)}
            </div>
          </div>
        </div>
        <CommissionCard />
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
          <div className="text-center py-16 t-body-sm text-neutral-400">
            {leads.length === 0
              ? "No leads right now — check back soon."
              : `No ${filter === "all" ? "" : CATEGORY_LABELS[filter]} leads open.`}
          </div>
        ) : (
          filtered.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onAssign={() => handleAssign(lead)} />
          ))
        )}
      </div>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4">
          <div className="pointer-events-auto inline-flex items-center gap-2 max-w-[92%] px-4 h-11 rounded-full bg-neutral-900 text-white shadow-e2">
            <span className="w-5 h-5 rounded-full bg-success flex items-center justify-center shrink-0">
              <Check size={12} strokeWidth={3} className="text-white" />
            </span>
            <span className="t-body-sm font-medium truncate">{toast}</span>
          </div>
        </div>
      )}

      <BottomTabBar active="leads" />
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

function LeadCard({ lead, onAssign }: { lead: Lead; onAssign: () => void }) {
  return (
    <div className="rounded-xl bg-white shadow-e1 border border-[var(--border-default)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="t-body-lg font-semibold text-neutral-900 truncate">
            {lead.type}
          </div>
          <div className="t-caption text-neutral-500 mt-0.5">{lead.id}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Chip tone={CATEGORY_TONE[lead.category]} size="sm">
            {CATEGORY_LABELS[lead.category]}
          </Chip>
          <Chip tone={urgencyTone[lead.urgency]} size="sm">
            {urgencyLabel[lead.urgency]}
          </Chip>
        </div>
      </div>

      <p className="t-body-sm text-neutral-700 mt-2 line-clamp-2">
        {lead.description}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="t-h1 font-extrabold tabular text-success-bold inline-flex items-center leading-none">
            <IndianRupee size={20} className="mr-0.5" />
            {lead.payoutRange
              ? `${lead.payoutRange[0].toLocaleString("en-IN")} – ₹${lead.payoutRange[1].toLocaleString("en-IN")}`
              : lead.amount.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="text-right shrink-0 space-y-1">
          <div className="inline-flex items-center gap-1 t-body-sm font-semibold text-neutral-800">
            <MapPin size={13} className="text-neutral-500" />
            {lead.distanceKm} km
          </div>
          <div className="t-caption text-neutral-500">{lead.area}</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 t-caption text-neutral-500">
          <Clock size={12} />
          {fmtTime(lead.postedMinAgo)}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => skipLead(lead.id)}>
            Skip
          </Button>
          <Button variant="primary" size="sm" onClick={onAssign}>
            Assign to me
          </Button>
        </div>
      </div>
    </div>
  );
}
