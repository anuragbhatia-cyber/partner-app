"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import {
  Button,
  Card,
  Chip,
  SectionLabel,
} from "@/components/ui";
import {
  MoreVertical,
  Phone,
  ChevronRight,
  Plus,
  FileText,
  Users,
  Check,
  X,
  Receipt,
  ShieldCheck,
  CheckCircle2,
  Search,
  IdCard,
  Car,
  Camera,
  MapPin,
  ScrollText,
  Send,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

type Tab = "details" | "notes";

export default function IncidentActivePage() {
  const [tab, setTab] = useState<Tab>("details");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignedTo, setAssignedTo] = useState<TeamMember | null>(null);
  const [docsOpen, setDocsOpen] = useState(false);
  const [requestedDocs, setRequestedDocs] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [cancelSheetOpen, setCancelSheetOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const incidentsLinkRef = useRef<HTMLAnchorElement>(null);

  const flashToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleReviewCancel = () => setConfirmCancelOpen(true);

  const handleConfirmCancel = () => {
    if (cancelling) return;
    setCancelling(true);
    window.setTimeout(() => {
      incidentsLinkRef.current?.click();
    }, 600);
  };

  return (
    <PhoneFrame label="Incident · In Progress">
      <a
        ref={incidentsLinkRef}
        href="/incidents"
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Back to incidents
      </a>
      <AppBar
        back
        href="/incidents"
        title="IRN-100842"
        action={
          <button className="w-10 h-10 flex items-center justify-center rounded-full">
            <MoreVertical size={20} className="text-neutral-700" />
          </button>
        }
      />

      <div className="px-4 pt-3 pb-3">
        <div className="flex bg-neutral-100 rounded-xl p-1">
          <TabButton active={tab === "details"} onClick={() => setTab("details")}>
            Details
          </TabButton>
          <TabButton active={tab === "notes"} onClick={() => setTab("notes")}>
            Notes
          </TabButton>
        </div>
      </div>

      <div className="px-4 py-4 pb-32 space-y-4">
        {tab === "details" ? (
          <DetailsPanel
            assignedTo={assignedTo}
            requestedDocs={requestedDocs}
            onOpenAssign={() => setAssignOpen(true)}
            onOpenDocs={() => setDocsOpen(true)}
          />
        ) : (
          <NotesPanel />
        )}
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white border-t border-[var(--border-subtle)] px-4 pt-3 pb-4 space-y-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => setSheetOpen(true)}
        >
          Mark Complete
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => setCancelSheetOpen(true)}
        >
          Not Completed
        </Button>
      </div>

      <CompleteUploadSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

      <NotCompletedSheet
        open={cancelSheetOpen}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        onClose={() => setCancelSheetOpen(false)}
        onReviewCancel={handleReviewCancel}
      />

      <ConfirmCancelDialog
        open={confirmCancelOpen}
        cancelling={cancelling}
        onKeep={() => setConfirmCancelOpen(false)}
        onConfirm={handleConfirmCancel}
      />

      <AssignToTeamSheet
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onAssign={(member) => {
          setAssignedTo(member);
          setAssignOpen(false);
          flashToast(`Assigned to ${member.name}`);
        }}
      />

      <RequestDocumentsSheet
        open={docsOpen}
        initial={requestedDocs}
        onClose={() => setDocsOpen(false)}
        onSend={(ids) => {
          setRequestedDocs(ids);
          setDocsOpen(false);
          flashToast(
            ids.length === 1
              ? `1 document requested`
              : `${ids.length} documents requested`
          );
        }}
      />

      {toast && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-[60] flex justify-center px-4">
          <div className="pointer-events-auto inline-flex items-center gap-2 max-w-[92%] px-4 h-11 rounded-full bg-neutral-900 text-white shadow-e2">
            <span className="w-5 h-5 rounded-full bg-success flex items-center justify-center shrink-0">
              <Check size={12} strokeWidth={3} className="text-white" />
            </span>
            <span className="t-body-sm font-medium truncate">{toast}</span>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 h-10 rounded-lg t-body-sm font-semibold transition-all inline-flex items-center justify-center ${
        active
          ? "bg-white text-neutral-800 shadow-e1"
          : "text-neutral-500 hover:text-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}

function DetailsPanel({
  assignedTo,
  requestedDocs,
  onOpenAssign,
  onOpenDocs,
}: {
  assignedTo: TeamMember | null;
  requestedDocs: string[];
  onOpenAssign: () => void;
  onOpenDocs: () => void;
}) {
  return (
    <>
      {/* Status ribbon */}
      <div className="-mx-4 -mt-4 mb-4 px-4 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Chip tone="warning" dot>
            IN PROGRESS
          </Chip>
          <span className="t-caption text-neutral-600 font-medium">
            2 days elapsed
          </span>
        </div>
        <Chip tone="error" size="sm">HIGH</Chip>
      </div>

      {/* Incident details grid */}
      <Card padding="lg">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <Field label="Incident ID" value={<span className="font-mono">IRN-12345</span>} />
          <Field label="Challan Number" value={<span className="font-mono">MH012024789456</span>} />

          <Field
            label="Vehicle Number"
            value={<span className="font-mono">MH01AB1234</span>}
          />
          <Field label="State" value="Maharashtra" />

          <Field label="Fine Amount" value={<span className="font-mono">₹2,500</span>} />
          <Field
            label="TAT Deadline"
            value={<span className="font-semibold text-error">20 Aug 2026</span>}
          />
        </div>
      </Card>

      {/* Agent */}
      <div>
        <SectionLabel className="mb-2">Agent</SectionLabel>
        <Card padding="none">
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold t-body-sm">
              VR
            </div>
            <div className="flex-1 min-w-0">
              <div className="t-body font-semibold text-neutral-800">
                Vikram Rao
              </div>
              <div className="t-caption text-neutral-500">LLD-12121</div>
            </div>
            <button className="w-9 h-9 rounded-full bg-success-subtle flex items-center justify-center text-success-bold">
              <Phone size={14} />
            </button>
          </div>
        </Card>
      </div>

      {/* Timeline mini */}
      <div>
        <SectionLabel className="mb-2">Timeline</SectionLabel>
        <Card>
          <TimelineWithActions
            assignedTo={assignedTo}
            requestedDocs={requestedDocs}
            onOpenAssign={onOpenAssign}
            onOpenDocs={onOpenDocs}
          />
        </Card>
      </div>
    </>
  );
}

function NotesPanel() {
  const [notes, setNotes] = useState([
    {
      id: "n1",
      time: "10:42",
      body: "Client has previous challan history, will need to fetch records from RTO before filing dispute.",
    },
    {
      id: "n2",
      time: "10:38",
      body: "Arrived at MG Road; parking taken care of. Client waiting near metro exit.",
    },
  ]);
  const [draft, setDraft] = useState("");

  const wordCount = (s: string) =>
    s.trim().split(/\s+/).filter(Boolean).length;

  const addNote = () => {
    const body = draft.trim();
    if (!body) return;
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    setNotes((prev) => [
      { id: `n${prev.length + 1}`, time: `${hh}:${mm}`, body },
      ...prev,
    ]);
    setDraft("");
  };

  return (
    <>
      <div>
        <SectionLabel className="mb-2">Add a note</SectionLabel>
        <Card padding="md">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Capture what you saw or agreed with the client…"
            rows={4}
            className="w-full t-body text-neutral-800 placeholder:text-neutral-400 resize-none bg-transparent focus:outline-none"
          />
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
            <span className="t-caption text-neutral-500">
              {wordCount(draft)} word{wordCount(draft) === 1 ? "" : "s"}
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={addNote}
              disabled={!draft.trim()}
              leftIcon={<Plus size={14} />}
            >
              Save note
            </Button>
          </div>
        </Card>
      </div>

      <div>
        <SectionLabel className="mb-2">History ({notes.length})</SectionLabel>
        <div className="space-y-2">
          {notes.map((n) => (
            <Card key={n.id}>
              <div className="t-body-sm text-neutral-700 leading-relaxed">
                {n.body}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
                <span className="t-caption text-neutral-500">
                  {n.time} · {wordCount(n.body)} words
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setNotes((prev) => prev.filter((x) => x.id !== n.id))
                  }
                  className="t-caption font-semibold text-neutral-500 hover:text-error-bold"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
          {notes.length === 0 && (
            <Card padding="lg" className="text-center">
              <div className="t-body-sm text-neutral-400">No notes yet</div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="t-caption text-neutral-500">{label}</div>
      <div className="mt-1 t-body font-semibold text-neutral-800 break-words">
        {value}
      </div>
    </div>
  );
}

type StepStatus = "done" | "current" | "pending";

function StepDot({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <div className="w-[18px] h-[18px] rounded-full bg-success flex items-center justify-center">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 5.5L4 7.5L8 3"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  if (status === "current") {
    return (
      <div className="w-[18px] h-[18px] rounded-full border-2 border-warning bg-warning-subtle flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
      </div>
    );
  }
  return (
    <div className="w-[18px] h-[18px] rounded-full border-2 border-neutral-200 bg-white" />
  );
}

function TimelineWithActions({
  assignedTo,
  requestedDocs,
  onOpenAssign,
  onOpenDocs,
}: {
  assignedTo: TeamMember | null;
  requestedDocs: string[];
  onOpenAssign: () => void;
  onOpenDocs: () => void;
}) {
  return (
    <div>
      <TimelineRow status="done" label="Accepted" time="10:24" connectorClass="bg-success" />

      <TimelineRow
        status="current"
        label="In progress"
        time="10:41"
        connectorClass="bg-neutral-200"
      >
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileText size={14} />}
            onClick={onOpenDocs}
          >
            Request Documents
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Users size={14} />}
            onClick={onOpenAssign}
          >
            Assign to Team
          </Button>
        </div>
        {(assignedTo || requestedDocs.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {assignedTo && (
              <div className="inline-flex items-center gap-2 h-8 px-2.5 rounded-full bg-primary-50 text-primary-700 t-caption font-semibold">
                <Users size={12} />
                Assigned to {assignedTo.name}
              </div>
            )}
            {requestedDocs.length > 0 && (
              <div className="inline-flex items-center gap-2 h-8 px-2.5 rounded-full bg-info-subtle text-info-bold t-caption font-semibold">
                <FileText size={12} />
                {requestedDocs.length} doc{requestedDocs.length === 1 ? "" : "s"} requested
              </div>
            )}
          </div>
        )}
      </TimelineRow>

      <TimelineRow status="pending" label="Completion" isLast />
    </div>
  );
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
  {
    id: "m1",
    name: "Rohan Verma",
    initials: "RV",
    role: "Associate · Traffic",
    activeCases: 3,
    status: "active",
  },
  {
    id: "m2",
    name: "Aditi Kulkarni",
    initials: "AK",
    role: "Associate · RTO",
    activeCases: 5,
    status: "active",
  },
  {
    id: "m3",
    name: "Sameer Iqbal",
    initials: "SI",
    role: "Junior · Traffic",
    activeCases: 1,
    status: "offline",
  },
  {
    id: "m4",
    name: "Neha Rao",
    initials: "NR",
    role: "Associate · General",
    activeCases: 0,
    status: "active",
  },
];

function AssignToTeamSheet({
  open,
  onClose,
  onAssign,
}: {
  open: boolean;
  onClose: () => void;
  onAssign: (member: TeamMember) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? TEAM_MEMBERS.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q)
      )
    : TEAM_MEMBERS;

  const selected = TEAM_MEMBERS.find((m) => m.id === selectedId) ?? null;

  const handleClose = () => {
    onClose();
    window.setTimeout(() => {
      setQuery("");
      setSelectedId(null);
    }, 250);
  };

  const handleSelect = (m: TeamMember) => {
    setSelectedId(m.id);
    setQuery(m.name);
  };

  const handleClear = () => {
    setSelectedId(null);
    setQuery("");
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-[translate] duration-300 ease-out flex flex-col max-h-[85vh] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        <div className="px-4 pt-2 pb-2 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="t-h3 font-bold text-neutral-800">
              Assign to team
            </div>
            <div className="t-caption text-neutral-500 mt-0.5">
              Search and select a team member
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 -mr-1 shrink-0 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-500"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-1 pb-3 shrink-0">
          <div className="flex items-center gap-2 h-11 px-3 rounded-lg border border-[var(--border-default)] bg-white focus-within:border-primary-500 transition-colors">
            <Search size={16} className="text-neutral-600 shrink-0" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (selectedId) setSelectedId(null);
              }}
              placeholder="Search team members"
              className="flex-1 min-w-0 t-body text-neutral-800 bg-transparent focus:outline-none placeholder:text-neutral-500"
            />
            {(query || selected) && (
              <button
                type="button"
                onClick={handleClear}
                className="shrink-0 text-neutral-500 hover:text-neutral-700"
                aria-label="Clear"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div
          role="listbox"
          className="flex-1 min-h-0 overflow-y-auto px-4 pb-3"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-8 text-center t-body-sm text-neutral-400">
              No matches for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--border-default)] bg-white overflow-hidden divide-y divide-[var(--border-subtle)]">
              {filtered.map((m) => {
                const active = m.id === selectedId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => handleSelect(m)}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${
                      active
                        ? "bg-primary-50/70"
                        : "bg-white hover:bg-primary-50/40"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold t-caption">
                        {m.initials}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          m.status === "active"
                            ? "bg-success"
                            : "bg-neutral-300"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="t-body font-semibold text-neutral-800 truncate">
                        {m.name}
                      </div>
                      <div className="t-caption text-neutral-500 truncate">
                        {m.role} · {m.activeCases} active
                      </div>
                    </div>
                    {active && (
                      <div className="w-6 h-6 shrink-0 rounded-full bg-primary-600 text-white flex items-center justify-center">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 pt-3 pb-5 border-t border-[var(--border-subtle)] shrink-0">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selected}
            onClick={() => selected && onAssign(selected)}
          >
            {selected ? `Assign to ${selected.name}` : "Select a member"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TimelineRow({
  status,
  label,
  time,
  isLast,
  connectorClass,
  children,
}: {
  status: StepStatus;
  label: string;
  time?: string;
  isLast?: boolean;
  connectorClass?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3.5 pb-7 relative last:pb-0">
      {!isLast && (
        <div
          className={`absolute left-[10px] top-6 w-px h-full -translate-x-1/2 ${
            connectorClass ?? "bg-neutral-200"
          }`}
        />
      )}
      <div className="relative z-10 shrink-0 pt-0.5">
        <StepDot status={status} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`t-body-lg ${
              status === "pending"
                ? "text-neutral-400 font-medium"
                : "text-neutral-900 font-semibold"
            }`}
          >
            {label}
          </span>
          {time && (
            <span className="t-body-sm text-neutral-500 tabular font-medium">
              {time}
            </span>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

function CompleteUploadSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [receipt, setReceipt] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = receipt !== null && !submitted;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setTimeout(() => {
      router.push("/home");
    }, 1400);
  };

  const handleClose = () => {
    if (submitted) return;
    onClose();
    setTimeout(() => {
      setReceipt(null);
    }, 250);
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-[translate] duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex justify-center">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        {submitted ? (
          <div className="px-6 pt-6 pb-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-success-subtle flex items-center justify-center mb-3">
              <CheckCircle2 size={30} className="text-success-bold" />
            </div>
            <div className="t-h3 font-bold text-neutral-800">
              Submitted for verification
            </div>
            <div className="t-body-sm text-neutral-500 mt-1 max-w-[280px]">
              We&apos;ll notify you once the team confirms the uploads. Redirecting…
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 pt-2 pb-2 flex items-center justify-between gap-3">
              <div className="t-h3 font-bold text-neutral-800">
                Complete case
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-9 h-9 -mr-1 shrink-0 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-500"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 py-3">
              <UploadRow
                icon={<Receipt size={18} />}
                title="Payment receipt"
                subtitle="Challan payment / transaction receipt"
                file={receipt}
                onFile={setReceipt}
              />
            </div>

            <div className="px-4 pb-3">
              <div className="flex items-start gap-2.5 rounded-xl bg-info-subtle px-3 py-2.5">
                <ShieldCheck
                  size={16}
                  className="text-info-bold shrink-0 mt-0.5"
                />
                <div className="t-caption text-info-bold leading-relaxed">
                  Our team will verify the uploads within 24 hours before the case is marked complete.
                </div>
              </div>
            </div>

            <div className="px-4 pt-1 pb-5 space-y-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                Submit for verification
              </Button>
              <Button variant="ghost" fullWidth onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function UploadRow({
  icon,
  title,
  subtitle,
  file,
  onFile,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0];
    if (next) onFile(next);
    e.target.value = "";
  };

  const openPicker = () => inputRef.current?.click();

  if (file) {
    return (
      <div className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-success bg-success-subtle/60">
        <div className="w-10 h-10 rounded-lg bg-success flex items-center justify-center shrink-0 text-white">
          <Check size={18} strokeWidth={3} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="t-body font-semibold text-neutral-800 truncate">
            {title}
          </div>
          <div className="t-caption text-neutral-600 truncate mt-0.5">
            {file.name}
          </div>
        </div>
        <button
          type="button"
          onClick={openPicker}
          className="t-caption font-semibold text-primary-700 shrink-0 px-2 py-1 rounded-md hover:bg-white/60"
        >
          Replace
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={openPicker}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-[var(--border-subtle)] hover:border-primary-300 hover:bg-primary-50/40 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="t-body font-semibold text-neutral-800">{title}</div>
        <div className="t-caption text-neutral-500 mt-0.5">{subtitle}</div>
      </div>
      <ChevronRight size={16} className="text-neutral-300 shrink-0" />
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleChange}
      />
    </button>
  );
}

type DocOption = {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
};

const DOC_OPTIONS: DocOption[] = [
  {
    id: "driving-license",
    label: "Driving licence",
    hint: "Front & back, clear photo",
    icon: <IdCard size={18} />,
  },
  {
    id: "rc",
    label: "Registration certificate",
    hint: "RC book / smart card",
    icon: <Car size={18} />,
  },
  {
    id: "insurance",
    label: "Insurance policy",
    hint: "Valid on the date of incident",
    icon: <ShieldCheck size={18} />,
  },
  {
    id: "challan",
    label: "Original challan / notice",
    hint: "Physical or e-challan copy",
    icon: <Receipt size={18} />,
  },
  {
    id: "id-proof",
    label: "ID proof",
    hint: "Aadhaar / PAN / passport",
    icon: <ScrollText size={18} />,
  },
  {
    id: "address-proof",
    label: "Address proof",
    hint: "Utility bill / rent agreement",
    icon: <MapPin size={18} />,
  },
  {
    id: "vehicle-photos",
    label: "Vehicle photos",
    hint: "4 angles + number plate",
    icon: <Camera size={18} />,
  },
];

function RequestDocumentsSheet({
  open,
  initial,
  onClose,
  onSend,
}: {
  open: boolean;
  initial: string[];
  onClose: () => void;
  onSend: (ids: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(initial);

  useEffect(() => {
    if (open) setSelected(initial);
  }, [open, initial]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleClose = () => {
    onClose();
  };

  const canSend = selected.length > 0;

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-[translate] duration-300 ease-out flex flex-col max-h-[85vh] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        <div className="px-4 pt-2 pb-3 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="t-h3 font-bold text-neutral-800">
              Request documents
            </div>
            <div className="t-caption text-neutral-500 mt-0.5">
              Pick what the client needs to share
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 -mr-1 shrink-0 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-500"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-3 space-y-2">
          {DOC_OPTIONS.map((doc) => {
            const active = selected.includes(doc.id);
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => toggle(doc.id)}
                className={`w-full text-left rounded-xl border p-3 flex items-center gap-3 transition-colors ${
                  active
                    ? "border-primary-500 bg-primary-50/60"
                    : "border-[var(--border-default)] bg-white hover:border-primary-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    active
                      ? "bg-primary-100 text-primary-700"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {doc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="t-body font-semibold text-neutral-800 truncate">
                    {doc.label}
                  </div>
                  <div className="t-caption text-neutral-500 truncate mt-0.5">
                    {doc.hint}
                  </div>
                </div>
                <div
                  className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center transition-all ${
                    active
                      ? "bg-primary-600 text-white"
                      : "border-2 border-neutral-300 bg-white"
                  }`}
                  aria-hidden
                >
                  {active && <Check size={14} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-4 pt-3 pb-5 border-t border-[var(--border-subtle)] shrink-0">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canSend}
            onClick={() => onSend(selected)}
            rightIcon={<Send size={16} />}
          >
            {canSend
              ? `Send request (${selected.length})`
              : "Select at least one"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotCompletedSheet({
  open,
  reason,
  onReasonChange,
  onClose,
  onReviewCancel,
}: {
  open: boolean;
  reason: string;
  onReasonChange: (v: string) => void;
  onClose: () => void;
  onReviewCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const canContinue = reason.trim().length >= 3;

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
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-[translate] duration-300 ease-out flex flex-col ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        <div className="px-5 pt-2 pb-3 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="t-h3 font-bold text-neutral-800">
              Case not completed
            </div>
            <div className="t-body-sm text-neutral-500 mt-1">
              Tell us why you can&apos;t finish this case.
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

        <div className="px-5 pb-3 space-y-3">
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            maxLength={280}
            placeholder="e.g. Client no-show at pickup point, area not accessible, wrong doc type…"
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-default)] focus:outline-none focus:border-primary-500 t-body text-neutral-800 h-28 resize-none"
          />
          <div className="flex items-start gap-2 rounded-xl bg-warning-subtle border border-warning/30 px-3 py-2.5">
            <AlertTriangle
              size={16}
              className="text-warning-bold mt-0.5 shrink-0"
            />
            <p className="t-body-sm text-warning-bold font-medium leading-snug">
              Cancelling a case will affect your overall rating with us.
            </p>
          </div>
        </div>

        <div className="px-5 pt-2 pb-5 space-y-2 border-t border-[var(--border-subtle)]">
          <Button
            variant="destructive"
            size="lg"
            fullWidth
            disabled={!canContinue}
            onClick={onReviewCancel}
          >
            Continue to cancel
          </Button>
          <Button variant="ghost" size="lg" fullWidth onClick={onClose}>
            Keep case
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConfirmCancelDialog({
  open,
  cancelling,
  onKeep,
  onConfirm,
}: {
  open: boolean;
  cancelling: boolean;
  onKeep: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !cancelling) onKeep();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, cancelling, onKeep]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-cancel-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => !cancelling && onKeep()}
        className="absolute inset-0 bg-black/50 animate-[fadeInBackdrop_180ms_ease-out]"
      />
      <div className="relative w-full max-w-[340px] bg-white rounded-2xl shadow-e3 p-5 animate-[dialogIn_200ms_cubic-bezier(0.2,0,0,1)]">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-error-subtle text-error-bold flex items-center justify-center mb-3">
            <AlertTriangle size={24} />
          </div>
          <h3
            id="confirm-cancel-title"
            className="t-h3 font-bold text-neutral-800"
          >
            Cancel this case?
          </h3>
          <p className="t-body-sm text-neutral-600 mt-1.5">
            The client will be notified. This can&apos;t be undone.
          </p>
        </div>

        <div className="mt-5 flex gap-2">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            disabled={cancelling}
            onClick={onKeep}
          >
            Keep case
          </Button>
          <Button
            variant="destructive"
            size="md"
            fullWidth
            loading={cancelling}
            onClick={onConfirm}
          >
            {cancelling ? "Cancelling…" : "Yes, cancel"}
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes dialogIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

