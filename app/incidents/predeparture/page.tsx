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
  MessageCircle,
  ChevronRight,
  Navigation,
} from "lucide-react";

export default function PreDeparturePage() {
  return (
    <PhoneFrame label="Incident · Pre-departure">
      <AppBar
        back
        href="/incidents"
        title="IRN-100842"
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
              </div>
            </div>
            <div className="grid grid-cols-2 border-t border-[var(--border-subtle)]">
              <button className="flex items-center justify-center gap-2 py-3 t-body-sm font-semibold text-success-bold hover:bg-success-subtle/50">
                <Phone size={16} />
                Call
              </button>
              <button className="flex items-center justify-center gap-2 py-3 t-body-sm font-semibold text-info-bold hover:bg-info-subtle/50 border-l border-[var(--border-subtle)]">
                <MessageCircle size={16} />
                Message
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
          rightIcon={<ChevronRight size={18} />}
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
