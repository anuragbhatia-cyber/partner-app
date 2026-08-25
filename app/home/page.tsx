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
  UserPlus,
  CalendarCheck2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { PAST_COUNT } from "@/app/incidents/page";
import {
  CATEGORY_LABELS,
  LeadCategory,
  useLeadsStore,
} from "@/lib/leads-store";
import { getStatus, setStatus } from "@/lib/partner-status";

type Area = { id: string; label: string; meta: string; state: string };

const AREAS: Area[] = [
  // Karnataka
  { id: "blr-south", label: "Bengaluru South", meta: "Koramangala · HSR · BTM", state: "Karnataka" },
  { id: "blr-central", label: "Bengaluru Central", meta: "MG Road · Shivajinagar", state: "Karnataka" },
  { id: "blr-north", label: "Bengaluru North", meta: "Hebbal · Yelahanka", state: "Karnataka" },
  { id: "blr-east", label: "Bengaluru East", meta: "Whitefield · Marathahalli", state: "Karnataka" },
  { id: "blr-west", label: "Bengaluru West", meta: "Rajajinagar · Vijayanagar", state: "Karnataka" },
  { id: "electronic-city", label: "Electronic City", meta: "Phase 1 & 2", state: "Karnataka" },
  { id: "mysuru", label: "Mysuru", meta: "Central · Vijayanagar", state: "Karnataka" },
  { id: "mangaluru", label: "Mangaluru", meta: "Hampankatta · Kadri", state: "Karnataka" },
  // Maharashtra
  { id: "mumbai-south", label: "Mumbai South", meta: "Colaba · Fort · Nariman Point", state: "Maharashtra" },
  { id: "mumbai-central", label: "Mumbai Central", meta: "Bandra · Andheri · Juhu", state: "Maharashtra" },
  { id: "mumbai-suburbs", label: "Mumbai Suburbs", meta: "Powai · Ghatkopar · Mulund", state: "Maharashtra" },
  { id: "navi-mumbai", label: "Navi Mumbai", meta: "Vashi · Nerul · Kharghar", state: "Maharashtra" },
  { id: "thane", label: "Thane", meta: "Ghodbunder · Wagle Estate", state: "Maharashtra" },
  { id: "pune-central", label: "Pune Central", meta: "Shivajinagar · Deccan", state: "Maharashtra" },
  { id: "pune-east", label: "Pune East", meta: "Hadapsar · Kharadi · Viman Nagar", state: "Maharashtra" },
  { id: "pune-west", label: "Pune West", meta: "Kothrud · Baner · Aundh", state: "Maharashtra" },
  { id: "nagpur", label: "Nagpur", meta: "Civil Lines · Dharampeth", state: "Maharashtra" },
  // Delhi NCR
  { id: "delhi-central", label: "Delhi Central", meta: "Connaught Place · Karol Bagh", state: "Delhi" },
  { id: "delhi-south", label: "South Delhi", meta: "Saket · Hauz Khas · GK", state: "Delhi" },
  { id: "delhi-north", label: "North Delhi", meta: "Civil Lines · Kamla Nagar", state: "Delhi" },
  { id: "delhi-east", label: "East Delhi", meta: "Preet Vihar · Laxmi Nagar", state: "Delhi" },
  { id: "delhi-west", label: "West Delhi", meta: "Rajouri Garden · Janakpuri", state: "Delhi" },
  { id: "gurugram", label: "Gurugram", meta: "Cyber City · Golf Course Rd", state: "Haryana" },
  { id: "noida", label: "Noida", meta: "Sector 18 · 62 · 137", state: "Uttar Pradesh" },
  { id: "faridabad", label: "Faridabad", meta: "Old · Sector 15 · Neelam", state: "Haryana" },
  { id: "ghaziabad", label: "Ghaziabad", meta: "Indirapuram · Vaishali", state: "Uttar Pradesh" },
  // Tamil Nadu
  { id: "chennai-central", label: "Chennai Central", meta: "T Nagar · Nungambakkam", state: "Tamil Nadu" },
  { id: "chennai-south", label: "Chennai South", meta: "Adyar · Velachery · OMR", state: "Tamil Nadu" },
  { id: "chennai-north", label: "Chennai North", meta: "Anna Nagar · Kilpauk", state: "Tamil Nadu" },
  { id: "coimbatore", label: "Coimbatore", meta: "RS Puram · Peelamedu", state: "Tamil Nadu" },
  { id: "madurai", label: "Madurai", meta: "Anna Nagar · Simmakkal", state: "Tamil Nadu" },
  // Telangana / AP
  { id: "hyderabad-central", label: "Hyderabad Central", meta: "Banjara Hills · Jubilee Hills", state: "Telangana" },
  { id: "hyderabad-west", label: "Hyderabad West", meta: "Gachibowli · Madhapur", state: "Telangana" },
  { id: "hyderabad-old", label: "Old City", meta: "Charminar · Malakpet", state: "Telangana" },
  { id: "visakhapatnam", label: "Visakhapatnam", meta: "Dwaraka Nagar · MVP Colony", state: "Andhra Pradesh" },
  { id: "vijayawada", label: "Vijayawada", meta: "Governorpet · Benz Circle", state: "Andhra Pradesh" },
  // West Bengal
  { id: "kolkata-central", label: "Kolkata Central", meta: "Park Street · Esplanade", state: "West Bengal" },
  { id: "kolkata-south", label: "South Kolkata", meta: "Ballygunge · Gariahat", state: "West Bengal" },
  { id: "kolkata-north", label: "North Kolkata", meta: "Shyambazar · Sovabazar", state: "West Bengal" },
  { id: "howrah", label: "Howrah", meta: "Station · Shibpur", state: "West Bengal" },
  // Gujarat
  { id: "ahmedabad-west", label: "Ahmedabad West", meta: "SG Highway · Bodakdev", state: "Gujarat" },
  { id: "ahmedabad-east", label: "Ahmedabad East", meta: "Maninagar · Kankaria", state: "Gujarat" },
  { id: "surat", label: "Surat", meta: "Adajan · Vesu · Athwa", state: "Gujarat" },
  { id: "vadodara", label: "Vadodara", meta: "Alkapuri · Manjalpur", state: "Gujarat" },
  // Rajasthan
  { id: "jaipur", label: "Jaipur", meta: "C Scheme · Malviya Nagar", state: "Rajasthan" },
  { id: "jodhpur", label: "Jodhpur", meta: "Sardarpura · Ratanada", state: "Rajasthan" },
  { id: "udaipur", label: "Udaipur", meta: "Ashok Nagar · Bhopalpura", state: "Rajasthan" },
  // Kerala
  { id: "kochi", label: "Kochi", meta: "Kakkanad · Panampilly Nagar", state: "Kerala" },
  { id: "thiruvananthapuram", label: "Thiruvananthapuram", meta: "Vazhuthacaud · Kowdiar", state: "Kerala" },
  { id: "kozhikode", label: "Kozhikode", meta: "Beach Rd · Nadakkavu", state: "Kerala" },
  // Punjab / Chandigarh
  { id: "chandigarh", label: "Chandigarh", meta: "Sector 17 · 34 · 43", state: "Chandigarh" },
  { id: "ludhiana", label: "Ludhiana", meta: "Sarabha Nagar · Model Town", state: "Punjab" },
  { id: "amritsar", label: "Amritsar", meta: "Ranjit Avenue · Lawrence Rd", state: "Punjab" },
  // UP
  { id: "lucknow", label: "Lucknow", meta: "Hazratganj · Gomti Nagar", state: "Uttar Pradesh" },
  { id: "kanpur", label: "Kanpur", meta: "Swaroop Nagar · Kakadeo", state: "Uttar Pradesh" },
  { id: "varanasi", label: "Varanasi", meta: "Cantt · Sigra · Lanka", state: "Uttar Pradesh" },
  // MP
  { id: "indore", label: "Indore", meta: "Vijay Nagar · Palasia", state: "Madhya Pradesh" },
  { id: "bhopal", label: "Bhopal", meta: "MP Nagar · New Market", state: "Madhya Pradesh" },
  // Others
  { id: "patna", label: "Patna", meta: "Boring Rd · Kankarbagh", state: "Bihar" },
  { id: "bhubaneswar", label: "Bhubaneswar", meta: "Sahid Nagar · Patia", state: "Odisha" },
  { id: "guwahati", label: "Guwahati", meta: "Panbazar · Beltola", state: "Assam" },
  { id: "dehradun", label: "Dehradun", meta: "Rajpur Rd · Clement Town", state: "Uttarakhand" },
  { id: "goa", label: "Goa", meta: "Panaji · Margao · Vasco", state: "Goa" },
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
  const [areaIds, setAreaIds] = useState<string[]>(["blr-south"]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [todayFilter, setTodayFilter] = useState<TodayFilter>("all");
  const [ready, setReady] = useState(false);
  const selectedAreas = AREAS.filter((a) => areaIds.includes(a.id));
  const primaryArea = selectedAreas[0] ?? AREAS[0];
  const extraCount = Math.max(0, selectedAreas.length - 1);
  const { leads, assigned } = useLeadsStore();
  const activeCount = assigned.length;
  const leadsCount = leads.length;
  const offlineLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("offline");
    if (q === "1") setStatus("offline");
    if (getStatus() === "offline") {
      offlineLinkRef.current?.click();
      return;
    }
    setReady(true);
  }, []);

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

  if (!ready) {
    return (
      <PhoneFrame
        label="Home · Idle"
        statusBarClassName="bg-black text-white"
      >
        <a
          ref={offlineLinkRef}
          href="/home/offline"
          className="hidden"
          aria-hidden
          tabIndex={-1}
        >
          Offline
        </a>
        <div className="flex-1" />
      </PhoneFrame>
    );
  }

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
                {primaryArea.label}
                {extraCount > 0 ? ` +${extraCount}` : ""}
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
              {leadsCount} New Lead{leadsCount === 1 ? "" : "s"}
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
            <TodayEmpty
              filter={todayFilter}
              onShowAll={() => setTodayFilter("all")}
            />
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
        selectedIds={areaIds}
        onToggle={(id) =>
          setAreaIds((prev) =>
            prev.includes(id)
              ? prev.filter((x) => x !== id)
              : [...prev, id]
          )
        }
        onClose={() => setPickerOpen(false)}
      />
    </PhoneFrame>
  );
}

type NotifItem = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  title: string;
  body: React.ReactNode;
  time: string;
  unread?: boolean;
  variant?: "invite";
  href?: string;
};

const NOTIF_SECTIONS: { label: string; items: NotifItem[] }[] = [
  {
    label: "Today",
    items: [
      {
        icon: UserPlus,
        iconBg: "bg-primary-50 text-primary-700",
        title: "Team invite",
        body: (
          <>
            You&apos;ve been requested to join{" "}
            <span className="font-semibold text-neutral-800">
              Anurag&apos;s team
            </span>
            .
          </>
        ),
        time: "Just now",
        unread: true,
        variant: "invite",
      },
      {
        icon: IndianRupee,
        iconBg: "bg-accent-100 text-accent-700",
        title: "₹850 credited",
        body: "Case IRN-100842",
        time: "2 min ago",
        unread: true,
        href: "/wallet/transactions",
      },
      {
        icon: Siren,
        iconBg: "bg-error-subtle text-error-bold",
        title: "New case assigned",
        body: "Traffic Challan · HIGH · MG Road · 3.2 km",
        time: "10:24",
        href: "/leads",
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
        href: "/wallet/transactions",
      },
      {
        icon: ShieldCheck,
        iconBg: "bg-success-subtle text-success-bold",
        title: "KYC approved",
        body: "Welcome aboard!",
        time: "09:30",
        href: "/profile/documents",
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
  const [inviteState, setInviteState] = useState<
    "pending" | "accepted" | "declined"
  >("pending");
  const [inviteBusy, setInviteBusy] = useState<null | "accept" | "decline">(
    null
  );

  const handleInvite = (kind: "accept" | "decline") => {
    if (inviteBusy) return;
    setInviteBusy(kind);
    window.setTimeout(() => {
      setInviteState(kind === "accept" ? "accepted" : "declined");
      setInviteBusy(null);
    }, 500);
  };

  const inner = (
    <div className="flex items-start gap-3 p-3.5">
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
          {notif.unread && inviteState === "pending" && (
            <span className="w-2 h-2 rounded-full bg-error shrink-0 mt-1.5" />
          )}
        </div>
        <div className="t-body-sm text-neutral-500 mt-0.5">{notif.body}</div>
        <div className="t-caption text-neutral-400 mt-2">{notif.time}</div>
        {notif.variant === "invite" &&
          (inviteState === "pending" ? (
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<X size={14} />}
                loading={inviteBusy === "decline"}
                disabled={inviteBusy !== null}
                onClick={() => handleInvite("decline")}
              >
                Decline
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Check size={14} />}
                loading={inviteBusy === "accept"}
                disabled={inviteBusy !== null}
                onClick={() => handleInvite("accept")}
              >
                Accept
              </Button>
            </div>
          ) : (
            <div
              className={`mt-3 inline-flex items-center gap-1.5 t-body-sm font-semibold ${
                inviteState === "accepted"
                  ? "text-success-bold"
                  : "text-neutral-500"
              }`}
            >
              {inviteState === "accepted" ? (
                <>
                  <Check size={14} strokeWidth={3} />
                  Joined the team
                </>
              ) : (
                <>
                  <X size={14} strokeWidth={3} />
                  Invite declined
                </>
              )}
            </div>
          ))}
      </div>
    </div>
  );

  const shell = "rounded-xl bg-white border border-[var(--border-default)] shadow-e1 overflow-hidden";
  if (notif.href && notif.variant !== "invite") {
    return (
      <a
        href={notif.href}
        className={`${shell} block hover:bg-neutral-50/50 active:bg-neutral-50 transition-colors`}
      >
        {inner}
      </a>
    );
  }
  return <div className={shell}>{inner}</div>;
}

function LocationPickerSheet({
  open,
  selectedIds,
  onToggle,
  onClose,
}: {
  open: boolean;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AREAS;
    return AREAS.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.meta.toLowerCase().includes(q) ||
        a.state.toLowerCase().includes(q)
    );
  }, [query]);

  // Group by state so users can scan by geography
  const groups = useMemo(() => {
    const map = new Map<string, Area[]>();
    for (const a of filtered) {
      if (!map.has(a.state)) map.set(a.state, []);
      map.get(a.state)!.push(a);
    }
    return Array.from(map.entries());
  }, [filtered]);

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
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-transform duration-300 ease-out flex flex-col max-h-[85%] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        <div className="px-4 pt-2 pb-3 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="t-h3 font-bold text-neutral-800">
              Working areas
            </div>
            <div className="t-caption text-neutral-700 mt-0.5">
              {selectedIds.length > 0
                ? `${selectedIds.length} selected · you'll only receive cases from these`
                : "Pick one or more · you'll only receive cases from these"}
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
              placeholder="Search area, city or state"
              className="flex-1 t-body text-neutral-800 focus:outline-none placeholder:text-neutral-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="w-6 h-6 rounded-full text-neutral-400 hover:text-neutral-600 flex items-center justify-center shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto no-scrollbar flex-1 px-4 pb-4">
          {filtered.length === 0 ? (
            <div className="text-center py-10 t-body-sm text-neutral-600">
              No areas match &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map(([state, items]) => (
                <div key={state}>
                  <div className="t-micro font-semibold uppercase tracking-wider text-neutral-500 px-1 mb-1.5">
                    {state}
                  </div>
                  <ul className="space-y-1">
                    {items.map((a) => {
                      const active = selectedIds.includes(a.id);
                      return (
                        <li key={a.id}>
                          <button
                            type="button"
                            onClick={() => onToggle(a.id)}
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
                            <span
                              className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center transition-all ${
                                active
                                  ? "bg-primary-600 text-white"
                                  : "border-2 border-neutral-300 bg-white"
                              }`}
                              aria-hidden
                            >
                              {active && (
                                <Check size={14} strokeWidth={3} />
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 pt-2 pb-5 border-t border-[var(--border-subtle)] shrink-0">
          <Button
            variant="primary"
            fullWidth
            disabled={selectedIds.length === 0}
            onClick={onClose}
          >
            Done
            {selectedIds.length > 0 ? ` · ${selectedIds.length} selected` : ""}
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

function TodayEmpty({
  filter,
  onShowAll,
}: {
  filter: TodayFilter;
  onShowAll: () => void;
}) {
  const isFiltered = filter !== "all";
  const label = isFiltered ? CATEGORY_LABELS[filter as LeadCategory] : "";

  return (
    <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-white/60 px-5 py-8 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-primary-50 text-primary-700 flex items-center justify-center mb-3">
        <CalendarCheck2 size={22} />
      </div>
      <h3 className="t-body-lg font-semibold text-neutral-800">
        {isFiltered ? `No ${label} work today` : "No cases lined up today"}
      </h3>
      <p className="t-body-sm text-neutral-500 mt-1 max-w-[260px] mx-auto">
        {isFiltered
          ? "Try another category or browse open leads in your area."
          : "New cases will land here as they come in. In the meantime, check the live leads."}
      </p>
      <div className="mt-4 flex items-center justify-center gap-2">
        {isFiltered && (
          <button
            type="button"
            onClick={onShowAll}
            className="h-9 px-3.5 rounded-full border border-[var(--border-default)] text-neutral-700 t-body-sm font-semibold hover:border-primary-300"
          >
            Show all
          </button>
        )}
        <Link
          href="/leads"
          className="h-9 px-3.5 inline-flex items-center gap-1 rounded-full bg-primary-600 text-white t-body-sm font-semibold hover:bg-primary-700"
        >
          Browse leads
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
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
