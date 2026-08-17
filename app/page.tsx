"use client";

import Link from "next/link";
import {
  Home,
  ClipboardList,
  Wallet,
  Bell,
  User,
  UserPlus,
  Sparkles,
} from "lucide-react";

interface Screen {
  path: string;
  title: string;
  desc: string;
  tag?: string;
}

interface Section {
  key: string;
  title: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  screens: Screen[];
}

const sections: Section[] = [
  {
    key: "auth",
    title: "Auth & Onboarding",
    color: "from-primary-500 to-primary-700",
    icon: UserPlus,
    screens: [
      { path: "/splash", title: "Splash", desc: "Brand + auth check" },
      { path: "/role", title: "Role Selection", desc: "Lawyer or Agent" },
      { path: "/otp", title: "Phone & OTP", desc: "4-digit verify" },
      { path: "/onboarding/personal", title: "Personal Info", desc: "Basic details form" },
      { path: "/onboarding/documents", title: "Documents Hub", desc: "Upload checklist" },
      { path: "/onboarding/kyc-status", title: "KYC Status", desc: "Under review" },
    ],
  },
  {
    key: "home",
    title: "Home Dashboard",
    color: "from-primary-600 to-primary-800",
    icon: Home,
    screens: [
      { path: "/home", title: "Idle", desc: "Ready & waiting", tag: "hero" },
      { path: "/home/active", title: "Active Case", desc: "Command bridge" },
      { path: "/home/incoming", title: "Incoming Assignment", desc: "Full-screen overlay", tag: "critical" },
      { path: "/home/offline", title: "Offline", desc: "Not receiving cases" },
      { path: "/ai", title: "AI Expert", desc: "Chat co-pilot for drafts & help" },
      { path: "/knowledge", title: "Knowledge Base", desc: "Guides, templates, FAQs & rulings" },
    ],
  },
  {
    key: "incidents",
    title: "Incidents",
    color: "from-info to-info-bold",
    icon: ClipboardList,
    screens: [
      { path: "/incidents", title: "Incidents List", desc: "Active + history" },
      { path: "/incidents/predeparture", title: "Pre-departure", desc: "Just accepted" },
      { path: "/incidents/enroute", title: "En Route", desc: "Navigation view" },
      { path: "/incidents/active", title: "In Progress", desc: "Execution workspace" },
      { path: "/incidents/complete", title: "Completion", desc: "Close case flow" },
      { path: "/incidents/history", title: "History", desc: "Past cases" },
    ],
  },
  {
    key: "wallet",
    title: "Wallet",
    color: "from-accent-500 to-accent-700",
    icon: Wallet,
    screens: [
      { path: "/wallet", title: "Wallet Home", desc: "Balance + summary", tag: "hero" },
      { path: "/wallet/transactions", title: "Transactions", desc: "Full ledger" },
      { path: "/wallet/payout", title: "Payout Request", desc: "Amount + confirm" },
    ],
  },
  {
    key: "notifications",
    title: "Notifications",
    color: "from-primary-400 to-primary-600",
    icon: Bell,
    screens: [
      { path: "/notifications", title: "Notifications Feed", desc: "Ops · Money · KYC" },
    ],
  },
  {
    key: "profile",
    title: "Profile & Settings",
    color: "from-neutral-500 to-neutral-700",
    icon: User,
    screens: [
      { path: "/profile", title: "Profile Home", desc: "Availability + sections" },
      { path: "/profile/availability", title: "Availability & Areas", desc: "Hours + map" },
      { path: "/profile/documents", title: "Documents", desc: "Uploads + expiry" },
      { path: "/profile/support", title: "Support", desc: "Help + chat" },
      { path: "/profile/settings", title: "Settings", desc: "Security + about" },
    ],
  },
];

export default function GalleryPage() {
  const totalScreens = sections.reduce((n, s) => n + s.screens.length, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(201,154,46,0.4), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15), transparent 40%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 md:px-8 pt-14 pb-16 md:pt-20 md:pb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur mb-6">
            <Sparkles size={14} className="text-accent-300" />
            <span className="text-xs font-semibold tracking-wide">
              UI PREVIEW · V1
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Lawyered
            <span className="block text-accent-300">Partner App</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
            High-fidelity mockups of the field-first mobile app for
            Lawyered&apos;s legal &amp; RTO delivery partners. {totalScreens}{" "}
            screens across {sections.length} sections.
          </p>
          <div className="flex flex-wrap gap-6 md:gap-10 mt-10 text-sm">
            <Stat value={totalScreens.toString()} label="Screens" />
            <Stat value={sections.length.toString()} label="Sections" />
            <Stat value="100+" label="Components" />
            <Stat value="V1" label="Release" />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/prototype"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent-500 text-primary-900 font-semibold t-body-lg hover:bg-accent-300 transition-colors shadow-e2"
            >
              <Sparkles size={16} />
              Launch interactive prototype
            </Link>
            <span className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white/80 t-body-sm">
              Or browse individual screens ↓
            </span>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-14 md:py-20 space-y-14">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.key}>
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-white shadow-e2`}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800 tracking-tight">
                    {section.title}
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {section.screens.length}{" "}
                    {section.screens.length === 1 ? "screen" : "screens"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.screens.map((screen) => (
                  <Link
                    key={screen.path}
                    href={screen.path}
                    className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white hover:border-primary-400 hover:shadow-e2 transition-all p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors">
                        {screen.title}
                      </h3>
                      {screen.tag && (
                        <span
                          className={`t-micro font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            screen.tag === "critical"
                              ? "bg-error-subtle text-error-bold"
                              : "bg-accent-100 text-accent-700"
                          }`}
                        >
                          {screen.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500">{screen.desc}</p>
                    <div className="mt-3 text-xs font-mono text-neutral-400">
                      {screen.path}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <footer className="pt-10 mt-14 border-t border-neutral-200 text-sm text-neutral-500">
          Built as a static Next.js preview. Tap any screen above.
        </footer>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold tracking-tight">
        {value}
      </div>
      <div className="text-xs uppercase tracking-wider text-white/60 mt-1">
        {label}
      </div>
    </div>
  );
}
