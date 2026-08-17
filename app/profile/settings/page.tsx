"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card, ListRow, SectionLabel } from "@/components/ui";
import {
  Bell,
  Globe,
  Shield,
  Scroll,
  Info,
  LogOut,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { useState, type ReactNode } from "react";

type Language = "en" | "hi" | "kn";

const LANGUAGE_LABEL: Record<Language, string> = {
  en: "English",
  hi: "हिन्दी (Hindi)",
  kn: "ಕನ್ನಡ (Kannada)",
};

type SheetKind =
  | null
  | "language"
  | "signout"
  | "delete"
  | "info-terms"
  | "info-privacy"
  | "info-agreement"
  | "info-app";

export default function SettingsPage() {
  const [notifOn, setNotifOn] = useState(true);
  const [language, setLanguage] = useState<Language>("en");
  const [sheet, setSheet] = useState<SheetKind>(null);

  const signOut = () => {
    setSheet(null);
    // Dispatch a synthetic anchor click so it works both standalone
    // (real Next navigation) and inside the prototype (Link interception
    // switches the prototype's screen state instead of leaving /prototype).
    const a = document.createElement("a");
    a.href = "/splash";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <PhoneFrame label="Profile · Settings">
      <AppBar back href="/profile" title="Settings" />

      <div className="px-4 py-4 pb-24 space-y-4">
        {/* App */}
        <div>
          <SectionLabel className="mb-2">App</SectionLabel>
          <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
            <ListRow
              icon={<Bell size={18} />}
              title="Notifications"
              subtitle={notifOn ? "Push enabled" : "Push disabled"}
              right={<Switch on={notifOn} onChange={() => setNotifOn((v) => !v)} />}
              showChevron={false}
            />
            <ListRow
              icon={<Globe size={18} />}
              title="Language"
              right={
                <span className="t-caption text-neutral-500">
                  {LANGUAGE_LABEL[language]}
                </span>
              }
              onClick={() => setSheet("language")}
            />
          </Card>
        </div>

        {/* About */}
        <div>
          <SectionLabel className="mb-2">About</SectionLabel>
          <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
            <ListRow
              icon={<Scroll size={18} />}
              title="Terms & Conditions"
              onClick={() => setSheet("info-terms")}
            />
            <ListRow
              icon={<Shield size={18} />}
              title="Privacy Policy"
              onClick={() => setSheet("info-privacy")}
            />
            <ListRow
              icon={<Scroll size={18} />}
              title="Partner Agreement"
              onClick={() => setSheet("info-agreement")}
            />
            <ListRow
              icon={<Info size={18} />}
              title="App info"
              subtitle="v1.4.0 (build 342)"
              onClick={() => setSheet("info-app")}
            />
          </Card>
        </div>

        {/* Account */}
        <div>
          <SectionLabel className="mb-2">Account</SectionLabel>
          <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
            <ListRow
              icon={<LogOut size={18} />}
              title="Sign out"
              onClick={() => setSheet("signout")}
            />
            <ListRow
              icon={<Trash2 size={18} />}
              title={<span className="text-error">Delete account</span>}
              tone="danger"
              onClick={() => setSheet("delete")}
            />
          </Card>
        </div>
      </div>

      {/* Choice sheets */}
      <ChoiceSheet
        open={sheet === "language"}
        title="Language"
        subtitle="Choose your preferred language"
        options={[
          { value: "en", label: "English" },
          { value: "hi", label: "हिन्दी (Hindi)" },
          { value: "kn", label: "ಕನ್ನಡ (Kannada)" },
        ]}
        value={language}
        onSelect={(v) => {
          setLanguage(v as Language);
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
      {/* Confirm sheets */}
      <ConfirmSheet
        open={sheet === "signout"}
        title="Sign out?"
        body="You'll need to log in again with your phone number."
        confirmLabel="Sign out"
        onConfirm={signOut}
        onClose={() => setSheet(null)}
      />
      <ConfirmSheet
        open={sheet === "delete"}
        title="Delete account?"
        body="This will permanently remove your profile, cases, and payouts. This cannot be undone."
        confirmLabel="Delete account"
        destructive
        onConfirm={() => setSheet(null)}
        onClose={() => setSheet(null)}
      />

      {/* Info sheets */}
      <InfoSheet
        open={sheet === "info-terms"}
        title="Terms & Conditions"
        subtitle="Last updated Aug 2025"
        onClose={() => setSheet(null)}
      >
        <p>
          By using the Lawyered Partner app you agree to abide by our operating
          policies for on-spot legal representation and RTO services in India.
        </p>
        <p>
          Case assignments are non-transferable. Any misrepresentation of
          credentials will result in immediate deactivation of your partner
          account.
        </p>
      </InfoSheet>
      <InfoSheet
        open={sheet === "info-privacy"}
        title="Privacy Policy"
        subtitle="How we handle your data"
        onClose={() => setSheet(null)}
      >
        <p>
          We collect the minimum data needed to route cases to you: your
          service area, availability, and case history. Location is only used
          while you are Online.
        </p>
        <p>
          Documents uploaded during KYC are encrypted at rest and shared only
          with Bar Council verification workflows.
        </p>
      </InfoSheet>
      <InfoSheet
        open={sheet === "info-agreement"}
        title="Partner Agreement"
        subtitle="Your contract with Lawyered"
        onClose={() => setSheet(null)}
      >
        <p>
          You are an independent legal service provider on the Lawyered
          platform. Payouts settle weekly after platform fees and applicable
          TDS.
        </p>
        <p>
          You may go offline at any time; assignments already accepted must be
          completed or explicitly cancelled through the app.
        </p>
      </InfoSheet>
      <InfoSheet
        open={sheet === "info-app"}
        title="App info"
        onClose={() => setSheet(null)}
      >
        <div className="space-y-2 t-body">
          <InfoRow label="Version" value="1.4.0" />
          <InfoRow label="Build" value="342" />
          <InfoRow label="Release channel" value="Production" />
          <InfoRow label="Device ID" value="LWY-A1F3-90B7" mono />
        </div>
      </InfoSheet>
    </PhoneFrame>
  );
}

/* --- Reusable atoms --- */

function Switch({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
        on ? "bg-success" : "bg-neutral-300"
      }`}
    >
      <span
        className={`inline-block w-5 h-5 rounded-full bg-white shadow-e1 transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function Sheet({
  open,
  onClose,
  children,
  maxHeight = "80%",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: string;
}) {
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
        style={{ maxHeight }}
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-transform duration-300 ease-out flex flex-col ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>
        {children}
      </div>
    </div>
  );
}

function SheetHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <div className="px-4 pt-2 pb-2 flex items-start justify-between gap-3 shrink-0">
      <div className="min-w-0">
        <div className="t-h3 font-bold text-neutral-800 truncate">{title}</div>
        {subtitle && (
          <div className="t-caption text-neutral-500 mt-0.5">{subtitle}</div>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="w-9 h-9 -mr-1 shrink-0 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-500"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function ChoiceSheet({
  open,
  title,
  subtitle,
  options,
  value,
  onSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  options: { value: string; label: string }[];
  value: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose}>
      <SheetHeader title={title} subtitle={subtitle} onClose={onClose} />
      <div className="px-4 pb-4">
        <div className="space-y-1">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onSelect(o.value)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-colors ${
                o.value === value
                  ? "border-primary-500 bg-primary-50/40"
                  : "border-transparent hover:bg-neutral-50"
              }`}
            >
              <span className="flex-1 t-body font-medium text-neutral-800">
                {o.label}
              </span>
              {o.value === value && (
                <Check size={18} className="text-primary-600 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}

function ConfirmSheet({
  open,
  title,
  body,
  confirmLabel,
  destructive,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="px-4 pt-3 pb-2">
        <div className="t-h3 font-bold text-neutral-800">{title}</div>
        <div className="t-body-sm text-neutral-500 mt-2 leading-relaxed">
          {body}
        </div>
      </div>
      <div className="px-4 pt-3 pb-5 space-y-2">
        <Button
          variant={destructive ? "destructive" : "primary"}
          size="lg"
          fullWidth
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
        <Button variant="ghost" size="lg" fullWidth onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Sheet>
  );
}

function InfoSheet({
  open,
  title,
  subtitle,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose}>
      <SheetHeader title={title} subtitle={subtitle} onClose={onClose} />
      <div className="px-4 py-3 overflow-y-auto no-scrollbar t-body text-neutral-700 leading-relaxed space-y-3">
        {children}
      </div>
      <div className="px-4 pt-2 pb-5 border-t border-[var(--border-subtle)]">
        <Button variant="ghost" size="lg" fullWidth onClick={onClose}>
          Close
        </Button>
      </div>
    </Sheet>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500">{label}</span>
      <span
        className={`font-semibold text-neutral-800 ${mono ? "font-mono t-body-sm" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
