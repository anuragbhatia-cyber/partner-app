"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card } from "@/components/ui";

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
      <div className="flex flex-col min-h-[calc(100%-4rem)] px-4 pt-4 pb-4">
        <h1 className="t-h1 font-bold text-neutral-800 tracking-tight">
          Let&apos;s get you set up
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
          <div className="t-caption font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
            Keep handy
          </div>
          <Card padding="sm">
            <ul className="space-y-1 t-body-sm text-neutral-700">
              {["Aadhaar", "PAN", "Bar Council ID", "Bank account details"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                    {item}
                  </li>
                )
              )}
            </ul>
          </Card>
        </div>

        <div className="mt-auto pt-4 space-y-2">
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
      </div>
    </PhoneFrame>
  );
}
