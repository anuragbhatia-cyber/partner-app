"use client";

import Link from "next/link";
import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
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
} from "lucide-react";
import { useRef, useState } from "react";

export default function ProfileHomePage() {
  const [online, setOnline] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);
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
      <AppBar title="Profile" />

      <div className="px-4 py-4 pb-24 space-y-4">
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
                onClick={() => setOnline((v) => !v)}
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
              <div>
                <div className="t-caption uppercase tracking-wider text-neutral-500 font-semibold">
                  Hours
                </div>
                <div className="t-body-sm font-semibold text-neutral-800 mt-1">
                  Mon–Fri · 9–8
                </div>
              </div>
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
    </PhoneFrame>
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
