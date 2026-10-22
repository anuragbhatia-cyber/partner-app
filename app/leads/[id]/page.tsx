"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Card, Chip, SectionLabel } from "@/components/ui";
import {
  Check,
  Download,
  IndianRupee,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  assignLead,
  CATEGORY_LABELS,
  CATEGORY_TONE,
  LeadUrgency,
  leadTotalAmount,
  skipLead,
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

const priorityLabel: Record<LeadUrgency, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const priorityTextTone: Record<LeadUrgency, string> = {
  high: "text-error",
  medium: "text-warning-bold",
  low: "text-neutral-700",
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
                label="Priority"
                value={
                  <span className={`t-h3 font-bold ${priorityTextTone[lead.urgency]}`}>
                    {priorityLabel[lead.urgency]}
                  </span>
                }
              />
            </div>
          </Card>
        </div>

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
                        label={`${CATEGORY_LABELS[lead.category]} Amount`}
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
                </button>
              );
            })}
          </div>
        </div>
      </div>

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

