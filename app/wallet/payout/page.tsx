"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card } from "@/components/ui";
import { AlertCircle, CheckCircle2, Landmark } from "lucide-react";
import { useEffect, useState } from "react";

function fmtDatePlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function generateReference() {
  return `PYT-${Date.now().toString().slice(-8)}`;
}

const MIN_PAYOUT = 100;

export default function PayoutPage() {
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);
  const [bankLinked, setBankLinked] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{
    amount: number;
    reference: string;
    creditsBy: string;
  } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("bank");
    if (q === "none" || q === "unlinked") setBankLinked(false);
  }, []);

  const quick = [1000, 2500];
  const available = 4250;

  const amountNum = amount ? Number(amount) : 0;
  const amountError =
    amountNum === 0
      ? "Enter an amount to continue."
      : amountNum < MIN_PAYOUT
        ? `Minimum payout is ₹${MIN_PAYOUT}.`
        : amountNum > available
          ? `You have ₹${available.toLocaleString("en-IN")} available.`
          : null;
  const error = bankLinked ? amountError : "Link a bank account to continue.";
  const isValid = error === null;
  const showError = touched && amountError;

  const handleSubmit = () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setReceipt({
        amount: amountNum,
        reference: generateReference(),
        creditsBy: fmtDatePlus(2),
      });
      setSubmitting(false);
    }, 800);
  };

  if (receipt) {
    return (
      <PhoneFrame label="Wallet · Payout Requested">
        <div className="flex flex-col min-h-full">
          <div className="flex-1 px-6 pt-14 pb-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-success-subtle flex items-center justify-center mb-4">
              <CheckCircle2
                size={44}
                strokeWidth={2.5}
                className="text-success-bold"
              />
            </div>
            <h1 className="t-h1 font-bold text-neutral-800">
              Payout requested
            </h1>
            <p className="t-body text-neutral-600 mt-1">
              We&apos;ve queued your withdrawal.
            </p>

            <Card padding="none" className="w-full mt-6 text-left">
              <div className="divide-y divide-[var(--border-subtle)]">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="t-caption font-semibold uppercase tracking-wider text-neutral-500">
                    Amount
                  </span>
                  <span className="t-h3 font-bold tabular text-accent-700 font-mono">
                    ₹{receipt.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="t-caption font-semibold uppercase tracking-wider text-neutral-500">
                    To
                  </span>
                  <span className="t-body-lg font-semibold text-neutral-800">
                    HDFC ****4521
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="t-caption font-semibold uppercase tracking-wider text-neutral-500">
                    Credits by
                  </span>
                  <span className="t-body-lg font-semibold text-neutral-800">
                    {receipt.creditsBy}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="t-caption font-semibold uppercase tracking-wider text-neutral-500">
                    Reference
                  </span>
                  <span className="t-body-sm font-mono text-neutral-600">
                    {receipt.reference}
                  </span>
                </div>
              </div>
            </Card>

            <p className="t-caption text-neutral-500 mt-4 max-w-[280px]">
              You&apos;ll get a notification when the amount lands in your
              bank account.
            </p>
          </div>

          <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4 space-y-2">
            <Button variant="primary" size="lg" fullWidth href="/wallet">
              Back to wallet
            </Button>
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              href="/wallet/transactions"
            >
              View transactions
            </Button>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame label="Wallet · Payout">
      <AppBar back href="/wallet" title="Request Payout" />

      <div className="px-4 py-6 pb-32 space-y-4">
        {/* Amount */}
        <div>
          <div className="t-body-sm text-neutral-500 mb-3">
            Enter Amount To Request Payout
          </div>
          <Card
            padding="lg"
            className={`py-8 ${
              showError ? "border-error!" : ""
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="t-display font-bold text-neutral-500 font-mono">
                ₹
              </span>
              <input
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                onBlur={() => setTouched(true)}
                placeholder="Enter amount"
                aria-invalid={showError ? true : undefined}
                className="flex-1 min-w-0 t-hero font-bold tabular text-neutral-800 bg-transparent focus:outline-none font-mono tracking-tight placeholder:text-neutral-400 placeholder:font-medium placeholder:text-2xl"
              />
            </div>
          </Card>
          {showError ? (
            <p
              role="alert"
              className="mt-2 flex items-center gap-1.5 t-caption font-medium text-error"
            >
              <AlertCircle size={13} />
              {error}
            </p>
          ) : (
            <p className="mt-2 t-caption text-neutral-500">
              Minimum ₹{MIN_PAYOUT} · Available ₹
              {available.toLocaleString("en-IN")}
            </p>
          )}
        </div>

        {/* Quick amounts */}
        <div className="flex items-center gap-2">
          {quick.map((v) => (
            <button
              key={v}
              onClick={() => setAmount(String(v))}
              className="px-3 py-1.5 rounded-full bg-neutral-100 t-caption font-semibold text-neutral-700 hover:bg-neutral-200"
            >
              ₹{v.toLocaleString("en-IN")}
            </button>
          ))}
          <button
            onClick={() => setAmount(String(available))}
            className="px-3 py-1.5 rounded-full bg-primary-100 t-caption font-semibold text-primary-700 hover:bg-primary-200"
          >
            Max
          </button>
        </div>

        {/* Payout to */}
        <div>
          <div className="t-caption font-semibold uppercase tracking-wider text-neutral-500 mb-2 px-1">
            Payout to
          </div>
          {bankLinked ? (
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src="/hdfc-logo.png"
                    alt="HDFC Bank"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div>
                  <div className="t-body font-semibold text-neutral-800">
                    HDFC Bank ****4521
                  </div>
                  <div className="t-caption text-neutral-500">
                    Priya Sharma
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-warning/30 bg-warning-subtle/50">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-warning-subtle text-warning-bold flex items-center justify-center shrink-0">
                  <Landmark size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="t-body font-semibold text-warning-bold">
                    No bank account linked
                  </div>
                  <div className="t-caption text-neutral-700 mt-0.5">
                    Add a bank account to receive payouts. Verification takes
                    about 5 minutes.
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    href="/profile/bank"
                    className="mt-3"
                  >
                    Link bank account
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {bankLinked && (
          <div className="t-caption text-neutral-500 leading-relaxed">
            Amount will be credited to your account within 48 hours of request
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isValid}
          loading={submitting}
          onClick={() => {
            setTouched(true);
            handleSubmit();
          }}
        >
          {submitting ? "Requesting…" : "Request payout"}
        </Button>
      </div>
    </PhoneFrame>
  );
}
