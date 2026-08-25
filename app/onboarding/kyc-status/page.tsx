"use client";

import { PhoneFrame } from "@/components/PhoneFrame";
import { Button, Card } from "@/components/ui";
import { Check, Clock, X as XIcon } from "lucide-react";
import Image from "next/image";
import Lottie from "lottie-react";
import { useEffect, useRef, useState } from "react";
import confettiAnimation from "./confetti.json";

type Outcome = "approved" | "review" | "rejected";

const STEPS = [
  "Personal info",
  "Professional details",
  "Document verification",
  "Final approval",
];

const REJECT_AT = 2; // "Document verification" fails when outcome=rejected
const STEP_DURATION_MS = 1400;

export default function KycStatusPage() {
  const [outcome, setOutcome] = useState<Outcome>("approved");
  const [activeIdx, setActiveIdx] = useState(-1);
  const reuploadRef = useRef<HTMLAnchorElement>(null);
  const homeRef = useRef<HTMLAnchorElement>(null);
  const supportRef = useRef<HTMLAnchorElement>(null);

  // Read demo outcome from URL once on mount
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("outcome");
    if (q === "review" || q === "rejected") setOutcome(q);
  }, []);

  useEffect(() => {
    const start = window.setTimeout(() => setActiveIdx(0), 400);
    return () => window.clearTimeout(start);
  }, []);

  const targetIdx =
    outcome === "approved"
      ? STEPS.length
      : outcome === "review"
        ? STEPS.length - 1
        : REJECT_AT;

  useEffect(() => {
    if (activeIdx < 0) return;
    if (activeIdx >= targetIdx) return;
    const t = window.setTimeout(
      () => setActiveIdx((i) => i + 1),
      STEP_DURATION_MS
    );
    return () => window.clearTimeout(t);
  }, [activeIdx, targetIdx]);

  const settled = activeIdx >= targetIdx;
  const isApproved = settled && outcome === "approved";
  const isReviewing = settled && outcome === "review";
  const isRejected = settled && outcome === "rejected";

  const stepStateFor = (i: number) => {
    if (i < activeIdx) return "done" as const;
    if (i === activeIdx) {
      if (isRejected) return "rejected" as const;
      if (isReviewing) return "review" as const;
      return "current" as const;
    }
    return "pending" as const;
  };

  return (
    <PhoneFrame label="Onboarding · KYC Status">
      <a
        ref={reuploadRef}
        href="/onboarding/documents"
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Re-upload
      </a>
      <a
        ref={homeRef}
        href="/home"
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Home
      </a>
      <a
        ref={supportRef}
        href="/profile/support"
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Support
      </a>

      {isApproved && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-start justify-center">
          <Lottie
            animationData={confettiAnimation}
            loop={false}
            className="w-full h-full"
          />
        </div>
      )}

      <div className="px-4 pt-8 pb-32">
        <Card padding="lg" className="text-center py-8">
          {!settled && (
            <div className="w-32 h-32 mx-auto mb-4 relative flex items-center justify-center">
              <Image
                src="/verification-in-progress.png"
                alt="Verification in progress"
                fill
                sizes="128px"
                className="object-contain"
              />
            </div>
          )}
          {isApproved && (
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-subtle flex items-center justify-center">
              <Check size={32} strokeWidth={3} className="text-success-bold" />
            </div>
          )}
          {isReviewing && (
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning-subtle flex items-center justify-center">
              <Clock size={30} strokeWidth={2.5} className="text-warning-bold" />
            </div>
          )}
          {isRejected && (
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-subtle flex items-center justify-center">
              <XIcon size={32} strokeWidth={3} className="text-error-bold" />
            </div>
          )}
          <h1 className="t-h2 font-bold text-neutral-800">
            {isApproved
              ? "Verification Complete!"
              : isReviewing
                ? "Under manual review"
                : isRejected
                  ? "We couldn't verify your KYC"
                  : "Verification in Progress"}
          </h1>
          {isApproved && (
            <p className="t-body text-neutral-600 mt-2">
              You&apos;re all set to start taking cases
            </p>
          )}
          {isReviewing && (
            <p className="t-body text-neutral-600 mt-2 max-w-[280px] mx-auto">
              Our team is checking your Bar Council ID. This usually takes up
              to 24 hours — we&apos;ll notify you.
            </p>
          )}
          {isRejected && (
            <p className="t-body text-neutral-600 mt-2 max-w-[280px] mx-auto">
              The Bar Council ID you uploaded couldn&apos;t be verified. Please
              upload a clearer copy.
            </p>
          )}
        </Card>

        <Card padding="lg" className="mt-4">
          <ol>
            {STEPS.map((label, i) => (
              <StepRow
                key={label}
                label={label}
                state={stepStateFor(i)}
                isLast={i === STEPS.length - 1}
                prevDone={i - 1 < activeIdx}
              />
            ))}
          </ol>
        </Card>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4 space-y-2">
        {isApproved && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => homeRef.current?.click()}
          >
            Continue to dashboard
          </Button>
        )}
        {isReviewing && (
          <>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => homeRef.current?.click()}
            >
              Continue with limited access
            </Button>
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={() => supportRef.current?.click()}
            >
              Contact support
            </Button>
          </>
        )}
        {isRejected && (
          <>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => reuploadRef.current?.click()}
            >
              Re-upload documents
            </Button>
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={() => supportRef.current?.click()}
            >
              Contact support
            </Button>
          </>
        )}
        {!settled && (
          <Button variant="primary" size="lg" fullWidth disabled>
            Continue to dashboard
          </Button>
        )}
      </div>

      <style jsx global>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.4) rotate(-14deg);
          }
          60% {
            opacity: 1;
            transform: scale(1.12) rotate(6deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
      `}</style>
    </PhoneFrame>
  );
}

type StepState = "done" | "current" | "review" | "rejected" | "pending";

function StepRow({
  label,
  state,
  isLast,
  prevDone,
}: {
  label: string;
  state: StepState;
  isLast?: boolean;
  prevDone?: boolean;
}) {
  const dot =
    state === "done" ? (
      <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white shrink-0 transition-all duration-300">
        <Check size={18} strokeWidth={3} />
      </div>
    ) : state === "current" ? (
      <div className="w-8 h-8 rounded-full border-2 border-warning bg-warning-subtle flex items-center justify-center shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse" />
      </div>
    ) : state === "review" ? (
      <div className="w-8 h-8 rounded-full border-2 border-warning bg-warning-subtle flex items-center justify-center text-warning-bold shrink-0">
        <Clock size={16} strokeWidth={2.5} />
      </div>
    ) : state === "rejected" ? (
      <div className="w-8 h-8 rounded-full bg-error flex items-center justify-center text-white shrink-0">
        <XIcon size={18} strokeWidth={3} />
      </div>
    ) : (
      <div className="w-8 h-8 rounded-full border-2 border-neutral-200 bg-white shrink-0" />
    );

  const textClass =
    state === "done"
      ? "text-neutral-800 font-semibold"
      : state === "current"
        ? "text-warning-bold font-bold"
        : state === "review"
          ? "text-warning-bold font-bold"
          : state === "rejected"
            ? "text-error-bold font-bold"
            : "text-neutral-400 font-medium";

  const connectorClass =
    state === "rejected"
      ? "bg-neutral-200"
      : prevDone && state === "done"
        ? "bg-success"
        : "bg-neutral-200";

  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        {dot}
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-5 mt-1 mb-1 rounded-full transition-colors duration-300 ${connectorClass}`}
          />
        )}
      </div>
      <div className={`flex-1 min-w-0 pb-4 ${isLast ? "pb-0" : ""}`}>
        <div className="min-h-8 flex items-center">
          <span className={`t-h3 transition-colors ${textClass}`}>{label}</span>
        </div>
      </div>
    </li>
  );
}
