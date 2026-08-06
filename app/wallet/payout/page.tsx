"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card } from "@/components/ui";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function PayoutPage() {
  const [amount, setAmount] = useState("4250");

  const quick = [1000, 2500];
  const available = 4250;

  return (
    <PhoneFrame label="Wallet · Payout">
      <AppBar back href="/wallet" title="Request Payout" />

      <div className="px-4 py-6 pb-32 space-y-4">
        {/* Amount */}
        <div>
          <div className="t-body-sm text-neutral-500 text-center mb-3">
            How much?
          </div>
          <Card padding="lg" className="text-center py-8">
            <div className="flex items-center justify-center gap-1">
              <span className="t-display font-bold text-neutral-500 font-mono">
                ₹
              </span>
              <input
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                className="w-40 t-hero font-bold tabular text-neutral-800 text-center bg-transparent focus:outline-none font-mono tracking-tight"
              />
            </div>
            <div className="t-caption text-neutral-500 mt-2">
              All available
            </div>
          </Card>
        </div>

        {/* Available + quick amounts */}
        <div className="flex items-center justify-center gap-2">
          <span className="t-caption text-neutral-500 mr-2">
            Available: ₹{available.toLocaleString("en-IN")}
          </span>
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
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-9 h-9 rounded-lg bg-info-subtle flex items-center justify-center">
                    <span className="t-caption font-bold text-info-bold">
                      HDFC
                    </span>
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
              </div>
              <button className="t-caption font-semibold text-primary-600">
                Change
              </button>
            </div>
          </Card>
        </div>

        {/* Est arrival */}
        <Card className="bg-success-subtle/40 border-success/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-success shrink-0 mt-0.5" />
            <div>
              <div className="t-body-sm font-semibold text-success-bold">
                Est. arrival tomorrow, 6 PM
              </div>
              <div className="t-caption text-success-bold/70 mt-0.5">
                Payouts to HDFC typically complete within 24 hours
              </div>
            </div>
          </div>
        </Card>

        <div className="t-caption text-neutral-500 text-center leading-relaxed">
          Min payout ₹500 · Once initiated, payouts cannot be cancelled
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
