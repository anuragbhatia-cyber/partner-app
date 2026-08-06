"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button } from "@/components/ui";
import { Phone, ShieldCheck, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const RESEND_SECONDS = 28;

export default function OTPPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("98765 43210");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [toast, setToast] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(false), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (step === "otp") {
      inputsRef.current[0]?.focus();
      setResendIn(RESEND_SECONDS);
    }
  }, [step]);

  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const id = setInterval(() => {
      setResendIn((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [step, resendIn]);

  const handleResend = () => {
    setOtp(["", "", "", ""]);
    setResendIn(RESEND_SECONDS);
    setToast(true);
    inputsRef.current[0]?.focus();
  };

  const setDigit = (i: number, raw: string) => {
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

  const otpComplete = otp.every((d) => d !== "");

  if (step === "phone") {
    return (
      <PhoneFrame label="Auth · Phone">
        <AppBar back href="/splash" />

        <div className="flex flex-col min-h-[calc(100%-4rem)] px-4 pt-6 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 mb-5">
            <Phone size={26} />
          </div>
          <h1 className="t-h1 font-bold text-neutral-800 tracking-tight">
            Enter Your Mobile Number
          </h1>
          <p className="t-body text-neutral-500 mt-2">
            We&apos;ll send an OTP to verify
          </p>

          <div className="mt-8">
            <div className="flex items-stretch rounded-xl border border-[var(--border-default)] bg-white overflow-hidden focus-within:border-primary-500 transition-colors">
              <div className="flex items-center px-3 border-r border-[var(--border-subtle)] bg-neutral-25">
                <span className="t-body-lg font-semibold text-neutral-700">
                  +91
                </span>
              </div>
              <input
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-4 py-4 t-h3 font-medium text-neutral-800 tabular focus:outline-none"
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="mt-8"
            onClick={() => setStep("otp")}
          >
            Send OTP →
          </Button>

          <p className="t-caption text-neutral-500 leading-relaxed text-center mt-auto pt-8">
            By continuing, you agree to our{" "}
            <span className="font-semibold text-primary-600">Terms</span> and{" "}
            <span className="font-semibold text-primary-600">Conditions</span>
          </p>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame label="Auth · OTP">
      <AppBar back onClick={() => setStep("phone")} />

      <div className="px-4 pt-6 pb-24">
        <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 mb-5">
          <ShieldCheck size={26} />
        </div>
        <h1 className="t-h1 font-bold text-neutral-800 tracking-tight">
          Enter The 4-Digit Code
        </h1>
        <p className="t-body text-neutral-500 mt-2">
          Sent to +91 {phone}{" "}
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
              className={`w-12 h-14 text-center t-h2 font-bold text-neutral-800 rounded-xl border ${
                d
                  ? "border-primary-500 bg-primary-50/50"
                  : "border-[var(--border-default)] bg-white"
              } tabular focus:outline-none focus:border-primary-600 transition-colors`}
            />
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-8"
          href={otpComplete ? "/role" : undefined}
          disabled={!otpComplete}
        >
          Verify →
        </Button>

        <div className="text-center t-body-sm text-neutral-500 mt-6">
          {resendIn > 0 ? (
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
          OTP resent successfully
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
