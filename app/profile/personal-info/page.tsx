"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card } from "@/components/ui";
import { AlertCircle, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getProfile, setProfile, type Profile } from "@/lib/profile-store";
import { useToast } from "@/components/Toast";

const DEMO_OTP = "1234";

export default function ProfilePersonalInfoPage() {
  const [form, setForm] = useState<Profile>({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
  });
  const [initial, setInitial] = useState<Profile>(form);
  const [saving, setSaving] = useState(false);
  const [verifyMode, setVerifyMode] = useState<null | "phone" | "email">(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const profileLinkRef = useRef<HTMLAnchorElement>(null);
  const toast = useToast();

  useEffect(() => {
    const p = getProfile();
    setForm(p);
    setInitial(p);
  }, []);

  const dirty =
    form.fullName !== initial.fullName ||
    form.email !== initial.email ||
    form.phone !== initial.phone ||
    form.dob !== initial.dob;

  const update =
    (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const commit = (label = "Personal info updated") => {
    setProfile(form);
    setInitial(form);
    setSaving(false);
    setVerifyMode(null);
    setOtp("");
    setOtpError(null);
    toast.show(label);
    window.setTimeout(() => profileLinkRef.current?.click(), 900);
  };

  const handleSave = () => {
    if (!dirty || saving) return;
    const phoneChanged = form.phone !== initial.phone;
    const emailChanged = form.email !== initial.email;
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
        commit(
          verifyMode === "phone" ? "Mobile updated" : "Email updated"
        );
      } else {
        setOtpError("Incorrect code. Try 1234 for the demo.");
        setOtp("");
        setVerifying(false);
      }
    }, 700);
  };

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

      <div className="px-4 py-4 pb-32 space-y-4">
        <Card padding="lg" className="space-y-4">
          <Field
            label="Full name"
            value={form.fullName}
            onChange={update("fullName")}
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={update("email")}
          />
          <Field
            label="Mobile"
            value={form.phone}
            onChange={update("phone")}
          />
          <Field
            label="Date of birth"
            type="date"
            value={form.dob}
            onChange={update("dob")}
          />
        </Card>
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
                    {verifyMode === "phone" ? form.phone : form.email}
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
                Demo tip: use <span className="font-semibold text-neutral-500 tabular">1234</span> to confirm.
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

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="t-caption font-semibold text-neutral-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="mt-1.5 w-full h-11 px-3 rounded-lg border border-[var(--border-default)] bg-white t-body text-neutral-800 focus:outline-none focus:border-primary-500 transition-colors"
      />
    </label>
  );
}
