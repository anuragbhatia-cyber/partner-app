"use client";

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  LayoutGrid,
  Home as HomeIcon,
  ClipboardList,
  Wallet as WalletIcon,
  Bell,
  User,
  UserPlus,
  Users,
  X,
  Menu,
  Sparkles,
} from "lucide-react";
import { PhoneShell, PhoneFrameProvider } from "@/components/PhoneFrame";
import { cn } from "@/lib/utils";

/* Import every screen. Nested PhoneFrames in each page become no-op
   because PhoneShell puts them inside PhoneFrameProvider (context flag). */
import SplashPage from "@/app/splash/page";
import RolePage from "@/app/role/page";
import OtpPage from "@/app/otp/page";
import OnboardingPersonalPage from "@/app/onboarding/personal/page";
import OnboardingDocumentsPage from "@/app/onboarding/documents/page";
import OnboardingKycStatusPage from "@/app/onboarding/kyc-status/page";
import HomePage from "@/app/home/page";
import HomeActivePage from "@/app/home/active/page";
import HomeIncomingPage from "@/app/home/incoming/page";
import HomeOfflinePage from "@/app/home/offline/page";
import IncidentsPage from "@/app/incidents/page";
import LeadsPage from "@/app/leads/page";
import TeamsPage from "@/app/teams/page";
import AiExpertPage from "@/app/ai/page";
import KnowledgeBasePage from "@/app/knowledge/page";
import IncidentPreDeparturePage from "@/app/incidents/predeparture/page";
import IncidentEnRoutePage from "@/app/incidents/enroute/page";
import IncidentActivePage from "@/app/incidents/active/page";
import IncidentCompletePage from "@/app/incidents/complete/page";
import IncidentHistoryPage from "@/app/incidents/history/page";
import WalletPage from "@/app/wallet/page";
import WalletTransactionsPage from "@/app/wallet/transactions/page";
import WalletPayoutPage from "@/app/wallet/payout/page";
import NotificationsPage from "@/app/notifications/page";
import ProfilePage from "@/app/profile/page";
import ProfileAvailabilityPage from "@/app/profile/availability/page";
import ProfileDocumentsPage from "@/app/profile/documents/page";
import ProfileSupportPage from "@/app/profile/support/page";
import ProfileSettingsPage from "@/app/profile/settings/page";
import ProfilePersonalInfoPage from "@/app/profile/personal-info/page";
import ProfileProfessionalPage from "@/app/profile/professional/page";
import ProfileBankPage from "@/app/profile/bank/page";
import ProfileLanguagesPage from "@/app/profile/languages/page";

type ScreenKey =
  | "splash" | "role" | "otp"
  | "onboarding-personal" | "onboarding-documents"
  | "onboarding-kyc-status"
  | "home" | "home-active" | "home-incoming" | "home-offline"
  | "leads"
  | "teams"
  | "ai"
  | "knowledge"
  | "incidents" | "incidents-predeparture" | "incidents-enroute"
  | "incidents-active" | "incidents-complete" | "incidents-history"
  | "wallet" | "wallet-transactions" | "wallet-payout"
  | "notifications"
  | "profile" | "profile-availability" | "profile-documents"
  | "profile-support" | "profile-settings"
  | "profile-personal-info" | "profile-professional"
  | "profile-bank" | "profile-languages";

interface ScreenDef {
  key: ScreenKey;
  title: string;
  section: string;
  path: string;
  Component: React.ComponentType;
}

const SCREENS: ScreenDef[] = [
  { key: "splash", title: "Splash", section: "auth", path: "/splash", Component: SplashPage },
  { key: "otp", title: "Phone & OTP", section: "auth", path: "/otp", Component: OtpPage },
  { key: "role", title: "Role Select", section: "auth", path: "/role", Component: RolePage },
  { key: "onboarding-personal", title: "Personal", section: "onboard", path: "/onboarding/personal", Component: OnboardingPersonalPage },
  { key: "onboarding-documents", title: "Documents", section: "onboard", path: "/onboarding/documents", Component: OnboardingDocumentsPage },
  { key: "onboarding-kyc-status", title: "KYC Status", section: "onboard", path: "/onboarding/kyc-status", Component: OnboardingKycStatusPage },
  { key: "home", title: "Home", section: "home", path: "/home", Component: HomePage },
  { key: "home-active", title: "Home · Active", section: "home", path: "/home/active", Component: HomeActivePage },
  { key: "home-incoming", title: "Incoming ⚡", section: "home", path: "/home/incoming", Component: HomeIncomingPage },
  { key: "home-offline", title: "Home · Offline", section: "home", path: "/home/offline", Component: HomeOfflinePage },
  { key: "leads", title: "Leads", section: "leads", path: "/leads", Component: LeadsPage },
  { key: "teams", title: "My Team", section: "home", path: "/teams", Component: TeamsPage },
  { key: "ai", title: "AI Expert", section: "home", path: "/ai", Component: AiExpertPage },
  { key: "knowledge", title: "Knowledge Base", section: "home", path: "/knowledge", Component: KnowledgeBasePage },
  { key: "incidents", title: "Incidents", section: "incidents", path: "/incidents", Component: IncidentsPage },
  { key: "incidents-predeparture", title: "Pre-departure", section: "incidents", path: "/incidents/predeparture", Component: IncidentPreDeparturePage },
  { key: "incidents-enroute", title: "En Route", section: "incidents", path: "/incidents/enroute", Component: IncidentEnRoutePage },
  { key: "incidents-active", title: "In Progress", section: "incidents", path: "/incidents/active", Component: IncidentActivePage },
  { key: "incidents-complete", title: "Complete", section: "incidents", path: "/incidents/complete", Component: IncidentCompletePage },
  { key: "incidents-history", title: "History", section: "incidents", path: "/incidents/history", Component: IncidentHistoryPage },
  { key: "wallet", title: "Wallet", section: "wallet", path: "/wallet", Component: WalletPage },
  { key: "wallet-transactions", title: "Transactions", section: "wallet", path: "/wallet/transactions", Component: WalletTransactionsPage },
  { key: "wallet-payout", title: "Payout", section: "wallet", path: "/wallet/payout", Component: WalletPayoutPage },
  { key: "notifications", title: "Notifications", section: "notifications", path: "/notifications", Component: NotificationsPage },
  { key: "profile", title: "Profile", section: "profile", path: "/profile", Component: ProfilePage },
  { key: "profile-personal-info", title: "Personal info", section: "profile", path: "/profile/personal-info", Component: ProfilePersonalInfoPage },
  { key: "profile-professional", title: "Professional", section: "profile", path: "/profile/professional", Component: ProfileProfessionalPage },
  { key: "profile-documents", title: "Documents", section: "profile", path: "/profile/documents", Component: ProfileDocumentsPage },
  { key: "profile-bank", title: "Bank account", section: "profile", path: "/profile/bank", Component: ProfileBankPage },
  { key: "profile-languages", title: "Languages", section: "profile", path: "/profile/languages", Component: ProfileLanguagesPage },
  { key: "profile-availability", title: "Availability", section: "profile", path: "/profile/availability", Component: ProfileAvailabilityPage },
  { key: "profile-support", title: "Support", section: "profile", path: "/profile/support", Component: ProfileSupportPage },
  { key: "profile-settings", title: "Settings", section: "profile", path: "/profile/settings", Component: ProfileSettingsPage },
];

const SECTIONS = [
  { key: "auth", title: "Auth", icon: UserPlus },
  { key: "onboard", title: "Onboarding", icon: UserPlus },
  { key: "home", title: "Home", icon: HomeIcon },
  { key: "leads", title: "Leads", icon: Users },
  { key: "incidents", title: "Incidents", icon: ClipboardList },
  { key: "wallet", title: "Wallet", icon: WalletIcon },
  { key: "notifications", title: "Alerts", icon: Bell },
  { key: "profile", title: "Profile", icon: User },
] as const;

export default function PrototypePlayer() {
  const [current, setCurrent] = useState<ScreenKey>("splash");
  const [history, setHistory] = useState<ScreenKey[]>(["splash"]);
  const [cursor, setCursor] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);

  const screenMap = useMemo(
    () => Object.fromEntries(SCREENS.map((s) => [s.key, s])) as Record<ScreenKey, ScreenDef>,
    []
  );
  const pathMap = useMemo(
    () => Object.fromEntries(SCREENS.map((s) => [s.path, s.key])) as Record<string, ScreenKey>,
    []
  );

  const navigate = useCallback(
    (key: ScreenKey, { closeDrawer = false }: { closeDrawer?: boolean } = {}) => {
      if (key === current) return;
      setCurrent(key);
      const next = history.slice(0, cursor + 1);
      next.push(key);
      setHistory(next);
      setCursor(next.length - 1);
      setTransitionKey((k) => k + 1);
      if (closeDrawer) setDrawerOpen(false);
    },
    [history, cursor, current]
  );

  const goBack = useCallback(() => {
    if (cursor > 0) {
      setCursor(cursor - 1);
      setCurrent(history[cursor - 1]);
      setTransitionKey((k) => k + 1);
    }
  }, [cursor, history]);

  const goForward = useCallback(() => {
    if (cursor < history.length - 1) {
      setCursor(cursor + 1);
      setCurrent(history[cursor + 1]);
      setTransitionKey((k) => k + 1);
    }
  }, [cursor, history]);

  const reset = useCallback(() => {
    setCurrent("splash");
    setHistory(["splash"]);
    setCursor(0);
    setTransitionKey((k) => k + 1);
  }, []);

  // Intercept clicks inside the phone so every in-app Link navigates the prototype
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http")) return;
      if (href === "/") return; // let gallery link work
      if (href === "#" || href.startsWith("#")) {
        e.preventDefault();
        return;
      }
      const key = pathMap[href];
      if (key) {
        e.preventDefault();
        navigate(key);
      } else {
        // Unknown internal href — prevent navigation to keep the user in the app
        e.preventDefault();
      }
    };
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, [navigate, pathMap]);

  // Splash auto-advances to Role Select after ~2s the first time we land on it
  useEffect(() => {
    if (current !== "splash") return;
    const t = setTimeout(() => {
      // Only advance if user hasn't already navigated
      setCurrent((c) => {
        if (c !== "splash") return c;
        setHistory((h) => (h.length === 1 && h[0] === "splash" ? [...h, "otp"] : h));
        setCursor((cur) => cur + 1);
        setTransitionKey((k) => k + 1);
        return "otp";
      });
    }, 2200);
    return () => clearTimeout(t);
  }, [current]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft") goBack();
      if (e.key === "ArrowRight") goForward();
      if (e.key === "Escape") setDrawerOpen(false);
      if (e.key.toLowerCase() === "n") setDrawerOpen((v) => !v);
      if (e.key.toLowerCase() === "r") reset();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goBack, goForward, reset]);

  const CurrentScreen = screenMap[current].Component;
  const currentDef = screenMap[current];

  return (
    <div
      className="fixed inset-0 overflow-hidden text-white md:bg-none"
      style={{
        background: undefined,
      }}
    >
      {/* Player backdrop — desktop only */}
      <div
        className="hidden md:block absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 800px at 30% 20%, #1a2951 0%, #0c1830 40%, #050912 100%)",
        }}
      />

      {/* Subtle grid — desktop only */}
      <div
        className="hidden md:block absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top bar — desktop only */}
      <header className="hidden md:flex absolute top-0 inset-x-0 h-14 px-4 md:px-6 items-center justify-between z-30">
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 t-caption font-semibold text-white/70 hover:text-white transition-colors"
          >
            <LayoutGrid size={13} />
            <span className="hidden sm:inline">Gallery</span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-1 t-micro uppercase tracking-wider text-white/40">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono t-micro">←</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono t-micro">→</kbd>
          <span className="ml-1">back / forward</span>
          <span className="mx-2 text-white/20">·</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono t-micro">N</kbd>
          <span className="ml-1">navigator</span>
          <span className="mx-2 text-white/20">·</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono t-micro">R</kbd>
          <span className="ml-1">restart</span>
        </div>
      </header>

      {/* Left rail — desktop only */}
      <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-4 md:left-6 z-30 flex-col gap-2">
        <RailButton
          onClick={() => setDrawerOpen(true)}
          icon={<Menu size={18} />}
          label="Screens"
        />
        <RailButton
          onClick={goBack}
          disabled={cursor === 0}
          icon={<ArrowLeft size={18} />}
          label="Back"
        />
        <RailButton
          onClick={goForward}
          disabled={cursor >= history.length - 1}
          icon={<ArrowRight size={18} />}
          label="Forward"
        />
        <RailButton
          onClick={reset}
          icon={<RotateCcw size={16} />}
          label="Restart from splash"
        />
      </div>

      {/* Phone stage — mobile: full viewport, no chrome; desktop: fixed 412×892 device */}
      <div ref={stageRef} className="absolute inset-0 md:flex md:items-center md:justify-center md:py-4 md:px-24 md:overflow-hidden">
        {/* Mobile: edge-to-edge screen render */}
        <div
          key={`mobile-${transitionKey}`}
          className="md:hidden w-full h-full overflow-y-auto no-scrollbar bg-white text-neutral-800 flex flex-col animate-[fadeIn_260ms_cubic-bezier(0.2,0,0,1)]"
        >
          <PhoneFrameProvider>
            <CurrentScreen />
          </PhoneFrameProvider>
        </div>

        {/* Desktop: scaled phone device */}
        <div
          className="hidden md:block relative shrink-0"
          style={{
            width: "min(412px, calc(412px * (100dvh - 32px) / 892px))",
            height: "min(892px, 100dvh - 32px)",
          }}
        >
          <div
            className="absolute top-1/2 left-1/2 overflow-hidden rounded-[42px]"
            style={{
              width: "412px",
              height: "892px",
              transform:
                "translate(-50%, -50%) scale(min(1, calc((100dvh - 32px) / 892px)))",
              transformOrigin: "center center",
            }}
          >
            <div
              key={`desktop-${transitionKey}`}
              className="w-full h-full animate-[fadeIn_260ms_cubic-bezier(0.2,0,0,1)]"
            >
              <PhoneShell
                statusBarClassName={
                  current === "splash" ? "bg-black text-white" : undefined
                }
              >
                <CurrentScreen />
              </PhoneShell>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB — opens screen navigator */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-30 w-12 h-12 rounded-full bg-neutral-900 text-white shadow-e3 flex items-center justify-center"
        aria-label="Open screen navigator"
      >
        <Menu size={20} />
      </button>

      {/* Screen navigator drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 pointer-events-none transition-opacity",
          drawerOpen ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity",
            drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
          )}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={cn(
            "absolute top-0 left-0 bottom-0 w-[320px] bg-neutral-900 border-r border-white/10 shadow-2xl transition-transform overflow-hidden flex flex-col pointer-events-auto",
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-accent-300" />
                <span className="t-micro font-bold uppercase tracking-widest text-accent-300">
                  Navigator
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-7 h-7 rounded-md text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
            <h2 className="t-h3 font-bold text-white">Jump to any screen</h2>
            <p className="t-caption text-white/50 mt-1">
              {SCREENS.length} screens across {SECTIONS.length} sections
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {SECTIONS.map((sec) => {
              const list = SCREENS.filter((s) => s.section === sec.key);
              const Icon = sec.icon;
              return (
                <div key={sec.key}>
                  <div className="t-micro font-semibold uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1.5">
                    <Icon size={10} />
                    {sec.title}
                  </div>
                  <div className="space-y-0.5">
                    {list.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => navigate(s.key, { closeDrawer: true })}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded-md t-caption transition-colors flex items-center gap-2",
                          current === s.key
                            ? "bg-accent-500 text-primary-900 font-semibold"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {current === s.key && (
                          <span className="w-1 h-1 rounded-full bg-primary-900" />
                        )}
                        <span className="truncate">{s.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-white/10 text-center t-micro text-white/40">
            Press <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">Esc</kbd> to close · <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">N</kbd> to reopen
          </div>
        </aside>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.994);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function RailButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        "group relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors border",
        disabled
          ? "text-white/20 border-white/5 cursor-not-allowed"
          : "text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border-white/10"
      )}
    >
      {icon}
      <span className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded bg-neutral-900 text-white t-micro whitespace-nowrap pointer-events-none">
        {label}
      </span>
    </button>
  );
}
