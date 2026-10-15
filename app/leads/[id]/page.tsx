"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Card, Chip, SectionLabel } from "@/components/ui";
import {
  Check,
  ChevronRight,
  IndianRupee,
  MapPin,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  assignLead,
  CATEGORY_LABELS,
  CATEGORY_TONE,
  LeadUrgency,
  leadTotalAmount,
  useLeadsStore,
  usePreviewLeadId,
} from "@/lib/leads-store";

const urgencyTone: Record<LeadUrgency, "error" | "warning" | "neutral"> = {
  high: "error",
  medium: "warning",
  low: "neutral",
};

const urgencyLabel: Record<LeadUrgency, string> = {
  high: "HIGH PRIORITY",
  medium: "MEDIUM PRIORITY",
  low: "LOW PRIORITY",
};

const urgencyDeadline: Record<LeadUrgency, string> = {
  high: "2 days",
  medium: "5 days",
  low: "10 days",
};

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
  const { leads } = useLeadsStore();
  const previewId = usePreviewLeadId();
  const [assigning, setAssigning] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const initializedForRef = useRef<string | null>(null);

  const toggleItem = (incidentId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(incidentId)) next.delete(incidentId);
      else next.add(incidentId);
      return next;
    });
  };

  const id = params?.id
    ? decodeURIComponent(params.id)
    : previewId ?? "";
  const lead = leads.find((l) => l.id === id);

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
    setSelectedIds(new Set(lead.items.map((i) => i.incidentId)));
  }, [lead]);

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

  const handleAssign = () => {
    setAssigning(true);
    assignLead(lead.id);
    router.push("/incidents");
  };

  return (
    <PhoneFrame label="Assignment · Detail">
      <AppBar
        back
        href="/leads"
        title={lead.id}
        action={
          <Chip tone={urgencyTone[lead.urgency]} size="sm">
            {urgencyLabel[lead.urgency]}
          </Chip>
        }
      />

      <div className="px-4 pt-4 pb-32 space-y-4">
        <div className="-mx-4 -mt-4 px-4 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Chip tone={CATEGORY_TONE[lead.category]} dot>
              {CATEGORY_LABELS[lead.category]}
            </Chip>
            <span className="t-caption text-neutral-600 font-medium">
              Posted {fmtTime(lead.postedMinAgo)}
            </span>
          </div>
          <span className="t-caption font-semibold text-error">
            {urgencyDeadline[lead.urgency]}
          </span>
        </div>

        <div>
          <h2 className="t-h2 font-bold text-neutral-900 leading-tight">
            {lead.items.length} {lead.itemLabel}
          </h2>
          <div className="mt-1.5 inline-flex items-center gap-1.5 t-body-sm text-neutral-600">
            <MapPin size={14} className="text-neutral-500" />
            {lead.location}
          </div>
        </div>

        <Card padding="lg">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <Field
              label="Earnings"
              value={
                <span className="inline-flex items-center text-success-bold font-mono t-h2 font-extrabold tabular leading-none">
                  <IndianRupee size={18} className="mr-0.5" />
                  {lead.earnings.toLocaleString("en-IN")}
                </span>
              }
            />
            <Field
              label={`Total ${lead.itemLabel === "Challans" ? "Challan Amount" : "Amount"}`}
              value={
                <span className="inline-flex items-center font-mono t-h2 font-extrabold tabular text-neutral-900 leading-none">
                  <IndianRupee size={18} className="mr-0.5" />
                  {totalAmount.toLocaleString("en-IN")}
                </span>
              }
            />
          </div>
        </Card>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <SectionLabel className="!mb-0">
              {lead.itemLabel} ({lead.items.length})
              {selectedIds.size > 0 && (
                <span className="ml-1.5 t-caption font-semibold text-primary-600 normal-case tracking-normal">
                  · {selectedIds.size} selected
                </span>
              )}
            </SectionLabel>
            <button
              type="button"
              onClick={() => {
                if (selectedIds.size === lead.items.length) {
                  setSelectedIds(new Set());
                } else {
                  setSelectedIds(new Set(lead.items.map((i) => i.incidentId)));
                }
              }}
              className="t-caption font-semibold text-primary-600 hover:text-primary-700"
            >
              {selectedIds.size === lead.items.length
                ? "Clear all"
                : "Select all"}
            </button>
          </div>
          <div className="space-y-3">
            {lead.items.map((item) => {
              const checked = selectedIds.has(item.incidentId);
              return (
                <button
                  key={item.incidentId}
                  type="button"
                  onClick={() => toggleItem(item.incidentId)}
                  aria-pressed={checked}
                  className={`w-full text-left rounded-xl border transition-colors p-4 bg-white ${
                    checked
                      ? "border-primary-500 ring-2 ring-primary-100"
                      : "border-[var(--border-default)] hover:border-primary-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={checked} />
                    <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-4 gap-y-5">
                      <Field
                        label="Incident ID"
                        value={
                          <span className="font-mono">{item.incidentId}</span>
                        }
                      />
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
                        label="Fine Amount"
                        value={
                          <span className="inline-flex items-center font-mono">
                            <IndianRupee size={13} className="mr-0.5" />
                            {item.fineAmount.toLocaleString("en-IN")}
                          </span>
                        }
                      />
                      <Field
                        label="TAT Deadline"
                        value={
                          <span className="font-semibold text-error">
                            {item.tatDeadline}
                          </span>
                        }
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <SwipeToAssign onConfirm={handleAssign} />
      </div>
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

function SwipeToAssign({ onConfirm }: { onConfirm: () => void }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbSize = 48;
  const padding = 4;
  const [maxX, setMaxX] = useState(0);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);

  useEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      if (!el) return;
      setMaxX(Math.max(0, el.clientWidth - thumbSize - padding * 2));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const finish = useCallback(() => {
    if (confirmed) return;
    setConfirmed(true);
    setX(maxX);
    onConfirm();
  }, [confirmed, maxX, onConfirm]);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (confirmed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;
    startOffsetRef.current = x;
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging || confirmed) return;
    const next = Math.min(
      maxX,
      Math.max(0, startOffsetRef.current + (e.clientX - startXRef.current))
    );
    setX(next);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (x >= maxX - 2) {
      finish();
    } else {
      setX(0);
    }
  };

  const progress = maxX > 0 ? x / maxX : 0;

  return (
    <div
      ref={trackRef}
      className="relative h-14 w-full rounded-full bg-primary-50 border border-primary-100 overflow-hidden select-none"
    >
      <div
        aria-hidden
        className="absolute bg-primary-500/90 rounded-full"
        style={{
          top: padding,
          bottom: padding,
          left: padding,
          width: `${x}px`,
          transition: dragging ? "none" : "width 220ms ease-out",
        }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center t-body font-semibold text-primary-700 pointer-events-none"
        style={{ opacity: 1 - progress * 0.9 }}
      >
        {confirmed ? "Assigning…" : "Swipe to assign"}
      </div>
      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label="Swipe to assign to me"
        disabled={confirmed}
        className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-white shadow-e2 text-primary-600 active:scale-[0.97]"
        style={{
          width: thumbSize,
          height: thumbSize,
          left: padding,
          transform: `translate(${x}px, -50%)`,
          transition: dragging ? "none" : "transform 220ms ease-out",
          touchAction: "none",
        }}
      >
        <ChevronRight size={22} strokeWidth={2.5} />
      </button>
    </div>
  );
}
