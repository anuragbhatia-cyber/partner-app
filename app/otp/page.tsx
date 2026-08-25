"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button } from "@/components/ui";
import { setSession } from "@/lib/session";
import { Phone, ShieldCheck, Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const RESEND_SECONDS = 28;
const OTP_EXPIRY_SECONDS = 60;
const MAX_RESENDS = 3;
const DEMO_OTP = "1234";
const EXISTING_USERS = ["9999999999"];

export default function OTPPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [toast, setToast] = useState<string | null>(null);
  const [waReminders, setWaReminders] = useState(true);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [sentAt, setSentAt] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [docSheet, setDocSheet] = useState<"privacy" | "terms" | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const verifyLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const digitsOnly = phone.replace(/\D/g, "");
  const formattedPhone =
    digitsOnly.length === 10
      ? `${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`
      : digitsOnly;
  const isReturning = EXISTING_USERS.includes(digitsOnly);

  const otpComplete = otp.every((d) => d !== "");

  const handleRequestCode = () => {
    if (sending) return;
    setSending(true);
    window.setTimeout(() => {
      setOtp(["", "", "", ""]);
      setOtpError(null);
      setExpired(false);
      setToast(`Code sent to +91 ${formattedPhone}`);
      setSentAt(Date.now());
      setStep("otp");
      setSending(false);
    }, 800);
  };

  const handleVerify = () => {
    if (verifying || !otpComplete || expired) return;
    setOtpError(null);
    setVerifying(true);
    window.setTimeout(() => {
      if (otp.join("") === DEMO_OTP) {
        if (isReturning) {
          setSession({ phone: digitsOnly, createdAt: Date.now() });
        }
        verifyLinkRef.current?.click();
      } else {
        setOtpError("Incorrect code. Please try again.");
        setOtp(["", "", "", ""]);
        setVerifying(false);
        inputsRef.current[0]?.focus();
      }
    }, 1000);
  };

  useEffect(() => {
    if (step === "otp") {
      inputsRef.current[0]?.focus();
      setResendIn(RESEND_SECONDS);
    } else {
      setResendCount(0);
      const el = phoneInputRef.current;
      if (el && el.value) {
        el.focus();
        el.select();
      }
    }
  }, [step]);

  useEffect(() => {
    if (step !== "otp" || sentAt === 0) return;
    setExpired(false);
    const id = window.setTimeout(
      () => setExpired(true),
      OTP_EXPIRY_SECONDS * 1000
    );
    return () => window.clearTimeout(id);
  }, [step, sentAt]);

  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const id = setInterval(() => {
      setResendIn((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [step, resendIn]);

  const handleResend = () => {
    if (resendCount >= MAX_RESENDS) return;
    setOtp(["", "", "", ""]);
    setResendIn(RESEND_SECONDS);
    setOtpError(null);
    setExpired(false);
    setSentAt(Date.now());
    setResendCount((c) => c + 1);
    setToast(`OTP resent to +91 ${formattedPhone}`);
    inputsRef.current[0]?.focus();
  };

  const setDigit = (i: number, raw: string) => {
    if (otpError) setOtpError(null);
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setOtp((prev) => {
        const nx = [...prev];
        nx[i] = "";
        return nx;
      });
      return;
    }

    setOtp((prev) => {
      const nx = [...prev];
      let cursor = i;
      for (const ch of digits) {
        if (cursor >= nx.length) break;
        nx[cursor] = ch;
        cursor += 1;
      }
      const focusIdx = Math.min(cursor, nx.length - 1);
      requestAnimationFrame(() => inputsRef.current[focusIdx]?.focus());
      return nx;
    });
  };

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      e.preventDefault();
      setOtp((prev) => {
        const nx = [...prev];
        nx[i - 1] = "";
        return nx;
      });
      inputsRef.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      inputsRef.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < otp.length - 1) {
      e.preventDefault();
      inputsRef.current[i + 1]?.focus();
    }
  };

  if (step === "phone") {
    return (
      <PhoneFrame label="Auth · Phone">
        <AppBar back href="/splash" />

        <div className="flex flex-col min-h-[calc(100%-4rem)] px-4 pt-6 pb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 mb-4">
            <Phone size={22} />
          </div>
          <h1 className="t-h1 font-bold text-neutral-800 tracking-tight">
            Enter Your Mobile Number
          </h1>

          <div className="mt-5">
            <div className="flex items-stretch h-12 rounded-xl border border-[var(--border-default)] bg-white overflow-hidden focus-within:border-primary-500 transition-colors">
              <div className="flex items-center gap-2 pl-3 pr-2.5">
                <IndiaFlag />
                <span className="t-body font-semibold text-neutral-800">+91</span>
                <span className="text-neutral-300">|</span>
              </div>
              <input
                ref={phoneInputRef}
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter Mobile Number"
                className="flex-1 min-w-0 pr-3 t-body text-neutral-800 tabular focus:outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>

          {isReturning && (
            <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-success-subtle border border-success/30 px-3 py-2.5">
              <span className="text-lg leading-none mt-0.5">👋</span>
              <div>
                <p className="t-body-sm font-semibold text-success-bold">
                  Welcome back
                </p>
                <p className="t-caption text-neutral-600">
                  We recognised your number — sign in with your OTP.
                </p>
              </div>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="mt-5"
            disabled={phone.replace(/\D/g, "").length !== 10}
            loading={sending}
            onClick={handleRequestCode}
          >
            {sending
              ? "Sending code…"
              : isReturning
                ? "Sign in with OTP"
                : "Request Code"}
          </Button>

          <button
            type="button"
            role="checkbox"
            aria-checked={waReminders}
            onClick={() => setWaReminders((v) => !v)}
            className="mt-16 w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-dashed border-neutral-300 bg-transparent px-4 transition-colors hover:border-neutral-400"
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                waReminders
                  ? "bg-[#22C55E]"
                  : "border-2 border-neutral-300"
              }`}
            >
              {waReminders && (
                <Check size={10} strokeWidth={3} className="text-white" />
              )}
            </span>
            <span className="t-body-sm text-neutral-700">
              Get Daily reminders on whatsapp
            </span>
          </button>

          <p className="t-caption text-neutral-500 leading-relaxed text-center mt-auto pt-8">
            By Continuing you agree to our{" "}
            <button
              type="button"
              onClick={() => setDocSheet("privacy")}
              className="font-semibold text-primary-600 underline hover:text-primary-700"
            >
              Privacy Policy
            </button>
            <br />
            and{" "}
            <button
              type="button"
              onClick={() => setDocSheet("terms")}
              className="font-semibold text-primary-600 underline hover:text-primary-700"
            >
              Terms &amp; Conditions
            </button>
          </p>
        </div>

        <DocSheet open={docSheet} onClose={() => setDocSheet(null)} />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame label="Auth · OTP">
      <a
        ref={verifyLinkRef}
        href={isReturning ? "/home" : "/account-type"}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Continue
      </a>
      <AppBar back onClick={() => setStep("phone")} />

      <div className="px-4 pt-6 pb-24">
        <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 mb-5">
          <ShieldCheck size={26} />
        </div>
        <h1 className="t-h1 font-bold text-neutral-800 tracking-tight">
          Enter The 4-Digit Code
        </h1>
        <p className="t-body text-neutral-500 mt-2">
          Sent to +91 {formattedPhone}{" "}
          <button
            onClick={() => setStep("phone")}
            className="font-semibold text-primary-600 ml-1"
          >
            Edit
          </button>
        </p>

        <div className="mt-8 flex gap-2">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={d}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={(e) => e.currentTarget.select()}
              onPaste={(e) => {
                e.preventDefault();
                setDigit(i, e.clipboardData.getData("text"));
              }}
              aria-invalid={otpError ? true : undefined}
              disabled={expired}
              className={`w-12 h-14 text-center t-h2 font-bold text-neutral-800 rounded-xl border ${
                otpError
                  ? "border-error bg-error-subtle/40"
                  : expired
                    ? "border-neutral-200 bg-neutral-100 text-neutral-400"
                    : d
                      ? "border-primary-500 bg-primary-50/50"
                      : "border-[var(--border-default)] bg-white"
              } tabular focus:outline-none focus:border-primary-600 transition-colors disabled:cursor-not-allowed`}
            />
          ))}
        </div>

        {otpError && !expired && (
          <p
            role="alert"
            className="mt-3 t-body-sm font-medium text-error"
          >
            {otpError}
          </p>
        )}

        {expired && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-xl bg-warning-subtle border border-warning/30 px-3 py-2.5"
          >
            <span className="mt-0.5 text-warning-bold">
              <ShieldCheck size={16} />
            </span>
            <div>
              <p className="t-body-sm font-semibold text-warning-bold">
                This code has expired
              </p>
              <p className="t-caption text-neutral-600">
                Tap Resend below to get a new one.
              </p>
            </div>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-8"
          disabled={!otpComplete || expired}
          loading={verifying}
          onClick={handleVerify}
        >
          {verifying ? "Verifying…" : "Verify"}
        </Button>

        <p className="mt-4 t-caption text-neutral-400 text-center">
          Demo tip: use <span className="font-semibold tabular text-neutral-500">{DEMO_OTP}</span> to continue
        </p>

        <div className="text-center t-body-sm text-neutral-500 mt-6">
          {resendCount >= MAX_RESENDS ? (
            <p className="text-neutral-600">
              Resend limit reached.{" "}
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="font-semibold text-primary-600 hover:text-primary-700"
              >
                Edit number
              </button>{" "}
              to try again.
            </p>
          ) : resendIn > 0 ? (
            <>
              Resend OTP in{" "}
              <span className="font-semibold tabular">
                0:{String(resendIn).padStart(2, "0")}
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 -translate-x-1/2 top-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-900 text-white shadow-e3 t-body-sm font-medium animate-[toastIn_240ms_cubic-bezier(0.2,0,0,1)]"
        >
          <span className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
            <Check size={12} strokeWidth={3} />
          </span>
          {toast}
        </div>
      )}

      <style jsx global>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translate(-50%, -12px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </PhoneFrame>
  );
}

const DOC_CONTENT = {
  privacy: {
    title: "Privacy Policy",
    updated: "Updated 1 Jul 2026",
    sections: [
      {
        heading: "1. Information we collect",
        body: "We collect the phone number you register with, KYC documents you upload (Aadhaar, PAN, Bar Council ID, bank details), device identifiers, and location data while you are on an active assignment. We do not access your contacts, photos, or messages.",
      },
      {
        heading: "2. How we use your information",
        body: "Your information is used to verify your identity, match you with cases, calculate payouts, provide customer support, and comply with tax and regulatory obligations. Location data is used only while a case is in progress and is not sold to third parties.",
      },
      {
        heading: "3. Sharing & disclosure",
        body: "We share limited details (name, contact number, professional credentials) with the client of a matched case. We share tax-related data with statutory authorities as required by Indian law. We do not sell or rent your personal information.",
      },
      {
        heading: "4. Data retention",
        body: "KYC records are retained for the duration of your engagement plus seven years after account closure, in line with Indian financial and legal record-keeping requirements.",
      },
      {
        heading: "5. Your rights",
        body: "You may request access, correction, or deletion of your data by writing to privacy@lawyered.in. Deletion requests may be limited where retention is legally required.",
      },
      {
        heading: "6. Security",
        body: "We use encryption in transit and at rest, restricted access controls, and regular audits. No system is perfectly secure — please report any suspicious activity immediately to security@lawyered.in.",
      },
      {
        heading: "7. Contact",
        body: "For privacy questions, write to Grievance Officer, Lawyered Legal Tech Pvt Ltd, Gurugram, Haryana. Email: privacy@lawyered.in.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    updated: "Updated 1 Jul 2026",
    sections: [
      {
        heading: "1. Acceptance of terms",
        body: "By registering as a Partner you agree to these Terms and to comply with all applicable laws. If you do not agree, please do not use the Lawyered Partner App.",
      },
      {
        heading: "2. Partner eligibility",
        body: "You must be at least 18, hold a valid Bar Council enrolment (for legal partners) or comparable credential, and complete KYC verification. False information may result in immediate termination.",
      },
      {
        heading: "3. Assignments & compensation",
        body: "Cases are offered based on availability, location, and rating. Payouts are calculated per the case fee schedule shown at assignment time, less applicable platform fees and statutory deductions (TDS/GST).",
      },
      {
        heading: "4. Code of conduct",
        body: "You will act professionally, respect client confidentiality, and follow the case-handling SOPs published in the Knowledge section. Repeated violations may lead to suspension or removal.",
      },
      {
        heading: "5. Cancellations & no-shows",
        body: "Cancelling a case after acceptance may impact your rating and future eligibility. Repeated no-shows will result in suspension.",
      },
      {
        heading: "6. Termination",
        body: "Either party may terminate the engagement at any time with prior notice. Lawyered may suspend accounts pending investigation of policy violations.",
      },
      {
        heading: "7. Liability",
        body: "The platform is provided on an as-is basis. Lawyered is not liable for indirect or consequential damages arising from your use of the app.",
      },
      {
        heading: "8. Governing law",
        body: "These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of courts at Gurugram, Haryana.",
      },
    ],
  },
} as const;

function DocSheet({
  open,
  onClose,
}: {
  open: "privacy" | "terms" | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  const doc = DOC_CONTENT[open];

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-sheet-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 animate-[fadeInBackdrop_180ms_ease-out]"
      />
      <div className="mt-auto relative bg-white rounded-t-3xl shadow-e3 max-h-[88%] flex flex-col animate-[sheetIn_260ms_cubic-bezier(0.2,0,0,1)]">
        <div className="pt-2 pb-1 flex justify-center">
          <span className="w-10 h-1.5 rounded-full bg-neutral-200" />
        </div>
        <div className="px-5 pt-2 pb-3 border-b border-[var(--border-subtle)] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              id="doc-sheet-title"
              className="t-h2 font-bold text-neutral-800 tracking-tight"
            >
              {doc.title}
            </h2>
            <p className="t-caption text-neutral-500 mt-0.5">{doc.updated}</p>
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
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h3 className="t-body-lg font-semibold text-neutral-800">
                {s.heading}
              </h3>
              <p className="t-body-sm text-neutral-600 mt-1 leading-relaxed">
                {s.body}
              </p>
            </section>
          ))}
          <p className="t-caption text-neutral-400 pt-2">
            For questions about this document, write to{" "}
            <span className="font-semibold text-neutral-600">
              legal@lawyered.in
            </span>
            .
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes sheetIn {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes fadeInBackdrop {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

function IndiaFlag() {
  return (
    <svg
      viewBox="0 0 30 20"
      width={22}
      height={15}
      className="rounded-[2px] shrink-0 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
      aria-hidden
    >
      <rect width="30" height="6.67" y="0" fill="#FF9933" />
      <rect width="30" height="6.66" y="6.67" fill="#FFFFFF" />
      <rect width="30" height="6.67" y="13.33" fill="#138808" />
      <circle cx="15" cy="10" r="2" fill="none" stroke="#000080" strokeWidth="0.5" />
    </svg>
  );
}
