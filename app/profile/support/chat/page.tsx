"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Msg = {
  id: number;
  from: "user" | "agent";
  text: string;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, from: "user", text, time: now() },
    ]);
    setDraft("");
    setTyping(true);
    window.setTimeout(() => {
      const reply =
        CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, from: "agent", text: reply, time: now() },
      ]);
      setTyping(false);
    }, 1200);
  };

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
        <div className="flex items-center gap-2 h-11 px-3 rounded-full border border-[var(--border-default)] bg-white focus-within:border-primary-500 transition-colors">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message"
            className="flex-1 t-body text-neutral-800 bg-transparent focus:outline-none placeholder:text-neutral-400"
          />
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim()}
            className="w-8 h-8 -mr-1 rounded-full bg-primary-600 text-white flex items-center justify-center disabled:opacity-40 shrink-0"
            aria-label="Send"
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
          {msg.text}
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
