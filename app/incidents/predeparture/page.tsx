"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import {
  Button,
  Card,
  Chip,
  SectionLabel,
  Timeline,
} from "@/components/ui";
import {
  MoreVertical,
  MapPin,
  Phone,
  ChevronRight,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const IRN = "IRN-100842";
const CLIENT_PHONE = "+919876543210";
const CALL_KEY = `lp_call_log_${IRN}`;

function relativeTime(ms: number) {
  const diff = Math.max(0, Date.now() - ms);
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function PreDeparturePage() {
  const [lastCalledAt, setLastCalledAt] = useState<number | null>(null);
  const [callCount, setCallCount] = useState(0);
  const callLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(CALL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { at: number; count: number };
        setLastCalledAt(parsed.at);
        setCallCount(parsed.count);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Re-render every 30s so the "Xm ago" stays current
  useEffect(() => {
    if (!lastCalledAt) return;
    const t = window.setInterval(() => setLastCalledAt((v) => v), 30000);
    return () => window.clearInterval(t);
  }, [lastCalledAt]);

  const handleCall = () => {
    const now = Date.now();
    const nextCount = callCount + 1;
    setLastCalledAt(now);
    setCallCount(nextCount);
    try {
      window.sessionStorage.setItem(
        CALL_KEY,
        JSON.stringify({ at: now, count: nextCount })
      );
    } catch {
      /* ignore */
    }
    callLinkRef.current?.click();
  };

  return (
    <PhoneFrame label="Incident · Pre-departure">
      <a
        ref={callLinkRef}
        href={`tel:${CLIENT_PHONE}`}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Call
      </a>
      <AppBar
        back
        href="/incidents"
        title={IRN}
        action={
          <button className="w-10 h-10 flex items-center justify-center rounded-full">
            <MoreVertical size={20} className="text-neutral-700" />
          </button>
        }
      />

      {/* Status banner */}
      <div className="px-4 py-3 bg-success-subtle border-b border-success/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Chip tone="success" dot>
            ACCEPTED
          </Chip>
          <span className="t-caption text-success-bold font-medium">
            Just now
          </span>
        </div>
        <Chip tone="error" size="sm">
          HIGH
        </Chip>
      </div>

      <div className="px-4 py-4 pb-32 space-y-4">
        {/* Location card */}
        <Card padding="none" className="overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-info-subtle to-info/20 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-info flex items-center justify-center animate-pulse">
                <MapPin size={22} className="text-white" />
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="t-body-lg font-semibold text-neutral-800">
              MG Road, near Metro
            </div>
            <div className="t-body-sm text-neutral-500 mt-0.5">
              Bengaluru 560001
            </div>
            <div className="flex items-center gap-4 mt-3 t-body-sm text-neutral-600">
              <span className="tabular">3.2 km</span>
              <span className="text-neutral-300">·</span>
              <span>~12 min</span>
            </div>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              className="mt-4"
              leftIcon={<Navigation size={16} />}
            >
              Get Directions
            </Button>
          </div>
        </Card>

        {/* Client */}
        <div>
          <SectionLabel className="mb-2">Client</SectionLabel>
          <Card padding="none">
            <div className="flex items-center gap-3 p-4">
              <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-semibold">
                RK
              </div>
              <div className="flex-1 min-w-0">
                <div className="t-body-lg font-semibold text-neutral-800">
                  Rajesh Kumar
                </div>
                <div className="t-caption font-mono text-neutral-500 mt-0.5">
                  KA-01-AB-1234 · Maruti Swift
                </div>
                {lastCalledAt && (
                  <div className="mt-1.5 inline-flex items-center gap-1 t-caption text-success-bold">
                    <CheckCircle2 size={12} strokeWidth={2.5} />
                    <span>
                      Called {relativeTime(lastCalledAt)}
                      {callCount > 1 ? ` · ${callCount} attempts` : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={handleCall}
                className="w-full flex items-center justify-center gap-2 py-3 t-body-sm font-semibold text-success-bold hover:bg-success-subtle/50"
              >
                <Phone size={16} />
                {lastCalledAt ? "Call again" : "Call"}
              </button>
            </div>
          </Card>
        </div>

        {/* Case */}
        <div>
          <SectionLabel className="mb-2">Case Brief</SectionLabel>
          <Card>
            <div className="space-y-3">
              <DetailRow label="Service" value="Challan dispute" />
              <DetailRow label="Priority" value="HIGH" />
              <DetailRow label="SLA" value="Reach in 30 min" />
              <DetailRow label="Payout" value="₹850" highlight />
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <div className="t-caption font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                Notes from ops
              </div>
              <p className="t-body-sm text-neutral-700 leading-relaxed">
                &ldquo;Client waiting near metro exit gate 4. Speeding challan
                — wants to contest.&rdquo;
              </p>
            </div>
          </Card>
        </div>

        {/* Timeline */}
        <div>
          <SectionLabel className="mb-2">Timeline</SectionLabel>
          <Card>
            <Timeline
              steps={[
                { label: "Accepted", time: "10:24", status: "done" },
                { label: "En route", status: "pending" },
                { label: "Arrived", status: "pending" },
                { label: "In progress", status: "pending" },
                { label: "Completed", status: "pending" },
              ]}
            />
          </Card>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          href="/incidents/enroute"
        >
          Start Journey
        </Button>
      </div>
    </PhoneFrame>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between t-body">
      <span className="text-neutral-500">{label}</span>
      <span
        className={
          highlight
            ? "text-accent-700 font-bold tabular t-h3"
            : "text-neutral-800 font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}
