"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import {
  Check,
  CheckCheck,
  MessageSquarePlus,
  Paperclip,
  Search,
  X,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  LeadCategory,
  useLeadsStore,
} from "@/lib/leads-store";
import { requestOpenChatOnIncident } from "@/lib/chat-nav";
import { useEffect, useState } from "react";

type Status = "sent" | "delivered" | "read";

type ChatRow = {
  caseId: string;
  personName: string;
  category: LeadCategory;
  tatDays: number;
  lastMessage: string;
  hasAttachment?: boolean;
  outgoing: boolean;
  status?: Status;
  timeAgo: string;
  unread?: number;
};

const PREVIEWS: Omit<ChatRow, "caseId" | "category" | "tatDays">[] = [
  {
    personName: "Suresh Kulkarni",
    lastMessage: "Please share the RC and insurance copy, hearing is tomorrow.",
    outgoing: false,
    timeAgo: "2m ago",
    unread: 3,
  },
  {
    personName: "Mukesh Agarwal",
    hasAttachment: true,
    lastMessage: "Shared the latest challan copy from the portal — please confirm.",
    outgoing: true,
    status: "read",
    timeAgo: "30m ago",
  },
  {
    personName: "Farhan Qureshi",
    lastMessage: "Awaiting confirmation from finance before raising the refund.",
    outgoing: true,
    status: "delivered",
    timeAgo: "53m ago",
  },
  {
    personName: "Rohan Deshpande",
    lastMessage: "Court hearing deferred to next Monday due to clerical delay.",
    outgoing: true,
    status: "delivered",
    timeAgo: "58m ago",
  },
  {
    personName: "Aisha Khan",
    lastMessage: "Need a screenshot of the virtual court status, link not opening.",
    outgoing: false,
    timeAgo: "1h ago",
    unread: 3,
  },
  {
    personName: "Meera Iyer",
    lastMessage: "Will be at the RTO tomorrow morning, keep the dept slip ready.",
    outgoing: true,
    status: "read",
    timeAgo: "1h ago",
  },
];

type Filter = "all" | "unread";

export default function ChatsPage() {
  const { assigned } = useLeadsStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [newChatOpen, setNewChatOpen] = useState(false);

  const rows: ChatRow[] = PREVIEWS.map((p, i) => {
    const inc = assigned[i % Math.max(assigned.length, 1)];
    const caseId = inc?.caseId ?? `IRN-12${345 + i}`;
    const category = inc?.category ?? "challan";
    const tatDays = inc ? inc.deadlineDays - 50 : -50 - i * 10;
    return { ...p, caseId, category, tatDays };
  });

  const unreadCount = rows.filter((r) => (r.unread ?? 0) > 0).length;
  const visible = filter === "unread" ? rows.filter((r) => (r.unread ?? 0) > 0) : rows;

  return (
    <PhoneFrame label="Chats">
      <AppBar title="Chats" />

      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <label className="flex items-center gap-2 h-10 px-3 rounded-xl border border-[var(--border-default)] bg-white">
          <Search size={16} className="text-neutral-400" />
          <input
            className="flex-1 bg-transparent t-body-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
            placeholder="Search by IRN or message"
          />
        </label>
      </div>

      {/* Filter chips */}
      <div className="px-4 pb-2 flex items-center gap-2">
        <FilterChip
          label="All"
          count={rows.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterChip
          label="Unread"
          count={unreadCount}
          active={filter === "unread"}
          onClick={() => setFilter("unread")}
        />
      </div>

      {/* List */}
      <div className="pb-20">
        {visible.map((row, i) => (
          <ChatListRow key={`${row.caseId}-${i}`} row={row} />
        ))}
      </div>

      <div className="sticky bottom-24 z-20 self-end mr-4 mb-2 pointer-events-none">
        <button
          type="button"
          onClick={() => setNewChatOpen(true)}
          aria-label="Start new chat"
          className="pointer-events-auto h-13 pl-4 pr-5 inline-flex items-center gap-2 rounded-full bg-primary-600 text-white shadow-e3 hover:bg-primary-700 active:scale-[0.98] transition-all"
          style={{ height: 52 }}
        >
          <MessageSquarePlus size={18} />
          <span className="t-body-sm font-semibold">New chat</span>
        </button>
      </div>

      <NewChatSheet
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
      />

      <BottomTabBar active="chats" />
    </PhoneFrame>
  );
}

function NewChatSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [batchId, setBatchId] = useState("");
  const [incidentId, setIncidentId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setBatchId("");
      setIncidentId("");
      setError(null);
    }
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batchId.trim().toUpperCase();
    const incident = incidentId.trim().toUpperCase();
    if (!batch && !incident) {
      setError("Enter a Batch ID or Incident ID to continue.");
      return;
    }
    requestOpenChatOnIncident(incident || batch);
    onClose();
    router.push("/incidents/active");
  };

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
            <div className="t-h3 font-bold text-neutral-800">New chat</div>
            <div className="t-caption text-neutral-500 mt-0.5">
              Open a chat by Batch ID or Incident ID.
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

        <form onSubmit={submit} className="px-4 pb-5 space-y-3">
          <label className="block">
            <span className="t-caption font-semibold text-neutral-600">
              Batch ID
            </span>
            <input
              autoFocus
              value={batchId}
              onChange={(e) => {
                setBatchId(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. BATCH-2410"
              className="mt-1.5 w-full h-11 px-3 rounded-xl border border-[var(--border-default)] bg-white t-body text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500"
            />
          </label>
          <label className="block">
            <span className="t-caption font-semibold text-neutral-600">
              Incident ID
            </span>
            <input
              value={incidentId}
              onChange={(e) => {
                setIncidentId(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. IRN-100842"
              className="mt-1.5 w-full h-11 px-3 rounded-xl border border-[var(--border-default)] bg-white t-body text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500"
            />
          </label>
          {error && (
            <span className="block t-caption text-error-bold">
              {error}
            </span>
          )}
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-primary-600 text-white t-body font-semibold hover:bg-primary-700 active:scale-[0.99] transition-all"
          >
            Start chat
          </button>
        </form>
      </div>
    </div>
  );
}

function ChatListRow({ row }: { row: ChatRow }) {
  const unread = (row.unread ?? 0) > 0;
  return (
    <Link
      href={`/chats/${encodeURIComponent(row.caseId)}/open`}
      onPointerDown={() => requestOpenChatOnIncident(row.caseId)}
      className={`block px-3 py-3 border-b border-[var(--border-subtle)] active:bg-neutral-100 ${
        unread ? "bg-primary-50/60" : "bg-white"
      }`}
    >
      <div>
        {/* Title row: ID + chips + time */}
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1 flex items-center flex-wrap gap-x-1.5 gap-y-1">
            <span className="t-body-sm font-bold text-neutral-900 shrink-0">
              {row.caseId}
            </span>
            <CategoryChip category={row.category} />
            <TatChip days={row.tatDays} />
          </div>
          <span
            className={`t-caption shrink-0 ${
              unread ? "text-primary-700 font-semibold" : "text-neutral-500"
            }`}
          >
            {row.timeAgo}
          </span>
        </div>

        {/* Person name */}
        <div className="mt-0.5 t-caption text-neutral-500 truncate">
          {row.personName}
        </div>

        {/* Message row */}
        <div className="mt-1 flex items-center gap-1.5">
          {row.outgoing && <StatusTick status={row.status} />}
          {row.hasAttachment && (
            <Paperclip size={12} className="shrink-0 text-neutral-500" />
          )}
          <p
            className={`min-w-0 t-body-sm truncate ${
              unread ? "text-neutral-900 font-medium" : "text-neutral-500"
            }`}
          >
            {row.lastMessage}
          </p>
          {unread && (
            <span className="ml-auto shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-primary-600 text-white t-micro font-semibold flex items-center justify-center">
              {row.unread}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full border t-body-sm font-semibold transition-colors ${
        active
          ? "bg-primary-600 border-primary-600 text-white"
          : "bg-white border-[var(--border-default)] text-neutral-700"
      }`}
    >
      {label}
      <span
        className={`min-w-[18px] h-[18px] px-1.5 inline-flex items-center justify-center rounded-full t-micro font-semibold tabular ${
          active ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function CategoryChip({ category }: { category: LeadCategory }) {
  const tone: Record<
    LeadCategory,
    { bg: string; text: string; border: string }
  > = {
    challan: {
      bg: "bg-success-subtle",
      text: "text-success-bold",
      border: "border-success/30",
    },
    case: {
      bg: "bg-info-subtle",
      text: "text-info-bold",
      border: "border-info/30",
    },
    rto: {
      bg: "bg-warning-subtle",
      text: "text-warning-bold",
      border: "border-warning/40",
    },
  };
  const t = tone[category];
  return (
    <span
      className={`inline-flex items-center h-5 px-1.5 rounded-md border t-micro font-semibold ${t.bg} ${t.text} ${t.border}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

function TatChip({ days }: { days: number }) {
  const overdue = days < 0;
  return (
    <span
      className={`inline-flex items-center h-5 px-1.5 rounded-md border t-micro font-semibold ${
        overdue
          ? "border-error/30 bg-error-subtle text-error-bold"
          : "border-neutral-200 bg-neutral-50 text-neutral-600"
      }`}
    >
      {days}d
    </span>
  );
}

function StatusTick({ status }: { status?: Status }) {
  if (status === "sent") {
    return <Check size={12} className="shrink-0 text-neutral-400" />;
  }
  if (status === "delivered") {
    return <CheckCheck size={12} className="shrink-0 text-neutral-400" />;
  }
  if (status === "read") {
    return <CheckCheck size={12} className="shrink-0 text-info" />;
  }
  return null;
}
