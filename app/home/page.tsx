"use client";

import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Avatar, Button, Card, ProgressBar } from "@/components/ui";
import {
  Bell,
  Wallet as WalletIcon,
  BookOpen,
  Phone,
  ChevronRight,
  ChevronDown,
  MapPin,
  Check,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ACTIVE_COUNT, PAST_COUNT } from "@/app/incidents/page";

const AREAS = [
  { id: "blr-south", label: "Bengaluru South", meta: "Koramangala · HSR · BTM" },
  { id: "blr-central", label: "Bengaluru Central", meta: "MG Road · Shivajinagar" },
  { id: "blr-north", label: "Bengaluru North", meta: "Hebbal · Yelahanka" },
  { id: "blr-east", label: "Bengaluru East", meta: "Whitefield · Marathahalli" },
  { id: "blr-west", label: "Bengaluru West", meta: "Rajajinagar · Vijayanagar" },
  { id: "electronic-city", label: "Electronic City", meta: "Phase 1 & 2" },
];

export default function HomeIdlePage() {
  const [areaId, setAreaId] = useState("blr-south");
  const [pickerOpen, setPickerOpen] = useState(false);
  const area = AREAS.find((a) => a.id === areaId) ?? AREAS[0];

  return (
    <PhoneFrame label="Home · Idle">
      {/* App bar */}
      <header className="px-4 min-h-16 py-3 flex items-center gap-3 bg-white sticky top-0 z-30 border-b border-[var(--border-subtle)]">
        <Avatar initials="P" size={44} />
        <div className="flex-1 min-w-0">
          <div className="t-body-lg font-semibold text-neutral-800 truncate leading-tight">
            Hi, Priya
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mt-0.5 -ml-1 flex items-center gap-1.5 px-1 py-0.5 rounded-md hover:bg-neutral-50 transition-colors max-w-full"
            aria-label="Change working area"
          >
            <span className="w-2 h-2 rounded-full bg-success shrink-0" />
            <span className="t-caption font-medium text-neutral-600 truncate">
              Online · {area.label}
            </span>
            <ChevronDown size={13} className="text-neutral-400 shrink-0" />
          </button>
        </div>
        <Link
          href="/notifications"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-50 relative shrink-0"
        >
          <Bell size={20} className="text-neutral-700" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </Link>
      </header>

      <div className="px-4 pt-4 pb-24 space-y-4">

        {/* Weekly goal */}
        <Card padding="lg">
          <h2 className="t-h3 font-semibold text-neutral-900 mb-2">This Week</h2>
          <div className="flex items-baseline justify-between mb-2">
            <span className="t-display font-bold tabular text-neutral-800">
              ₹4,200
            </span>
            <span className="t-body-sm text-neutral-500">7 of 50 cases</span>
          </div>
          <ProgressBar value={14} tone="primary" />
          <div className="mt-3 t-caption text-neutral-500">
            43 more cases to hit your weekly goal
          </div>
          <Link
            href="/wallet"
            className="mt-4 -mx-3 flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-700 shrink-0">
              <WalletIcon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="t-body font-semibold text-neutral-800">
                Wallet
              </div>
              <div className="t-caption text-neutral-500 mt-0.5">
                View balance &amp; payouts
              </div>
            </div>
            <ChevronRight size={16} className="text-neutral-300 shrink-0" />
          </Link>
        </Card>

        {/* Quick actions */}
        <Card padding="none" className="p-2.5">
          <h2 className="t-h3 font-semibold text-neutral-900 mb-2 px-1">Quick Access</h2>
          <div className="grid grid-cols-2 gap-1.5">
            <QuickAction icon={BookOpen} label="SOP" href="#" />
            <QuickAction icon={Phone} label="Contact" href="/profile/support" />
          </div>
        </Card>

        {/* Incidents summary */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="t-h3 font-semibold text-neutral-900">Total incidents</h2>
            <Link
              href="/incidents"
              className="t-caption font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-0.5"
            >
              View more <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <IncidentStat
              label="Active"
              value={ACTIVE_COUNT}
              tone="primary"
              href="/incidents"
            />
            <IncidentStat
              label="Past"
              value={PAST_COUNT}
              tone="neutral"
              href="/incidents"
            />
          </div>
        </Card>
      </div>

      <BottomTabBar active="home" />

      <LocationPickerSheet
        open={pickerOpen}
        selectedId={areaId}
        onSelect={(id) => {
          setAreaId(id);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </PhoneFrame>
  );
}

function LocationPickerSheet({
  open,
  selectedId,
  onSelect,
  onClose,
}: {
  open: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AREAS;
    return AREAS.filter(
      (a) =>
        a.label.toLowerCase().includes(q) || a.meta.toLowerCase().includes(q)
    );
  }, [query]);

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
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-transform duration-300 ease-out flex flex-col max-h-[80%] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        <div className="px-4 pt-2 pb-3 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="t-h3 font-bold text-neutral-800">
              Working area
            </div>
            <div className="t-caption text-neutral-500 mt-0.5">
              You&apos;ll only receive cases from here
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 -mr-1 shrink-0 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-500"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pb-3 shrink-0">
          <div className="flex items-center gap-2 h-11 px-3 rounded-lg border border-[var(--border-default)] bg-white focus-within:border-primary-500 transition-colors">
            <Search size={16} className="text-neutral-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search area"
              className="flex-1 t-body text-neutral-800 focus:outline-none placeholder:text-neutral-400"
            />
          </div>
        </div>

        <div className="overflow-y-auto no-scrollbar flex-1 px-4 pb-4">
          {filtered.length === 0 ? (
            <div className="text-center py-10 t-body-sm text-neutral-400">
              No areas match &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul className="space-y-1">
              {filtered.map((a) => {
                const active = a.id === selectedId;
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(a.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-colors ${
                        active
                          ? "border-primary-500 bg-primary-50/40"
                          : "border-transparent hover:bg-neutral-50"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          active
                            ? "bg-primary-100 text-primary-700"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        <MapPin size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="t-body font-semibold text-neutral-800 truncate">
                          {a.label}
                        </div>
                        <div className="t-caption text-neutral-500 truncate mt-0.5">
                          {a.meta}
                        </div>
                      </div>
                      {active && (
                        <Check size={18} className="text-primary-600 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-4 pt-2 pb-5 border-t border-[var(--border-subtle)] shrink-0">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-white hover:border-primary-300 hover:bg-primary-50/30 transition-colors min-w-0"
    >
      <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
        <Icon size={18} />
      </div>
      <span className="t-body-sm font-semibold text-neutral-800 truncate">
        {label}
      </span>
    </Link>
  );
}

function IncidentStat({
  label,
  value,
  tone,
  href,
}: {
  label: string;
  value: number;
  tone: "primary" | "neutral";
  href: string;
}) {
  const styles =
    tone === "primary"
      ? "bg-primary-50 text-primary-700"
      : "bg-neutral-100 text-neutral-700";
  return (
    <Link
      href={href}
      className={`rounded-xl px-4 py-3 ${styles} hover:opacity-90 transition-opacity`}
    >
      <div className="t-caption font-medium opacity-80">{label}</div>
      <div className="t-h1 font-bold tabular mt-1">{value}</div>
    </Link>
  );
}
