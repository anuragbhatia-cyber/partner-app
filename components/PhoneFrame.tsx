"use client";

import { ReactNode, createContext, useContext } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

// If we're already inside a PhoneFrame (e.g. inside the /prototype player),
// nested PhoneFrames render only their children — the outer chrome is reused.
const PhoneFrameContext = createContext(false);

export function PhoneFrameProvider({ children }: { children: ReactNode }) {
  return (
    <PhoneFrameContext.Provider value={true}>
      {children}
    </PhoneFrameContext.Provider>
  );
}

interface PhoneFrameProps {
  children: ReactNode;
  label?: string;
  time?: string;
}

export function PhoneFrame({
  children,
  label,
  time = "9:41",
}: PhoneFrameProps) {
  const isNested = useContext(PhoneFrameContext);
  if (isNested) return <>{children}</>;

  return (
    <div className="min-h-screen w-full flex flex-col items-center md:py-10 md:px-4">
      {/* Meta strip — desktop only */}
      <div className="hidden md:flex w-full max-w-[420px] items-center justify-between mb-6 text-xs text-neutral-600">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white shadow-e1 hover:bg-neutral-50 transition-colors"
        >
          <LayoutGrid size={14} />
          Gallery
        </Link>
        {label ? (
          <span className="font-medium text-neutral-700">{label}</span>
        ) : (
          <span />
        )}
      </div>

      {/* Phone chrome — bezel only shows on md+; on mobile the UI is edge-to-edge */}
      <div className="relative w-full md:max-w-[420px] md:rounded-[42px] md:bg-neutral-900 md:p-2 md:shadow-e3">
        {/* Screen */}
        <div className="relative bg-[var(--surface-bg)] w-full md:rounded-[34px] md:overflow-hidden md:aspect-[9/19.5] min-h-screen md:min-h-0">
          {/* Status bar — desktop only (mobile OS has its own) */}
          <div className="hidden md:flex absolute inset-x-0 top-0 z-40 items-center justify-between px-6 pt-2 pb-1 t-body-sm font-semibold text-neutral-900 tabular bg-white">
            <span>{time}</span>
            <div className="absolute left-1/2 -translate-x-1/2 top-1.5 h-6 w-24 rounded-full bg-neutral-900" />
            <div className="flex items-center gap-1">
              <SignalIcon />
              <WifiIcon />
              <BatteryIcon />
            </div>
          </div>

          {/* Screen content — absolute + internal scroll on desktop, natural doc flow on mobile */}
          <div className="md:absolute md:inset-0 md:pt-9 md:overflow-y-auto no-scrollbar flex flex-col min-h-screen md:min-h-0 bg-[var(--surface-bg)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PhoneShell — used by the prototype player. Renders the phone chrome once
 * and provides a scrollable content area for children. Sizes itself to fill
 * its parent (parent controls dimensions).
 */
export function PhoneShell({
  children,
  time = "9:41",
}: {
  children: ReactNode;
  time?: string;
}) {
  return (
    <div className="relative w-full h-full rounded-[42px] bg-neutral-900 p-2 shadow-e3 ring-1 ring-white/5">
      <div className="relative rounded-[34px] overflow-hidden bg-[var(--surface-bg)] w-full h-full flex flex-col">
        {/* Status bar — dedicated row, sits above content */}
        <div className="relative shrink-0 h-9 flex items-center justify-between px-6 pt-2 pb-1 t-body-sm font-semibold text-neutral-900 tabular z-40 bg-white">
          <span>{time}</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-1.5 h-6 w-24 rounded-full bg-neutral-900" />
          <div className="flex items-center gap-1">
            <SignalIcon />
            <WifiIcon />
            <BatteryIcon />
          </div>
        </div>
        {/* Scrollable content region */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col">
          <PhoneFrameProvider>{children}</PhoneFrameProvider>
        </div>
      </div>
    </div>
  );
}

function SignalIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
      <rect x="0" y="8" width="3" height="4" rx="0.5" />
      <rect x="4" y="5" width="3" height="7" rx="0.5" />
      <rect x="8" y="2" width="3" height="10" rx="0.5" />
      <rect x="12" y="0" width="3" height="12" rx="0.5" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
      <path d="M7 12a1.2 1.2 0 100-2.4A1.2 1.2 0 007 12zM3.6 8.4a5 5 0 016.8 0l-1 1a3.5 3.5 0 00-4.8 0l-1-1zM.8 5.6a9 9 0 0112.4 0l-1 1a7.5 7.5 0 00-10.4 0l-1-1z" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
      <rect
        x="0.5"
        y="0.5"
        width="20"
        height="11"
        rx="2.5"
        stroke="currentColor"
        strokeOpacity="0.4"
      />
      <rect x="2" y="2" width="15" height="8" rx="1.5" fill="currentColor" />
      <rect
        x="21"
        y="4"
        width="1.5"
        height="4"
        rx="0.5"
        fill="currentColor"
        fillOpacity="0.4"
      />
    </svg>
  );
}

export function AppBar({
  title,
  back,
  href,
  onClick,
  action,
  className,
}: {
  title?: string;
  back?: boolean;
  href?: string;
  onClick?: () => void;
  action?: ReactNode;
  className?: string;
}) {
  const backButtonClass =
    "w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-50";
  return (
    <header
      className={cn(
        "sticky top-0 z-30 min-h-16 px-4 py-3 flex items-center justify-between bg-white border-b border-[var(--border-subtle)]",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {back && (onClick && !href ? (
          <button
            type="button"
            onClick={onClick}
            aria-label="Back"
            className={backButtonClass}
          >
            <ArrowLeft size={22} className="text-neutral-800" />
          </button>
        ) : (
          <Link href={href || "#"} className={backButtonClass}>
            <ArrowLeft size={22} className="text-neutral-800" />
          </Link>
        ))}
        {title && (
          <h1 className="t-h3 text-neutral-800 truncate">
            {title}
          </h1>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </header>
  );
}

export function ScreenScroll({ children }: { children: ReactNode }) {
  return <div className="pb-24">{children}</div>;
}
