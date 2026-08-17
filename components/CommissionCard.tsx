"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui";

export function CommissionCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-xl bg-primary-50 border border-primary-100 px-3.5 py-3 hover:bg-primary-100/60 transition-colors text-left"
      >
        <Image
          src="/commission-coins.png"
          alt=""
          width={44}
          height={44}
          className="shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="t-body-sm font-semibold text-neutral-900">
            How commission works?
          </div>
          <div className="t-caption text-neutral-600 mt-0.5">
            What you take home per lead
          </div>
        </div>
        <span className="t-body-sm font-semibold text-primary-700 shrink-0">
          View
        </span>
      </button>

      <CommissionSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function CommissionSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex justify-center">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        <div className="px-4 pt-2 pb-2 flex items-start justify-between gap-3">
          <div>
            <div className="t-h3 font-bold text-neutral-800">
              How commission works
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 -mr-1 shrink-0 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3 space-y-2.5">
          <RateRow
            tone="case"
            label="Case"
            rate="₹300+"
            note="Starts at ₹300. Longer hearings and complex matters like accidents or court cases pay more."
          />
          <RateRow
            tone="challan"
            label="Challan"
            rate="10%"
            note="You keep 10% of the amount you help the client save on their challan."
          />
          <RateRow
            tone="rto"
            label="RTO"
            rate="₹100 – ₹200"
            note="Flat fee per RTO visit. The exact amount depends on your city and RTO office."
          />

          <ul className="pt-2 space-y-2 t-body-sm text-neutral-700">
            <li className="flex gap-2">
              <span className="w-1.5 h-1.5 mt-2 rounded-full bg-primary-500 shrink-0" />
              Payout is credited only after the case completes
            </li>
            <li className="flex gap-2">
              <span className="w-1.5 h-1.5 mt-2 rounded-full bg-primary-500 shrink-0" />
              Funds land in your wallet within 24 hours
            </li>
            <li className="flex gap-2">
              <span className="w-1.5 h-1.5 mt-2 rounded-full bg-primary-500 shrink-0" />
              TDS is deducted as per statutory rates
            </li>
          </ul>
        </div>

        <div className="px-4 pt-2 pb-5 border-t border-[var(--border-subtle)]">
          <Button variant="primary" size="lg" fullWidth onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}

function RateRow({
  tone,
  label,
  rate,
  note,
}: {
  tone: "case" | "challan" | "rto";
  label: string;
  rate: string;
  note: string;
}) {
  const toneMap = {
    case: {
      bg: "bg-primary-50",
      heading: "text-primary-700",
      rate: "text-primary-700",
    },
    challan: {
      bg: "bg-accent-50",
      heading: "text-accent-700",
      rate: "text-accent-700",
    },
    rto: {
      bg: "bg-info-subtle",
      heading: "text-info-bold",
      rate: "text-info-bold",
    },
  }[tone];
  return (
    <div
      className={`rounded-xl ${toneMap.bg} px-3.5 py-3 flex items-start justify-between gap-3`}
    >
      <div className="flex-1 min-w-0">
        <div className={`t-body-sm font-bold ${toneMap.heading}`}>
          {label}
        </div>
        <div className="t-body-sm text-neutral-700 mt-1 leading-snug">
          {note}
        </div>
      </div>
      <div className={`t-body-lg font-bold tabular shrink-0 ${toneMap.rate}`}>
        {rate}
      </div>
    </div>
  );
}
