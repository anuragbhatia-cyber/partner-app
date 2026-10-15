"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Mic, Play, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Msg =
  | {
      id: number;
      from: "user" | "agent";
      kind: "text";
      text: string;
      time: string;
    }
  | {
      id: number;
      from: "user" | "agent";
      kind: "voice";
      durationSec: number;
      time: string;
    };

const now = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const INITIAL: Msg[] = [
  {
    id: 1,
    from: "agent",
    kind: "text",
    text: "Hi Priya! I'm Riya from Lawyered support. How can I help you today?",
    time: "09:42",
  },
];

const CANNED_REPLIES = [
  "Got it — let me pull up your account.",
  "Thanks for the details. I'm checking that now.",
  "That usually resolves within 24 hours. I'll follow up if it doesn't.",
  "I've flagged this to the ops team. You'll hear back shortly.",
];

export default function SupportChatPage() {
  const [messages, setMessages] = useState<Msg[]>(INITIAL);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  useEffect(() => {
    if (!recording) return;
    setRecSeconds(0);
    const t = window.setInterval(() => setRecSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [recording]);

  const replyLater = () => {
    setTyping(true);
    window.setTimeout(() => {
      const reply =
        CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          from: "agent",
          kind: "text",
          text: reply,
          time: now(),
        },
      ]);
      setTyping(false);
    }, 1200);
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, from: "user", kind: "text", text, time: now() },
    ]);
    setDraft("");
    replyLater();
  };

  const sendVoice = () => {
    const dur = Math.max(1, recSeconds);
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        from: "user",
        kind: "voice",
        durationSec: dur,
        time: now(),
      },
    ]);
    setRecording(false);
    setRecSeconds(0);
    replyLater();
  };

  const canSend = draft.trim().length > 0;
  const recTime = `${Math.floor(recSeconds / 60)
    .toString()
    .padStart(2, "0")}:${(recSeconds % 60).toString().padStart(2, "0")}`;

  return (
    <PhoneFrame label="Support · Chat">
      <AppBar back href="/profile/support" title="Chat with support" />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-2"
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}
        {typing && (
          <div className="flex items-end gap-1 px-3 py-2 w-fit rounded-2xl bg-neutral-100">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.1s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white border-t border-[var(--border-subtle)] px-3 pt-2 pb-3">
        <div className="flex items-center gap-2">
          {recording ? (
            <div className="flex-1 min-w-0 flex items-center gap-2 h-11 px-3 rounded-full bg-error-subtle">
              <button
                type="button"
                aria-label="Cancel recording"
                onClick={() => {
                  setRecording(false);
                  setRecSeconds(0);
                }}
                className="shrink-0 w-7 h-7 rounded-full text-error-bold hover:bg-error/10 flex items-center justify-center"
              >
                <Trash2 size={16} />
              </button>
              <span className="w-2 h-2 rounded-full bg-error-bold animate-pulse" />
              <span className="t-body-sm font-semibold text-error-bold tabular">
                {recTime}
              </span>
              <span className="flex-1 min-w-0 t-caption text-neutral-500 truncate">
                Recording… tap send when done
              </span>
            </div>
          ) : (
            <div className="flex-1 min-w-0 flex items-center gap-2 h-11 px-3 rounded-full border border-[var(--border-default)] bg-white focus-within:border-primary-500 transition-colors">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message"
                className="flex-1 t-body text-neutral-800 bg-transparent focus:outline-none placeholder:text-neutral-400"
              />
            </div>
          )}

          {!recording && !canSend && (
            <button
              type="button"
              aria-label="Record voice message"
              onClick={() => setRecording(true)}
              className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            >
              <Mic size={18} />
            </button>
          )}

          <button
            type="button"
            onClick={recording ? sendVoice : send}
            disabled={!recording && !canSend}
            className="shrink-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center disabled:bg-neutral-200 disabled:text-neutral-400"
            aria-label={recording ? "Send voice message" : "Send"}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[80%]">
        <div
          className={`px-3.5 py-2 rounded-2xl t-body ${
            isUser
              ? "bg-primary-600 text-white rounded-br-md"
              : "bg-neutral-100 text-neutral-800 rounded-bl-md"
          }`}
        >
          {msg.kind === "voice" ? (
            <VoiceClip durationSec={msg.durationSec} isUser={isUser} />
          ) : (
            msg.text
          )}
        </div>
        <div
          className={`t-caption text-neutral-400 mt-1 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {msg.time}
        </div>
      </div>
    </div>
  );
}

function VoiceClip({
  durationSec,
  isUser,
}: {
  durationSec: number;
  isUser: boolean;
}) {
  const mm = Math.floor(durationSec / 60)
    .toString()
    .padStart(2, "0");
  const ss = (durationSec % 60).toString().padStart(2, "0");
  const bars = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) =>
        6 + Math.round(Math.sin((i + durationSec) * 1.3) * 5 + 6)
      ),
    [durationSec]
  );
  return (
    <div className="flex items-center gap-2.5 min-w-[180px] py-0.5">
      <button
        type="button"
        aria-label="Play voice message"
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-white/20 text-white" : "bg-primary-100 text-primary-700"
        }`}
      >
        <Play size={14} className="ml-0.5" />
      </button>
      <div className="flex items-center gap-[2px] flex-1 h-6">
        {bars.map((h, i) => (
          <span
            key={i}
            className={`w-[2px] rounded-full ${
              isUser ? "bg-white/80" : "bg-primary-500/70"
            }`}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <span
        className={`t-caption tabular shrink-0 ${
          isUser ? "text-white/80" : "text-neutral-500"
        }`}
      >
        {mm}:{ss}
      </span>
    </div>
  );
}
