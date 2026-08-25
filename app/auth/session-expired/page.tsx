"use client";

import { PhoneFrame } from "@/components/PhoneFrame";
import { Button } from "@/components/ui";
import { clearSession, getSession } from "@/lib/session";
import { Clock, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

export default function SessionExpiredPage() {
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);

  useEffect(() => {
    const s = getSession();
    if (s?.phone) {
      const d = s.phone.replace(/\D/g, "");
      if (d.length === 10) {
        setMaskedPhone(`+91 •••• ${d.slice(6)}`);
      }
    }
    clearSession();
  }, []);

  return (
    <PhoneFrame label="Session expired">
      <div className="flex flex-col min-h-[calc(100%-2rem)] px-6 pt-14 pb-8">
        <div className="w-16 h-16 rounded-2xl bg-warning-subtle text-warning-bold flex items-center justify-center mb-6">
          <ShieldAlert size={28} />
        </div>

        <h1 className="t-h1 font-bold text-neutral-800 tracking-tight">
          Signed out for security
        </h1>
        <p className="t-body text-neutral-500 mt-2 leading-relaxed">
          Your session expired to keep your account safe. Sign in again to pick
          up where you left off.
        </p>

        <div className="mt-6 rounded-xl border border-[var(--border-default)] bg-neutral-50 px-4 py-3 flex items-center gap-3">
          <Clock size={18} className="text-neutral-500 shrink-0" />
          <div className="min-w-0">
            <p className="t-body-sm font-semibold text-neutral-800">
              Sessions last 30 days
            </p>
            <p className="t-caption text-neutral-500 mt-0.5">
              {maskedPhone
                ? `Last signed in as ${maskedPhone}`
                : "Sign in again with your registered mobile number."}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-8 space-y-3">
          <Button variant="primary" size="lg" fullWidth href="/otp">
            Sign in again
          </Button>
          <Button variant="ghost" size="lg" fullWidth href="/profile/support">
            Need help?
          </Button>
        </div>
      </div>
    </PhoneFrame>
  );
}
