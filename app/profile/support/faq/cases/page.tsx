"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Card } from "@/components/ui";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Faq = { q: string; a: string };

const FAQS: Faq[] = [
  {
    q: "How are cases assigned to me?",
    a: "You'll receive incidents from your selected working area, matched to your practice type and availability.",
  },
  {
    q: "What happens if I miss a case notification?",
    a: "Unanswered cases roll over to the next nearest partner after 30 seconds. Missed cases do not affect your rating unless it becomes a pattern.",
  },
  {
    q: "Can I cancel a case after accepting?",
    a: "Cancellations are allowed before you mark yourself as \"En route\". Cancelling after that will impact your reliability score.",
  },
  {
    q: "What if the client is a no-show?",
    a: "Wait at the location for 15 minutes, then mark the case as \"Client no-show\" in the app. You'll be paid the standard call-out fee.",
  },
  {
    q: "How do I hand a case over to another partner?",
    a: "Open the case → tap the more menu → \"Request handover\". Ops will reassign to the next available partner in the area.",
  },
  {
    q: "Where can I see the case history and notes?",
    a: "Every case you've worked appears under Incidents → Past. Tap any case to view timeline, notes, and payout details.",
  },
];

export default function CasesFaqPage() {
  return (
    <PhoneFrame label="Support · About cases">
      <AppBar back href="/profile/support" title="About cases" />

      <div className="px-4 py-4 pb-24 space-y-3">
        <p className="t-body-sm text-neutral-500">
          Accepting, running, and closing cases
        </p>

        <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
          {FAQS.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} />
          ))}
        </Card>
      </div>
    </PhoneFrame>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-neutral-50/50 transition-colors"
      >
        <div className="flex-1 min-w-0 t-body font-medium text-neutral-800">
          {q}
        </div>
        <ChevronDown
          size={18}
          className={`text-neutral-400 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 -mt-1 t-body-sm text-neutral-600 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}
