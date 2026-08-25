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
  Download,
  Check,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

type SortMode = "recent" | "oldest" | "az";

const SORT_LABEL: Record<SortMode, string> = {
  recent: "Newest first",
  oldest: "Oldest first",
  az: "A → Z",
};

export default function KnowledgeBasePage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<Resource | null>(null);
  const [sort, setSort] = useState<SortMode>("recent");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

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
    const matched = RESOURCES.filter((r) => {
      if (filter !== "all" && r.category !== filter) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    });
    const sorted = [...matched];
    if (sort === "recent") {
      sorted.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    } else if (sort === "oldest") {
      sorted.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
  }, [query, filter, sort]);

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
            onClick={() => setSortSheetOpen(true)}
            aria-label={`Sort: ${SORT_LABEL[sort]}`}
            title={`Sort: ${SORT_LABEL[sort]}`}
            className={`w-8 h-8 -mr-1 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              sort !== "recent"
                ? "bg-primary-50 text-primary-700"
                : "text-neutral-500 hover:text-primary-600 hover:bg-primary-50/50"
            }`}
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
          filtered.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              onOpen={() => setActive(r)}
            />
          ))
        )}
      </div>

      <ResourceSheet resource={active} onClose={() => setActive(null)} />

      <SortSheet
        open={sortSheetOpen}
        value={sort}
        onChange={setSort}
        onClose={() => setSortSheetOpen(false)}
      />
    </PhoneFrame>
  );
}

function SortSheet({
  open,
  value,
  onChange,
  onClose,
}: {
  open: boolean;
  value: SortMode;
  onChange: (v: SortMode) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const options: SortMode[] = ["recent", "oldest", "az"];

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sort-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 animate-[fadeInBackdrop_180ms_ease-out]"
      />
      <div className="mt-auto relative bg-white rounded-t-3xl shadow-e3 flex flex-col animate-[sheetIn_260ms_cubic-bezier(0.2,0,0,1)]">
        <div className="pt-2 pb-1 flex justify-center">
          <span className="w-10 h-1.5 rounded-full bg-neutral-200" />
        </div>
        <div className="px-5 pt-2 pb-3 flex items-start justify-between gap-3">
          <h2
            id="sort-title"
            className="t-h3 font-bold text-neutral-800"
          >
            Sort by
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 -mr-1 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pb-5 space-y-1">
          {options.map((opt) => {
            const active = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  onClose();
                }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${
                  active
                    ? "bg-primary-50 text-primary-700"
                    : "hover:bg-neutral-50 text-neutral-800"
                }`}
              >
                <span className="t-body font-semibold">
                  {SORT_LABEL[opt]}
                </span>
                {active && <Check size={18} strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
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

function ResourceCard({
  resource,
  onOpen,
}: {
  resource: Resource;
  onOpen: () => void;
}) {
  const meta = CATEGORY_META[resource.category];
  const Icon = meta.icon;
  return (
    <button
      type="button"
      onClick={onOpen}
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

function generateBody(resource: Resource): { heading: string; body: string }[] {
  const cat = resource.category;
  if (cat === "template") {
    return [
      {
        heading: "How to use",
        body: "Print on the specified stamp paper (or use e-stamp) and fill each highlighted section with case-specific details. Have the client sign in front of a notary before submission.",
      },
      {
        heading: "Fields to complete",
        body: "Deponent details, case reference, event narration, prayer clause, and jurat block. Do not leave any field blank — strike through with 'NA' if not applicable.",
      },
      {
        heading: "Common mistakes",
        body: "Missing stamp value, unsigned pages, inconsistent dates between annexures. Cross-check against the master checklist before filing.",
      },
    ];
  }
  if (cat === "faq") {
    return [
      {
        heading: "Frequently asked",
        body: "This page collates the questions clients ask most often. Each answer includes the statutory basis and the practical next step you can take on their behalf.",
      },
      {
        heading: "When to escalate",
        body: "If the question needs interpretation of a recent judgement or state-specific rule, forward it to the ops desk via Support — don't guess.",
      },
      {
        heading: "Related resources",
        body: "See Guides for step-by-step handling and Regulations for the underlying statute text.",
      },
    ];
  }
  if (cat === "guide") {
    return [
      {
        heading: "Before you start",
        body: "Confirm the client has all originals plus one clear self-attested copy of each document. Missing paperwork is the #1 reason for delays.",
      },
      {
        heading: "Step-by-step",
        body: "Follow the sequence below in order. Skipping a step can invalidate the whole submission. Each step has an SLA — flag delays to ops immediately.",
      },
      {
        heading: "Timelines & fees",
        body: "Typical turnaround is 3–7 working days depending on the RTO. Government fees are listed at the bottom; convenience charges are set by the platform.",
      },
    ];
  }
  if (cat === "checklist") {
    return [
      {
        heading: "Before the visit",
        body: "Print two copies of the checklist and have the client initial each row as items are handed over. Keep the original with your file.",
      },
      {
        heading: "At the counter",
        body: "Present documents in the order listed. Officer-side questions tend to follow the same sequence — you'll move faster.",
      },
      {
        heading: "After submission",
        body: "Save the acknowledgment slip, log the reference number, and set a follow-up reminder inside the app.",
      },
    ];
  }
  if (cat === "regulation") {
    return [
      {
        heading: "Scope",
        body: "This section reproduces the operative text with plain-language callouts. Refer to the official gazette for the authoritative version.",
      },
      {
        heading: "Recent amendments",
        body: "Amendments effective in the last 12 months are marked in the sidebar. Read those before quoting older text in court.",
      },
      {
        heading: "Related case law",
        body: "See the Judgements section for cases where this provision was tested or read down.",
      },
    ];
  }
  if (cat === "judgement") {
    return [
      {
        heading: "Case brief",
        body: "Short summary of facts, the question of law, and the operative directions. Use this as your starting point before citing.",
      },
      {
        heading: "Ratio decidendi",
        body: "The binding principle of the case, distilled into 2–3 lines. Cite this — not the facts — when relying on the judgement.",
      },
      {
        heading: "Applicability",
        body: "Guidance on which similar fact patterns this ruling helps with and where it may be distinguished.",
      },
    ];
  }
  return [
    {
      heading: "Notice",
      body: "This is the operative text of the circular. Follow the compliance dates listed at the end.",
    },
    {
      heading: "Impact",
      body: "Practical impact on partners handling related cases. Update your workflow if this applies to your area.",
    },
    {
      heading: "Effective date",
      body: "Applies from the notification date noted on the header. Cases filed before this date follow the earlier procedure.",
    },
  ];
}

function downloadResource(r: Resource) {
  const sections = generateBody(r);
  const lines = [
    r.title,
    "",
    `Category: ${CATEGORY_META[r.category].label}`,
    `Updated: ${r.date}`,
    "",
    r.description,
    "",
  ];
  for (const s of sections) {
    lines.push(s.heading, s.body, "");
  }
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${r.id}-${r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ResourceSheet({
  resource,
  onClose,
}: {
  resource: Resource | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!resource) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [resource, onClose]);

  if (!resource) return null;
  const meta = CATEGORY_META[resource.category];
  const Icon = meta.icon;
  const sections = generateBody(resource);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 animate-[fadeInBackdrop_180ms_ease-out]"
      />
      <div className="mt-auto relative bg-white rounded-t-3xl shadow-e3 max-h-[92%] flex flex-col animate-[sheetIn_260ms_cubic-bezier(0.2,0,0,1)]">
        <div className="pt-2 pb-1 flex justify-center">
          <span className="w-10 h-1.5 rounded-full bg-neutral-200" />
        </div>
        <div className="px-5 pt-2 pb-3 border-b border-[var(--border-subtle)] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className={`inline-flex items-center gap-1.5 px-2 h-6 rounded-full mb-2 ${meta.tone}`}>
              <Icon size={12} />
              <span className="t-micro font-bold uppercase tracking-wider">
                {meta.label}
              </span>
            </div>
            <h2
              id="resource-title"
              className="t-h2 font-bold text-neutral-800 tracking-tight leading-snug"
            >
              {resource.title}
            </h2>
            <p className="t-caption text-neutral-500 mt-1">
              Updated {resource.date}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <p className="t-body text-neutral-700 leading-relaxed">
            {resource.description}
          </p>
          {sections.map((s) => (
            <section key={s.heading}>
              <h3 className="t-body-lg font-semibold text-neutral-800">
                {s.heading}
              </h3>
              <p className="t-body-sm text-neutral-600 mt-1 leading-relaxed">
                {s.body}
              </p>
            </section>
          ))}
        </div>

        <div className="px-5 pt-3 pb-5 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => downloadResource(resource)}
            className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-primary-600 text-white t-body font-semibold hover:bg-primary-700"
          >
            <Download size={16} />
            Download as text
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes sheetIn {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
