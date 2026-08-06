"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card, SectionLabel } from "@/components/ui";
import { MapPin, ChevronRight } from "lucide-react";

const DAYS = [
  { day: "Monday", range: "9:00 - 20:00" },
  { day: "Tuesday", range: "9:00 - 20:00" },
  { day: "Wednesday", range: "9:00 - 20:00" },
  { day: "Thursday", range: "9:00 - 20:00" },
  { day: "Friday", range: "9:00 - 20:00" },
  { day: "Saturday", range: "9:00 - 14:00" },
  { day: "Sunday", range: "Off" },
];

export default function AvailabilityPage() {
  return (
    <PhoneFrame label="Profile · Availability">
      <AppBar back href="/profile" title="Availability & Areas" />

      <div className="px-4 py-4 pb-24 space-y-4">
        {/* Status */}
        <div>
          <SectionLabel className="mb-2">Status</SectionLabel>
          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success" />
                  <span className="t-h3 font-bold text-neutral-800">
                    Online
                  </span>
                </div>
                <div className="t-body-sm text-neutral-500 mt-1">
                  You&apos;re receiving cases
                </div>
              </div>
              <Button variant="secondary" size="sm">
                Go Offline
              </Button>
            </div>
          </Card>
        </div>

        {/* Working hours */}
        <div>
          <SectionLabel className="mb-2">Working Hours</SectionLabel>
          <Card padding="none">
            <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <span className="t-body text-neutral-800">
                Auto online during working hours
              </span>
              <button className="relative inline-flex items-center h-6 w-11 rounded-full bg-success">
                <span className="inline-block w-5 h-5 rounded-full bg-white translate-x-5 shadow-e1" />
              </button>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {DAYS.map((d) => (
                <div
                  key={d.day}
                  className="px-4 py-3 flex items-center justify-between hover:bg-neutral-50/50"
                >
                  <span className="t-body text-neutral-800">{d.day}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`t-body-sm tabular ${
                        d.range === "Off"
                          ? "text-neutral-400"
                          : "text-neutral-600 font-medium"
                      }`}
                    >
                      {d.range}
                    </span>
                    <ChevronRight size={16} className="text-neutral-300" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Service area */}
        <div>
          <SectionLabel className="mb-2">Service Area</SectionLabel>
          <Card padding="none" className="overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-info-subtle via-primary-50 to-accent-100/40 relative">
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 200"
              >
                <circle
                  cx="200"
                  cy="100"
                  r="70"
                  fill="var(--color-primary-500)"
                  fillOpacity="0.1"
                  stroke="var(--color-primary-500)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <circle cx="200" cy="100" r="6" fill="var(--color-primary-600)" />
              </svg>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 t-body text-neutral-800 font-medium">
                    <MapPin size={14} className="text-neutral-500" />
                    Koramangala, Bengaluru
                  </div>
                  <div className="t-body-sm text-neutral-500 mt-1">
                    15 km · 8 pincodes · Est. 40+ cases/week
                  </div>
                </div>
              </div>
              <Button variant="secondary" size="md" fullWidth className="mt-4">
                Edit area
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PhoneFrame>
  );
}
