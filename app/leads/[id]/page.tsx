"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card, Chip, SectionLabel } from "@/components/ui";
import {
  Car,
  ChevronRight,
  IndianRupee,
  Percent,
  Shield,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import {
  assignLead,
  CATEGORY_LABELS,
  CATEGORY_TONE,
  LeadUrgency,
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

type TeamMember = {
  id: string;
  name: string;
  initials: string;
  role: string;
  activeCases: number;
  status: "active" | "offline";
};

const TEAM_MEMBERS: TeamMember[] = [
  { id: "m1", name: "Rohan Verma", initials: "RV", role: "Associate · Traffic", activeCases: 3, status: "active" },
  { id: "m2", name: "Aditi Kulkarni", initials: "AK", role: "Associate · RTO", activeCases: 5, status: "active" },
  { id: "m3", name: "Sameer Iqbal", initials: "SI", role: "Junior · Traffic", activeCases: 1, status: "offline" },
  { id: "m4", name: "Neha Rao", initials: "NR", role: "Associate · General", activeCases: 0, status: "active" },
];

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { leads } = useLeadsStore();
  const previewId = usePreviewLeadId();
  const [assigning, setAssigning] = useState(false);
  const [teammateSheetOpen, setTeammateSheetOpen] = useState(false);
  const toast = useToast();

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

  if (!lead) {
    // Render a placeholder frame while redirecting to avoid flash
    return (
      <PhoneFrame label="Lead">
        <AppBar back href="/leads" title="Lead" />
        <div className="px-4 py-10 text-center t-body-sm text-neutral-400">
          This lead is no longer available.
        </div>
      </PhoneFrame>
    );
  }

  const payoutLabel = lead.payoutRange
    ? `${lead.payoutRange[0].toLocaleString("en-IN")} – ₹${lead.payoutRange[1].toLocaleString("en-IN")}`
    : lead.amount.toLocaleString("en-IN");

  const handleAssign = () => {
    setAssigning(true);
    assignLead(lead.id);
    router.push("/incidents");
  };

  const handleSkip = () => {
    skipLead(lead.id);
    router.push("/leads");
  };

  const handleAssignToTeammate = (member: TeamMember) => {
    setAssigning(true);
    skipLead(lead.id);
    setTeammateSheetOpen(false);
    toast.show(`Sent to ${member.name}`);
    window.setTimeout(() => router.push("/leads"), 900);
  };

  return (
    <PhoneFrame label="Lead · Detail">
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
            {lead.type}
          </h2>
          <p className="t-body text-neutral-700 mt-2 leading-relaxed">
            {lead.description}
          </p>
        </div>

        <Card padding="lg">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <Field
              label="Lead ID"
              value={<span className="font-mono">{lead.id}</span>}
            />
            <Field
              label="Category"
              value={CATEGORY_LABELS[lead.category]}
            />
            <Field
              label="Vehicle Number"
              value={<span className="font-mono">{lead.vehicle}</span>}
            />
            <Field label="Area" value={lead.area} />
            <Field
              label="Payout"
              value={
                <span className="font-mono">
                  ₹{payoutLabel}
                </span>
              }
            />
            <Field
              label="Response Window"
              value={
                <span className="font-semibold text-error">
                  {urgencyDeadline[lead.urgency]}
                </span>
              }
            />
          </div>
        </Card>

        <Card padding="lg" variant="tinted">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="t-caption font-semibold text-primary-700 uppercase tracking-wider">
                Your payout
              </div>
              <div className="mt-1 t-display font-extrabold tabular text-success-bold inline-flex items-center leading-none">
                <IndianRupee size={22} className="mr-0.5" />
                {payoutLabel}
              </div>
              {lead.payoutRange && (
                <div className="t-caption text-neutral-600 mt-1.5">
                  Final amount confirmed on completion
                </div>
              )}
            </div>
            <Link
              href="/wallet"
              className="shrink-0 inline-flex items-center gap-1 t-caption font-semibold text-primary-700"
            >
              <Percent size={13} />
              Commission
            </Link>
          </div>
        </Card>

        <div>
          <SectionLabel className="mb-2">Vehicle</SectionLabel>
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                <Car size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="t-body font-semibold font-mono text-neutral-800">
                  {lead.vehicle}
                </div>
                <div className="t-caption text-neutral-500 mt-0.5">
                  Registered vehicle number
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card padding="md" className="bg-neutral-50 border-neutral-200">
          <div className="flex items-start gap-3">
            <Shield size={16} className="text-neutral-500 shrink-0 mt-0.5" />
            <div className="t-caption text-neutral-600 leading-relaxed">
              Once assigned, this lead moves to your active incidents. You have
              {" "}
              {lead.urgency === "high" ? "2 days" : lead.urgency === "medium" ? "5 days" : "10 days"}{" "}
              to complete the task before it&apos;s reassigned.
            </div>
          </div>
        </Card>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white border-t border-[var(--border-subtle)] px-4 pt-3 pb-4 space-y-2">
        <div className="flex gap-2">
          <Button variant="secondary" size="lg" onClick={handleSkip}>
            Skip
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleAssign}
          >
            Assign to me
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setTeammateSheetOpen(true)}
          className="w-full inline-flex items-center justify-center gap-1 t-body-sm font-semibold text-primary-600 hover:text-primary-700 py-1"
        >
          <Users size={14} />
          Or assign to a teammate
        </button>
      </div>

      <TeammateSheet
        open={teammateSheetOpen}
        onClose={() => setTeammateSheetOpen(false)}
        onPick={handleAssignToTeammate}
      />
    </PhoneFrame>
  );
}

function TeammateSheet({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (m: TeamMember) => void;
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
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex justify-center">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>
        <div className="px-4 pt-2 pb-3 flex items-start justify-between gap-3">
          <div>
            <div className="t-h3 font-bold text-neutral-800">
              Assign to a teammate
            </div>
            <div className="t-caption text-neutral-500 mt-0.5">
              They&apos;ll be notified and can accept from their app.
            </div>
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

        <div className="px-4 pb-4 space-y-2">
          {TEAM_MEMBERS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onPick(m)}
              disabled={m.status === "offline"}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-[var(--border-default)] bg-white hover:border-primary-300 hover:bg-primary-50/40 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold shrink-0">
                {m.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="t-body font-semibold text-neutral-800 truncate">
                  {m.name}
                </div>
                <div className="t-caption text-neutral-500 truncate">
                  {m.role} · {m.activeCases} active
                </div>
              </div>
              <span
                className={`t-caption font-semibold shrink-0 ${
                  m.status === "active"
                    ? "text-success-bold"
                    : "text-neutral-400"
                }`}
              >
                {m.status === "active" ? "Online" : "Offline"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
