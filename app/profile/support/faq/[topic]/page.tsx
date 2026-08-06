"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Card } from "@/components/ui";
import { ChevronDown } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";

type Faq = { q: string; a: string };
type Topic = { title: string; subtitle: string; faqs: Faq[] };

const TOPICS: Record<string, Topic> = {
  payment: {
    title: "Payment questions",
    subtitle: "Payouts, deductions, and settlement timelines",
    faqs: [
      {
        q: "When do I get paid for a completed case?",
        a: "Payouts are settled to your registered bank account within 3 business days of case closure. You can track pending payouts in Wallet.",
      },
      {
        q: "Why is my payout amount lower than the case fee?",
        a: "Case fees are net of the standard platform commission (10%) and any applicable TDS. A full breakdown is shown in the payout receipt.",
      },
      {
        q: "How do I raise a dispute on a payout?",
        a: "Open the payout in Wallet, tap the case, and select \"Raise dispute\". Our ops team responds within 24 hours.",
      },
      {
        q: "Can I change my payout bank account?",
        a: "Yes, go to Profile → Bank details. Changes require re-verification and take 1–2 business days.",
      },
    ],
  },
  cases: {
    title: "About cases",
    subtitle: "Accepting, running, and closing cases",
    faqs: [
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
    ],
  },
  kyc: {
    title: "KYC & documents",
    subtitle: "Verification, re-uploads, and validity",
    faqs: [
      {
        q: "How long does KYC verification take?",
        a: "Most KYC submissions are verified within 24 hours. Complex cases may take up to 3 business days.",
      },
      {
        q: "My document was rejected. What now?",
        a: "Open Profile → Documents to see the rejection reason. Re-upload a clearer image or a corrected document and it will be re-reviewed within 24 hours.",
      },
      {
        q: "Do I need to renew my Bar Council ID?",
        a: "Yes. You'll be reminded 30 days before expiry. Cases will pause if the ID lapses.",
      },
      {
        q: "Is my data secure?",
        a: "All documents are encrypted at rest and only accessed by our verification team on a need-to-know basis.",
      },
    ],
  },
  app: {
    title: "App & technical",
    subtitle: "App issues, permissions, and updates",
    faqs: [
      {
        q: "The app isn't sending me case notifications",
        a: "Check that Notifications and Background App Refresh are enabled for Lawyered in your device settings. Also ensure Do Not Disturb is off.",
      },
      {
        q: "Location tracking keeps stopping",
        a: "Grant \"Always\" location permission and disable battery optimization for the app so it can track cases in the background.",
      },
      {
        q: "How do I update the app?",
        a: "Visit the App Store or Play Store. We push mandatory updates monthly — the app will prompt you when an update is required.",
      },
      {
        q: "The app is crashing on startup",
        a: "Try force-closing and reopening. If it persists, reinstall the app. Your data is safe on the server and will be restored on login.",
      },
    ],
  },
};

export default function FaqTopicPage() {
  const params = useParams<{ topic: string }>();
  const topic = TOPICS[params.topic];
  if (!topic) return notFound();

  return (
    <PhoneFrame label={`Support · ${topic.title}`}>
      <AppBar back href="/profile/support" title={topic.title} />

      <div className="px-4 py-4 pb-24 space-y-3">
        <p className="t-body-sm text-neutral-500">{topic.subtitle}</p>

        <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
          {topic.faqs.map((f, i) => (
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
