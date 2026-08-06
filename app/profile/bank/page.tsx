"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card, Chip, SectionLabel } from "@/components/ui";
import { Landmark, ShieldCheck } from "lucide-react";

export default function ProfileBankPage() {
  return (
    <PhoneFrame label="Profile · Bank">
      <AppBar back href="/profile" title="Bank account" />

      <div className="px-4 py-4 pb-32 space-y-4">
        <SectionLabel className="mb-2">Primary account</SectionLabel>
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 shrink-0">
              <Landmark size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="t-body font-semibold text-neutral-800">
                HDFC Bank
              </div>
              <div className="t-caption text-neutral-500 font-mono">
                •••• 4521
              </div>
            </div>
            <Chip tone="success" size="sm">
              Verified
            </Chip>
          </div>

          <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
            <Row label="Account holder" value="Priya Sharma" />
            <Row label="IFSC" value="HDFC0000456" mono />
            <Row label="Branch" value="MG Road, Bengaluru" />
          </div>
        </Card>

        <Card className="bg-info-subtle border-info/20 flex items-start gap-2.5">
          <ShieldCheck size={16} className="text-info-bold shrink-0 mt-0.5" />
          <div className="t-body-sm text-info-bold leading-relaxed">
            Payouts are processed via NEFT and typically settle within 1 working day.
          </div>
        </Card>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4 flex gap-2">
        <Button variant="secondary" size="lg" fullWidth href="/profile">
          Change bank
        </Button>
      </div>
    </PhoneFrame>
  );
}

function Row({
  label,
  value,
  mono,
  strong,
}: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between t-body">
      <span className="text-neutral-500">{label}</span>
      <span
        className={`text-neutral-800 ${strong ? "font-bold" : "font-semibold"} ${
          mono ? "font-mono t-body-sm" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
