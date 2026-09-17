"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card } from "@/components/ui";
import { OnboardingStepBar, getOnboardingSteps } from "@/app/onboarding/steps";
import {
  getOnboarding,
  setOnboarding,
  type AccountType,
} from "@/lib/onboarding-store";
import { AlertCircle, Check } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const OPTIONS: {
  key: AccountType;
  title: string;
  desc: string;
  image: string;
  alt: string;
}[] = [
  {
    key: "individual",
    title: "Individual",
    desc: "Solo practice with payouts to your personal bank account",
    image: "/account-individual.png",
    alt: "Individual lawyer at desk",
  },
  {
    key: "business",
    title: "Business",
    desc: "Firm or agency with multiple associates and GST billing",
    image: "/account-business.png",
    alt: "Law firm building",
  },
];

export default function AccountTypePage() {
  const [selected, setSelected] = useState<AccountType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const continueLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const stored = getOnboarding().accountType;
    if (stored) setSelected(stored);
  }, []);

  const handleContinue = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (submitting || !selected) return;
    const simulateError = e.shiftKey;
    setSubmitError(null);
    setSubmitting(true);
    window.setTimeout(() => {
      if (simulateError) {
        setSubmitError(
          "Couldn't save your choice. Check your connection and try again."
        );
        setSubmitting(false);
      } else {
        setOnboarding({ accountType: selected });
        continueLinkRef.current?.click();
      }
    }, 800);
  };

  return (
    <PhoneFrame label="Account Type">
      <a
        ref={continueLinkRef}
        href="/role"
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Continue
      </a>
      <AppBar back href="/otp" />

      <div className="flex flex-col min-h-[calc(100%-4rem)] px-4 pt-4 pb-6">
        <div className="mb-6">
          <OnboardingStepBar
            current={1}
            label="Account Type"
            steps={getOnboardingSteps(selected ?? undefined)}
          />
        </div>

        <h1 className="t-h1 font-bold text-neutral-800 tracking-tight">
          How Will You Be Joining?
        </h1>

        <div className="space-y-3 mt-6">
          {OPTIONS.map((o) => {
            const active = selected === o.key;
            return (
              <button
                key={o.key}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(o.key)}
                className="w-full text-left"
              >
                <Card
                  padding="md"
                  className={`transition-all ${
                    active
                      ? "border-2! border-primary-600!"
                      : "hover:border-primary-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-[#e0f2fe]">
                      <Image
                        src={o.image}
                        alt={o.alt}
                        fill
                        sizes="80px"
                        className="object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0 self-center">
                      <div className="t-body-lg font-bold text-neutral-800">
                        {o.title}
                      </div>
                      <div className="t-body-sm text-neutral-500 mt-0.5 leading-snug">
                        {o.desc}
                      </div>
                    </div>
                    <div
                      className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center transition-all ${
                        active
                          ? "bg-primary-600 text-white"
                          : "border-2 border-neutral-300 bg-white"
                      }`}
                      aria-hidden
                    >
                      {active && <Check size={16} strokeWidth={3} />}
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4 space-y-3">
        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl bg-error-subtle border border-error/30 px-3 py-2.5"
          >
            <span className="text-error-bold mt-0.5 shrink-0">
              <AlertCircle size={16} />
            </span>
            <div className="min-w-0">
              <p className="t-body-sm font-semibold text-error-bold">
                Couldn&apos;t save your choice
              </p>
              <p className="t-caption text-neutral-600">
                {submitError}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selected}
          loading={submitting}
          onClick={handleContinue}
        >
          {submitting
            ? "Saving…"
            : submitError
              ? "Try again"
              : "Continue"}
        </Button>
      </div>
    </PhoneFrame>
  );
}
