"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Camera,
  Check,
  CheckCheck,
  Clock,
  Copy,
  CornerUpLeft,
  Download,
  FileText,
  Image as ImageIcon,
  Lock,
  Mic,
  Paperclip,
  Play,
  RefreshCcw,
  Send,
  Trash2,
  X,
  ZoomIn,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================================
   Types
   ============================================================ */

type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

type ChatImage = {
  src: string;
  alt?: string;
};

type ChatDocument = {
  name: string;
  sizeLabel: string;
  mime?: string;
};

export type ReplyTo = {
  id: string;
  sender: "lawyer" | "ops";
  senderName?: string;
  preview: string;
};

export type ChatMessage =
  | {
      id: string;
      kind: "text";
      sender: "lawyer" | "ops";
      senderName?: string;
      body: string;
      at: Date;
      status?: MessageStatus;
      replyTo?: ReplyTo;
    }
  | {
      id: string;
      kind: "image";
      sender: "lawyer" | "ops";
      senderName?: string;
      images: ChatImage[];
      caption?: string;
      at: Date;
      status?: MessageStatus;
      replyTo?: ReplyTo;
      uploadingProgress?: number;
    }
  | {
      id: string;
      kind: "document";
      sender: "lawyer" | "ops";
      senderName?: string;
      doc: ChatDocument;
      at: Date;
      status?: MessageStatus;
      replyTo?: ReplyTo;
      uploadingProgress?: number;
    }
  | {
      id: string;
      kind: "voice";
      sender: "lawyer" | "ops";
      senderName?: string;
      durationSec: number;
      at: Date;
      status?: MessageStatus;
      replyTo?: ReplyTo;
    }
  | {
      id: string;
      kind: "system";
      body: string;
      at: Date;
    };

type Props = {
  caseId: string;
  mode?: "active" | "readOnly";
  initialMessages?: ChatMessage[];
  opsTyping?: boolean;
  /** Pre-canned chips that fill the composer when tapped (empty state only) */
  quickReplies?: string[];
};

/* ============================================================
   Defaults
   ============================================================ */

const DEFAULT_QUICK_REPLIES = [
  "Need documents",
  "Incident details unclear",
  "Need a screenshot",
];

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: "s0",
    kind: "system",
    body: "Chat started · you can message the team here",
    at: minutesAgo(145),
  },
  {
    id: "m1",
    kind: "text",
    sender: "lawyer",
    body: "Reached MG Road for the challan handover. The client hasn't shared the RC book yet.",
    at: minutesAgo(140),
    status: "read",
  },
  {
    id: "m2",
    kind: "text",
    sender: "ops",
    senderName: "Priya",
    body: "On it. Pinging the client now — give us 2 min.",
    at: minutesAgo(138),
  },
  {
    id: "m3",
    kind: "text",
    sender: "ops",
    senderName: "Priya",
    body: "Can you share a photo of the physical challan copy? Just to double-check the challan number before we file.",
    at: minutesAgo(135),
  },
  {
    id: "m4",
    kind: "image",
    sender: "lawyer",
    images: [{ src: "/active-incident-3d.png", alt: "Challan photo" }],
    caption: "Physical copy. MH012024789456.",
    at: minutesAgo(130),
    status: "read",
  },
  {
    id: "m5",
    kind: "text",
    sender: "ops",
    senderName: "Priya",
    body: "Got it, challan number matches. Sharing the pre-filled dispute PDF — please print and get the client to sign.",
    at: minutesAgo(125),
  },
  {
    id: "m6",
    kind: "document",
    sender: "ops",
    senderName: "Priya",
    doc: {
      name: "dispute-form-MH012024.pdf",
      sizeLabel: "412 KB",
      mime: "application/pdf",
    },
    at: minutesAgo(124),
  },
  {
    id: "m7",
    kind: "text",
    sender: "lawyer",
    body: "Downloaded. Will share signed copy in 10 min.",
    at: minutesAgo(10),
    status: "delivered",
  },
];

function minutesAgo(mins: number): Date {
  return new Date(Date.now() - mins * 60 * 1000);
}

/* ============================================================
   Main component
   ============================================================ */

export function IncidentChatPanel({
  mode = "active",
  initialMessages,
  opsTyping = false,
  quickReplies = DEFAULT_QUICK_REPLIES,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? DEFAULT_MESSAGES
  );
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [longPressFor, setLongPressFor] = useState<string | null>(null);
  const [viewer, setViewer] = useState<ChatImage | null>(null);
  const [attachOpen, setAttachOpen] = useState(false);
  const [hintSeen, setHintSeen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [scrolledUp, setScrolledUp] = useState(false);
  const [newSinceScrollUp, setNewSinceScrollUp] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(messages.length);
  const scrolledUpRef = useRef(false);

  const hasMessages = messages.filter((m) => m.kind !== "system").length > 0;

  // Scroll to bottom on first mount & when new message added (unless user scrolled up)
  useEffect(() => {
    const changed = messages.length - prevCountRef.current;
    prevCountRef.current = messages.length;
    if (!scrolledUpRef.current) {
      bottomSentinelRef.current?.scrollIntoView({ block: "end" });
    } else if (changed > 0) {
      setNewSinceScrollUp((n) => n + changed);
    }
  }, [messages]);

  const flashToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isUp = fromBottom > 48;
    scrolledUpRef.current = isUp;
    setScrolledUp(isUp);
    if (!isUp && newSinceScrollUp !== 0) setNewSinceScrollUp(0);
  };

  const scrollToBottom = () => {
    bottomSentinelRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setScrolledUp(false);
    setNewSinceScrollUp(0);
  };

  const sendText = (body: string) => {
    const trimmed = body.trim();
    if (!trimmed || trimmed.length > 2000) return;
    const id = `m-${Date.now()}`;
    const newMsg: ChatMessage = {
      id,
      kind: "text",
      sender: "lawyer",
      body: trimmed,
      at: new Date(),
      status: "sending",
      replyTo: replyTo ?? undefined,
    };
    setMessages((prev) => [...prev, newMsg]);
    setDraft("");
    setReplyTo(null);
    if (!hintSeen) setHintSeen(true);
    // Simulate server ack
    window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id && m.kind === "text" ? { ...m, status: "sent" } : m
        )
      );
    }, 500);
    window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id && m.kind === "text" ? { ...m, status: "delivered" } : m
        )
      );
    }, 1200);
    window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id && m.kind === "text" ? { ...m, status: "read" } : m
        )
      );
    }, 2800);
  };

  const retrySend = (id: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id && (m.kind === "text" || m.kind === "image" || m.kind === "document" || m.kind === "voice")
          ? { ...m, status: "sending" }
          : m
      )
    );
    window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id && (m.kind === "text" || m.kind === "image" || m.kind === "document" || m.kind === "voice")
            ? { ...m, status: "sent" }
            : m
        )
      );
    }, 900);
  };

  const openReply = (m: ChatMessage) => {
    setLongPressFor(null);
    if (m.kind === "system") return;
    const preview =
      m.kind === "text"
        ? m.body
        : m.kind === "image"
          ? m.caption || "Photo"
          : m.kind === "voice"
            ? "Voice message"
            : m.doc.name;
    setReplyTo({
      id: m.id,
      sender: m.sender,
      senderName: m.sender === "lawyer" ? "You" : m.senderName || "Support",
      preview,
    });
  };

  const copyMessage = async (m: ChatMessage) => {
    setLongPressFor(null);
    if (m.kind !== "text") return;
    try {
      await navigator.clipboard.writeText(m.body);
      flashToast("Copied");
    } catch {
      flashToast("Could not copy");
    }
  };

  const attachImage = () => {
    setAttachOpen(false);
    const id = `m-${Date.now()}`;
    const newMsg: ChatMessage = {
      id,
      kind: "image",
      sender: "lawyer",
      images: [{ src: "/active-incident-3d.png", alt: "Attachment" }],
      at: new Date(),
      status: "sending",
      uploadingProgress: 20,
      replyTo: replyTo ?? undefined,
    };
    setMessages((prev) => [...prev, newMsg]);
    setReplyTo(null);
    let p = 20;
    const t = window.setInterval(() => {
      p += 20;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id && m.kind === "image"
            ? { ...m, uploadingProgress: Math.min(p, 100) }
            : m
        )
      );
      if (p >= 100) {
        window.clearInterval(t);
        window.setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === id && m.kind === "image"
                ? { ...m, status: "sent", uploadingProgress: undefined }
                : m
            )
          );
        }, 250);
      }
    }, 220);
  };

  const sendVoice = (durationSec: number) => {
    const id = `m-${Date.now()}`;
    const newMsg: ChatMessage = {
      id,
      kind: "voice",
      sender: "lawyer",
      durationSec,
      at: new Date(),
      status: "sending",
      replyTo: replyTo ?? undefined,
    };
    setMessages((prev) => [...prev, newMsg]);
    setReplyTo(null);
    window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id && m.kind === "voice" ? { ...m, status: "sent" } : m
        )
      );
    }, 600);
    window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id && m.kind === "voice" ? { ...m, status: "delivered" } : m
        )
      );
    }, 1400);
  };

  const attachDocument = () => {
    setAttachOpen(false);
    const id = `m-${Date.now()}`;
    const newMsg: ChatMessage = {
      id,
      kind: "document",
      sender: "lawyer",
      doc: {
        name: "signed-dispute-form.pdf",
        sizeLabel: "1.1 MB",
        mime: "application/pdf",
      },
      at: new Date(),
      status: "sending",
      uploadingProgress: 15,
      replyTo: replyTo ?? undefined,
    };
    setMessages((prev) => [...prev, newMsg]);
    setReplyTo(null);
    let p = 15;
    const t = window.setInterval(() => {
      p += 25;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id && m.kind === "document"
            ? { ...m, uploadingProgress: Math.min(p, 100) }
            : m
        )
      );
      if (p >= 100) {
        window.clearInterval(t);
        window.setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === id && m.kind === "document"
                ? { ...m, status: "sent", uploadingProgress: undefined }
                : m
            )
          );
        }, 300);
      }
    }, 240);
  };

  // Group messages by day
  const grouped = useMemo(() => groupByDay(messages), [messages]);
  const overLimit = draft.length > 2000;
  const canSend = draft.trim().length > 0 && !overLimit && mode === "active";

  const readOnly = mode === "readOnly";

  return (
    <div className="relative -mx-4 -my-4 flex flex-col grow min-h-0">
      {/* Message list */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto no-scrollbar px-3 pt-3 pb-2 space-y-2 bg-[var(--surface-bg)]"
      >
        {!hasMessages && !readOnly ? (
          <EmptyChatState
            quickReplies={quickReplies}
            onChipTap={(label) => setDraft(label)}
          />
        ) : (
          grouped.map((group) => (
            <div key={group.key} className="space-y-2">
              <DateSeparator label={group.label} />
              {group.items.map((m) => (
                <MessageRow
                  key={m.id}
                  message={m}
                  showMenu={longPressFor === m.id}
                  onLongPress={() => setLongPressFor(m.id)}
                  onDismissMenu={() => setLongPressFor(null)}
                  onReply={() => openReply(m)}
                  onCopy={() => copyMessage(m)}
                  onViewImage={(img) => setViewer(img)}
                  onRetry={() => retrySend(m.id)}
                />
              ))}
            </div>
          ))
        )}

        {opsTyping && !readOnly && <TypingIndicator name="Priya" />}

        <div ref={bottomSentinelRef} />
      </div>

      {/* First-send hint */}
      {!hintSeen && hasMessages && !readOnly && (
        <OneTimeHint onClose={() => setHintSeen(true)} />
      )}

      {/* "New messages" pill when scrolled up */}
      {scrolledUp && newSinceScrollUp > 0 && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute left-1/2 -translate-x-1/2 bottom-24 z-20 px-3 h-8 rounded-full bg-neutral-900 text-white t-caption font-semibold shadow-e2 inline-flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary-300" />
          {newSinceScrollUp} new message{newSinceScrollUp === 1 ? "" : "s"}
        </button>
      )}

      {/* Reply preview */}
      {replyTo && !readOnly && (
        <div className="relative px-3 pt-2 border-t border-[var(--border-subtle)] bg-white">
          <div className="rounded-lg bg-primary-50/70 border-l-2 border-primary-500 px-3 py-2 pr-9">
            <div className="t-caption font-semibold text-primary-700">
              Replying to {replyTo.senderName}
            </div>
            <div className="t-caption text-neutral-600 truncate">
              {replyTo.preview}
            </div>
          </div>
          <button
            type="button"
            aria-label="Cancel reply"
            onClick={() => setReplyTo(null)}
            className="absolute right-4 top-3 w-7 h-7 rounded-full text-neutral-500 hover:bg-neutral-100 flex items-center justify-center"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Composer / read-only banner */}
      {readOnly ? (
        <ReadOnlyBanner />
      ) : (
        <Composer
          draft={draft}
          onDraftChange={setDraft}
          onSend={() => sendText(draft)}
          onOpenAttach={() => setAttachOpen((o) => !o)}
          onOpenCamera={attachImage}
          onSendVoice={sendVoice}
          canSend={canSend}
          overLimit={overLimit}
        />
      )}

      {/* Attachment picker */}
      {attachOpen && !readOnly && (
        <AttachmentPicker
          onClose={() => setAttachOpen(false)}
          onCamera={attachImage}
          onGallery={attachImage}
          onDocument={attachDocument}
        />
      )}

      {/* Image viewer */}
      {viewer && (
        <ImageViewer image={viewer} onClose={() => setViewer(null)} />
      )}

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-30 flex justify-center px-4">
          <div className="pointer-events-auto inline-flex items-center gap-2 max-w-[92%] px-4 h-10 rounded-full bg-neutral-900 text-white shadow-e2">
            <Check size={14} />
            <span className="t-body-sm font-medium truncate">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Pieces
   ============================================================ */

function EmptyChatState({
  quickReplies,
  onChipTap,
}: {
  quickReplies: string[];
  onChipTap: (label: string) => void;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6 py-8">
      <div className="w-14 h-14 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-6l-4 4v-4H6a2 2 0 01-2-2V6z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="mt-4 t-body-lg font-semibold text-neutral-800">
        Need documents or details?
      </h3>
      <p className="mt-1 t-body-sm text-neutral-500 max-w-[260px]">
        Message the support team here. All replies stay linked to this incident.
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {quickReplies.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => onChipTap(label)}
            className="h-9 px-3.5 rounded-full border border-primary-200 bg-primary-50/60 text-primary-700 t-body-sm font-semibold hover:bg-primary-50"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 inline-flex items-center gap-1.5 t-caption text-neutral-500">
        <Lock size={12} />
        Messages can&apos;t be deleted once sent.
      </div>
    </div>
  );
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center my-2">
      <span className="t-caption font-semibold text-neutral-500 bg-white/90 border border-[var(--border-subtle)] rounded-full px-3 py-0.5">
        {label}
      </span>
    </div>
  );
}

function MessageRow(props: {
  message: ChatMessage;
  showMenu: boolean;
  onLongPress: () => void;
  onDismissMenu: () => void;
  onReply: () => void;
  onCopy: () => void;
  onViewImage: (img: ChatImage) => void;
  onRetry: () => void;
}) {
  if (props.message.kind === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="t-caption text-neutral-500 bg-neutral-100 rounded-full px-3 py-1">
          {props.message.body}
        </span>
      </div>
    );
  }
  return <ChatBubbleRow {...props} message={props.message} />;
}

function ChatBubbleRow({
  message,
  showMenu,
  onLongPress,
  onDismissMenu,
  onReply,
  onCopy,
  onViewImage,
  onRetry,
}: {
  message: Exclude<ChatMessage, { kind: "system" }>;
  showMenu: boolean;
  onLongPress: () => void;
  onDismissMenu: () => void;
  onReply: () => void;
  onCopy: () => void;
  onViewImage: (img: ChatImage) => void;
  onRetry: () => void;
}) {
  const own = message.sender === "lawyer";
  const timeLabel = formatTime(message.at);

  // Long-press detection
  const timerRef = useRef<number | null>(null);
  const start = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    timerRef.current = window.setTimeout(() => {
      onLongPress();
      timerRef.current = null;
    }, 450);
  };
  const cancel = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const bubbleTone = own
    ? "bg-primary-600 text-white shadow-e1"
    : "bg-white text-neutral-800 border border-[var(--border-subtle)]";
  const metaTone = own ? "text-primary-100" : "text-neutral-500";

  return (
    <div className={cn("flex items-end gap-1.5", own ? "justify-end" : "justify-start")}>
      {!own && (
        <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center t-caption font-semibold shrink-0 mb-1">
          {initials(message.senderName || "Support")}
        </div>
      )}
      <div
        className={cn(
          "relative max-w-[82%] min-w-0 flex flex-col",
          own ? "items-end" : "items-start"
        )}
      >
        {!own && (
          <div className="t-caption text-neutral-500 font-semibold mb-0.5 ml-2">
            {message.senderName || "Support"}
          </div>
        )}
        <div
          onPointerDown={start}
          onPointerUp={cancel}
          onPointerLeave={cancel}
          onPointerCancel={cancel}
          onContextMenu={(e) => {
            e.preventDefault();
            onLongPress();
          }}
          className={cn(
            "relative rounded-2xl px-3 py-2 select-none",
            bubbleTone,
            own ? "rounded-br-sm" : "rounded-bl-sm"
          )}
        >
          {message.replyTo && (
            <div
              className={cn(
                "rounded-md border-l-2 px-2 py-1 mb-1.5 text-left",
                own
                  ? "bg-primary-700/40 border-white/70"
                  : "bg-primary-50 border-primary-500"
              )}
            >
              <div
                className={cn(
                  "t-caption font-semibold",
                  own ? "text-white" : "text-primary-700"
                )}
              >
                {message.replyTo.senderName}
              </div>
              <div
                className={cn(
                  "t-caption truncate",
                  own ? "text-primary-50/90" : "text-neutral-600"
                )}
              >
                {message.replyTo.preview}
              </div>
            </div>
          )}

          {message.kind === "text" && (
            <p className="t-body whitespace-pre-wrap break-words leading-snug">
              {linkify(message.body)}
            </p>
          )}

          {message.kind === "image" && (
            <ImageBubble
              message={message}
              own={own}
              onViewImage={onViewImage}
            />
          )}

          {message.kind === "document" && (
            <DocumentBubble message={message} own={own} />
          )}

          {message.kind === "voice" && (
            <VoiceBubble message={message} own={own} />
          )}

          <div
            className={cn(
              "mt-1 flex items-center gap-1 justify-end",
              own ? "" : "justify-end"
            )}
          >
            <span className={cn("t-micro tabular", metaTone)}>{timeLabel}</span>
            {own && <StatusTicks status={message.status} own />}
          </div>
        </div>

        {/* Failed state actions */}
        {own && message.status === "failed" && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-1 inline-flex items-center gap-1 t-caption text-error-bold font-semibold"
          >
            <RefreshCcw size={12} />
            Tap to retry
          </button>
        )}

        {/* Long-press menu */}
        {showMenu && (
          <div
            className="absolute z-30 -top-2 -translate-y-full"
            style={own ? { right: 0 } : { left: 0 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-e2 border border-[var(--border-subtle)] py-1 min-w-[150px]"
            >
              <button
                type="button"
                onClick={onReply}
                className="w-full text-left px-3 py-2 flex items-center gap-2 t-body-sm text-neutral-800 hover:bg-neutral-50"
              >
                <CornerUpLeft size={14} />
                Reply
              </button>
              {message.kind === "text" && (
                <button
                  type="button"
                  onClick={onCopy}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 t-body-sm text-neutral-800 hover:bg-neutral-50"
                >
                  <Copy size={14} />
                  Copy
                </button>
              )}
            </div>
            {/* Backdrop to dismiss */}
            <button
              type="button"
              aria-label="Close menu"
              onClick={onDismissMenu}
              className="fixed inset-0 -z-10 cursor-default"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ImageBubble({
  message,
  own,
  onViewImage,
}: {
  message: Extract<ChatMessage, { kind: "image" }>;
  own: boolean;
  onViewImage: (img: ChatImage) => void;
}) {
  const uploading = message.uploadingProgress !== undefined;
  const first = message.images[0];
  return (
    <div className="min-w-[180px]">
      <button
        type="button"
        onClick={() => !uploading && onViewImage(first)}
        className="relative w-full rounded-lg overflow-hidden bg-neutral-100 aspect-[4/3]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={first.src}
          alt={first.alt || "Attachment"}
          className="w-full h-full object-cover"
        />
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-white/60 border-t-white animate-spin" />
          </div>
        )}
        {!uploading && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/40 rounded-full w-7 h-7 flex items-center justify-center text-white">
            <ZoomIn size={14} />
          </div>
        )}
      </button>
      {uploading && (
        <div
          className={cn(
            "mt-1.5 h-1 rounded-full overflow-hidden",
            own ? "bg-primary-700/50" : "bg-neutral-200"
          )}
        >
          <div
            className={cn(
              "h-full transition-all",
              own ? "bg-white" : "bg-primary-600"
            )}
            style={{ width: `${message.uploadingProgress ?? 0}%` }}
          />
        </div>
      )}
      {message.caption && (
        <p
          className={cn(
            "mt-1.5 t-body whitespace-pre-wrap break-words",
            own ? "text-white" : "text-neutral-800"
          )}
        >
          {message.caption}
        </p>
      )}
    </div>
  );
}

function DocumentBubble({
  message,
  own,
}: {
  message: Extract<ChatMessage, { kind: "document" }>;
  own: boolean;
}) {
  const uploading = message.uploadingProgress !== undefined;
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 min-w-[220px] max-w-[280px] rounded-lg p-2",
        own ? "bg-primary-700/40" : "bg-primary-50/70"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          own ? "bg-white/15 text-white" : "bg-primary-100 text-primary-700"
        )}
      >
        <FileText size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "t-body-sm font-semibold truncate",
            own ? "text-white" : "text-neutral-800"
          )}
        >
          {message.doc.name}
        </div>
        <div
          className={cn(
            "t-caption truncate",
            own ? "text-primary-100" : "text-neutral-500"
          )}
        >
          {uploading
            ? `Uploading… ${message.uploadingProgress}%`
            : `PDF · ${message.doc.sizeLabel}`}
        </div>
        {uploading && (
          <div
            className={cn(
              "mt-1 h-1 rounded-full overflow-hidden",
              own ? "bg-primary-700/50" : "bg-neutral-200"
            )}
          >
            <div
              className={cn(
                "h-full transition-all",
                own ? "bg-white" : "bg-primary-600"
              )}
              style={{ width: `${message.uploadingProgress ?? 0}%` }}
            />
          </div>
        )}
      </div>
      {!uploading && (
        <button
          type="button"
          aria-label={`Download ${message.doc.name}`}
          className={cn(
            "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            own
              ? "text-white hover:bg-white/15"
              : "text-primary-700 hover:bg-primary-100"
          )}
        >
          <Download size={16} />
        </button>
      )}
    </div>
  );
}

function VoiceBubble({
  message,
  own,
}: {
  message: Extract<ChatMessage, { kind: "voice" }>;
  own: boolean;
}) {
  const mm = Math.floor(message.durationSec / 60)
    .toString()
    .padStart(2, "0");
  const ss = (message.durationSec % 60).toString().padStart(2, "0");
  const bars = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) =>
        6 + Math.round(Math.sin((i + message.durationSec) * 1.3) * 5 + 6)
      ),
    [message.durationSec]
  );
  return (
    <div className="flex items-center gap-2.5 min-w-[200px] py-0.5">
      <button
        type="button"
        aria-label="Play voice message"
        className={cn(
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          own ? "bg-white/15 text-white" : "bg-primary-100 text-primary-700"
        )}
      >
        <Play size={14} className="ml-0.5" />
      </button>
      <div className="flex items-center gap-[2px] flex-1 h-6">
        {bars.map((h, i) => (
          <span
            key={i}
            className={cn(
              "w-[2px] rounded-full",
              own ? "bg-white/80" : "bg-primary-500/70"
            )}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <span
        className={cn(
          "t-caption tabular shrink-0",
          own ? "text-primary-100" : "text-neutral-500"
        )}
      >
        {mm}:{ss}
      </span>
    </div>
  );
}

function StatusTicks({
  status,
  own,
}: {
  status?: MessageStatus;
  own: boolean;
}) {
  if (!own) return null;
  const base = "shrink-0";
  if (status === "sending") {
    return <Clock size={12} className={cn(base, "text-primary-100")} />;
  }
  if (status === "failed") {
    return (
      <span className="t-micro font-semibold text-error-subtle inline-flex items-center gap-0.5">
        <RefreshCcw size={10} />
        Failed
      </span>
    );
  }
  if (status === "sent") {
    return <Check size={12} className={cn(base, "text-primary-100")} />;
  }
  if (status === "delivered") {
    return <CheckCheck size={12} className={cn(base, "text-primary-100")} />;
  }
  if (status === "read") {
    return <CheckCheck size={12} className={cn(base, "text-info")} />;
  }
  return null;
}

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-end gap-1.5 justify-start">
      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center t-caption font-semibold shrink-0">
        {initials(name)}
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-white border border-[var(--border-subtle)] px-3 py-2 inline-flex items-center gap-1">
        <TypingDot delay={0} />
        <TypingDot delay={150} />
        <TypingDot delay={300} />
      </div>
    </div>
  );
}

function TypingDot({ delay }: { delay: number }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-[typingDot_1s_ease-in-out_infinite]"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

function Composer({
  draft,
  onDraftChange,
  onSend,
  onOpenAttach,
  onOpenCamera,
  onSendVoice,
  canSend,
  overLimit,
}: {
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  onOpenAttach: () => void;
  onOpenCamera: () => void;
  onSendVoice: (durationSec: number) => void;
  canSend: boolean;
  overLimit: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!recording) return;
    setSeconds(0);
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [recording]);

  const startRecording = () => setRecording(true);
  const cancelRecording = () => {
    setRecording(false);
    setSeconds(0);
  };
  const sendRecording = () => {
    const dur = Math.max(1, seconds);
    setRecording(false);
    setSeconds(0);
    onSendVoice(dur);
  };

  const timeLabel = `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    <div className="sticky bottom-0 z-10 bg-white border-t border-[var(--border-subtle)] px-3 pt-2 pb-3">
      <div className="flex items-end gap-2">
        <button
          type="button"
          aria-label="Attach"
          onClick={onOpenAttach}
          disabled={recording}
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40"
        >
          <Paperclip size={18} />
        </button>

        {recording ? (
          <div className="flex-1 min-w-0 flex items-center gap-2 rounded-2xl bg-error-subtle px-3 h-10">
            <button
              type="button"
              aria-label="Cancel recording"
              onClick={cancelRecording}
              className="shrink-0 w-7 h-7 rounded-full text-error-bold hover:bg-error/10 flex items-center justify-center"
            >
              <Trash2 size={16} />
            </button>
            <span className="w-2 h-2 rounded-full bg-error-bold animate-pulse" />
            <span className="t-body-sm font-semibold text-error-bold tabular">
              {timeLabel}
            </span>
            <span className="flex-1 min-w-0 t-caption text-neutral-500 truncate">
              Recording… tap send when done
            </span>
          </div>
        ) : (
          <div
            className={cn(
              "flex-1 min-w-0 flex items-end gap-2 rounded-2xl bg-neutral-100 px-3 py-1.5 transition-colors",
              overLimit && "ring-2 ring-error/40 bg-error-subtle"
            )}
          >
            <textarea
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) onSend();
                }
              }}
              placeholder="Message support…"
              rows={1}
              className="flex-1 min-w-0 bg-transparent resize-none focus:outline-none t-body text-neutral-800 placeholder:text-neutral-400 max-h-28"
            />
            <button
              type="button"
              aria-label="Open camera"
              onClick={onOpenCamera}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 hover:bg-neutral-200"
            >
              <Camera size={18} />
            </button>
          </div>
        )}

        {!recording && !canSend && (
          <button
            type="button"
            aria-label="Record voice message"
            onClick={startRecording}
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          >
            <Mic size={18} />
          </button>
        )}

        <button
          type="button"
          aria-label={recording ? "Send voice message" : "Send"}
          disabled={!recording && !canSend}
          onClick={recording ? sendRecording : onSend}
          className={cn(
            "shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            recording || canSend
              ? "bg-primary-600 text-white hover:bg-primary-700"
              : "bg-neutral-200 text-neutral-400"
          )}
        >
          <Send size={16} />
        </button>
      </div>
      {overLimit && (
        <div className="mt-1 t-caption text-error-bold font-medium">
          {draft.length}/2000 · message is too long
        </div>
      )}
    </div>
  );
}

function AttachmentPicker({
  onClose,
  onCamera,
  onGallery,
  onDocument,
}: {
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onDocument: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 pb-5"
      >
        <div className="pt-2 pb-1 flex justify-center">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>
        <div className="px-4 pt-2 pb-3">
          <div className="t-h3 font-bold text-neutral-800">Attach</div>
          <div className="t-caption text-neutral-500 mt-0.5">
            Share a photo or document with support
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 px-4">
          <AttachOption icon={<Camera size={22} />} label="Camera" onClick={onCamera} />
          <AttachOption icon={<ImageIcon size={22} />} label="Gallery" onClick={onGallery} />
          <AttachOption icon={<FileText size={22} />} label="Document" onClick={onDocument} />
        </div>
      </div>
    </div>
  );
}

function AttachOption({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border border-[var(--border-default)] bg-white px-3 py-4 hover:border-primary-300 hover:bg-primary-50/40"
    >
      <span className="w-12 h-12 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center">
        {icon}
      </span>
      <span className="t-body-sm font-semibold text-neutral-800">{label}</span>
    </button>
  );
}

function ReadOnlyBanner() {
  return (
    <div className="sticky bottom-0 z-10 bg-neutral-100 border-t border-[var(--border-subtle)] px-4 py-3 flex items-center gap-2">
      <span className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center shrink-0">
        <Lock size={14} />
      </span>
      <div className="min-w-0">
        <div className="t-body-sm font-semibold text-neutral-800">
          This incident is closed
        </div>
        <div className="t-caption text-neutral-500 truncate">
          Chat is read-only. History is kept for your records.
        </div>
      </div>
    </div>
  );
}

function OneTimeHint({ onClose }: { onClose: () => void }) {
  return (
    <div className="mx-3 mb-2 rounded-xl bg-warning-subtle border border-warning/30 px-3 py-2 flex items-start gap-2">
      <Lock size={14} className="text-warning-bold mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="t-caption text-warning-bold font-semibold leading-snug">
          Messages can&apos;t be deleted once sent — including photos and
          documents. Be careful what you share.
        </p>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="shrink-0 w-6 h-6 rounded-full text-warning-bold hover:bg-warning/10 flex items-center justify-center"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function ImageViewer({
  image,
  onClose,
}: {
  image: ChatImage;
  onClose: () => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="flex items-center justify-between px-3 py-3 text-white">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center"
        >
          <X size={20} />
        </button>
        <button
          type="button"
          aria-label="Download"
          className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center"
        >
          <Download size={18} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt || "Attachment"}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
    </div>
  );
}

/* ============================================================
   Helpers
   ============================================================ */

function formatTime(d: Date) {
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase() || "S";
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(d: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(d) === dayKey(today)) return "Today";
  if (dayKey(d) === dayKey(yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

function groupByDay(messages: ChatMessage[]) {
  const groups: { key: string; label: string; items: ChatMessage[] }[] = [];
  for (const m of messages) {
    const k = dayKey(m.at);
    const last = groups[groups.length - 1];
    if (!last || last.key !== k) {
      groups.push({ key: k, label: dayLabel(m.at), items: [m] });
    } else {
      last.items.push(m);
    }
  }
  return groups;
}

function linkify(text: string): React.ReactNode {
  const urlRegex = /(https?:\/\/[^\s]+)|(\+?\d[\d\s\-()]{6,}\d)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = urlRegex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const matched = m[0];
    if (matched.startsWith("http")) {
      parts.push(
        <a
          key={`l-${key++}`}
          href={matched}
          target="_blank"
          rel="noreferrer"
          className="underline break-all"
        >
          {matched}
        </a>
      );
    } else {
      parts.push(
        <a
          key={`l-${key++}`}
          href={`tel:${matched.replace(/\s+/g, "")}`}
          className="underline"
        >
          {matched}
        </a>
      );
    }
    last = m.index + matched.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}
