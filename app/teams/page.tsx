"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card, Chip, SectionLabel } from "@/components/ui";
import {
  UserPlus,
  MapPin,
  Star,
  ChevronRight,
  Search,
  X,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  AlertTriangle,
  Trash2,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/Toast";

type MemberStatus = "active" | "invited" | "offline";
type CaseStatus = "in_progress" | "pending" | "completed";

type MemberCase = {
  irn: string;
  title: string;
  status: CaseStatus;
  deadlineDays: number | null;
  payout: number;
};

type Member = {
  id: string;
  name: string;
  initials: string;
  role: string;
  area: string;
  phone: string;
  email: string;
  joined: string;
  activeCases: number;
  completedCases: number;
  rating: number | null;
  status: MemberStatus;
  cases: MemberCase[];
};

const INITIAL_MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Rohan Verma",
    initials: "RV",
    role: "Associate · Traffic",
    area: "Koramangala",
    phone: "+91 98450 12345",
    email: "rohan.v@example.com",
    joined: "Feb 2025",
    activeCases: 3,
    completedCases: 24,
    rating: 4.7,
    status: "active",
    cases: [
      {
        irn: "IRN-100842",
        title: "Traffic challan · MG Road",
        status: "in_progress",
        deadlineDays: 4,
        payout: 850,
      },
      {
        irn: "IRN-100851",
        title: "Rear-end collision · ORR",
        status: "in_progress",
        deadlineDays: 9,
        payout: 1200,
      },
      {
        irn: "IRN-100867",
        title: "Overspeeding hearing · CCC",
        status: "pending",
        deadlineDays: 14,
        payout: 950,
      },
    ],
  },
  {
    id: "m2",
    name: "Aditi Kulkarni",
    initials: "AK",
    role: "Associate · RTO",
    area: "HSR Layout",
    phone: "+91 98867 22110",
    email: "aditi.k@example.com",
    joined: "Nov 2024",
    activeCases: 5,
    completedCases: 41,
    rating: 4.9,
    status: "active",
    cases: [
      {
        irn: "IRN-100844",
        title: "RTO ownership transfer",
        status: "in_progress",
        deadlineDays: 6,
        payout: 1500,
      },
      {
        irn: "IRN-100848",
        title: "Duplicate RC application",
        status: "in_progress",
        deadlineDays: 3,
        payout: 700,
      },
      {
        irn: "IRN-100855",
        title: "Address change · smart card",
        status: "in_progress",
        deadlineDays: 12,
        payout: 900,
      },
      {
        irn: "IRN-100861",
        title: "Fitness certificate renewal",
        status: "pending",
        deadlineDays: 20,
        payout: 650,
      },
      {
        irn: "IRN-100869",
        title: "NOC transfer · inter-state",
        status: "pending",
        deadlineDays: 25,
        payout: 1400,
      },
    ],
  },
  {
    id: "m3",
    name: "Sameer Iqbal",
    initials: "SI",
    role: "Junior · Traffic",
    area: "BTM",
    phone: "+91 99862 55401",
    email: "sameer.i@example.com",
    joined: "Apr 2025",
    activeCases: 1,
    completedCases: 8,
    rating: 4.4,
    status: "offline",
    cases: [
      {
        irn: "IRN-100846",
        title: "Overspeeding challan dispute",
        status: "in_progress",
        deadlineDays: 2,
        payout: 600,
      },
    ],
  },
  {
    id: "m4",
    name: "Neha Rao",
    initials: "NR",
    role: "Associate · General",
    area: "Indiranagar",
    phone: "+91 98008 71234",
    email: "",
    joined: "Aug 2026",
    activeCases: 0,
    completedCases: 0,
    rating: null,
    status: "invited",
    cases: [],
  },
];

const STATUS_META: Record<MemberStatus, { label: string; tone: "success" | "warning" | "neutral" }> = {
  active: { label: "Active", tone: "success" },
  invited: { label: "Invite sent", tone: "warning" },
  offline: { label: "Offline", tone: "neutral" },
};

const CASE_META: Record<CaseStatus, { label: string; tone: "primary" | "warning" | "success" }> = {
  in_progress: { label: "In progress", tone: "primary" },
  pending: { label: "Pending", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
};

export default function TeamsPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const toast = useToast();

  const selectedMember = useMemo(
    () => members.find((m) => m.id === selectedId) ?? null,
    [members, selectedId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.area.toLowerCase().includes(q)
    );
  }, [members, query]);

  const activeCount = members.filter((m) => m.status === "active").length;
  const totalCases = members.reduce((sum, m) => sum + m.activeCases, 0);

  const handleInvite = (phone: string) => {
    setMembers((prev) => [
      ...prev,
      {
        id: `m${prev.length + 1}-${Date.now()}`,
        name: phone,
        initials: "?",
        role: "Pending sign-up",
        area: "—",
        phone,
        email: "",
        joined: "Just now",
        activeCases: 0,
        completedCases: 0,
        rating: null,
        status: "invited",
        cases: [],
      },
    ]);
    setAddOpen(false);
    toast.show(`Invite sent to ${phone}`);
  };

  const handleRemove = (id: string) => {
    const removed = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setSelectedId(null);
    if (removed) toast.show(`${removed.name} removed from your team`);
  };

  const handleResend = (id: string) => {
    const m = members.find((x) => x.id === id);
    if (m) toast.show(`Invite resent to ${m.phone || m.name}`);
  };

  if (selectedMember) {
    return (
      <PhoneFrame label={`Team · ${selectedMember.name}`}>
        <MemberDetail
          member={selectedMember}
          onBack={() => setSelectedId(null)}
          onRemove={() => handleRemove(selectedMember.id)}
          onResend={() => handleResend(selectedMember.id)}
        />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame label="My Team">
      <AppBar back href="/home" title="My Team" />

      <div className="px-4 pt-4 pb-24 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Members" value={members.length} />
          <StatTile label="Active" value={activeCount} tone="success" />
          <StatTile label="Cases" value={totalCases} />
        </div>

        <div className="flex items-center gap-2 h-11 px-3 rounded-lg border border-[var(--border-default)] bg-white focus-within:border-primary-500 transition-colors">
          <Search size={16} className="text-neutral-500 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, role, area"
            className="flex-1 t-body text-neutral-800 focus:outline-none placeholder:text-neutral-500 bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="w-6 h-6 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div>
          {filtered.length === 0 ? (
            <Card padding="lg" className="text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                <UserPlus size={20} />
              </div>
              <div className="t-body-lg font-semibold text-neutral-800">
                {query ? "No matches" : "No team members yet"}
              </div>
              <div className="t-body-sm text-neutral-500 mt-1">
                {query
                  ? "Try a different name or area."
                  : "Invite sub-lawyers to help handle your caseload."}
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((m) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  onClick={() => setSelectedId(m.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          fullWidth
          leftIcon={<UserPlus size={18} />}
          onClick={() => setAddOpen(true)}
        >
          Add team member
        </Button>
      </div>

      <AddMemberSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onInvite={handleInvite}
      />
    </PhoneFrame>
  );
}

function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success";
}) {
  return (
    <div className="rounded-xl bg-white border border-[var(--border-default)] shadow-e1 px-3 py-3">
      <div className="t-caption font-semibold text-neutral-600 truncate">{label}</div>
      <div
        className={`t-h1 font-bold tabular mt-0.5 ${
          tone === "success" ? "text-success-bold" : "text-neutral-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function MemberCard({
  member,
  onClick,
}: {
  member: Member;
  onClick: () => void;
}) {
  const status = STATUS_META[member.status];
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl bg-white border border-[var(--border-default)] shadow-e1 p-3.5 flex items-center gap-3 hover:border-primary-300 transition-colors"
    >
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center t-body font-bold">
          {member.initials}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
            member.status === "active"
              ? "bg-success"
              : member.status === "invited"
                ? "bg-warning"
                : "bg-neutral-300"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="t-body-lg font-semibold text-neutral-900 truncate">
            {member.name}
          </div>
          {member.status !== "active" && (
            <Chip tone={status.tone} size="sm">
              {status.label}
            </Chip>
          )}
        </div>
        <div className="t-caption text-neutral-500 mt-0.5 truncate">
          {member.role}
        </div>
        <div className="mt-1.5 flex items-center gap-3 t-caption text-neutral-600">
          <span className="inline-flex items-center gap-1">
            <MapPin size={11} className="text-neutral-400" />
            {member.area}
          </span>
          <span className="text-neutral-300">·</span>
          <span className="tabular">
            {member.activeCases} case{member.activeCases === 1 ? "" : "s"}
          </span>
          {member.rating !== null && (
            <>
              <span className="text-neutral-300">·</span>
              <span className="inline-flex items-center gap-1 tabular">
                <Star size={11} className="text-accent-500 fill-accent-500" />
                {member.rating.toFixed(1)}
              </span>
            </>
          )}
        </div>
      </div>
      <ChevronRight size={16} className="text-neutral-300 shrink-0" />
    </button>
  );
}

function MemberDetail({
  member,
  onBack,
  onRemove,
  onResend,
}: {
  member: Member;
  onBack: () => void;
  onRemove: () => void;
  onResend: () => void;
}) {
  const status = STATUS_META[member.status];
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResendClick = () => {
    if (resending) return;
    setResending(true);
    window.setTimeout(() => {
      onResend();
      setResending(false);
    }, 800);
  };

  useEffect(() => {
    if (!confirmOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !removing) setConfirmOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [confirmOpen, removing]);

  const handleConfirm = () => {
    if (removing) return;
    setRemoving(true);
    window.setTimeout(() => {
      onRemove();
    }, 500);
  };

  return (
    <>
      <AppBar back onClick={onBack} title={member.name} />

      <div className="px-4 pt-4 pb-24 space-y-4">
        <Card padding="lg" className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center t-h1 font-bold">
              {member.initials}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-5 h-5 rounded-full ring-2 ring-white ${
                member.status === "active"
                  ? "bg-success"
                  : member.status === "invited"
                    ? "bg-warning"
                    : "bg-neutral-300"
              }`}
            />
          </div>
          <h2 className="t-h2 font-bold text-neutral-900">{member.name}</h2>
          <div className="t-body-sm text-neutral-500 mt-1">{member.role}</div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Chip tone={status.tone} size="sm" dot>
              {status.label}
            </Chip>
            {member.rating !== null && (
              <span className="inline-flex items-center gap-1 t-body-sm font-semibold text-neutral-800">
                <Star size={13} className="text-accent-500 fill-accent-500" />
                {member.rating.toFixed(1)}
              </span>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Active" value={member.activeCases} tone="success" />
          <StatTile label="Completed" value={member.completedCases} />
          <StatTile label="Rating" value={member.rating ?? 0} />
        </div>

        <div>
          <SectionLabel className="mb-2">Profile</SectionLabel>
          <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
            <InfoRow icon={<Phone size={16} />} label="Phone" value={member.phone} />
            {member.email && (
              <InfoRow icon={<Mail size={16} />} label="Email" value={member.email} />
            )}
            <InfoRow
              icon={<MapPin size={16} />}
              label="Working area"
              value={member.area}
            />
            <InfoRow
              icon={<Calendar size={16} />}
              label="Joined"
              value={member.joined}
            />
          </Card>
        </div>

        <div>
          <h2 className="t-h3 font-semibold text-neutral-800 mb-2">
            Assigned cases
          </h2>
          {member.cases.length === 0 ? (
            <Card padding="lg" className="text-center">
              <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                <Briefcase size={16} />
              </div>
              <div className="t-body-sm text-neutral-600">
                No cases assigned yet
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {member.cases.map((c) => (
                <CaseRow key={c.irn} caseItem={c} />
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 space-y-2">
          {member.status === "invited" && (
            <Button
              variant="primary"
              size="md"
              fullWidth
              leftIcon={<Send size={16} />}
              loading={resending}
              onClick={handleResendClick}
            >
              {resending ? "Resending…" : "Resend invite"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="md"
            fullWidth
            leftIcon={<Trash2 size={16} />}
            onClick={() => setConfirmOpen(true)}
            className="!text-error-bold hover:!bg-error-subtle/60"
          >
            Remove from team
          </Button>
        </div>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-title"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => !removing && setConfirmOpen(false)}
            className="absolute inset-0 bg-black/50 animate-[fadeInBackdrop_180ms_ease-out]"
          />
          <div className="relative w-full max-w-[340px] bg-white rounded-2xl shadow-e3 p-5 animate-[dialogIn_200ms_cubic-bezier(0.2,0,0,1)]">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-error-subtle text-error-bold flex items-center justify-center mb-3">
                <AlertTriangle size={24} />
              </div>
              <h3
                id="remove-title"
                className="t-h3 font-bold text-neutral-800"
              >
                Remove {member.name}?
              </h3>
              <p className="t-body-sm text-neutral-600 mt-1.5">
                They won&apos;t see new cases from your team. Any active cases
                assigned to them stay open.
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                disabled={removing}
                onClick={() => setConfirmOpen(false)}
              >
                Keep
              </Button>
              <Button
                variant="destructive"
                size="md"
                fullWidth
                loading={removing}
                onClick={handleConfirm}
              >
                {removing ? "Removing…" : "Yes, remove"}
              </Button>
            </div>
          </div>

          <style jsx global>{`
            @keyframes dialogIn {
              from { opacity: 0; transform: scale(0.96); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes fadeInBackdrop {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 min-h-[52px]">
      <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="t-caption text-neutral-500">{label}</div>
        <div className="t-body font-medium text-neutral-800 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

function CaseRow({ caseItem }: { caseItem: MemberCase }) {
  const meta = CASE_META[caseItem.status];
  const deadlineTone =
    caseItem.deadlineDays === null
      ? "neutral"
      : caseItem.deadlineDays <= 7
        ? "error"
        : "warning";
  return (
    <Link
      href="/incidents/active"
      className="block rounded-xl bg-white border border-[var(--border-default)] shadow-e1 p-3.5 hover:border-primary-300 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="t-body-lg font-semibold text-neutral-900 truncate">
            {caseItem.title}
          </div>
          <div className="t-caption text-neutral-500 mt-0.5 tabular">
            {caseItem.irn}
          </div>
        </div>
        <Chip tone={meta.tone} size="sm" className="shrink-0">
          {meta.label}
        </Chip>
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
        {caseItem.deadlineDays !== null ? (
          <Chip tone={deadlineTone} size="sm">
            {caseItem.deadlineDays} day{caseItem.deadlineDays === 1 ? "" : "s"} left
          </Chip>
        ) : (
          <span className="t-caption text-neutral-500">No deadline</span>
        )}
        <span className="t-body-sm font-semibold text-success-bold tabular">
          ₹{caseItem.payout.toLocaleString("en-IN")}
        </span>
      </div>
    </Link>
  );
}

function AddMemberSheet({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (phone: string) => void;
}) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      setPhone("");
      setEmail("");
      setPhoneTouched(false);
      setEmailTouched(false);
    }
  }, [open]);

  const phoneDigits = phone.replace(/\D/g, "");
  const phoneError =
    phoneDigits.length === 0
      ? "Mobile number is required."
      : !/^(91)?[6-9]\d{9}$/.test(phoneDigits)
        ? "Enter a valid 10-digit Indian mobile number."
        : null;
  const emailTrimmed = email.trim();
  const emailError =
    emailTrimmed.length === 0
      ? null
      : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailTrimmed)
        ? "Enter a valid email address."
        : null;
  const canSubmit = phoneError === null && emailError === null;
  const showPhoneError = phoneTouched && phoneError;
  const showEmailError = emailTouched && emailError;

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
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-transform duration-300 ease-out flex flex-col max-h-[92%] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        <div className="px-4 pt-2 pb-3 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="t-h3 font-bold text-neutral-800">
              Invite Sub-Lawyer
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 -mr-1 shrink-0 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-500"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pb-4 space-y-3 overflow-y-auto no-scrollbar">
          <Field
            label="Mobile number"
            required
            icon={<Phone size={14} className="text-neutral-400" />}
            error={showPhoneError ? phoneError : null}
          >
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, ""))}
              onBlur={() => setPhoneTouched(true)}
              placeholder="+91 98xxxxxxxx"
              inputMode="tel"
              aria-invalid={showPhoneError ? true : undefined}
              className={`w-full h-11 pl-9 pr-3 rounded-lg border bg-white t-body text-neutral-800 focus:outline-none placeholder:text-neutral-400 tabular ${
                showPhoneError
                  ? "border-error focus:border-error"
                  : "border-[var(--border-default)] focus:border-primary-500"
              }`}
            />
          </Field>
          <Field
            label="Email (optional)"
            icon={<Mail size={14} className="text-neutral-400" />}
            error={showEmailError ? emailError : null}
          >
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="name@example.com"
              inputMode="email"
              aria-invalid={showEmailError ? true : undefined}
              className={`w-full h-11 pl-9 pr-3 rounded-lg border bg-white t-body text-neutral-800 focus:outline-none placeholder:text-neutral-400 ${
                showEmailError
                  ? "border-error focus:border-error"
                  : "border-[var(--border-default)] focus:border-primary-500"
              }`}
            />
          </Field>

          <div className="rounded-lg bg-primary-50/60 border border-primary-100 p-3">
            <div className="t-body-sm font-semibold text-primary-800">
              What they can do
            </div>
            <ul className="mt-1.5 space-y-1 t-caption text-neutral-700">
              <li>• Handle cases you delegate to them</li>
              <li>• See their own earnings and payouts</li>
              <li>• Cannot invite other members</li>
            </ul>
          </div>
        </div>

        <div className="px-4 pt-3 pb-5 border-t border-[var(--border-subtle)] shrink-0 flex gap-2">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            disabled={!canSubmit}
            onClick={() => {
              setPhoneTouched(true);
              setEmailTouched(true);
              if (!canSubmit) return;
              onInvite(phone.trim());
            }}
          >
            Send invite
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  icon,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="t-caption font-semibold text-neutral-700">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </span>
      <div className="relative mt-1.5">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
        )}
        {children}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 t-caption font-medium text-error">
          <AlertTriangle size={12} />
          {error}
        </p>
      )}
    </label>
  );
}
