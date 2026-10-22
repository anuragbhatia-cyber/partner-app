"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button } from "@/components/ui";
import {
  AlertCircle,
  Camera,
  Check,
  ChevronDown,
  Home,
  Image as ImageIcon,
  MapPin,
  Trash2,
  User,
  X,
} from "lucide-react";
import { OnboardingStepBar, getOnboardingSteps } from "@/app/onboarding/steps";
import {
  getOnboarding,
  setOnboarding,
  type AccountType,
  type Address,
  type Gender,
} from "@/lib/onboarding-store";
import { useEffect, useMemo, useRef, useState } from "react";

type PersonalFields = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  gender: Gender | "";
  dob: string;
};

type AddressFields = {
  line: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

type Fields = {
  photo: string;
  personal: PersonalFields;
  currentAddress: AddressFields;
  permanentSameAsCurrent: boolean;
  permanentAddress: AddressFields;
};

const EMPTY_PERSONAL: PersonalFields = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  gender: "",
  dob: "",
};

const EMPTY_ADDRESS: AddressFields = {
  line: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

const EMPTY_FIELDS: Fields = {
  photo: "",
  personal: EMPTY_PERSONAL,
  currentAddress: EMPTY_ADDRESS,
  permanentSameAsCurrent: false,
  permanentAddress: EMPTY_ADDRESS,
};

type TouchedPersonal = Record<keyof PersonalFields, boolean>;
type TouchedAddress = Record<keyof AddressFields, boolean>;

type Touched = {
  photo: boolean;
  personal: TouchedPersonal;
  currentAddress: TouchedAddress;
  permanentAddress: TouchedAddress;
};

const EMPTY_TOUCHED: Touched = {
  photo: false,
  personal: {
    firstName: false,
    lastName: false,
    email: false,
    mobile: false,
    gender: false,
    dob: false,
  },
  currentAddress: {
    line: false,
    area: false,
    city: false,
    state: false,
    pincode: false,
    country: false,
  },
  permanentAddress: {
    line: false,
    area: false,
    city: false,
    state: false,
    pincode: false,
    country: false,
  },
};

const ALL_TOUCHED_ADDRESS: TouchedAddress = {
  line: true,
  area: true,
  city: true,
  state: true,
  pincode: true,
  country: true,
};

const ALL_TOUCHED: Touched = {
  photo: true,
  personal: {
    firstName: true,
    lastName: true,
    email: true,
    mobile: true,
    gender: true,
    dob: true,
  },
  currentAddress: ALL_TOUCHED_ADDRESS,
  permanentAddress: ALL_TOUCHED_ADDRESS,
};

export default function PersonalInfoPage() {
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [touched, setTouched] = useState<Touched>(EMPTY_TOUCHED);
  const [accountType, setAccountType] = useState<AccountType | undefined>();
  const [saving, setSaving] = useState(false);
  const [photoSheet, setPhotoSheet] = useState(false);
  const nextLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const stored = getOnboarding();
    if (stored.personal) {
      const p = stored.personal;
      // Backfill from legacy single-name field if present
      const [legacyFirst = "", ...legacyRest] = (p.name ?? "").trim().split(/\s+/);
      const legacyLast = legacyRest.join(" ");
      setFields({
        photo: p.photo ?? "",
        personal: {
          firstName: p.firstName ?? legacyFirst,
          lastName: p.lastName ?? legacyLast,
          email: p.email ?? "",
          mobile: p.mobile ?? "",
          gender: p.gender ?? "",
          dob: p.dob ?? "",
        },
        currentAddress: {
          ...EMPTY_ADDRESS,
          ...(p.currentAddress ?? {}),
          line: p.currentAddress?.line ?? p.address ?? "",
          pincode: p.currentAddress?.pincode ?? p.pincode ?? "",
          country: p.currentAddress?.country ?? "India",
        },
        permanentSameAsCurrent: p.permanentSameAsCurrent ?? false,
        permanentAddress: {
          ...EMPTY_ADDRESS,
          ...(p.permanentAddress ?? {}),
          country: p.permanentAddress?.country ?? "India",
        },
      });
    }
    setAccountType(stored.accountType);
  }, []);

  const nextHref = "/onboarding/documents";
  const backHref =
    accountType === "business" ? "/onboarding/business" : "/onboarding/expertise";
  const currentStep = accountType === "business" ? 5 : 4;

  const errors = useMemo(() => validateAll(fields), [fields]);

  const isValid =
    !errors.photo &&
    isSectionClean(errors.personal) &&
    isSectionClean(errors.currentAddress) &&
    (fields.permanentSameAsCurrent || isSectionClean(errors.permanentAddress));

  const patchPersonal = (key: keyof PersonalFields, value: string) =>
    setFields((f) => ({
      ...f,
      personal: { ...f.personal, [key]: value },
    }));

  const patchAddress =
    (which: "currentAddress" | "permanentAddress") =>
    (key: keyof AddressFields, value: string) =>
      setFields((f) => ({
        ...f,
        [which]: { ...f[which], [key]: value },
      }));

  const markPersonalTouched = (key: keyof PersonalFields) =>
    setTouched((t) => ({
      ...t,
      personal: { ...t.personal, [key]: true },
    }));

  const markAddressTouched =
    (which: "currentAddress" | "permanentAddress") =>
    (key: keyof AddressFields) =>
      setTouched((t) => ({
        ...t,
        [which]: { ...t[which], [key]: true },
      }));

  const showPersonalError = (key: keyof PersonalFields) =>
    touched.personal[key] ? errors.personal[key] : undefined;

  const showAddressError =
    (which: "currentAddress" | "permanentAddress") =>
    (key: keyof AddressFields) =>
      touched[which][key] ? errors[which][key] : undefined;

  const handleContinue = () => {
    if (saving) return;
    if (!isValid) {
      setTouched(ALL_TOUCHED);
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      const permanentAddress = fields.permanentSameAsCurrent
        ? fields.currentAddress
        : fields.permanentAddress;
      setOnboarding({
        personal: {
          photo: fields.photo,
          firstName: fields.personal.firstName.trim(),
          lastName: fields.personal.lastName.trim(),
          email: fields.personal.email.trim(),
          mobile: fields.personal.mobile,
          gender: fields.personal.gender || undefined,
          dob: fields.personal.dob,
          currentAddress: trimAddress(fields.currentAddress),
          permanentSameAsCurrent: fields.permanentSameAsCurrent,
          permanentAddress: trimAddress(permanentAddress),
          // legacy mirrors for downstream reads
          name: `${fields.personal.firstName} ${fields.personal.lastName}`.trim(),
          pincode: fields.currentAddress.pincode,
          address: fields.currentAddress.line.trim(),
        },
      });
      nextLinkRef.current?.click();
    }, 800);
  };

  const handlePhotoUpload = () => {
    setFields((f) => ({ ...f, photo: "uploaded" }));
    setTouched((t) => ({ ...t, photo: true }));
    setPhotoSheet(false);
  };

  const handlePhotoRemove = () => {
    setFields((f) => ({ ...f, photo: "" }));
    setPhotoSheet(false);
  };

  const initials = `${fields.personal.firstName} ${fields.personal.lastName}`
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const photoError = touched.photo ? errors.photo : undefined;
  const hasPhoto = !!fields.photo;

  const personalDone = isSectionClean(errors.personal);
  const currentAddressDone = isSectionClean(errors.currentAddress);
  const permanentAddressDone =
    fields.permanentSameAsCurrent || isSectionClean(errors.permanentAddress);

  return (
    <PhoneFrame label="Onboarding · Personal">
      <a
        ref={nextLinkRef}
        href={nextHref}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Continue
      </a>
      <AppBar back href={backHref} title="Personal Details" />

      <div className="px-4 pt-4 pb-32">
        <OnboardingStepBar
          current={currentStep}
          label="Personal Details"
          steps={getOnboardingSteps(accountType)}
        />

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

        <div className="space-y-3 mt-6">
          <CollapsibleCard
            title="Personal Information"
            icon={<User size={16} />}
            done={personalDone}
            defaultOpen
          >
            <div className="grid grid-cols-2 gap-2.5">
              <Field
                label="First Name"
                required
                placeholder="Enter first name"
                value={fields.personal.firstName}
                onChange={(v) => patchPersonal("firstName", v)}
                onBlur={() => markPersonalTouched("firstName")}
                maxLength={40}
                error={showPersonalError("firstName")}
              />
              <Field
                label="Last Name"
                required
                placeholder="Enter last name"
                value={fields.personal.lastName}
                onChange={(v) => patchPersonal("lastName", v)}
                onBlur={() => markPersonalTouched("lastName")}
                maxLength={40}
                error={showPersonalError("lastName")}
              />
            </div>
            <Field
              label="Email"
              required
              placeholder="email@example.com"
              value={fields.personal.email}
              onChange={(v) => patchPersonal("email", v)}
              onBlur={() => markPersonalTouched("email")}
              inputMode="email"
              maxLength={120}
              error={showPersonalError("email")}
            />
            <Field
              label="Mobile Number"
              required
              placeholder="+91 98765 43210"
              value={fields.personal.mobile}
              onChange={(v) =>
                patchPersonal("mobile", v.replace(/[^\d+ ]/g, "").slice(0, 16))
              }
              onBlur={() => markPersonalTouched("mobile")}
              inputMode="tel"
              maxLength={16}
              error={showPersonalError("mobile")}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <SelectField
                label="Gender"
                value={fields.personal.gender}
                onChange={(v) => patchPersonal("gender", v)}
                options={[
                  { value: "", label: "Select" },
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
              />
              <Field
                label="Date of Birth"
                placeholder="dd/mm/yyyy"
                type="date"
                value={fields.personal.dob}
                onChange={(v) => patchPersonal("dob", v)}
                onBlur={() => markPersonalTouched("dob")}
              />
            </div>
          </CollapsibleCard>

          <CollapsibleCard
            title="Current Address"
            icon={<MapPin size={16} />}
            done={currentAddressDone}
          >
            <Field
              label="Address Line"
              required
              placeholder="Street address"
              value={fields.currentAddress.line}
              onChange={(v) => patchAddress("currentAddress")("line", v)}
              onBlur={() => markAddressTouched("currentAddress")("line")}
              maxLength={200}
              error={showAddressError("currentAddress")("line")}
            />
            <Field
              label="Area/Locality"
              placeholder="Area or locality"
              value={fields.currentAddress.area}
              onChange={(v) => patchAddress("currentAddress")("area", v)}
              onBlur={() => markAddressTouched("currentAddress")("area")}
              maxLength={80}
              error={showAddressError("currentAddress")("area")}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <Field
                label="City"
                required
                placeholder="City"
                value={fields.currentAddress.city}
                onChange={(v) => patchAddress("currentAddress")("city", v)}
                onBlur={() => markAddressTouched("currentAddress")("city")}
                maxLength={60}
                error={showAddressError("currentAddress")("city")}
              />
              <Field
                label="State"
                required
                placeholder="State"
                value={fields.currentAddress.state}
                onChange={(v) => patchAddress("currentAddress")("state", v)}
                onBlur={() => markAddressTouched("currentAddress")("state")}
                maxLength={40}
                error={showAddressError("currentAddress")("state")}
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Field
                label="PIN Code"
                required
                placeholder="PIN code"
                value={fields.currentAddress.pincode}
                onChange={(v) =>
                  patchAddress("currentAddress")(
                    "pincode",
                    v.replace(/\D/g, "").slice(0, 6)
                  )
                }
                onBlur={() => markAddressTouched("currentAddress")("pincode")}
                inputMode="numeric"
                maxLength={6}
                error={showAddressError("currentAddress")("pincode")}
              />
              <Field
                label="Country"
                placeholder="Country"
                value={fields.currentAddress.country}
                onChange={(v) => patchAddress("currentAddress")("country", v)}
                onBlur={() => markAddressTouched("currentAddress")("country")}
                maxLength={40}
              />
            </div>
          </CollapsibleCard>

          <CheckboxRow
            checked={fields.permanentSameAsCurrent}
            onChange={(v) =>
              setFields((f) => ({ ...f, permanentSameAsCurrent: v }))
            }
          >
            Permanent address same as current address
          </CheckboxRow>

          {!fields.permanentSameAsCurrent && (
            <CollapsibleCard
              title="Permanent Address"
              icon={<Home size={16} />}
              done={permanentAddressDone}
            >
              <Field
                label="Address Line"
                required
                placeholder="Street address"
                value={fields.permanentAddress.line}
                onChange={(v) => patchAddress("permanentAddress")("line", v)}
                onBlur={() => markAddressTouched("permanentAddress")("line")}
                maxLength={200}
                error={showAddressError("permanentAddress")("line")}
              />
              <Field
                label="Area/Locality"
                placeholder="Area or locality"
                value={fields.permanentAddress.area}
                onChange={(v) => patchAddress("permanentAddress")("area", v)}
                onBlur={() => markAddressTouched("permanentAddress")("area")}
                maxLength={80}
                error={showAddressError("permanentAddress")("area")}
              />
              <div className="grid grid-cols-2 gap-2.5">
                <Field
                  label="City"
                  required
                  placeholder="City"
                  value={fields.permanentAddress.city}
                  onChange={(v) => patchAddress("permanentAddress")("city", v)}
                  onBlur={() => markAddressTouched("permanentAddress")("city")}
                  maxLength={60}
                  error={showAddressError("permanentAddress")("city")}
                />
                <Field
                  label="State"
                  required
                  placeholder="State"
                  value={fields.permanentAddress.state}
                  onChange={(v) => patchAddress("permanentAddress")("state", v)}
                  onBlur={() => markAddressTouched("permanentAddress")("state")}
                  maxLength={40}
                  error={showAddressError("permanentAddress")("state")}
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Field
                  label="PIN Code"
                  required
                  placeholder="PIN code"
                  value={fields.permanentAddress.pincode}
                  onChange={(v) =>
                    patchAddress("permanentAddress")(
                      "pincode",
                      v.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  onBlur={() =>
                    markAddressTouched("permanentAddress")("pincode")
                  }
                  inputMode="numeric"
                  maxLength={6}
                  error={showAddressError("permanentAddress")("pincode")}
                />
                <Field
                  label="Country"
                  placeholder="Country"
                  value={fields.permanentAddress.country}
                  onChange={(v) =>
                    patchAddress("permanentAddress")("country", v)
                  }
                  onBlur={() =>
                    markAddressTouched("permanentAddress")("country")
                  }
                  maxLength={40}
                />
              </div>
            </CollapsibleCard>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={saving}
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

/* ---------- collapsible card ---------- */

function CollapsibleCard({
  title,
  icon,
  done,
  defaultOpen,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  done?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            done
              ? "bg-success/10 text-success-bold"
              : "bg-primary-50 text-primary-700"
          }`}
        >
          {done ? <Check size={16} strokeWidth={3} /> : icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="t-body-lg font-semibold text-neutral-800">
            {title}
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-neutral-500 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 space-y-3 border-t border-[var(--border-subtle)]">
          {children}
        </div>
      )}
    </div>
  );
}

/* ---------- checkbox row ---------- */

function CheckboxRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const toggle = () => onChange(!checked);
  return (
    <button
      type="button"
      onClick={toggle}
      role="checkbox"
      aria-checked={checked}
      className="w-full flex items-start gap-3 px-1 py-1 text-left"
    >
      <span
        className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
          checked
            ? "bg-primary-600 text-white"
            : "border-2 border-neutral-300 bg-white"
        }`}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </span>
      <span className="t-body text-neutral-800 leading-snug">{children}</span>
    </button>
  );
}

/* ---------- photo sheet ---------- */

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

type PersonalErrors = Record<keyof PersonalFields, string | null>;
type AddressErrors = Record<keyof AddressFields, string | null>;

type Errors = {
  photo: string | null;
  personal: PersonalErrors;
  currentAddress: AddressErrors;
  permanentAddress: AddressErrors;
};

function validateAll(f: Fields): Errors {
  return {
    photo: validatePhoto(f.photo),
    personal: {
      firstName: validateName(f.personal.firstName, "First name"),
      lastName: validateName(f.personal.lastName, "Last name"),
      email: validateEmail(f.personal.email),
      mobile: validateMobile(f.personal.mobile),
      gender: null,
      dob: null,
    },
    currentAddress: validateAddress(f.currentAddress),
    permanentAddress: f.permanentSameAsCurrent
      ? emptyAddressErrors()
      : validateAddress(f.permanentAddress),
  };
}

function emptyAddressErrors(): AddressErrors {
  return {
    line: null,
    area: null,
    city: null,
    state: null,
    pincode: null,
    country: null,
  };
}

function validateAddress(a: AddressFields): AddressErrors {
  return {
    line: !a.line.trim()
      ? "Address line is required."
      : a.line.trim().length < 5
        ? "Address feels too short — add more detail."
        : null,
    area: null,
    city: !a.city.trim() ? "City is required." : null,
    state: !a.state.trim() ? "State is required." : null,
    pincode: !a.pincode
      ? "PIN code is required."
      : !/^[1-9][0-9]{5}$/.test(a.pincode)
        ? "Enter a valid 6-digit Indian PIN code."
        : null,
    country: null,
  };
}

function isSectionClean(section: Record<string, string | null>) {
  return Object.values(section).every((v) => !v);
}

function trimAddress(a: AddressFields): Address {
  return {
    line: a.line.trim(),
    area: a.area.trim(),
    city: a.city.trim(),
    state: a.state.trim(),
    pincode: a.pincode,
    country: a.country.trim(),
  };
}

function validatePhoto(v: string): string | null {
  if (!v) return "Add a profile photo so clients can recognise you.";
  return null;
}

function validateName(v: string, label: string): string | null {
  const t = v.trim();
  if (!t) return `${label} is required.`;
  if (t.length < 2) return `${label} must be at least 2 characters.`;
  if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(t))
    return "Use letters, spaces, dots or hyphens only.";
  return null;
}

function validateEmail(v: string): string | null {
  const t = v.trim();
  if (!t) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t))
    return "Enter a valid email address.";
  return null;
}

function validateMobile(v: string): string | null {
  const digits = v.replace(/\D/g, "");
  if (!digits) return "Mobile number is required.";
  if (digits.length < 10) return "Enter a valid mobile number.";
  return null;
}

/* ---------- field ---------- */

function Field({
  label,
  placeholder,
  multiline,
  disabled,
  required,
  type = "text",
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
  required?: boolean;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
  onBlur?: () => void;
  inputMode?: "text" | "numeric" | "tel" | "email";
  maxLength?: number;
  error?: string | null;
}) {
  return (
    <div className="min-w-0">
      <label className="t-caption font-semibold text-neutral-700 mb-1 block">
        {label} {required && <span className="text-error">*</span>}
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
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            size={1}
            value={value}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            onBlur={onBlur}
            inputMode={inputMode}
            maxLength={maxLength}
            aria-invalid={error ? true : undefined}
            className="flex-1 min-w-0 px-3 py-3 t-body text-neutral-800 placeholder:text-neutral-400 focus:outline-none bg-transparent"
          />
        )}
      </div>
      {error && (
        <p className="mt-1.5 t-caption text-error font-medium">{error}</p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label className="t-caption font-semibold text-neutral-700 mb-1 block">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <div className="relative flex items-center rounded-xl border border-[var(--border-default)] bg-white overflow-hidden focus-within:border-primary-500 transition-colors">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 px-3 py-3 pr-8 t-body text-neutral-800 focus:outline-none bg-transparent appearance-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 text-neutral-500 pointer-events-none"
        />
      </div>
    </div>
  );
}
