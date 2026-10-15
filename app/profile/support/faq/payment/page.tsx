"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Card } from "@/components/ui";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Faq = { q: string; a: string };

const FAQS: Faq[] = [
  {
    q: "When do I get paid for a completed case?",
    a: "Payouts are settled to your registered bank account within 3 business days of case closure. You can track pending payouts in Wallet.",
  },
  {
    q: "Why is my payout amount lower than the case fee?",
    a: "Case fees are net of the standard platform commission (10%) and any applicable TDS. A full breakdown is shown in the payout receipt.",
  },
  {
    q: "Can I change my payout bank account?",
    a: "Yes, go to Profile → Bank details. Changes require re-verification and take 1–2 business days.",
  },
  {
    q: "When are TDS certificates issued?",
    a: "Form 16A is issued quarterly, within 15 days of the quarter end. You can download them from Profile → Tax documents.",
  },
  {
    q: "Do I get paid for a client no-show?",
    a: "Yes. Mark the case as \"Client no-show\" after waiting 15 minutes at the location and you'll receive the standard call-out fee.",
  },
];

export default function PaymentFaqPage() {
  return (
    <PhoneFrame label="Support · Payment questions">
      <AppBar back href="/profile/support" title="Payment questions" />

      <div className="px-4 py-4 pb-24 space-y-3">
        <p className="t-body-sm text-neutral-500">
          Payouts, deductions, and settlement timelines
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
