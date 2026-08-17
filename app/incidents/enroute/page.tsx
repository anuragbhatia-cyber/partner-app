"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import {
  Button,
  Card,
  Chip,
  SectionLabel,
} from "@/components/ui";
import {
  MoreVertical,
  Phone,
  ChevronRight,
  Clock,
  Navigation2,
} from "lucide-react";

export default function EnRoutePage() {
  return (
    <PhoneFrame label="Incident · En Route">
      <AppBar
        back
        href="/incidents/predeparture"
        title="IRN-100842"
        action={
          <button className="w-10 h-10 flex items-center justify-center rounded-full">
            <MoreVertical size={20} className="text-neutral-700" />
          </button>
        }
      />

      <div className="px-4 py-3 bg-warning-subtle border-b border-warning/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Chip tone="warning" dot>
            EN ROUTE
          </Chip>
          <span className="t-caption text-warning-bold font-medium">
            4 min elapsed
          </span>
        </div>
        <Chip tone="error" size="sm">HIGH</Chip>
      </div>

      <div className="px-4 py-4 pb-32 space-y-4">
        {/* Map card */}
        <Card padding="none" className="overflow-hidden">
          <div className="h-56 bg-gradient-to-br from-info-subtle via-info/10 to-primary-50 relative">
            {/* Fake map pattern */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 200"
              preserveAspectRatio="none"
            >
              <path
                d="M0,100 Q100,50 200,100 T400,100"
                stroke="var(--color-info)"
                strokeWidth="4"
                fill="none"
                strokeDasharray="8 4"
                strokeLinecap="round"
              />
              <circle cx="60" cy="80" r="6" fill="var(--color-primary-600)" />
              <circle cx="340" cy="120" r="8" fill="var(--color-error)" />
              <circle cx="340" cy="120" r="14" fill="var(--color-error)" fillOpacity="0.2" />
            </svg>
            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur rounded-lg px-3 py-2 flex items-center justify-between shadow-e1">
              <div>
                <div className="t-caption uppercase tracking-wider text-neutral-500 font-semibold">
                  ETA
                </div>
                <div className="t-h3 font-bold text-neutral-800">
                  8 min
                </div>
              </div>
              <div className="text-right">
                <div className="t-caption uppercase tracking-wider text-neutral-500 font-semibold">
                  Distance
                </div>
                <div className="t-h3 font-bold text-neutral-800 tabular">
                  2.1 km
                </div>
              </div>
            </div>
          </div>
          <div className="p-3">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              leftIcon={<Navigation2 size={16} />}
            >
              Reopen Directions
            </Button>
          </div>
        </Card>

        {/* Client quick actions */}
        <div>
          <SectionLabel className="mb-2">Client</SectionLabel>
          <Card padding="none">
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-semibold t-body-sm">
                RK
              </div>
              <div className="flex-1 min-w-0">
                <div className="t-body font-semibold text-neutral-800">
                  Rajesh Kumar
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-success-subtle flex items-center justify-center text-success-bold">
                <Phone size={16} />
              </button>
            </div>
          </Card>
        </div>

        {/* Delay */}
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-warning-subtle flex items-center justify-center text-warning-bold">
              <Clock size={16} />
            </div>
            <div>
              <div className="t-body font-medium text-neutral-800">
                Running late?
              </div>
              <div className="t-caption text-neutral-500 mt-0.5">
                Notify client with new ETA
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-neutral-300" />
        </Card>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          href="/incidents/active"
          rightIcon={<ChevronRight size={18} />}
        >
          I&apos;ve Arrived
        </Button>
      </div>
    </PhoneFrame>
  );
}
