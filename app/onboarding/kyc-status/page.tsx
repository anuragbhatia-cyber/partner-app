"use client";

import { PhoneFrame } from "@/components/PhoneFrame";
import { Button, Card, ListRow } from "@/components/ui";
import { Check, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const STEPS = [
  "Personal info",
  "Professional details",
  "Document verification",
  "Bank verification",
  "Final approval",
];

const STEP_DURATION_MS = 1400;

export default function KycStatusPage() {
  const [activeIdx, setActiveIdx] = useState(-1);

  useEffect(() => {
    const start = window.setTimeout(() => setActiveIdx(0), 400);
    return () => window.clearTimeout(start);
  }, []);

  useEffect(() => {
    if (activeIdx < 0 || activeIdx >= STEPS.length) return;
    const t = window.setTimeout(
      () => setActiveIdx((i) => i + 1),
      STEP_DURATION_MS
    );
    return () => window.clearTimeout(t);
  }, [activeIdx]);

  const allDone = activeIdx >= STEPS.length;

  return (
    <PhoneFrame label="Onboarding · KYC Status">
      <div className="px-4 pt-8 pb-32">
        <Card padding="lg" className="text-center py-8 bg-neutral-100!">
          <div className="w-32 h-32 mx-auto mb-4 relative">
            <Image
              src="/verification-in-progress.png"
              alt="Verification in progress"
              fill
              sizes="128px"
              className="object-contain"
            />
          </div>
          <h1 className="t-h2 font-bold text-neutral-800">
            {allDone ? "Verification Complete" : "Verification in Progress"}
          </h1>
        </Card>

        <Card padding="lg" className="mt-4">
          <ol>
            {STEPS.map((label, i) => (
              <StepRow
                key={label}
                label={label}
                done={i < activeIdx}
                current={i === activeIdx}
                isLast={i === STEPS.length - 1}
                prevDone={i - 1 < activeIdx}
              />
            ))}
          </ol>
        </Card>

        <div className="mt-6 space-y-2">
          <Card padding="none">
            <ListRow
              icon={<MessageCircle size={18} />}
              title="Contact support"
              href="/profile/support"
            />
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          href={allDone ? "/home" : undefined}
          disabled={!allDone}
        >
          Continue to dashboard →
        </Button>
      </div>
    </PhoneFrame>
  );
}

function StepRow({
  label,
  done,
  current,
  isLast,
  prevDone,
}: {
  label: string;
  done?: boolean;
  current?: boolean;
  isLast?: boolean;
  prevDone?: boolean;
}) {
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        {done ? (
          <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white shrink-0 transition-all duration-300">
            <Check size={18} strokeWidth={3} />
          </div>
        ) : current ? (
          <div className="w-8 h-8 rounded-full border-2 border-warning bg-warning-subtle flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-neutral-200 bg-white shrink-0" />
        )}
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-5 mt-1 mb-1 rounded-full transition-colors duration-300 ${
              prevDone && done ? "bg-success" : "bg-neutral-200"
            }`}
          />
        )}
      </div>
      <div className={`flex-1 min-w-0 pb-4 ${isLast ? "pb-0" : ""}`}>
        <div className="min-h-8 flex items-center">
          <span
            className={`t-h3 transition-colors ${
              done
                ? "text-neutral-800 font-semibold"
                : current
                  ? "text-warning-bold font-bold"
                  : "text-neutral-400 font-medium"
            }`}
          >
            {label}
          </span>
        </div>
      </div>
    </li>
  );
}
