"use client";

import { PhoneFrame } from "@/components/PhoneFrame";
import { Button, Chip } from "@/components/ui";
import { MapPin, User, Car, IndianRupee, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function IncomingAssignmentPage() {
  const [secondsLeft, setSecondsLeft] = useState(47);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const pct = (secondsLeft / 60) * 100;
  const stroke = 2 * Math.PI * 45;
  const dashOffset = stroke * (1 - pct / 100);
  const ringColor =
    secondsLeft > 30
      ? "var(--color-primary-600)"
      : secondsLeft > 10
        ? "var(--color-warning)"
        : "var(--color-error)";

  return (
    <PhoneFrame label="Incoming Assignment · Critical">
      <div className="absolute inset-0 pt-9 bg-white flex flex-col">
        {/* Header strip */}
        <div className="px-4 py-3 bg-error-subtle border-b border-error/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
            <span className="t-body-sm font-bold uppercase tracking-wider text-error-bold">
              New Assignment
            </span>
          </div>
          <Link
            href="/home"
            className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-500 hover:bg-white"
          >
            <X size={18} />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-4">
          {/* Countdown ring */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="var(--color-neutral-100)"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={stroke}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className="text-[36px] font-bold tabular"
                  style={{ color: ringColor }}
                >
                  0:{secondsLeft.toString().padStart(2, "0")}
                </div>
                <div className="t-caption uppercase tracking-wider text-neutral-500 font-semibold">
                  respond
                </div>
              </div>
            </div>
          </div>

          {/* Case type */}
          <div className="text-center mb-2">
            <Chip tone="error" dot>HIGH PRIORITY</Chip>
          </div>
          <h1 className="t-h1 font-bold text-center text-neutral-800 leading-tight mb-6">
            Traffic Challan Dispute
          </h1>

          {/* Details */}
          <div className="space-y-3">
            <DetailRow
              icon={<MapPin size={18} />}
              label="Location"
              value="MG Road, near Metro"
              hint="3.2 km · ~12 min"
            />
            <DetailRow
              icon={<User size={18} />}
              label="Client"
              value="Rajesh Kumar"
            />
            <DetailRow
              icon={<Car size={18} />}
              label="Vehicle"
              value="KA-01-AB-1234"
              mono
            />
            <DetailRow
              icon={<IndianRupee size={18} />}
              label="Payout"
              value="₹850"
              highlight
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 pt-3 bg-white border-t border-[var(--border-subtle)]">
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              href="/home"
              className="!bg-neutral-100"
            >
              Decline
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              href="/incidents/predeparture"
              className="!bg-success !text-white"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function DetailRow({
  icon,
  label,
  value,
  hint,
  mono,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-neutral-25 border border-[var(--border-subtle)]">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          highlight
            ? "bg-accent-100 text-accent-700"
            : "bg-neutral-100 text-neutral-600"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="t-caption uppercase tracking-wider text-neutral-500 font-semibold">
          {label}
        </div>
        <div
          className={`t-body-lg font-semibold ${
            highlight ? "text-accent-700 t-h3" : "text-neutral-800"
          } ${mono ? "font-mono" : ""}`}
        >
          {value}
        </div>
        {hint && (
          <div className="t-caption text-neutral-500 mt-0.5">{hint}</div>
        )}
      </div>
    </div>
  );
}
