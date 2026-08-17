"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import {
  Send,
  Sparkles,
  FileText,
  Scale,
  MessageSquare,
  BookOpen,
  Paperclip,
  Copy,
  RefreshCw,
  Check,
  RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Msg = {
  id: number;
  from: "user" | "ai";
  text: string;
  time: string;
};

const now = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

type Prompt = {
  id: string;
  icon: typeof FileText;
  title: string;
  seedUser: string;
  reply: string;
};

const PROMPTS: Prompt[] = [
  {
    id: "draft-notice",
    icon: FileText,
    title: "Draft a legal notice",
    seedUser: "Draft a legal notice for unpaid dues of ₹1,25,000.",
    reply:
      "Here's a draft legal notice you can adapt:\n\nTo,\n[Recipient Name]\n[Address]\n\nSubject: Legal notice for recovery of ₹1,25,000\n\nDear Sir/Madam,\n\nUnder instructions from my client, I hereby serve upon you the following notice:\n\n1. My client had rendered services / supplied goods vide invoice dated [DATE], amounting to ₹1,25,000.\n2. Despite repeated reminders, the said amount remains outstanding.\n3. You are hereby called upon to pay the said sum of ₹1,25,000 along with interest @ 12% p.a. within 15 days of receipt of this notice.\n\nFailing which, my client shall be constrained to initiate appropriate civil and/or criminal proceedings at your risk and cost.\n\nYours faithfully,\n[Advocate Name]\n\nWant me to tailor this for a specific matter?",
  },
  {
    id: "explain-section",
    icon: Scale,
    title: "Explain a challan section",
    seedUser: "Explain Section 184 of the Motor Vehicles Act.",
    reply:
      "Section 184, Motor Vehicles Act, 1988 — Driving dangerously.\n\nIn plain terms: If a person drives in a manner that endangers the public (considering the road, traffic, and use of the place), they can be punished under this section.\n\nKey points:\n• First offence: imprisonment up to 6 months and/or fine up to ₹1,000–₹5,000.\n• Repeat offence within 3 years: imprisonment up to 2 years and/or fine up to ₹10,000.\n• Factors: overspeeding, rash overtaking, using mobile phone, jumping signals.\n\nCommonly clubbed with Section 279 IPC (rash driving) in accident cases. Would you like sample defenses?",
  },
  {
    id: "reply-client",
    icon: MessageSquare,
    title: "Reply to a client",
    seedUser: "Client is asking why their case is taking so long. Help me reply.",
    reply:
      "Try this:\n\n\"Namaste [Client Name],\n\nThank you for your patience. Your matter is currently at the [stage] — the next hearing / step is scheduled for [DATE]. Court timelines can vary and I am actively following up to ensure no avoidable delay.\n\nI'll share an update as soon as there's progress. Please feel free to reach me on this number for anything urgent.\n\nRegards,\n[Your Name]\"\n\nWant a version in Hindi or a shorter WhatsApp style?",
  },
  {
    id: "summarize",
    icon: BookOpen,
    title: "Summarize a document",
    seedUser: "I'll paste a document — please summarize it for me.",
    reply:
      "Sure — go ahead and paste the text (or key excerpts). I'll pull out:\n• The parties and cause of action\n• Key facts and dates\n• Reliefs sought / granted\n• Anything you should flag to your client\n\nFor scanned PDFs, use the attach button and I'll extract the text.",
  },
];

const FALLBACK_REPLIES = [
  "Got it. Here's how I'd approach that — could you share a bit more context (parties, dates, jurisdiction) so I can tailor it precisely?",
  "That's a common ask. A safe starting point is to frame it under the relevant statute, cite recent case law, and keep the tone factual. Want a template I can fill in with your details?",
  "Happy to help draft that. Would you like it as a formal notice, an email to the client, or a short WhatsApp message?",
];

export default function AiExpertPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasChat = messages.length > 0;

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  const send = (text: string, cannedReply?: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Msg = {
      id: Date.now(),
      from: "user",
      text: trimmed,
      time: now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setTyping(true);
    window.setTimeout(() => {
      const reply =
        cannedReply ??
        FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "ai", text: reply, time: now() },
      ]);
      setTyping(false);
    }, 1200);
  };

  const usePrompt = (p: Prompt) => send(p.seedUser, p.reply);

  const copy = async (msg: Msg) => {
    try {
      await navigator.clipboard.writeText(msg.text);
      setCopiedId(msg.id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* ignore in prototype */
    }
  };

  const regenerate = (aiMsgId: number) => {
    if (typing) return;
    // Remove the target AI message, then queue a new reply based on the
    // preceding user message. Cycle through fallback replies so the user
    // visibly gets something different each time.
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === aiMsgId);
      if (idx <= 0) return prev;
      return prev.slice(0, idx);
    });
    setTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => {
        const lastUser = [...prev].reverse().find((m) => m.from === "user");
        const seed = lastUser?.text ?? "";
        // Prefer a prompt-specific reply if the user seed matches a prompt
        const prompt = PROMPTS.find((p) => p.seedUser === seed);
        const pool = prompt
          ? [prompt.reply, ...FALLBACK_REPLIES]
          : FALLBACK_REPLIES;
        const reply = pool[Math.floor(Math.random() * pool.length)];
        return [
          ...prev,
          { id: Date.now(), from: "ai", text: reply, time: now() },
        ];
      });
      setTyping(false);
    }, 900);
  };

  const reset = () => {
    setMessages([]);
    setDraft("");
    setTyping(false);
  };

  return (
    <PhoneFrame label="AI Expert">
      <AppBar
        back
        href="/home"
        title="AI Expert"
        action={
          hasChat ? (
            <button
              type="button"
              onClick={reset}
              aria-label="New chat"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-50 text-neutral-600"
            >
              <RotateCcw size={18} />
            </button>
          ) : undefined
        }
      />

      {hasChat ? (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-3"
        >
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              msg={m}
              copied={copiedId === m.id}
              onCopy={() => copy(m)}
              onRegenerate={() => regenerate(m.id)}
            />
          ))}
          {typing && <TypingBubble />}
        </div>
      ) : (
        <IntroPanel onPick={usePrompt} />
      )}

      <div className="sticky bottom-0 z-20 mt-auto bg-white border-t border-[var(--border-subtle)] px-3 py-2">
        <div className="flex items-end gap-2 min-h-11 px-2 pl-3 py-1.5 rounded-2xl border border-[var(--border-default)] bg-white focus-within:border-primary-500 transition-colors">
          <button
            type="button"
            aria-label="Attach a document"
            className="w-8 h-8 shrink-0 rounded-full text-neutral-500 hover:text-primary-600 hover:bg-primary-50/50 flex items-center justify-center"
          >
            <Paperclip size={16} />
          </button>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            placeholder="Ask anything…"
            rows={1}
            className="flex-1 min-w-0 t-body text-neutral-800 bg-transparent focus:outline-none placeholder:text-neutral-400 resize-none py-2 max-h-32"
          />
          <button
            type="button"
            onClick={() => send(draft)}
            disabled={!draft.trim()}
            className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center disabled:opacity-40 shrink-0"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}

function IntroPanel({ onPick }: { onPick: (p: Prompt) => void }) {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-6 pb-2">
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-e2">
          <Sparkles size={26} />
        </div>
        <h1 className="t-h1 font-bold text-neutral-800 tracking-tight mt-4">
          {greeting}, Priya
        </h1>
      </div>

      <div className="mt-6 space-y-2">
        {PROMPTS.map((p) => (
          <PromptCard key={p.id} prompt={p} onClick={() => onPick(p)} />
        ))}
      </div>
    </div>
  );
}

function PromptCard({
  prompt,
  onClick,
}: {
  prompt: Prompt;
  onClick: () => void;
}) {
  const Icon = prompt.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border-default)] bg-white hover:border-primary-300 hover:bg-primary-50/30 active:bg-primary-50/60 transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="t-body font-semibold text-neutral-800">
          {prompt.title}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({
  msg,
  copied,
  onCopy,
  onRegenerate,
}: {
  msg: Msg;
  copied: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
}) {
  const isUser = msg.from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1 ml-1">
            <span className="w-5 h-5 rounded-md bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center">
              <Sparkles size={11} />
            </span>
            <span className="t-caption font-semibold text-neutral-600">
              AI Expert
            </span>
          </div>
        )}
        <div
          className={`px-3.5 py-2.5 rounded-2xl t-body whitespace-pre-wrap leading-relaxed ${
            isUser
              ? "bg-primary-600 text-white rounded-br-md"
              : "bg-neutral-100 text-neutral-800 rounded-bl-md"
          }`}
        >
          {msg.text}
        </div>
        {!isUser && (
          <div className="flex items-center gap-1 mt-1 ml-1">
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center gap-1 t-caption text-neutral-500 hover:text-primary-600 px-1.5 py-1 rounded-md"
              aria-label="Copy"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1 t-caption text-neutral-500 hover:text-primary-600 px-1.5 py-1 rounded-md"
              aria-label="Regenerate"
            >
              <RefreshCw size={12} />
              Regenerate
            </button>
          </div>
        )}
        <div
          className={`t-micro text-neutral-400 mt-1 ${
            isUser ? "text-right mr-1" : "text-left ml-1"
          }`}
        >
          {msg.time}
        </div>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex flex-col items-start max-w-[85%]">
        <div className="flex items-center gap-1.5 mb-1 ml-1">
          <span className="w-5 h-5 rounded-md bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center">
            <Sparkles size={11} />
          </span>
          <span className="t-caption font-semibold text-neutral-600">
            AI Expert
          </span>
        </div>
        <div className="flex items-end gap-1 px-3 py-2.5 rounded-2xl bg-neutral-100 rounded-bl-md">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.2s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.1s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
