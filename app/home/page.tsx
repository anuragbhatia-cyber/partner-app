"use client";

import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Button, Chip } from "@/components/ui";
import {
  Bell,
  Wallet as WalletIcon,
  Users,
  Phone,
  ChevronRight,
  ChevronDown,
  MapPin,
  Check,
  Search,
  X,
  IndianRupee,
  Siren,
  ShieldCheck,
  Sparkles,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { PAST_COUNT } from "@/app/incidents/page";
import {
  CATEGORY_LABELS,
  LeadCategory,
  useLeadsStore,
} from "@/lib/leads-store";

const AREAS = [
  { id: "blr-south", label: "Bengaluru South", meta: "Koramangala · HSR · BTM" },
  { id: "blr-central", label: "Bengaluru Central", meta: "MG Road · Shivajinagar" },
  { id: "blr-north", label: "Bengaluru North", meta: "Hebbal · Yelahanka" },
  { id: "blr-east", label: "Bengaluru East", meta: "Whitefield · Marathahalli" },
  { id: "blr-west", label: "Bengaluru West", meta: "Rajajinagar · Vijayanagar" },
  { id: "electronic-city", label: "Electronic City", meta: "Phase 1 & 2" },
];

type TodayCase = {
  vehicle: string;
  irn: string;
  description: string;
  deadlineDays: number;
  category: LeadCategory;
};

type TodayFilter = "all" | LeadCategory;

const TODAY_CASES: TodayCase[] = [
  {
    vehicle: "MH012024789456",
    irn: "IRN-100842",
    description:
      "Running a red light at the intersection of Maple Street and 5th Avenue.",
    deadlineDays: 4,
    category: "challan",
  },
  {
    vehicle: "KA05MJ4421",
    irn: "IRN-100843",
    description:
      "Rear-end collision on Outer Ring Road near Silk Board junction.",
    deadlineDays: 15,
    category: "case",
  },
  {
    vehicle: "KA03NP7788",
    irn: "IRN-100844",
    description:
      "RTO documentation pending for ownership transfer at Koramangala office.",
    deadlineDays: 6,
    category: "rto",
  },
  {
    vehicle: "DL8CAF2210",
    irn: "IRN-100845",
    description:
      "Court appearance scheduled at City Civil Court for pending challan hearing.",
    deadlineDays: 21,
    category: "case",
  },
  {
    vehicle: "MH12PQ9034",
    irn: "IRN-100846",
    description:
      "Overspeeding challan disputed — evidence review requested by client.",
    deadlineDays: 2,
    category: "challan",
  },
];

export default function HomeIdlePage() {
  const [areaId, setAreaId] = useState("blr-south");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [todayFilter, setTodayFilter] = useState<TodayFilter>("all");
  const area = AREAS.find((a) => a.id === areaId) ?? AREAS[0];
  const { leads, assigned } = useLeadsStore();
  const activeCount = assigned.length;
  const leadsCount = leads.length;

  const todayCounts = useMemo(() => {
    const c: Record<TodayFilter, number> = {
      all: TODAY_CASES.length,
      case: 0,
      challan: 0,
      rto: 0,
    };
    TODAY_CASES.forEach((c2) => {
      c[c2.category] += 1;
    });
    return c;
  }, []);

  const filteredToday =
    todayFilter === "all"
      ? TODAY_CASES
      : TODAY_CASES.filter((c) => c.category === todayFilter);

  if (notifOpen) {
    return (
      <PhoneFrame label="Home · Notifications">
        <NotificationsView onClose={() => setNotifOpen(false)} />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame
      label="Home · Idle"
      statusBarClassName="bg-black text-white"
    >
      {/* Dark hero section — wraps app bar + earnings card */}
      <section className="bg-black rounded-b-3xl pb-5">
        <header className="px-4 min-h-16 py-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-neutral-900 shrink-0 ring-2 ring-white/20 flex items-center justify-center text-white t-body-lg font-semibold">
            P
          </div>
          <div className="flex-1 min-w-0">
            <div className="t-body-lg font-semibold text-white truncate leading-tight">
              Hi Priya
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="mt-0.5 -ml-1 flex items-center gap-1 px-1 py-0.5 rounded-md hover:bg-white/10 transition-colors max-w-full"
              aria-label="Change working area"
            >
              <MapPin size={13} className="text-white/90 shrink-0" />
              <span className="t-caption font-medium text-white/90 truncate">
                {area.label}
              </span>
              <ChevronDown size={13} className="text-white/90 shrink-0" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            aria-label="Open notifications"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-neutral-50 relative shrink-0 shadow-e1"
          >
            <Bell size={18} className="text-neutral-800" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-white" />
          </button>
        </header>

        {/* Earnings card, sits inside the teal region */}
        <div className="px-4 pt-8">
          <div className="relative overflow-hidden rounded-2xl bg-white bg-[radial-gradient(circle_at_top_right,#f4e2ad_0%,#fbeecb_22%,#fef8e4_42%,#ffffff_60%)] px-5 py-4 shadow-e1">
            <div className="relative z-10">
              <div className="pr-20">
                <h2 className="t-body font-semibold text-neutral-700">
                  This Week Earnings
                </h2>
                <div className="mt-2 t-h1 font-extrabold tabular text-success-bold leading-none">
                  ₹4,200
                </div>
              </div>
              <div className="mt-5 h-3 w-full rounded-full bg-success-subtle ring-1 ring-inset ring-success/15 overflow-hidden">
                <div
                  className="h-full rounded-full bg-success-bold transition-all"
                  style={{ width: "14%" }}
                />
              </div>
              <div className="mt-3 t-body-sm font-semibold text-neutral-900 whitespace-nowrap">
                43 More incidents to hit your weekly goal
              </div>
            </div>
            <div className="pointer-events-none absolute top-3 right-3 w-12 h-12">
              <Image
                src="/wallet-earnings.png"
                alt="Wallet"
                fill
                sizes="192px"
                quality={95}
                className="object-contain"
              />
            </div>
            <Link
              href="/wallet"
              className="relative z-10 mt-5 -mx-5 -mb-2 flex items-center gap-3 px-5 pt-4 pb-2 border-t border-[var(--border-subtle)] hover:bg-white/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 shrink-0">
                <WalletIcon size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="t-body-lg font-semibold text-neutral-800">
                  Wallet
                </div>
                <div className="t-caption text-neutral-700 mt-0.5">
                  View balance &amp; payouts
                </div>
              </div>
              <ChevronRight size={18} className="text-neutral-600 shrink-0" />
            </Link>
          </div>
          <Link
            href="/leads"
            className="mt-3 flex items-center gap-3 rounded-2xl bg-neutral-800 ring-1 ring-white/10 px-5 py-2.5 shadow-e1 hover:bg-neutral-700 transition-colors"
          >
            <span
              aria-hidden
              className="relative flex h-3 w-3 shrink-0"
            >
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
            </span>
            <div className="flex-1 min-w-0 t-body-lg font-semibold text-white">
              {leadsCount} new lead{leadsCount === 1 ? "" : "s"}
            </div>
            <span className="t-micro font-bold uppercase tracking-wider text-[#4ade80] shrink-0">
              Live
            </span>
            <ChevronRight size={18} className="text-white/60 shrink-0" />
          </Link>
        </div>
      </section>

      <div className="px-4 pt-5 pb-24 space-y-6">
        {/* Quick actions */}
        <section>
          <h2 className="t-h3 font-bold text-neutral-900 mb-3">Quick Access</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction icon={Users} label="My Team" href="/teams" />
            <QuickAction icon={Phone} label="Support" href="/profile/support" />
            <QuickAction icon={Sparkles} label="AI Expert" href="/ai" />
            <QuickAction icon={BookOpen} label="Knowledge Base" href="/knowledge" />
          </div>
        </section>

        {/* Incidents summary */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="t-h3 font-bold text-neutral-900">Incidents</h2>
            <Link
              href="/incidents"
              className="t-body-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-0.5"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <IncidentStat
              label="Active Incidents"
              value={activeCount}
              href="/incidents"
              icon="/active-incident-3d.png"
            />
            <IncidentStat
              label="Past Incidents"
              value={PAST_COUNT}
              href="/incidents"
              icon="/past-incident-3d.png"
            />
          </div>
        </section>

        {/* Today's work */}
        <section>
          <h2 className="t-h3 font-bold text-neutral-900 mb-3">
            Today&apos;s work
          </h2>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-3">
            {(["all", "case", "challan", "rto"] as TodayFilter[]).map((f) => (
              <FilterPill
                key={f}
                active={todayFilter === f}
                onClick={() => setTodayFilter(f)}
                label={f === "all" ? "All" : CATEGORY_LABELS[f]}
                count={todayCounts[f]}
              />
            ))}
          </div>
          {filteredToday.length === 0 ? (
            <div className="text-center py-10 t-body-sm text-neutral-400">
              No {todayFilter === "all" ? "" : CATEGORY_LABELS[todayFilter]}{" "}
              work today.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredToday.map((c, i) => (
                <TodayCaseCard key={i} caseItem={c} />
              ))}
            </div>
          )}
        </section>
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

type NotifItem = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
};

const NOTIF_SECTIONS: { label: string; items: NotifItem[] }[] = [
  {
    label: "Today",
    items: [
      {
        icon: IndianRupee,
        iconBg: "bg-accent-100 text-accent-700",
        title: "₹850 credited",
        body: "Case IRN-100842",
        time: "2 min ago",
        unread: true,
      },
      {
        icon: Siren,
        iconBg: "bg-error-subtle text-error-bold",
        title: "New case assigned",
        body: "Traffic Challan · HIGH · MG Road · 3.2 km",
        time: "10:24",
      },
    ],
  },
  {
    label: "Yesterday",
    items: [
      {
        icon: IndianRupee,
        iconBg: "bg-accent-100 text-accent-700",
        title: "₹8,000 paid to bank",
        body: "HDFC ****4521 · UTR: N123456789",
        time: "18:22",
      },
      {
        icon: ShieldCheck,
        iconBg: "bg-success-subtle text-success-bold",
        title: "KYC approved",
        body: "Welcome aboard!",
        time: "09:30",
      },
    ],
  },
  {
    label: "This Week",
    items: [
      {
        icon: Sparkles,
        iconBg: "bg-neutral-100 text-neutral-600",
        title: "Weekly summary",
        body: "You earned ₹9,200 across 12 cases",
        time: "Sun 8:00",
      },
    ],
  },
];

function NotificationsView({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[var(--surface-bg)]">
      <header className="sticky top-0 z-30 shrink-0 min-h-16 px-4 py-3 flex items-center justify-between bg-white border-b border-[var(--border-subtle)]">
        <h2 className="t-h3 text-neutral-800">Notifications</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notifications"
          className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-neutral-50 text-neutral-700"
        >
          <X size={18} />
        </button>
      </header>

      <div className="flex-1 min-h-0 px-4 pt-4 pb-6 space-y-4">
        {NOTIF_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="t-caption font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              {section.label}
            </div>
            <div className="space-y-2">
              {section.items.map((n, i) => (
                <NotifRow key={i} notif={n} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotifRow({ notif }: { notif: NotifItem }) {
  const Icon = notif.icon;
  return (
    <div className="rounded-xl bg-white border border-[var(--border-default)] shadow-e1 p-3.5 flex items-start gap-3">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${notif.iconBg}`}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div
            className={`t-body ${
              notif.unread
                ? "font-semibold text-neutral-800"
                : "font-medium text-neutral-800"
            }`}
          >
            {notif.title}
          </div>
          {notif.unread && (
            <span className="w-2 h-2 rounded-full bg-error shrink-0 mt-1.5" />
          )}
        </div>
        <div className="t-body-sm text-neutral-500 mt-0.5">{notif.body}</div>
        <div className="t-caption text-neutral-400 mt-2">{notif.time}</div>
      </div>
    </div>
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
            <div className="t-caption text-neutral-700 mt-0.5">
              You&apos;ll only receive cases from here
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 -mr-1 shrink-0 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pb-3 shrink-0">
          <div className="flex items-center gap-2 h-11 px-3 rounded-lg border border-[var(--border-default)] bg-white focus-within:border-primary-500 transition-colors">
            <Search size={16} className="text-neutral-600 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search area"
              className="flex-1 t-body text-neutral-800 focus:outline-none placeholder:text-neutral-500"
            />
          </div>
        </div>

        <div className="overflow-y-auto no-scrollbar flex-1 px-4 pb-4">
          {filtered.length === 0 ? (
            <div className="text-center py-10 t-body-sm text-neutral-600">
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
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        <MapPin size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="t-body font-semibold text-neutral-800 truncate">
                          {a.label}
                        </div>
                        <div className="t-caption text-neutral-700 truncate mt-0.5">
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
      className="flex items-center gap-2 px-2.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-white shadow-e1 hover:border-primary-300 hover:bg-primary-50/30 transition-colors min-w-0"
    >
      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 shrink-0">
        <Icon size={16} />
      </div>
      <span className="t-body-sm font-semibold text-neutral-800 whitespace-nowrap">
        {label}
      </span>
    </Link>
  );
}

function IncidentStat({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: number;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="relative rounded-2xl p-4 pb-3 bg-white shadow-e1 border border-[var(--border-default)] hover:border-primary-300 transition-colors overflow-hidden min-h-[132px]"
    >
      <div className="pr-10 t-body-lg font-semibold text-neutral-900 leading-tight">
        {label}
      </div>
      <div className="mt-2 t-display font-extrabold tabular text-primary-700 leading-none">
        {value}
      </div>
      <Image
        src={icon}
        alt=""
        width={80}
        height={80}
        className="pointer-events-none absolute bottom-2 right-2 w-[72px] h-[72px] object-contain"
      />
    </Link>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border transition-colors ${
        active
          ? "bg-primary-600 border-primary-600 text-white"
          : "bg-white border-[var(--border-default)] text-neutral-700 hover:border-primary-300"
      }`}
    >
      <span className="t-body-sm font-semibold">{label}</span>
      <span
        className={`min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full t-caption font-semibold tabular ${
          active
            ? "bg-white/20 text-white"
            : "bg-neutral-100 text-neutral-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function TodayCaseCard({ caseItem }: { caseItem: TodayCase }) {
  const deadlineTone = caseItem.deadlineDays <= 7 ? "error" : "warning";
  return (
    <div className="rounded-xl bg-white shadow-e1 border border-[var(--border-default)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="t-body-lg font-semibold text-neutral-900 truncate">
            {caseItem.vehicle}
          </div>
          <div className="t-caption text-neutral-500 mt-0.5">
            {caseItem.irn}
          </div>
        </div>
        <Chip tone={deadlineTone} size="sm" className="shrink-0">
          Deadline: {caseItem.deadlineDays} DAYS
        </Chip>
      </div>
      <p className="t-body text-neutral-700 mt-2">{caseItem.description}</p>
      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex justify-end">
        <Link
          href="/incidents/active"
          className="t-body-sm font-semibold text-primary-600 inline-flex items-center gap-0.5"
        >
          View <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
