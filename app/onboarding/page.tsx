"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card } from "@/components/ui";
import { CheckSquare } from "lucide-react";

const STEPS = [
  { n: 1, title: "Personal", time: "~1 min" },
  { n: 2, title: "Professional", time: "~1 min" },
  { n: 3, title: "Documents", time: "~2 min" },
  { n: 4, title: "Bank", time: "~1 min" },
  { n: 5, title: "Agreement", time: "~30 sec" },
];

export default function OnboardingWelcomePage() {
  return (
    <PhoneFrame label="Onboarding · Welcome">
      <AppBar back href="/role" />
      <div className="px-4 pt-4 pb-4">
        <h1 className="t-h1 font-bold text-neutral-800 tracking-tight">
          Let&apos;s Get You Set Up
        </h1>
        <p className="t-body text-neutral-500 mt-1">
          This takes about 5 minutes
        </p>

        <Card padding="none" className="mt-4 overflow-hidden">
          <div className="divide-y divide-[var(--border-subtle)]">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-bold t-body-sm shrink-0 tabular">
                  {s.n}
                </div>
                <div className="flex-1">
                  <div className="t-body-lg font-semibold text-neutral-800">
                    {s.title}
                  </div>
                </div>
                <span className="t-caption text-neutral-500 tabular">
                  {s.time}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-4">
          <Card padding="sm">
            <div className="t-caption font-semibold text-neutral-500 mb-3">
              Keep handy
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-4 t-body-sm text-neutral-700">
              {["Aadhaar", "PAN", "Bar Council ID", "Bank account details"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckSquare
                      size={20}
                      strokeWidth={2}
                      className="text-primary-600 shrink-0"
                    />
                    {item}
                  </li>
                )
              )}
            </ul>
          </Card>
        </div>

      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4 space-y-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          href="/onboarding/personal"
        >
          Let&apos;s Start →
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          href="/home"
        >
          Skip for now
        </Button>
      </div>
    </PhoneFrame>
  );
}
