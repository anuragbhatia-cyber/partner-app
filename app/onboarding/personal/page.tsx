"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button } from "@/components/ui";
import { Calendar } from "lucide-react";
import { OnboardingStepBar } from "@/app/onboarding/steps";
import { useRef, useState } from "react";

const TODAY_ISO = new Date().toISOString().slice(0, 10);

export default function PersonalInfoPage() {
  const [dob, setDob] = useState("");
  const dateRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const el = dateRef.current;
    if (!el) return;
    // Chromium exposes showPicker(); other engines require focus + click
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
        return;
      } catch {
        /* fall through */
      }
    }
    el.focus();
    el.click();
  };

  return (
    <PhoneFrame label="Onboarding · Personal">
      <AppBar back href="/role" title="Personal Details" />

      <div className="px-4 pt-4 pb-32">
        <OnboardingStepBar current={2} label="Personal Details" />

        <h1 className="t-h1 font-bold text-neutral-800 tracking-tight mt-6">
          Enter Personal Details
        </h1>

        <div className="space-y-5 mt-6">
          <Field label="Full Name" placeholder="As per Aadhaar" />
          <Field
            label="Date of Birth"
            placeholder="DD / MM / YYYY"
            value={dob}
            onChange={(v) => setDob(formatDob(v))}
            inputMode="numeric"
            rightIcon={
              <>
                <button
                  type="button"
                  onClick={openPicker}
                  aria-label="Open calendar"
                  className="w-8 h-8 -mr-1 rounded-lg flex items-center justify-center text-neutral-500 hover:text-primary-600 hover:bg-primary-50/50 transition-colors"
                >
                  <Calendar size={16} />
                </button>
                <input
                  ref={dateRef}
                  type="date"
                  max={TODAY_ISO}
                  value={dobToIso(dob) ?? ""}
                  onChange={(e) => setDob(isoToDob(e.target.value))}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                />
              </>
            }
          />
          <div className="grid grid-cols-[2fr_1fr] gap-3">
            <Field label="Email" placeholder="name@example.com" />
            <Field label="Pincode" placeholder="560102" />
          </div>
          <Field
            label="Current Address"
            placeholder=""
            multiline
          />
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          href="/onboarding/documents"
        >
          Continue →
        </Button>
      </div>
    </PhoneFrame>
  );
}

function formatDob(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join(" / ");
}

function dobToIso(dob: string): string | null {
  const digits = dob.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  return `${yyyy}-${mm}-${dd}`;
}

function isoToDob(iso: string): string {
  if (!iso) return "";
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd} / ${mm} / ${yyyy}`;
}

function Field({
  label,
  placeholder,
  multiline,
  disabled,
  rightIcon,
  value,
  onChange,
  inputMode,
  maxLength,
}: {
  label: string;
  placeholder: string;
  multiline?: boolean;
  disabled?: boolean;
  rightIcon?: React.ReactNode;
  value?: string;
  onChange?: (v: string) => void;
  inputMode?: "text" | "numeric" | "tel" | "email";
  maxLength?: number;
}) {
  return (
    <div className="min-w-0">
      <label className="t-caption font-semibold text-neutral-700 mb-1.5 block">
        {label} <span className="text-error">*</span>
      </label>
      <div
        className={`flex items-center rounded-xl border bg-white overflow-hidden transition-colors ${
          disabled
            ? "bg-neutral-25 border-[var(--border-subtle)]"
            : "border-[var(--border-default)] focus-within:border-primary-500"
        }`}
      >
        {multiline ? (
          <textarea
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 min-w-0 px-4 py-3 t-body-lg text-neutral-800 placeholder:text-neutral-400 h-20 resize-none focus:outline-none bg-transparent"
          />
        ) : (
          <input
            placeholder={placeholder}
            disabled={disabled}
            size={1}
            value={value}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            inputMode={inputMode}
            maxLength={maxLength}
            className="flex-1 min-w-0 px-4 py-3 t-body-lg text-neutral-800 placeholder:text-neutral-400 focus:outline-none bg-transparent tabular"
          />
        )}
        {rightIcon && <div className="pr-4">{rightIcon}</div>}
      </div>
    </div>
  );
}
