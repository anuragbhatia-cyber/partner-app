"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button } from "@/components/ui";
import { OnboardingStepBar, getOnboardingSteps } from "@/app/onboarding/steps";
import {
  getOnboarding,
  setOnboarding,
  type AccountType,
} from "@/lib/onboarding-store";
import { useEffect, useRef, useState } from "react";

type Fields = {
  companyName: string;
  gstin: string;
  pincode: string;
  address: string;
};

type Touched = Record<keyof Fields, boolean>;

const EMPTY_FIELDS: Fields = {
  companyName: "",
  gstin: "",
  pincode: "",
  address: "",
};

const EMPTY_TOUCHED: Touched = {
  companyName: false,
  gstin: false,
  pincode: false,
  address: false,
};

export default function BusinessDetailsPage() {
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [touched, setTouched] = useState<Touched>(EMPTY_TOUCHED);
  const [accountType, setAccountType] = useState<AccountType | undefined>();
  const [saving, setSaving] = useState(false);
  const nextLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const stored = getOnboarding();
    if (stored.business) {
      setFields({
        companyName: stored.business.companyName ?? "",
        gstin: stored.business.gstin ?? "",
        pincode: stored.business.pincode ?? "",
        address: stored.business.address ?? "",
      });
    }
    setAccountType(stored.accountType);
  }, []);

  const errors = validateAll(fields);
  const isValid = Object.values(errors).every((e) => !e);

  const patch = (key: keyof Fields, value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  const markTouched = (key: keyof Fields) =>
    setTouched((t) => ({ ...t, [key]: true }));

  const showError = (key: keyof Fields) =>
    touched[key] ? errors[key] : undefined;

  const handleContinue = () => {
    if (saving) return;
    if (!isValid) {
      setTouched({
        companyName: true,
        gstin: true,
        pincode: true,
        address: true,
      });
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setOnboarding({
        business: {
          companyName: fields.companyName.trim(),
          gstin: fields.gstin.trim().toUpperCase(),
          pincode: fields.pincode,
          address: fields.address.trim(),
        },
      });
      nextLinkRef.current?.click();
    }, 700);
  };

  return (
    <PhoneFrame label="Onboarding · Business">
      <a
        ref={nextLinkRef}
        href="/onboarding/documents"
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Continue
      </a>
      <AppBar back href="/onboarding/personal" title="Business Details" />

      <div className="px-4 pt-4 pb-32">
        <OnboardingStepBar
          current={4}
          label="Business Details"
          steps={getOnboardingSteps(accountType ?? "business")}
        />

        <h1 className="t-h1 font-bold text-neutral-800 tracking-tight mt-6">
          Enter Business Details
        </h1>

        <div className="space-y-5 mt-6">
          <Field
            label="Company Name"
            placeholder="As per GST certificate"
            value={fields.companyName}
            onChange={(v) => patch("companyName", v)}
            onBlur={() => markTouched("companyName")}
            maxLength={120}
            error={showError("companyName")}
          />
          <Field
            label="GSTIN"
            placeholder="22ABCDE1234F1Z5"
            value={fields.gstin}
            onChange={(v) =>
              patch(
                "gstin",
                v.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 15)
              )
            }
            onBlur={() => markTouched("gstin")}
            inputMode="text"
            maxLength={15}
            error={showError("gstin")}
          />
          <Field
            label="Company Pincode"
            placeholder="560102"
            value={fields.pincode}
            onChange={(v) => patch("pincode", v.replace(/\D/g, "").slice(0, 6))}
            onBlur={() => markTouched("pincode")}
            inputMode="numeric"
            maxLength={6}
            error={showError("pincode")}
          />
          <Field
            label="Company Address"
            placeholder=""
            multiline
            value={fields.address}
            onChange={(v) => patch("address", v)}
            onBlur={() => markTouched("address")}
            maxLength={200}
            error={showError("address")}
          />
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={saving}
          disabled={!isValid && Object.values(touched).some(Boolean)}
          onClick={handleContinue}
        >
          {saving ? "Saving…" : "Continue"}
        </Button>
      </div>
    </PhoneFrame>
  );
}

/* ---------- validation ---------- */

function validateAll(f: Fields): Record<keyof Fields, string | null> {
  return {
    companyName: validateCompanyName(f.companyName),
    gstin: validateGstin(f.gstin),
    pincode: validatePincode(f.pincode),
    address: validateAddress(f.address),
  };
}

function validateCompanyName(v: string): string | null {
  const t = v.trim();
  if (!t) return "Company name is required.";
  if (t.length < 3) return "Company name must be at least 3 characters.";
  return null;
}

function validateGstin(v: string): string | null {
  const t = v.trim().toUpperCase();
  if (!t) return "GSTIN is required.";
  if (!/^[0-9A-Z]{15}$/.test(t))
    return "GSTIN must be 15 characters.";
  return null;
}

function validatePincode(v: string): string | null {
  if (!v) return "Pincode is required.";
  if (!/^[1-9][0-9]{5}$/.test(v))
    return "Enter a valid 6-digit Indian pincode.";
  return null;
}

function validateAddress(v: string): string | null {
  const t = v.trim();
  if (!t) return "Company address is required.";
  if (t.length < 10) return "Address feels too short — add more detail.";
  return null;
}

/* ---------- field ---------- */

function Field({
  label,
  placeholder,
  multiline,
  value,
  onChange,
  onBlur,
  inputMode,
  maxLength,
  error,
}: {
  label: string;
  placeholder: string;
  multiline?: boolean;
  value?: string;
  onChange?: (v: string) => void;
  onBlur?: () => void;
  inputMode?: "text" | "numeric" | "tel" | "email";
  maxLength?: number;
  error?: string | null;
}) {
  return (
    <div className="min-w-0">
      <label className="t-caption font-semibold text-neutral-700 mb-1.5 block">
        {label} <span className="text-error">*</span>
      </label>
      <div
        className={`flex items-center rounded-xl border bg-white overflow-hidden transition-colors ${
          error
            ? "border-error focus-within:border-error"
            : "border-[var(--border-default)] focus-within:border-primary-500"
        }`}
      >
        {multiline ? (
          <textarea
            placeholder={placeholder}
            value={value}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            onBlur={onBlur}
            maxLength={maxLength}
            aria-invalid={error ? true : undefined}
            className="flex-1 min-w-0 px-4 py-3 t-body-lg text-neutral-800 placeholder:text-neutral-400 h-20 resize-none focus:outline-none bg-transparent"
          />
        ) : (
          <input
            placeholder={placeholder}
            size={1}
            value={value}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            onBlur={onBlur}
            inputMode={inputMode}
            maxLength={maxLength}
            aria-invalid={error ? true : undefined}
            className="flex-1 min-w-0 px-4 py-3 t-body-lg text-neutral-800 placeholder:text-neutral-400 focus:outline-none bg-transparent tabular"
          />
        )}
      </div>
      {error && (
        <p className="mt-1.5 t-caption text-error font-medium">{error}</p>
      )}
    </div>
  );
}
