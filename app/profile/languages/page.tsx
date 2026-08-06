"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card, SectionLabel } from "@/components/ui";
import { Check } from "lucide-react";
import { useState } from "react";

const OPTIONS = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
];

export default function ProfileLanguagesPage() {
  const [primary, setPrimary] = useState("en");
  const [spoken, setSpoken] = useState<string[]>(["en", "hi", "kn"]);

  const toggle = (code: string) => {
    if (code === primary) return;
    setSpoken((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <PhoneFrame label="Profile · Languages">
      <AppBar back href="/profile" title="Languages" />

      <div className="px-4 py-4 pb-32 space-y-4">
        <SectionLabel className="mb-2">App language</SectionLabel>
        <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
          {OPTIONS.map((o) => (
            <button
              key={o.code}
              type="button"
              onClick={() => setPrimary(o.code)}
              className="w-full flex items-center px-4 py-3.5 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex-1 min-w-0 text-left">
                <div className="t-body font-medium text-neutral-800">
                  {o.label}
                </div>
                <div className="t-caption text-neutral-500 mt-0.5">
                  {o.native}
                </div>
              </div>
              {primary === o.code && (
                <Check size={18} className="text-primary-600 shrink-0" />
              )}
            </button>
          ))}
        </Card>

        <SectionLabel className="mb-2">Languages you speak</SectionLabel>
        <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
          {OPTIONS.map((o) => {
            const selected = spoken.includes(o.code);
            const isPrimary = primary === o.code;
            return (
              <button
                key={o.code}
                type="button"
                onClick={() => toggle(o.code)}
                disabled={isPrimary}
                className="w-full flex items-center px-4 py-3.5 hover:bg-neutral-50 transition-colors disabled:opacity-60"
              >
                <div className="flex-1 min-w-0 text-left">
                  <div className="t-body font-medium text-neutral-800">
                    {o.label}
                    {isPrimary && (
                      <span className="ml-2 t-caption font-semibold text-primary-600">
                        · Primary
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                    selected
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "bg-white border-neutral-300"
                  }`}
                >
                  {selected && <Check size={14} />}
                </div>
              </button>
            );
          })}
        </Card>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button variant="primary" size="lg" fullWidth href="/profile">
          Save
        </Button>
      </div>
    </PhoneFrame>
  );
}
