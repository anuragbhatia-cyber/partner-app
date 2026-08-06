"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Stepper } from "@/components/ui";
import { AlertCircle } from "lucide-react";

export default function BankPage() {
  return (
    <PhoneFrame label="Onboarding · Bank">
      <AppBar back href="/onboarding/documents" title="Bank Account" />

      <div className="px-4 pt-2 pb-32">
        <div className="pt-4 pb-8">
          <Stepper current={4} total={5} />
        </div>

        <h1 className="t-h2 font-bold text-neutral-800 tracking-tight">
          Bank Account
        </h1>
        <p className="t-body text-neutral-500 mt-2">
          Your payouts will be sent to this account
        </p>

        <div className="space-y-5 mt-6">
          <Field
            label="Account Holder Name"
            placeholder="As per Aadhaar"
            hint={
              <span className="text-warning-bold t-caption flex items-center gap-1 mt-1.5">
                <AlertCircle size={12} />
                Must match Aadhaar name
              </span>
            }
          />
          <Field label="Account Number" placeholder="" />
          <Field label="Re-enter Account Number" placeholder="" />
          <Field
            label="IFSC Code"
            placeholder="HDFC0001234"
            hint={
              <div className="t-caption text-success-bold font-medium mt-1.5">
                ✓ HDFC Bank · Koramangala Branch
              </div>
            }
          />
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          href="/onboarding/agreement"
        >
          Verify &amp; Save
        </Button>
      </div>
    </PhoneFrame>
  );
}

function Field({
  label,
  placeholder,
  hint,
}: {
  label: string;
  placeholder: string;
  hint?: React.ReactNode;
}) {
  return (
    <div>
      <label className="t-caption font-semibold text-neutral-700 mb-1.5 block">
        {label} <span className="text-error">*</span>
      </label>
      <input
        placeholder={placeholder}
        className="w-full px-4 py-3 t-body-lg text-neutral-800 placeholder:text-neutral-400 rounded-xl border border-[var(--border-default)] bg-white focus:outline-none focus:border-primary-500 transition-colors"
      />
      {hint}
    </div>
  );
}
