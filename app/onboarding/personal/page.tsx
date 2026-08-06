"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Stepper } from "@/components/ui";
import { Calendar } from "lucide-react";
import { ONBOARDING_STEPS } from "@/app/onboarding/steps";

export default function PersonalInfoPage() {
  return (
    <PhoneFrame label="Onboarding · Personal">
      <AppBar back href="/onboarding" title="Personal Details" />

      <div className="px-4 pt-2 pb-32">
        <div className="pt-4 pb-8">
          <Stepper current={1} steps={ONBOARDING_STEPS} />
        </div>

        <h1 className="t-h2 font-bold text-neutral-800 tracking-tight">
          Personal Details
        </h1>

        <div className="space-y-5 mt-6">
          <Field label="Full Name" placeholder="As per Aadhaar" />
          <Field
            label="Date of Birth"
            placeholder="DD / MM / YYYY"
            rightIcon={<Calendar size={16} className="text-neutral-400" />}
          />
          <Field label="Email" placeholder="name@example.com" />
          <Field
            label="Current Address"
            placeholder=""
            multiline
          />
          <div className="grid grid-cols-[1fr_2fr] gap-3">
            <Field label="Pincode" placeholder="560102" />
            <Field label="City, State" placeholder="Auto-filled" disabled />
          </div>
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

function Field({
  label,
  placeholder,
  multiline,
  disabled,
  rightIcon,
}: {
  label: string;
  placeholder: string;
  multiline?: boolean;
  disabled?: boolean;
  rightIcon?: React.ReactNode;
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
            className="flex-1 min-w-0 px-4 py-3 t-body-lg text-neutral-800 placeholder:text-neutral-400 focus:outline-none bg-transparent"
          />
        )}
        {rightIcon && <div className="pr-4">{rightIcon}</div>}
      </div>
    </div>
  );
}
