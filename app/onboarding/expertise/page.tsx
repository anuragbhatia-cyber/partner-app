"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card } from "@/components/ui";
import { OnboardingStepBar, getOnboardingSteps } from "@/app/onboarding/steps";
import {
  getOnboarding,
  setOnboarding,
  type AccountType,
  type Role,
} from "@/lib/onboarding-store";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Area = { key: string; title: string; desc: string; roles: Role[] };

const AREAS: Area[] = [
  {
    key: "traffic-challans",
    title: "Traffic Challans",
    desc: "E-challans, disputes and settlements",
    roles: ["lawyer", "rto"],
  },
  {
    key: "accident-response",
    title: "Accident Response",
    desc: "On-scene assistance and post-accident support",
    roles: ["lawyer"],
  },
  {
    key: "court-appearances",
    title: "Court Appearances",
    desc: "Traffic court and civil hearings",
    roles: ["lawyer"],
  },
  {
    key: "rc-registration",
    title: "RC & Registration",
    desc: "New registration and RC updates",
    roles: ["rto"],
  },
  {
    key: "ownership-transfer",
    title: "Ownership Transfer",
    desc: "Vehicle transfer and NOC paperwork",
    roles: ["rto"],
  },
  {
    key: "license-services",
    title: "License Services",
    desc: "Learner, renewal and duplicate DL",
    roles: ["rto"],
  },
  {
    key: "fitness-permits",
    title: "Fitness & Permits",
    desc: "Fitness certificates and commercial permits",
    roles: ["rto"],
  },
  {
    key: "legal-advisory",
    title: "General Legal Advisory",
    desc: "Consultations and drafting",
    roles: ["lawyer"],
  },
];

export default function ExpertisePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [accountType, setAccountType] = useState<AccountType | undefined>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [saving, setSaving] = useState(false);
  const nextLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const stored = getOnboarding();
    if (stored.expertise && stored.expertise.length) {
      setSelected(stored.expertise);
    }
    setAccountType(stored.accountType);
    setRoles(stored.roles ?? []);
  }, []);

  const visibleAreas = roles.length
    ? AREAS.filter((a) => a.roles.some((r) => roles.includes(r)))
    : AREAS;

  const toggle = (k: string) =>
    setSelected((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );

  const handleContinue = () => {
    if (saving || selected.length === 0) return;
    setSaving(true);
    window.setTimeout(() => {
      setOnboarding({ expertise: selected });
      nextLinkRef.current?.click();
    }, 600);
  };

  return (
    <PhoneFrame label="Onboarding · Expertise">
      <a
        ref={nextLinkRef}
        href="/onboarding/personal"
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Continue
      </a>
      <AppBar back href="/role" title="Area of Expertise" />

      <div className="flex flex-col min-h-[calc(100%-4rem)] px-4 pt-4 pb-6">
        <div className="mb-6">
          <OnboardingStepBar
            current={3}
            label="Area of Expertise"
            steps={getOnboardingSteps(accountType)}
          />
        </div>

        <h1 className="t-h1 font-bold text-neutral-800 tracking-tight">
          What Do You Specialise In?
        </h1>
        <p className="t-body text-neutral-500 mt-2">
          Pick every area you can take up. You can update this later from your
          profile.
        </p>

        <div className="space-y-3 mt-6">
          {visibleAreas.map((a) => {
            const active = selected.includes(a.key);
            return (
              <button
                key={a.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(a.key)}
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
                    <div className="flex-1 min-w-0 self-center">
                      <div className="t-body-lg font-bold text-neutral-800">
                        {a.title}
                      </div>
                      <div className="t-body-sm text-neutral-500 mt-0.5 leading-snug">
                        {a.desc}
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

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={selected.length === 0}
          loading={saving}
          onClick={handleContinue}
        >
          {saving ? "Saving…" : "Continue"}
        </Button>
      </div>
    </PhoneFrame>
  );
}
