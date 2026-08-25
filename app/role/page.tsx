"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card } from "@/components/ui";
import { OnboardingStepBar } from "@/app/onboarding/steps";
import {
  getOnboarding,
  setOnboarding,
  type Role,
} from "@/lib/onboarding-store";
import { Check } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const ROLES: {
  key: Role;
  title: string;
  desc: string;
  img: string;
  alt: string;
}[] = [
  {
    key: "lawyer",
    title: "I Am A Lawyer",
    desc: "On-spot legal representation for challans, accidents, and court matters",
    img: "/lawyer-icon.png",
    alt: "Lawyer",
  },
  {
    key: "rto",
    title: "I Am An RTO Agent",
    desc: "RTO documentation, registration, and challan management",
    img: "/rto-agent-icon.png",
    alt: "RTO Agent",
  },
];

export default function RoleSelectPage() {
  const [selected, setSelected] = useState<Role[]>([]);
  const [saving, setSaving] = useState(false);
  const nextLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const stored = getOnboarding().roles;
    if (stored && stored.length) setSelected(stored);
  }, []);

  const toggle = (r: Role) =>
    setSelected((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );

  const handleContinue = () => {
    if (saving || selected.length === 0) return;
    setSaving(true);
    window.setTimeout(() => {
      setOnboarding({ roles: selected });
      nextLinkRef.current?.click();
    }, 600);
  };

  return (
    <PhoneFrame label="Role Selection">
      <a
        ref={nextLinkRef}
        href="/onboarding/personal"
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Continue
      </a>
      <AppBar back href="/account-type" />

      <div className="flex flex-col min-h-[calc(100%-4rem)] px-4 pt-4 pb-6">
        <div className="mb-6">
          <OnboardingStepBar current={2} label="Expertise" />
        </div>

        <h1 className="t-h1 font-bold text-neutral-800 tracking-tight">
          What Is Your Area Of Practice?
        </h1>
        <p className="t-body text-neutral-500 mt-2">
          Choose the role that best matches your practice
        </p>

        <div className="space-y-3 mt-6">
          {ROLES.map((r) => {
            const active = selected.includes(r.key);
            return (
              <button
                key={r.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(r.key)}
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
                    <div className="w-28 h-28 rounded-xl overflow-hidden shrink-0 relative bg-[#e0f2fe]">
                      <Image
                        src={r.img}
                        alt={r.alt}
                        fill
                        sizes="112px"
                        className="object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0 self-center">
                      <div className="t-body-lg font-bold text-neutral-800">
                        {r.title}
                      </div>
                      <div className="t-body-sm text-neutral-500 mt-0.5 leading-snug">
                        {r.desc}
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
