"use client";

import Link from "next/link";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Button, Card, Chip, ListRow, SectionLabel } from "@/components/ui";
import {
  User,
  Scale,
  FileText,
  Landmark,
  Globe,
  MessageCircle,
  Sliders,
  Star,
  MapPin,
  Camera,
  Image as ImageIcon,
  Trash2,
  X,
  Pencil,
  BookOpen,
  Check,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getStatus, setStatus } from "@/lib/partner-status";

type DayCode = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const DAYS: { code: DayCode; label: string; short: string }[] = [
  { code: "mon", label: "Monday", short: "Mon" },
  { code: "tue", label: "Tuesday", short: "Tue" },
  { code: "wed", label: "Wednesday", short: "Wed" },
  { code: "thu", label: "Thursday", short: "Thu" },
  { code: "fri", label: "Friday", short: "Fri" },
  { code: "sat", label: "Saturday", short: "Sat" },
  { code: "sun", label: "Sunday", short: "Sun" },
];

const WEEKDAYS: DayCode[] = ["mon", "tue", "wed", "thu", "fri"];

function formatDays(codes: DayCode[]): string {
  const set = new Set(codes);
  if (set.size === 0) return "No days";
  if (set.size === 7) return "All week";
  const wd = WEEKDAYS.every((d) => set.has(d));
  if (wd && !set.has("sat") && !set.has("sun")) return "Mon–Fri";
  if (wd && set.has("sat") && !set.has("sun")) return "Mon–Sat";
  return DAYS.filter((d) => set.has(d.code))
    .map((d) => d.short)
    .join(", ");
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);

function fmtHour(h: number) {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function fmtShortHour(h: number) {
  if (h === 0 || h === 24) return "12";
  return h <= 12 ? `${h}` : `${h - 12}`;
}

export default function ProfileHomePage() {
  const [online, setOnline] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    setOnline(getStatus() === "online");
  }, []);

  const toggleOnline = () => {
    const next = !online;
    setOnline(next);
    setStatus(next ? "online" : "offline");
  };
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);
  const [hoursSheetOpen, setHoursSheetOpen] = useState(false);
  const [days, setDays] = useState<DayCode[]>(WEEKDAYS);
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(20);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUrl(URL.createObjectURL(file));
    setAvatarSheetOpen(false);
    e.target.value = "";
  };

  const openFilePicker = (capture: boolean) => {
    if (!fileInputRef.current) return;
    if (capture) {
      fileInputRef.current.setAttribute("capture", "user");
    } else {
      fileInputRef.current.removeAttribute("capture");
    }
    fileInputRef.current.click();
  };

  const removeAvatar = () => {
    setAvatarUrl(null);
    setAvatarSheetOpen(false);
  };

  return (
    <PhoneFrame label="Profile · Home">
      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Profile header */}
        <Card padding="lg" className="text-center">
          <button
            type="button"
            onClick={() => setAvatarSheetOpen(true)}
            aria-label="Change profile photo"
            className="relative w-20 h-20 mx-auto rounded-full block mb-3 group"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center text-primary-700 t-h1 font-bold ring-2 ring-transparent group-hover:ring-primary-200 transition-all">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Profile photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>PS</span>
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-e1 ring-2 ring-white">
              <Pencil size={13} />
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onPickFile}
            className="hidden"
          />
          <h2 className="t-h2 font-bold text-neutral-800">
            Advocate Priya Sharma
          </h2>
          <div className="t-body-sm text-neutral-500 mt-1 flex items-center justify-center gap-2">
            <span>Lawyer</span>
            <span className="text-neutral-300">·</span>
            <span>Bengaluru</span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3 t-body-sm">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-accent-500 fill-accent-500" />
              <span className="font-semibold text-neutral-800">4.8</span>
            </div>
            <span className="text-neutral-300">·</span>
            <span className="text-neutral-500">34 cases</span>
          </div>
        </Card>

        {/* Availability */}
        <div>
          <SectionLabel className="mb-2">Availability</SectionLabel>
          <Card padding="lg">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    online ? "bg-success" : "bg-neutral-300"
                  }`}
                />
                <span className="t-body-lg font-semibold text-neutral-800">
                  {online ? "Online" : "Offline"}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={online}
                aria-label={online ? "Go offline" : "Go online"}
                onClick={toggleOnline}
                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                  online ? "bg-success" : "bg-neutral-300"
                }`}
              >
                <span
                  className={`inline-block w-5 h-5 rounded-full bg-white shadow-e1 transition-transform ${
                    online ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="t-body-sm text-neutral-500">
              {online ? "Ready for cases" : "Not receiving new cases"}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setHoursSheetOpen(true)}
                className="text-left rounded-lg -mx-1 px-1 py-0.5 hover:bg-neutral-50 transition-colors"
              >
                <div className="t-caption uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1">
                  Hours
                  <Pencil size={10} className="text-neutral-400" />
                </div>
                <div className="t-body-sm font-semibold text-neutral-800 mt-1">
                  {formatDays(days)} · {fmtShortHour(startHour)}–{fmtShortHour(endHour)}
                </div>
              </button>
              <div>
                <div className="t-caption uppercase tracking-wider text-neutral-500 font-semibold">
                  Area
                </div>
                <div className="t-body-sm font-semibold text-neutral-800 mt-1 flex items-center gap-1">
                  <MapPin size={12} />
                  15 km
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Account */}
        <div>
          <SectionLabel className="mb-2">Account</SectionLabel>
          <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
            <ListRow
              icon={<User size={18} />}
              title="Personal info"
              href="/profile/personal-info"
            />
            <ListRow
              icon={<Scale size={18} />}
              title="Professional"
              href="/profile/professional"
            />
            <ListRow
              icon={<FileText size={18} />}
              title="Documents"
              subtitle="1 expiring soon"
              right={<Chip tone="neutral" size="sm">1</Chip>}
              href="/profile/documents"
              showChevron={false}
            />
            <ListRow
              icon={<Landmark size={18} />}
              title="Bank account"
              href="/profile/bank"
            />
            <ListRow
              icon={<Globe size={18} />}
              title="Languages"
              href="/profile/languages"
            />
          </Card>
        </div>

        {/* Help & Settings */}
        <div>
          <SectionLabel className="mb-2">Help &amp; Settings</SectionLabel>
          <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
            <ListRow
              icon={<BookOpen size={18} />}
              title="SOP & Knowledge base"
              href="/knowledge"
            />
            <ListRow
              icon={<MessageCircle size={18} />}
              title="Support"
              href="/profile/support"
            />
            <ListRow
              icon={<Sliders size={18} />}
              title="App settings"
              href="/profile/settings"
            />
          </Card>
        </div>

        <div className="text-center t-caption text-neutral-400 pt-2">
          App version 1.4.0
        </div>
      </div>

      <BottomTabBar active="profile" />

      <AvatarSheet
        open={avatarSheetOpen}
        hasAvatar={avatarUrl !== null}
        onTakePhoto={() => openFilePicker(true)}
        onPickFromGallery={() => openFilePicker(false)}
        onRemove={removeAvatar}
        onClose={() => setAvatarSheetOpen(false)}
      />

      <HoursSheet
        open={hoursSheetOpen}
        days={days}
        startHour={startHour}
        endHour={endHour}
        onSave={(d, s, e) => {
          setDays(d);
          setStartHour(s);
          setEndHour(e);
          setHoursSheetOpen(false);
        }}
        onClose={() => setHoursSheetOpen(false)}
      />
    </PhoneFrame>
  );
}

function HoursSheet({
  open,
  days,
  startHour,
  endHour,
  onSave,
  onClose,
}: {
  open: boolean;
  days: DayCode[];
  startHour: number;
  endHour: number;
  onSave: (days: DayCode[], startHour: number, endHour: number) => void;
  onClose: () => void;
}) {
  const [draftDays, setDraftDays] = useState<DayCode[]>(days);
  const [draftStart, setDraftStart] = useState(startHour);
  const [draftEnd, setDraftEnd] = useState(endHour);

  const openRef = useRef(open);
  if (open && !openRef.current) {
    setDraftDays(days);
    setDraftStart(startHour);
    setDraftEnd(endHour);
  }
  openRef.current = open;

  const toggleDay = (code: DayCode) =>
    setDraftDays((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  const setPreset = (preset: "weekdays" | "weekend" | "all") => {
    if (preset === "weekdays") setDraftDays(WEEKDAYS);
    else if (preset === "weekend") setDraftDays(["sat", "sun"]);
    else setDraftDays(DAYS.map((d) => d.code));
  };

  const canSave = draftEnd > draftStart && draftDays.length > 0;

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
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-[translate] duration-300 ease-out flex flex-col ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        <div className="px-4 pt-2 pb-3 flex items-center justify-between gap-3 shrink-0">
          <div className="t-h3 font-bold text-neutral-800">Working hours</div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 -mr-1 shrink-0 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-500"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pb-3 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="t-caption font-semibold uppercase tracking-wider text-neutral-500">
                Days
              </div>
              <div className="flex items-center gap-1">
                <PresetChip label="Mon–Fri" onClick={() => setPreset("weekdays")} />
                <PresetChip label="Weekend" onClick={() => setPreset("weekend")} />
                <PresetChip label="All" onClick={() => setPreset("all")} />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((d) => {
                const active = draftDays.includes(d.code);
                return (
                  <button
                    key={d.code}
                    type="button"
                    onClick={() => toggleDay(d.code)}
                    aria-pressed={active}
                    className={`h-11 rounded-lg border t-body-sm font-semibold inline-flex items-center justify-center transition-colors ${
                      active
                        ? "border-primary-500 bg-primary-600 text-white"
                        : "border-[var(--border-default)] bg-white text-neutral-700 hover:border-primary-300"
                    }`}
                  >
                    {d.short.slice(0, 1)}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 t-caption text-neutral-500 tabular">
              {formatDays(draftDays)}
            </p>
          </div>

          <div>
            <div className="t-caption font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              Hours
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="t-caption text-neutral-500 mb-1">Start</div>
                <select
                  value={draftStart}
                  onChange={(e) => setDraftStart(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-lg border border-[var(--border-default)] bg-white t-body font-medium text-neutral-800 focus:outline-none focus:border-primary-500"
                >
                  {HOUR_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {fmtHour(h)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <div className="t-caption text-neutral-500 mb-1">End</div>
                <select
                  value={draftEnd}
                  onChange={(e) => setDraftEnd(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-lg border border-[var(--border-default)] bg-white t-body font-medium text-neutral-800 focus:outline-none focus:border-primary-500"
                >
                  {HOUR_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {fmtHour(h)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {!canSave && (
              <div className="t-caption text-error mt-2">
                End time must be after start time
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pt-3 pb-5 border-t border-[var(--border-subtle)] shrink-0">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canSave}
            onClick={() => onSave(draftDays, draftStart, draftEnd)}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

function PresetChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-6 px-2 rounded-full border border-[var(--border-default)] bg-white text-neutral-700 t-caption font-semibold hover:border-primary-300 hover:bg-primary-50/40 transition-colors"
    >
      {label}
    </button>
  );
}

function AvatarSheet({
  open,
  hasAvatar,
  onTakePhoto,
  onPickFromGallery,
  onRemove,
  onClose,
}: {
  open: boolean;
  hasAvatar: boolean;
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
  onRemove: () => void;
  onClose: () => void;
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
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex justify-center">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        <div className="px-4 pt-2 pb-2 flex items-start justify-between gap-3">
          <div>
            <div className="t-h3 font-bold text-neutral-800">
              Profile photo
            </div>
            <div className="t-caption text-neutral-500 mt-0.5">
              PNG or JPG · up to 5 MB
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

        <div className="px-4 py-3 space-y-2">
          <SheetAction
            icon={<Camera size={18} />}
            title="Take a photo"
            subtitle="Use your camera"
            onClick={onTakePhoto}
          />
          <SheetAction
            icon={<ImageIcon size={18} />}
            title="Choose from gallery"
            subtitle="Pick an existing image"
            onClick={onPickFromGallery}
          />
          {hasAvatar && (
            <SheetAction
              icon={<Trash2 size={18} />}
              title="Remove photo"
              subtitle="Go back to initials"
              destructive
              onClick={onRemove}
            />
          )}
        </div>

        <div className="px-4 pt-1 pb-5">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function SheetAction({
  icon,
  title,
  subtitle,
  destructive,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-[var(--border-subtle)] hover:border-primary-300 hover:bg-primary-50/40 transition-colors text-left"
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          destructive
            ? "bg-error-subtle text-error-bold"
            : "bg-primary-50 text-primary-700"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`t-body font-semibold ${
            destructive ? "text-error-bold" : "text-neutral-800"
          }`}
        >
          {title}
        </div>
        <div className="t-caption text-neutral-500 mt-0.5">{subtitle}</div>
      </div>
    </button>
  );
}
