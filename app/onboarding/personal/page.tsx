"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button } from "@/components/ui";
import {
  AlertCircle,
  Calendar,
  Camera,
  Check,
  Image as ImageIcon,
  Trash2,
  X,
} from "lucide-react";
import { OnboardingStepBar } from "@/app/onboarding/steps";
import { getOnboarding, setOnboarding } from "@/lib/onboarding-store";
import { useEffect, useRef, useState } from "react";

const TODAY_ISO = new Date().toISOString().slice(0, 10);

type Fields = {
  photo: string;
  name: string;
  dob: string;
  email: string;
  pincode: string;
  address: string;
};

type Touched = Record<keyof Fields, boolean>;

const EMPTY_FIELDS: Fields = {
  photo: "",
  name: "",
  dob: "",
  email: "",
  pincode: "",
  address: "",
};

const EMPTY_TOUCHED: Touched = {
  photo: false,
  name: false,
  dob: false,
  email: false,
  pincode: false,
  address: false,
};

export default function PersonalInfoPage() {
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [touched, setTouched] = useState<Touched>(EMPTY_TOUCHED);
  const [saving, setSaving] = useState(false);
  const [canOpenPicker, setCanOpenPicker] = useState(false);
  const [photoSheet, setPhotoSheet] = useState(false);
  const dateRef = useRef<HTMLInputElement>(null);
  const nextLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const stored = getOnboarding().personal;
    if (stored) {
      setFields({
        photo: stored.photo ?? "",
        name: stored.name ?? "",
        dob: stored.dob ?? "",
        email: stored.email ?? "",
        pincode: stored.pincode ?? "",
        address: stored.address ?? "",
      });
    }
    if (typeof dateRef.current?.showPicker === "function") {
      setCanOpenPicker(true);
    }
  }, []);

  const errors = validateAll(fields);
  const isValid = Object.values(errors).every((e) => !e);

  const patch = (key: keyof Fields, value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  const markTouched = (key: keyof Fields) =>
    setTouched((t) => ({ ...t, [key]: true }));

  const openPicker = () => {
    const el = dateRef.current;
    if (!el || typeof el.showPicker !== "function") return;
    try {
      el.showPicker();
    } catch (err) {
      console.warn("DOB picker failed to open; user can type manually.", err);
    }
  };

  const handleContinue = () => {
    if (saving) return;
    if (!isValid) {
      setTouched({
        photo: true,
        name: true,
        dob: true,
        email: true,
        pincode: true,
        address: true,
      });
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setOnboarding({
        personal: {
          photo: fields.photo,
          name: fields.name.trim(),
          dob: fields.dob,
          email: fields.email.trim(),
          pincode: fields.pincode,
          address: fields.address.trim(),
        },
      });
      nextLinkRef.current?.click();
    }, 800);
  };

  const handlePhotoUpload = () => {
    patch("photo", "uploaded");
    markTouched("photo");
    setPhotoSheet(false);
  };

  const handlePhotoRemove = () => {
    patch("photo", "");
    setPhotoSheet(false);
  };

  const showError = (key: keyof Fields) =>
    touched[key] ? errors[key] : undefined;

  const initials = fields.name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const photoError = showError("photo");
  const hasPhoto = !!fields.photo;

  return (
    <PhoneFrame label="Onboarding · Personal">
      <a
        ref={nextLinkRef}
        href="/onboarding/documents"
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Continue
      </a>
      <AppBar back href="/role" title="Personal Details" />

      <div className="px-4 pt-4 pb-32">
        <OnboardingStepBar current={3} label="Personal Details" />

        <h1 className="t-h1 font-bold text-neutral-800 tracking-tight mt-6">
          Enter Personal Details
        </h1>

        <div className="mt-6 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setPhotoSheet(true)}
            aria-label={hasPhoto ? "Change profile photo" : "Add profile photo"}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center overflow-hidden transition-colors ${
              hasPhoto
                ? "bg-primary-100 text-primary-700"
                : photoError
                  ? "bg-error-subtle border-2 border-error text-error-bold"
                  : "bg-neutral-100 border-2 border-dashed border-neutral-300 text-neutral-500 hover:border-primary-400 hover:text-primary-600"
            }`}
          >
            {hasPhoto ? (
              initials ? (
                <span className="t-h1 font-bold">{initials}</span>
              ) : (
                <Camera size={28} />
              )
            ) : (
              <Camera size={28} />
            )}
            {hasPhoto && (
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-success text-white flex items-center justify-center border-2 border-white">
                <Check size={14} strokeWidth={3} />
              </span>
            )}
          </button>
          <p className="mt-3 t-body-sm font-semibold text-neutral-700">
            Profile photo <span className="text-error">*</span>
          </p>
          {photoError && (
            <p
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 t-caption text-error font-medium"
            >
              <AlertCircle size={13} />
              <span>{photoError}</span>
            </p>
          )}
        </div>

        <div className="space-y-5 mt-6">
          <Field
            label="Full Name"
            placeholder="As per Aadhaar"
            value={fields.name}
            onChange={(v) => patch("name", v)}
            onBlur={() => markTouched("name")}
            maxLength={80}
            error={showError("name")}
          />
          <Field
            label="Date of Birth"
            placeholder="DD / MM / YYYY"
            value={fields.dob}
            onChange={(v) => patch("dob", formatDob(v))}
            onBlur={() => markTouched("dob")}
            inputMode="numeric"
            error={showError("dob")}
            rightIcon={
              <>
                {canOpenPicker && (
                  <button
                    type="button"
                    onClick={openPicker}
                    aria-label="Open calendar"
                    className="w-8 h-8 -mr-1 rounded-lg flex items-center justify-center text-neutral-500 hover:text-primary-600 hover:bg-primary-50/50 transition-colors"
                  >
                    <Calendar size={16} />
                  </button>
                )}
                <input
                  ref={dateRef}
                  type="date"
                  max={TODAY_ISO}
                  value={dobToIso(fields.dob) ?? ""}
                  onChange={(e) => {
                    patch("dob", isoToDob(e.target.value));
                    markTouched("dob");
                  }}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                />
              </>
            }
          />
          <div className="grid grid-cols-[2fr_1fr] gap-3">
            <Field
              label="Email"
              placeholder="name@example.com"
              value={fields.email}
              onChange={(v) => patch("email", v)}
              onBlur={() => markTouched("email")}
              inputMode="email"
              maxLength={120}
              error={showError("email")}
            />
            <Field
              label="Pincode"
              placeholder="560102"
              value={fields.pincode}
              onChange={(v) => patch("pincode", v.replace(/\D/g, "").slice(0, 6))}
              onBlur={() => markTouched("pincode")}
              inputMode="numeric"
              maxLength={6}
              error={showError("pincode")}
            />
          </div>
          <Field
            label="Current Address"
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

      <PhotoSheet
        open={photoSheet}
        hasPhoto={hasPhoto}
        onClose={() => setPhotoSheet(false)}
        onUpload={handlePhotoUpload}
        onRemove={handlePhotoRemove}
      />
    </PhoneFrame>
  );
}

function PhotoSheet({
  open,
  hasPhoto,
  onClose,
  onUpload,
  onRemove,
}: {
  open: boolean;
  hasPhoto: boolean;
  onClose: () => void;
  onUpload: () => void;
  onRemove: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-sheet-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 animate-[fadeInBackdrop_180ms_ease-out]"
      />
      <div className="mt-auto relative bg-white rounded-t-3xl shadow-e3 flex flex-col animate-[sheetIn_260ms_cubic-bezier(0.2,0,0,1)]">
        <div className="pt-2 pb-1 flex justify-center">
          <span className="w-10 h-1.5 rounded-full bg-neutral-200" />
        </div>
        <div className="px-5 pt-2 pb-3 flex items-start justify-between gap-3">
          <div>
            <h2
              id="photo-sheet-title"
              className="t-h2 font-bold text-neutral-800 tracking-tight"
            >
              {hasPhoto ? "Replace profile photo" : "Add a profile photo"}
            </h2>
            <p className="t-body-sm text-neutral-500 mt-1">
              Face the camera in good lighting, no filters or sunglasses.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-4 py-3 space-y-2">
          <PhotoAction
            icon={<Camera size={18} />}
            title="Take a photo"
            subtitle="Use your camera"
            onClick={onUpload}
          />
          <PhotoAction
            icon={<ImageIcon size={18} />}
            title="Choose from gallery"
            subtitle="Pick an existing image"
            onClick={onUpload}
          />
          {hasPhoto && (
            <PhotoAction
              icon={<Trash2 size={18} />}
              title="Remove photo"
              subtitle="You'll need to add one again"
              tone="danger"
              onClick={onRemove}
            />
          )}
        </div>
        <div className="px-4 pt-1 pb-5">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes sheetIn {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function PhotoAction({
  icon,
  title,
  subtitle,
  tone = "default",
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone?: "default" | "danger";
  onClick: () => void;
}) {
  const badge =
    tone === "danger"
      ? "bg-error-subtle text-error-bold"
      : "bg-primary-50 text-primary-700";
  const label =
    tone === "danger" ? "text-error-bold" : "text-neutral-800";
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-[var(--border-subtle)] hover:border-primary-300 hover:bg-primary-50/40 transition-colors text-left"
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${badge}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`t-body font-semibold ${label}`}>{title}</div>
        <div className="t-caption text-neutral-500 mt-0.5">{subtitle}</div>
      </div>
    </button>
  );
}

/* ---------- validation ---------- */

function validateAll(f: Fields): Record<keyof Fields, string | null> {
  return {
    photo: validatePhoto(f.photo),
    name: validateName(f.name),
    dob: validateDob(f.dob),
    email: validateEmail(f.email),
    pincode: validatePincode(f.pincode),
    address: validateAddress(f.address),
  };
}

function validatePhoto(v: string): string | null {
  if (!v) return "Add a profile photo so clients can recognise you.";
  return null;
}

function validateName(v: string): string | null {
  const t = v.trim();
  if (!t) return "Full name is required.";
  if (t.length < 2) return "Name must be at least 2 characters.";
  if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(t))
    return "Use letters, spaces, dots or hyphens only.";
  return null;
}

function validateDob(v: string): string | null {
  if (!v) return "Date of birth is required.";
  const digits = v.replace(/\D/g, "");
  if (digits.length !== 8) return "Enter date as DD / MM / YYYY.";
  const dd = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));
  const yyyy = Number(digits.slice(4, 8));
  const d = new Date(yyyy, mm - 1, dd);
  if (
    d.getFullYear() !== yyyy ||
    d.getMonth() !== mm - 1 ||
    d.getDate() !== dd
  )
    return "That date doesn't look right.";
  if (d > new Date()) return "Date can't be in the future.";
  const age = ageInYears(d);
  if (age < 18) return "You must be 18 or older to register.";
  if (age > 100) return "Please check the year of birth.";
  return null;
}

function validateEmail(v: string): string | null {
  const t = v.trim();
  if (!t) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t))
    return "Enter a valid email address.";
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
  if (!t) return "Address is required.";
  if (t.length < 10) return "Address feels too short — add more detail.";
  return null;
}

function ageInYears(dob: Date) {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

/* ---------- date helpers ---------- */

function formatDob(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 4),
    digits.slice(4, 8),
  ].filter(Boolean);
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

/* ---------- field ---------- */

function Field({
  label,
  placeholder,
  multiline,
  disabled,
  rightIcon,
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
  disabled?: boolean;
  rightIcon?: React.ReactNode;
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
          disabled
            ? "bg-neutral-25 border-[var(--border-subtle)]"
            : error
              ? "border-error focus-within:border-error"
              : "border-[var(--border-default)] focus-within:border-primary-500"
        }`}
      >
        {multiline ? (
          <textarea
            placeholder={placeholder}
            disabled={disabled}
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
            disabled={disabled}
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
        {rightIcon && <div className="pr-4">{rightIcon}</div>}
      </div>
      {error && (
        <p className="mt-1.5 flex items-start gap-1.5 t-caption text-error font-medium">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
