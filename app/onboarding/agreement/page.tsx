"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card, Stepper } from "@/components/ui";
import { Check } from "lucide-react";

export default function AgreementPage() {
  return (
    <PhoneFrame label="Onboarding · Agreement">
      <AppBar back href="/onboarding/bank" title="Agreement" />

      <div className="px-4 pt-2 pb-32">
        <div className="pt-4 pb-8">
          <Stepper current={5} total={5} />
        </div>

        <h1 className="t-h2 font-bold text-neutral-800 tracking-tight">
          Partner Agreement
        </h1>

        <Card padding="none" className="mt-5 overflow-hidden">
          <div className="h-56 overflow-y-auto p-4 t-body-sm text-neutral-700 leading-relaxed space-y-3 bg-neutral-25 border-b border-[var(--border-subtle)]">
            <p className="font-semibold text-neutral-800">Section 1: Scope of Services</p>
            <p>
              As a Lawyered Partner, you agree to provide on-road legal
              assistance services to Lawyered&apos;s clients as directed
              through the platform...
            </p>
            <p className="font-semibold text-neutral-800">Section 2: Payment Terms</p>
            <p>
              You will be compensated per case as per the fee schedule.
              Payments are made via bank transfer within 24-48 hours of case
              verification...
            </p>
            <p className="font-semibold text-neutral-800">Section 3: Conduct</p>
            <p>
              All partners are expected to maintain professional conduct,
              respect client confidentiality, and comply with all applicable
              laws and Bar Council rules...
            </p>
          </div>
          <div className="p-2 text-center t-caption text-neutral-400 border-b border-[var(--border-subtle)]">
            Scroll to continue
          </div>
        </Card>

        <div className="space-y-3 mt-5">
          <ConsentRow label="I have read and accept the Partner Agreement" />
          <ConsentRow label="I consent to KYC verification" />
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          href="/onboarding/kyc-status"
        >
          Submit for KYC
        </Button>
      </div>
    </PhoneFrame>
  );
}

function ConsentRow({ label }: { label: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="w-5 h-5 rounded border-2 border-primary-600 bg-primary-600 flex items-center justify-center shrink-0 mt-0.5">
        <Check size={12} className="text-white" strokeWidth={3} />
      </div>
      <span className="t-body text-neutral-800">{label}</span>
    </div>
  );
}
