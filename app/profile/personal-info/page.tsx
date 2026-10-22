"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button } from "@/components/ui";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Home,
  MapPin,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getProfile,
  setProfile,
  type Address,
  type Gender,
  type Profile,
} from "@/lib/profile-store";
import { useToast } from "@/components/Toast";

const DEMO_OTP = "1234";

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
  personal: PersonalFields;
  currentAddress: AddressFields;
  permanentSameAsCurrent: boolean;
  permanentAddress: AddressFields;
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
  personal: {
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    gender: "",
    dob: "",
  },
  currentAddress: EMPTY_ADDRESS,
  permanentSameAsCurrent: false,
  permanentAddress: EMPTY_ADDRESS,
};

type TouchedPersonal = Record<keyof PersonalFields, boolean>;
type TouchedAddress = Record<keyof AddressFields, boolean>;

type Touched = {
  personal: TouchedPersonal;
  currentAddress: TouchedAddress;
  permanentAddress: TouchedAddress;
};

const EMPTY_TOUCHED_ADDRESS: TouchedAddress = {
  line: false,
  area: false,
  city: false,
  state: false,
  pincode: false,
  country: false,
};

const EMPTY_TOUCHED: Touched = {
  personal: {
    firstName: false,
    lastName: false,
    email: false,
    mobile: false,
    gender: false,
    dob: false,
  },
  currentAddress: EMPTY_TOUCHED_ADDRESS,
  permanentAddress: EMPTY_TOUCHED_ADDRESS,
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

export default function ProfilePersonalInfoPage() {
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [initial, setInitial] = useState<Fields>(EMPTY_FIELDS);
  const [touched, setTouched] = useState<Touched>(EMPTY_TOUCHED);
  const [saving, setSaving] = useState(false);
  const [verifyMode, setVerifyMode] = useState<null | "phone" | "email">(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const profileLinkRef = useRef<HTMLAnchorElement>(null);
  const toast = useToast();

  useEffect(() => {
    const p = getProfile();
    const loaded = profileToFields(p);
    setFields(loaded);
    setInitial(loaded);
  }, []);

  const errors = useMemo(() => validateAll(fields), [fields]);

  const isValid =
    isSectionClean(errors.personal) &&
    isSectionClean(errors.currentAddress) &&
    (fields.permanentSameAsCurrent || isSectionClean(errors.permanentAddress));

  const dirty = useMemo(() => !isFieldsEqual(fields, initial), [fields, initial]);

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

  const commit = (label = "Personal info updated") => {
    const permanentAddress = fields.permanentSameAsCurrent
      ? fields.currentAddress
      : fields.permanentAddress;
    const patch: Partial<Profile> = {
      firstName: fields.personal.firstName.trim(),
      lastName: fields.personal.lastName.trim(),
      email: fields.personal.email.trim(),
      phone: fields.personal.mobile,
      gender: fields.personal.gender || "",
      dob: fields.personal.dob,
      currentAddress: trimAddress(fields.currentAddress),
      permanentSameAsCurrent: fields.permanentSameAsCurrent,
      permanentAddress: trimAddress(permanentAddress),
    };
    setProfile(patch);
    setInitial(fields);
    setSaving(false);
    setVerifyMode(null);
    setOtp("");
    setOtpError(null);
    toast.show(label);
    window.setTimeout(() => profileLinkRef.current?.click(), 900);
  };

  const handleSave = () => {
    if (!dirty || saving) return;
    if (!isValid) {
      setTouched(ALL_TOUCHED);
      return;
    }
    const phoneChanged = fields.personal.mobile !== initial.personal.mobile;
    const emailChanged = fields.personal.email !== initial.personal.email;
    if (phoneChanged) {
      setVerifyMode("phone");
      setOtp("");
      setOtpError(null);
      return;
    }
    if (emailChanged) {
      setVerifyMode("email");
      setOtp("");
      setOtpError(null);
      return;
    }
    setSaving(true);
    window.setTimeout(() => commit(), 700);
  };

  const handleVerify = () => {
    if (verifying || otp.length !== 4) return;
    setOtpError(null);
    setVerifying(true);
    window.setTimeout(() => {
      if (otp === DEMO_OTP) {
        setVerifying(false);
        commit(verifyMode === "phone" ? "Mobile updated" : "Email updated");
      } else {
        setOtpError("Incorrect code. Try 1234 for the demo.");
        setOtp("");
        setVerifying(false);
      }
    }, 700);
  };

  const personalDone = isSectionClean(errors.personal);
  const currentAddressDone = isSectionClean(errors.currentAddress);
  const permanentAddressDone =
    fields.permanentSameAsCurrent || isSectionClean(errors.permanentAddress);

  return (
    <PhoneFrame label="Profile · Personal Info">
      <a
        ref={profileLinkRef}
        href="/profile"
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Profile
      </a>
      <AppBar back href="/profile" title="Personal info" />

      <div className="px-4 py-4 pb-32 space-y-3">
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
                onBlur={() => markAddressTouched("permanentAddress")("pincode")}
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

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!dirty}
          loading={saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      {verifyMode && (
        <div
          className="absolute inset-0 z-50 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="verify-title"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => !verifying && setVerifyMode(null)}
            className="absolute inset-0 bg-black/50 animate-[fadeInBackdrop_180ms_ease-out]"
          />
          <div className="mt-auto relative bg-white rounded-t-3xl shadow-e3 flex flex-col animate-[sheetIn_260ms_cubic-bezier(0.2,0,0,1)]">
            <div className="pt-2 pb-1 flex justify-center">
              <span className="w-10 h-1.5 rounded-full bg-neutral-200" />
            </div>
            <div className="px-5 pt-2 pb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-primary-700 shrink-0" />
                  <h2
                    id="verify-title"
                    className="t-h3 font-bold text-neutral-800"
                  >
                    Verify your new {verifyMode === "phone" ? "mobile" : "email"}
                  </h2>
                </div>
                <p className="t-body-sm text-neutral-500 mt-1">
                  We sent a 4-digit code to{" "}
                  <span className="font-semibold text-neutral-700">
                    {verifyMode === "phone"
                      ? fields.personal.mobile
                      : fields.personal.email}
                  </span>
                  .
                </p>
              </div>
              <button
                type="button"
                onClick={() => !verifying && setVerifyMode(null)}
                aria-label="Close"
                disabled={verifying}
                className="w-9 h-9 -mr-1 shrink-0 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-500 disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pb-3">
              <input
                autoFocus
                inputMode="numeric"
                maxLength={4}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 4));
                  if (otpError) setOtpError(null);
                }}
                placeholder="1234"
                aria-invalid={otpError ? true : undefined}
                className={`w-full h-14 px-4 text-center t-h2 font-bold tabular text-neutral-800 rounded-xl border focus:outline-none transition-colors ${
                  otpError
                    ? "border-error bg-error-subtle/40"
                    : "border-[var(--border-default)] focus:border-primary-500"
                }`}
              />
              {otpError && (
                <p
                  role="alert"
                  className="mt-2 flex items-center gap-1.5 t-body-sm font-medium text-error"
                >
                  <AlertCircle size={13} />
                  {otpError}
                </p>
              )}
              <p className="mt-2 t-caption text-neutral-400 text-center">
                Demo tip: use{" "}
                <span className="font-semibold text-neutral-500 tabular">
                  1234
                </span>{" "}
                to confirm.
              </p>
            </div>

            <div className="px-5 pt-1 pb-5 space-y-2 border-t border-[var(--border-subtle)]">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={otp.length !== 4}
                loading={verifying}
                onClick={handleVerify}
              >
                {verifying ? "Verifying…" : "Verify & save"}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                disabled={verifying}
                onClick={() => setVerifyMode(null)}
              >
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
      )}
    </PhoneFrame>
  );
}

/* ---------- helpers ---------- */

function profileToFields(p: Profile): Fields {
  return {
    personal: {
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      mobile: p.phone,
      gender: p.gender,
      dob: p.dob,
    },
    currentAddress: addressToFields(p.currentAddress),
    permanentSameAsCurrent: p.permanentSameAsCurrent,
    permanentAddress: addressToFields(p.permanentAddress),
  };
}

function addressToFields(a?: Address): AddressFields {
  return {
    line: a?.line ?? "",
    area: a?.area ?? "",
    city: a?.city ?? "",
    state: a?.state ?? "",
    pincode: a?.pincode ?? "",
    country: a?.country ?? "India",
  };
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

function isAddressEqual(a: AddressFields, b: AddressFields) {
  return (
    a.line === b.line &&
    a.area === b.area &&
    a.city === b.city &&
    a.state === b.state &&
    a.pincode === b.pincode &&
    a.country === b.country
  );
}

function isFieldsEqual(a: Fields, b: Fields) {
  const ap = a.personal;
  const bp = b.personal;
  if (
    ap.firstName !== bp.firstName ||
    ap.lastName !== bp.lastName ||
    ap.email !== bp.email ||
    ap.mobile !== bp.mobile ||
    ap.gender !== bp.gender ||
    ap.dob !== bp.dob ||
    a.permanentSameAsCurrent !== b.permanentSameAsCurrent
  )
    return false;
  if (!isAddressEqual(a.currentAddress, b.currentAddress)) return false;
  if (
    !a.permanentSameAsCurrent &&
    !isAddressEqual(a.permanentAddress, b.permanentAddress)
  )
    return false;
  return true;
}

/* ---------- validation ---------- */

type PersonalErrors = Record<keyof PersonalFields, string | null>;
type AddressErrors = Record<keyof AddressFields, string | null>;

type Errors = {
  personal: PersonalErrors;
  currentAddress: AddressErrors;
  permanentAddress: AddressErrors;
};

function validateAll(f: Fields): Errors {
  return {
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

/* ---------- field ---------- */

function Field({
  label,
  placeholder,
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
          error
            ? "border-error focus-within:border-error"
            : "border-[var(--border-default)] focus-within:border-primary-500"
        }`}
      >
        <input
          type={type}
          placeholder={placeholder}
          size={1}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          onBlur={onBlur}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          className="flex-1 min-w-0 px-3 py-3 t-body text-neutral-800 placeholder:text-neutral-400 focus:outline-none bg-transparent"
        />
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
