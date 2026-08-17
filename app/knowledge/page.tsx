"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import {
  Search,
  FileText,
  HelpCircle,
  BookOpen,
  CheckSquare,
  Scale,
  Gavel,
  Newspaper,
  Calendar,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type Category =
  | "template"
  | "faq"
  | "guide"
  | "checklist"
  | "regulation"
  | "judgement"
  | "circular";

type Resource = {
  id: string;
  title: string;
  description: string;
  category: Category;
  date: string;
};

const CATEGORY_META: Record<
  Category,
  { label: string; icon: typeof FileText; tone: string }
> = {
  template: {
    label: "Templates",
    icon: FileText,
    tone: "bg-primary-50 text-primary-700",
  },
  faq: {
    label: "FAQs",
    icon: HelpCircle,
    tone: "bg-info-subtle text-info-bold",
  },
  guide: {
    label: "Guides",
    icon: BookOpen,
    tone: "bg-accent-100 text-accent-700",
  },
  checklist: {
    label: "Checklists",
    icon: CheckSquare,
    tone: "bg-success-subtle text-success-bold",
  },
  regulation: {
    label: "Regulations",
    icon: Scale,
    tone: "bg-neutral-100 text-neutral-700",
  },
  judgement: {
    label: "Judgements",
    icon: Gavel,
    tone: "bg-warning-subtle text-warning-bold",
  },
  circular: {
    label: "Circulars",
    icon: Newspaper,
    tone: "bg-error-subtle text-error-bold",
  },
};

const RESOURCES: Resource[] = [
  {
    id: "r1",
    title: "Accident Affidavit Template",
    description:
      "Ready-to-use affidavit format for motor accident insurance claims on ₹100 non-judicial stamp paper.",
    category: "template",
    date: "15 Mar 2026",
  },
  {
    id: "r2",
    title: "RTI Application for Vehicle Records",
    description:
      "Standard RTI application format to request vehicle ownership, challan records, or registration details from RTO.",
    category: "template",
    date: "8 Feb 2026",
  },
  {
    id: "r3",
    title: "Challan & Traffic Violation FAQs",
    description:
      "Common questions about traffic challans — disputing wrong challans, payment deadlines, Lok Adalat, and more.",
    category: "faq",
    date: "22 Mar 2026",
  },
  {
    id: "r4",
    title: "Insurance Claims & Coverage FAQs",
    description:
      "Answers to frequently asked questions about motor insurance claims, third-party coverage, claim denials, and IDV.",
    category: "faq",
    date: "18 Mar 2026",
  },
  {
    id: "r5",
    title: "How to Transfer Vehicle Ownership Across States",
    description:
      "Complete step-by-step guide for interstate vehicle ownership transfer including NOC, Form 29/30, fees, and timelines.",
    category: "guide",
    date: "10 Mar 2026",
  },
  {
    id: "r6",
    title: "What to Do After a Road Accident — Step-by-Step Guide",
    description:
      "Immediate actions, evidence collection, FIR filing, insurance intimation, and legal steps after a vehicle accident.",
    category: "guide",
    date: "25 Mar 2026",
  },
  {
    id: "r7",
    title: "Pre-Accident Documentation Checklist",
    description:
      "Everything a vehicle owner should keep ready — RC, insurance, PUC, DL — with expiry tracking tips.",
    category: "checklist",
    date: "2 Mar 2026",
  },
  {
    id: "r8",
    title: "Court Hearing Preparation Checklist",
    description:
      "Documents, timelines, and witnesses to organise before every hearing to keep your matter moving.",
    category: "checklist",
    date: "12 Feb 2026",
  },
  {
    id: "r9",
    title: "Motor Vehicles (Amendment) Act, 2019",
    description:
      "Key provisions of the amended MV Act — revised penalties, driver licensing rules, and third-party compensation.",
    category: "regulation",
    date: "5 Mar 2026",
  },
  {
    id: "r10",
    title: "Central Motor Vehicle Rules — Quick Reference",
    description:
      "Frequently cited rules under CMVR with plain-language summaries for on-ground application.",
    category: "regulation",
    date: "28 Feb 2026",
  },
  {
    id: "r11",
    title: "Landmark Judgement — MACT Compensation Standards",
    description:
      "Supreme Court ruling on standardised computation of compensation under Motor Accident Claims Tribunal.",
    category: "judgement",
    date: "20 Mar 2026",
  },
  {
    id: "r12",
    title: "High Court Ruling — E-Challan Validity",
    description:
      "Recent HC judgement clarifying evidentiary standards for e-challans issued via ANPR cameras.",
    category: "judgement",
    date: "14 Mar 2026",
  },
  {
    id: "r13",
    title: "MoRTH Circular — Vehicle Scrappage Policy 2026",
    description:
      "Latest Ministry circular on the voluntary vehicle scrappage programme, incentives, and compliance dates.",
    category: "circular",
    date: "1 Mar 2026",
  },
  {
    id: "r14",
    title: "State Transport Circular — Fitness Certificate Renewal",
    description:
      "Updated procedure and revised fee structure for commercial vehicle fitness certificate renewal.",
    category: "circular",
    date: "24 Feb 2026",
  },
];

type Filter = "all" | Category;

const FILTERS: Filter[] = [
  "all",
  "template",
  "faq",
  "guide",
  "checklist",
  "regulation",
  "judgement",
  "circular",
];

export default function KnowledgeBasePage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: RESOURCES.length,
      template: 0,
      faq: 0,
      guide: 0,
      checklist: 0,
      regulation: 0,
      judgement: 0,
      circular: 0,
    };
    RESOURCES.forEach((r) => {
      c[r.category] += 1;
    });
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCES.filter((r) => {
      if (filter !== "all" && r.category !== filter) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  return (
    <PhoneFrame label="Knowledge Base">
      <AppBar back href="/home" title="Knowledge Base" />

      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 h-11 px-3 rounded-xl border border-[var(--border-default)] bg-white focus-within:border-primary-500 transition-colors">
          <Search size={16} className="text-neutral-500 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides, templates, FAQs…"
            className="flex-1 min-w-0 t-body text-neutral-800 focus:outline-none placeholder:text-neutral-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="w-6 h-6 rounded-full text-neutral-400 hover:text-neutral-600 flex items-center justify-center shrink-0"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            aria-label="Filters"
            className="w-8 h-8 -mr-1 rounded-lg text-neutral-500 hover:text-primary-600 hover:bg-primary-50/50 flex items-center justify-center shrink-0"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="sticky top-16 z-20 px-4 pt-3 pb-3 bg-[var(--surface-bg)]">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {FILTERS.map((f) => (
            <FilterPill
              key={f}
              active={filter === f}
              onClick={() => setFilter(f)}
              label={f === "all" ? "All" : CATEGORY_META[f].label}
              count={counts[f]}
            />
          ))}
        </div>
      </div>

      <div className="px-4 pt-1 pb-24 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 t-body-sm text-neutral-500">
            No resources match your search.
          </div>
        ) : (
          filtered.map((r) => <ResourceCard key={r.id} resource={r} />)
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

function ResourceCard({ resource }: { resource: Resource }) {
  const meta = CATEGORY_META[resource.category];
  const Icon = meta.icon;
  return (
    <button
      type="button"
      className="w-full text-left rounded-xl bg-white border border-[var(--border-default)] shadow-e1 p-4 hover:border-primary-300 hover:shadow-e2 transition-all"
    >
      <div
        className={`inline-flex items-center gap-1.5 px-2 h-6 rounded-full ${meta.tone}`}
      >
        <Icon size={12} />
        <span className="t-micro font-bold uppercase tracking-wider">
          {meta.label}
        </span>
      </div>
      <h3 className="t-body-lg font-semibold text-neutral-900 mt-3 leading-snug">
        {resource.title}
      </h3>
      <p className="t-body-sm text-neutral-600 mt-1.5 line-clamp-2 leading-relaxed">
        {resource.description}
      </p>
      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] inline-flex items-center gap-1.5 t-caption text-neutral-500">
        <Calendar size={12} />
        {resource.date}
      </div>
    </button>
  );
}
