"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Card, Chip, SectionLabel } from "@/components/ui";
import {
  Calendar,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  IndianRupee,
  LayoutGrid,
  MapPin,
  Rows3,
  Search,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArchivedLead,
  assignLead,
  CATEGORY_LABELS,
  CATEGORY_TONE,
  Lead,
  LeadItem,
  leadTotalAmount,
  skipLead,
  useLeadsStore,
  usePreviewLeadId,
} from "@/lib/leads-store";

type ViewMode = "card" | "table";
type ArchivedKind = "completed" | "rejected";
const PAGE_SIZE = 5;

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="t-caption text-neutral-500">{label}</div>
      <div className="mt-1 t-body font-semibold text-neutral-800 break-words">
        {value}
      </div>
    </div>
  );
}

function fmtTime(min: number) {
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  return `${h}h ago`;
}

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { leads, completed, rejected } = useLeadsStore();
  const previewId = usePreviewLeadId();
  const [assigning, setAssigning] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [page, setPage] = useState(1);
  const [itemQuery, setItemQuery] = useState("");
  const initializedForRef = useRef<string | null>(null);

  const toggleItem = (incidentId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(incidentId)) next.delete(incidentId);
      else next.add(incidentId);
      return next;
    });
  };

  const rawId = params?.id ? decodeURIComponent(params.id) : previewId ?? "";
  const id = rawId.split("?")[0];
  const openLead = leads.find((l) => l.id === id);
  const completedLead = completed.find((l) => l.id === id);
  const rejectedLead = rejected.find((l) => l.id === id);
  const archivedLead: ArchivedLead | undefined = completedLead ?? rejectedLead;
  const archivedKind: ArchivedKind | null = completedLead
    ? "completed"
    : rejectedLead
    ? "rejected"
    : null;
  const lead: Lead | ArchivedLead | undefined = openLead ?? archivedLead;
  const isArchived = archivedKind !== null;

  useEffect(() => {
    if (!lead && !assigning) {
      // Lead may have been just assigned/skipped elsewhere
      const t = window.setTimeout(() => router.replace("/leads"), 50);
      return () => window.clearTimeout(t);
    }
  }, [lead, assigning, router]);

  useEffect(() => {
    if (!lead) return;
    if (initializedForRef.current === lead.id) return;
    initializedForRef.current = lead.id;
    setSelectedIds(new Set());
    setPage(1);
    setItemQuery("");
  }, [lead]);

  const filteredItems = useMemo(() => {
    if (!lead) return [] as LeadItem[];
    const q = itemQuery.trim().toLowerCase();
    if (!q) return lead.items;
    return lead.items.filter(
      (i) =>
        i.incidentId.toLowerCase().includes(q) ||
        i.challanNumber.toLowerCase().includes(q) ||
        i.vehicleNumber.toLowerCase().includes(q) ||
        i.state.toLowerCase().includes(q) ||
        i.offence.toLowerCase().includes(q) ||
        i.courtLocation.toLowerCase().includes(q)
    );
  }, [lead, itemQuery]);

  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, safePage]);

  useEffect(() => {
    setPage(1);
  }, [itemQuery]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (!lead) {
    // Render a placeholder frame while redirecting to avoid flash
    return (
      <PhoneFrame label="Assignment">
        <AppBar back href="/leads" title="Assignment" />
        <div className="px-4 py-10 text-center t-body-sm text-neutral-400">
          This assignment is no longer available.
        </div>
      </PhoneFrame>
    );
  }

  const totalAmount = leadTotalAmount(lead);
  const totalStates = new Set(lead.items.map((i) => i.state)).size;

  const handleAssign = () => {
    setAssigning(true);
    assignLead(lead.id);
    router.push("/incidents");
  };

  const handleReject = () => {
    setAssigning(true);
    skipLead(lead.id);
    router.push("/leads");
  };

  const archivedDate = archivedLead
    ? new Date(archivedLead.archivedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;
  const archivedLabel =
    archivedKind === "completed"
      ? "Completed"
      : archivedKind === "rejected"
      ? "Rejected"
      : null;
  return (
    <PhoneFrame
      label={
        isArchived ? `Assignment · ${archivedLabel}` : "Assignment · Detail"
      }
    >
      <AppBar back href="/leads" title={lead.id} />

      <div
        className={`px-4 pt-4 ${isArchived ? "pb-10" : "pb-32"} space-y-4`}
      >
        <div
          className={`-mx-4 -mt-4 px-4 py-3 border-b flex items-center justify-between ${
            archivedKind === "completed"
              ? "bg-success-subtle border-success/20"
              : archivedKind === "rejected"
              ? "bg-neutral-100 border-neutral-200"
              : "bg-primary-50 border-primary-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Chip tone={CATEGORY_TONE[lead.category]} dot>
              {CATEGORY_LABELS[lead.category]}
            </Chip>
            <span className="t-caption text-neutral-600 font-medium">
              {isArchived
                ? `${archivedLabel} on ${archivedDate}`
                : `Posted ${fmtTime(lead.postedMinAgo)}`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <h2 className="t-h2 font-bold text-neutral-900 leading-tight">
            {lead.id}
          </h2>
          <button
            type="button"
            onClick={() => {
              // Prototype: trigger a download of batch summary
              const blob = new Blob(
                [JSON.stringify(lead, null, 2)],
                { type: "application/json" }
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${lead.id}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-primary-200 bg-primary-50/60 text-primary-700 t-caption font-semibold hover:bg-primary-50 active:scale-[0.98] transition-colors shrink-0"
            aria-label={`Download ${lead.id}`}
          >
            <Download size={14} />
            Download batch
          </button>
        </div>

        <div>
          <SectionLabel className="mb-2">Summary</SectionLabel>
          <Card padding="lg">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <Field
                label={`Number of ${lead.itemLabel}`}
                value={
                  <span className="t-h3 font-bold tabular text-neutral-900">
                    {lead.items.length}
                  </span>
                }
              />
              <Field
                label="Total states"
                value={
                  <span className="t-h3 font-bold tabular text-neutral-900">
                    {totalStates}
                  </span>
                }
              />
              <Field
                label={`Total ${lead.itemLabel === "Challans" ? "Challan Amount" : "Amount"}`}
                value={
                  <span className="inline-flex items-center font-mono t-h3 font-bold tabular text-neutral-900">
                    <IndianRupee size={14} className="mr-0.5" />
                    {totalAmount.toLocaleString("en-IN")}
                  </span>
                }
              />
              <Field
                label="Acceptance date"
                value={
                  <span className="t-h3 font-bold text-neutral-900">
                    {lead.items[0]?.tatDeadline ?? "—"}
                  </span>
                }
              />
            </div>
          </Card>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <h3 className="t-body-lg font-semibold text-neutral-800">
              {lead.itemLabel} ({lead.items.length})
              {!isArchived && selectedIds.size > 0 && (
                <span className="ml-1.5 t-body-sm font-semibold text-primary-600">
                  · {selectedIds.size} selected
                </span>
              )}
            </h3>
            {!isArchived && (
              <button
                type="button"
                onClick={() => {
                  if (selectedIds.size === lead.items.length) {
                    setSelectedIds(new Set());
                  } else {
                    setSelectedIds(new Set(lead.items.map((i) => i.incidentId)));
                  }
                }}
                className="t-body-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                {selectedIds.size === lead.items.length
                  ? "Clear all"
                  : "Select all"}
              </button>
            )}
          </div>

          <div className="mb-3">
            <ItemSearchInput
              value={itemQuery}
              onChange={setItemQuery}
              placeholder={`Search ${lead.itemLabel.toLowerCase()}, vehicle, state…`}
            />
          </div>

          <div className="mb-3">
            <ViewToggle
              view={viewMode}
              onChange={(v) => {
                setViewMode(v);
                setPage(1);
              }}
            />
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border-default)] bg-white/60 px-5 py-8 text-center">
              <h3 className="t-body-sm font-semibold text-neutral-800">
                No matches
              </h3>
              <p className="t-caption text-neutral-500 mt-1">
                Try a different challan, vehicle, or state.
              </p>
              <button
                type="button"
                onClick={() => setItemQuery("")}
                className="mt-3 h-8 px-3 rounded-full border border-[var(--border-default)] text-neutral-700 t-caption font-semibold hover:border-primary-300"
              >
                Clear search
              </button>
            </div>
          ) : viewMode === "card" ? (
            <div className="space-y-3">
              {pagedItems.map((item) => {
                const checked = selectedIds.has(item.incidentId);
                const CardTag = isArchived ? "div" : "button";
                return (
                  <CardTag
                    key={item.incidentId}
                    {...(isArchived
                      ? {}
                      : {
                          type: "button" as const,
                          onClick: () => toggleItem(item.incidentId),
                          "aria-pressed": checked,
                        })}
                    className={`w-full text-left rounded-xl border transition-colors p-4 bg-white ${
                      isArchived
                        ? "border-[var(--border-default)]"
                        : checked
                        ? "border-primary-500 ring-2 ring-primary-100"
                        : "border-[var(--border-default)] hover:border-primary-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!isArchived && <Checkbox checked={checked} />}
                      <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-4 gap-y-5">
                        <Field
                          label="Challan Number"
                          value={
                            <span className="font-mono">{item.challanNumber}</span>
                          }
                        />
                        <Field
                          label="Vehicle Number"
                          value={
                            <span className="font-mono">{item.vehicleNumber}</span>
                          }
                        />
                        <Field label="State" value={item.state} />
                        <Field
                          label={`${CATEGORY_LABELS[lead.category]} Amount`}
                          value={
                            <span className="inline-flex items-center font-mono">
                              <IndianRupee size={13} className="mr-0.5" />
                              {item.fineAmount.toLocaleString("en-IN")}
                            </span>
                          }
                        />
                        <Field
                          label="Deadline"
                          value={
                            <span className="font-semibold text-error">
                              {item.tatDeadline}
                            </span>
                          }
                        />
                        <Field label="Challan Date" value={item.challanDate} />
                        <div className="col-span-2">
                          <Field
                            label="Court Location"
                            value={item.courtLocation}
                          />
                        </div>
                        <div className="col-span-2">
                          <Field label="Offence" value={item.offence} />
                        </div>
                      </div>
                    </div>
                  </CardTag>
                );
              })}
            </div>
          ) : (
            <TableView
              lead={lead}
              items={pagedItems}
              selectedIds={selectedIds}
              onToggle={toggleItem}
              readOnly={isArchived}
            />
          )}

          {totalPages > 1 && (
            <Pagination
              page={safePage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          )}
        </div>
      </div>

      {!isArchived && (
        <div className="sticky bottom-0 z-20 mt-auto bg-white border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReject}
              className="h-11 px-5 rounded-full border border-[var(--border-default)] bg-white t-body-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={handleAssign}
              className="flex-1 h-11 rounded-full bg-primary-600 text-white t-body-sm font-semibold hover:bg-primary-700 active:scale-[0.99] transition-all"
            >
              Click to accept
            </button>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
        checked
          ? "bg-primary-600 border-primary-600 text-white"
          : "bg-white border-neutral-300"
      }`}
    >
      {checked && <Check size={18} strokeWidth={3} />}
    </span>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const options: { key: ViewMode; label: string; Icon: typeof LayoutGrid }[] = [
    { key: "card", label: "Cards", Icon: LayoutGrid },
    { key: "table", label: "Table", Icon: Rows3 },
  ];
  return (
    <div
      role="tablist"
      aria-label="View type"
      className="relative grid grid-cols-2 bg-neutral-100 rounded-full p-1 border border-[var(--border-subtle)]"
    >
      <span
        aria-hidden
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white shadow-e1 transition-transform duration-200 ${
          view === "card" ? "translate-x-1" : "translate-x-[calc(100%+3px)]"
        }`}
      />
      {options.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={view === key}
          onClick={() => onChange(key)}
          className={`relative z-10 h-8 rounded-full t-caption font-semibold transition-colors inline-flex items-center justify-center gap-1.5 ${
            view === key ? "text-primary-700" : "text-neutral-600"
          }`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}

function ItemSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
        <Search size={14} />
      </span>
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-8 pr-8 rounded-full bg-white border border-[var(--border-default)] t-caption text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute inset-y-0 right-2 my-auto h-5 w-5 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

function TableView({
  items,
  selectedIds,
  onToggle,
  readOnly = false,
}: {
  lead: Lead;
  items: LeadItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const checked = !readOnly && selectedIds.has(item.incidentId);
        const RowTag = readOnly ? "div" : "button";
        return (
          <RowTag
            key={item.incidentId}
            {...(readOnly
              ? {}
              : {
                  type: "button" as const,
                  onClick: () => onToggle(item.incidentId),
                  "aria-pressed": checked,
                })}
            className={`block w-full text-left rounded-xl bg-white border transition-colors p-3 ${
              readOnly
                ? "border-[var(--border-default)]"
                : checked
                ? "border-primary-500 ring-2 ring-primary-100"
                : "border-[var(--border-default)] hover:border-primary-300"
            }`}
          >
            <div className="flex items-start gap-3">
              {!readOnly && (
                <span className="pt-0.5">
                  <TableCheckbox checked={checked} />
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-[1.6fr_1fr_1.3fr] gap-2">
                  <TableField
                    label="Challan Number"
                    value={<span className="font-mono">{item.challanNumber}</span>}
                  />
                  <TableField
                    label="Amount"
                    value={
                      <span className="font-mono inline-flex items-center">
                        <IndianRupee size={11} className="mr-0.5" />
                        {item.fineAmount.toLocaleString("en-IN")}
                      </span>
                    }
                  />
                  <TableField
                    label="Deadline"
                    value={
                      <span className="inline-flex items-center gap-1 bg-error-subtle text-error font-semibold rounded-full px-1.5 py-0.5 t-micro">
                        <Calendar size={10} />
                        {item.tatDeadline}
                      </span>
                    }
                  />
                </div>

                <div className="my-2.5 border-t border-dashed border-[var(--border-subtle)]" />

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                      <Car size={13} />
                    </span>
                    <div className="min-w-0">
                      <div className="t-micro text-neutral-500 leading-tight">
                        Vehicle Number
                      </div>
                      <div className="font-mono t-caption font-bold text-neutral-900 truncate leading-tight mt-0.5">
                        {item.vehicleNumber}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-success-subtle text-success-bold flex items-center justify-center">
                      <MapPin size={13} />
                    </span>
                    <div className="min-w-0">
                      <div className="t-micro text-neutral-500 leading-tight">
                        State
                      </div>
                      <div className="t-caption font-bold text-neutral-900 truncate leading-tight mt-0.5">
                        {item.state}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RowTag>
        );
      })}
    </div>
  );
}

function TableField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="t-micro text-neutral-500 leading-tight">{label}</div>
      <div className="mt-0.5 t-caption font-bold text-neutral-900 leading-tight truncate">
        {value}
      </div>
    </div>
  );
}

function TableCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
        checked
          ? "bg-primary-600 border-primary-600 text-white"
          : "bg-white border-neutral-300"
      }`}
    >
      {checked && <Check size={12} strokeWidth={3} />}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  totalItems,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalItems);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={prevDisabled}
        className={`inline-flex items-center gap-1 h-9 pl-2 pr-3.5 rounded-full border t-caption font-semibold transition-colors ${
          prevDisabled
            ? "border-[var(--border-subtle)] text-neutral-300 cursor-not-allowed"
            : "border-[var(--border-default)] text-neutral-800 bg-white hover:border-primary-300"
        }`}
      >
        <ChevronLeft size={14} />
        Prev
      </button>
      <div className="t-caption text-neutral-600 text-center">
        <div className="font-semibold text-neutral-800">
          Page {page} of {totalPages}
        </div>
        <div className="t-micro text-neutral-500 mt-0.5">
          {start}–{end} of {totalItems}
        </div>
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className={`inline-flex items-center gap-1 h-9 pl-3.5 pr-2 rounded-full border t-caption font-semibold transition-colors ${
          nextDisabled
            ? "border-[var(--border-subtle)] text-neutral-300 cursor-not-allowed"
            : "border-[var(--border-default)] text-neutral-800 bg-white hover:border-primary-300"
        }`}
      >
        Next
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

