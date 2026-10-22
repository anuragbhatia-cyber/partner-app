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

type Area = { key: string; title: string; roles: Role[] };

const AREAS: Area[] = [
  { key: "criminal-law", title: "Criminal Law", roles: ["lawyer", "rto"] },
  { key: "motor-vehicle-act", title: "Motor Vehicle Act", roles: ["lawyer", "rto"] },
  { key: "corporate-litigation", title: "Corporate Litigation", roles: ["lawyer", "rto"] },
  { key: "consumer-protection", title: "Consumer Protection Law", roles: ["lawyer", "rto"] },
  { key: "intellectual-property", title: "Intellectual Property", roles: ["lawyer", "rto"] },
  { key: "employment-labour", title: "Employment and Labour Laws", roles: ["lawyer", "rto"] },
  { key: "startup-compliance", title: "Startup and Corporate Compliance", roles: ["lawyer", "rto"] },
  { key: "taxation", title: "Taxation", roles: ["lawyer", "rto"] },
  { key: "adr", title: "ADR", roles: ["lawyer", "rto"] },
  { key: "family-law", title: "Family Law", roles: ["lawyer", "rto"] },
  { key: "insolvency-bankruptcy", title: "Insolvency and Bankruptcy Law", roles: ["lawyer", "rto"] },
  { key: "other", title: "Other", roles: ["lawyer", "rto"] },
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
        href={accountType === "business" ? "/onboarding/business" : "/onboarding/personal"}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Continue
      </a>
      <AppBar back href="/role" title="Area of Expertise" />

      <div className="px-4 pt-4 pb-32">
        <div className="mb-6">
          <OnboardingStepBar
            current={3}
            label="Area of Expertise"
            steps={getOnboardingSteps(accountType)}
          />
        </div>

        <h1 className="t-h1 font-bold text-neutral-800 tracking-tight">
          What is your area of expertise?
        </h1>

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
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="t-body-lg font-medium text-neutral-800">
                        {a.title}
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
