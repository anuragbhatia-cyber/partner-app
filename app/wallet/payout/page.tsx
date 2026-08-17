"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card } from "@/components/ui";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

export default function PayoutPage() {
  const [amount, setAmount] = useState("");

  const quick = [1000, 2500];
  const available = 4250;

  return (
    <PhoneFrame label="Wallet · Payout">
      <AppBar back href="/wallet" title="Request Payout" />

      <div className="px-4 py-6 pb-32 space-y-4">
        {/* Amount */}
        <div>
          <div className="t-body-sm text-neutral-500 mb-3">
            Enter Amount To Request Payout
          </div>
          <Card padding="lg" className="py-8">
            <div className="flex items-center gap-1">
              <span className="t-display font-bold text-neutral-500 font-mono">
                ₹
              </span>
              <input
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter amount"
                className="flex-1 min-w-0 t-hero font-bold tabular text-neutral-800 bg-transparent focus:outline-none font-mono tracking-tight placeholder:text-neutral-400 placeholder:font-medium placeholder:text-2xl"
              />
            </div>
          </Card>
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
        </div>

        <div className="t-caption text-neutral-500 leading-relaxed">
          Amount will be credited to your account within 48 hours of request
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          href="/wallet"
          rightIcon={<ChevronRight size={18} />}
        >
          Continue
        </Button>
      </div>
    </PhoneFrame>
  );
}
