"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card } from "@/components/ui";
import {
  ChevronRight,
  Sparkles,
  Camera,
  Image as ImageIcon,
  X,
  Upload,
  ArrowUp,
  Check,
} from "lucide-react";
import { useState } from "react";
import { OnboardingStepBar } from "@/app/onboarding/steps";

type DocKey = "aadhaar" | "pan" | "bar" | "selfie";

type Doc = {
  key: DocKey;
  title: string;
  note?: string;
  done: boolean;
};

export default function DocumentsHubPage() {
  const [docs, setDocs] = useState<Doc[]>([
    { key: "aadhaar", title: "Aadhaar Card", note: "Front + Back", done: true },
    { key: "pan", title: "PAN Card", done: true },
    { key: "bar", title: "Bar Council ID", done: false },
    { key: "selfie", title: "Selfie", done: false },
  ]);
  const [active, setActive] = useState<DocKey | null>(null);

  const activeDoc = docs.find((d) => d.key === active) ?? null;
  const uploadedCount = docs.filter((d) => d.done).length;

  const markUploaded = () => {
    if (!active) return;
    setDocs((prev) =>
      prev.map((d) => (d.key === active ? { ...d, done: true } : d))
    );
    setActive(null);
  };

  return (
    <PhoneFrame label="Onboarding · Documents">
      <AppBar back href="/onboarding/personal" title="Documents" />

      <div className="px-4 pt-4 pb-32">
        <OnboardingStepBar current={3} label="Documents" />

        <h1 className="t-h1 font-bold text-neutral-800 tracking-tight mt-6">
          Upload Documents
        </h1>
        <p className="t-body text-neutral-500 mt-2">
          {uploadedCount} of {docs.length} uploaded
        </p>

        <div className="space-y-2 mt-6">
          {docs.map((d) => (
            <DocCard
              key={d.key}
              title={d.title}
              note={d.note}
              done={d.done}
              onClick={() => setActive(d.key)}
            />
          ))}
        </div>

        <Card className="mt-5 bg-[#FEF3C7]! border-transparent! shadow-none! flex items-start gap-2.5">
          <Sparkles size={16} className="text-[#B45309] shrink-0 mt-0.5" />
          <div className="t-body font-medium text-[#B45309] leading-relaxed">
            Tip: Ensure good lighting and all corners are visible
          </div>
        </Card>

        <div className="space-y-3 mt-5">
          <ConsentRow label="I have read and accept the Partner Agreement" />
          <ConsentRow label="I consent to KYC verification" />
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          href="/onboarding/kyc-status"
        >
          Continue →
        </Button>
      </div>

      <UploadSheet
        doc={activeDoc}
        onClose={() => setActive(null)}
        onUpload={markUploaded}
      />
    </PhoneFrame>
  );
}

function DocCard({
  title,
  note,
  done,
  onClick,
}: {
  title: string;
  note?: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left"
    >
      <Card padding="md" className="hover:border-primary-300 transition-colors">
        <div className="flex items-center gap-3">
          {done ? (
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <rect width="40" height="40" rx="20" fill="#ECFDF5" />
              <path
                d="M25.9993 15.5L17.7501 23.7494L14.0005 19.9997"
                stroke="#059669"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] shrink-0">
              <ArrowUp size={18} strokeWidth={2.5} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="t-body-lg font-semibold text-neutral-800">
              {title}
            </div>
            {note && (
              <div className="t-caption text-neutral-500 mt-0.5">{note}</div>
            )}
            {!done && (
              <div className="t-caption text-error font-medium mt-0.5">
                Required
              </div>
            )}
          </div>
          <ChevronRight size={16} className="text-neutral-900 shrink-0" />
        </div>
      </Card>
    </button>
  );
}

function UploadSheet({
  doc,
  onClose,
  onUpload,
}: {
  doc: Doc | null;
  onClose: () => void;
  onUpload: () => void;
}) {
  const open = doc !== null;

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
          <div className="min-w-0">
            <div className="t-h3 font-bold text-neutral-800 truncate">
              {doc?.done ? "Replace" : "Upload"} {doc?.title ?? ""}
            </div>
            {doc?.note && (
              <div className="t-caption text-neutral-500 mt-0.5">
                {doc.note}
              </div>
            )}
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
          <UploadAction
            icon={<Camera size={18} />}
            title="Take a photo"
            subtitle="Use your camera"
            onClick={onUpload}
          />
          <UploadAction
            icon={<ImageIcon size={18} />}
            title="Choose from gallery"
            subtitle="Pick an existing image"
            onClick={onUpload}
          />
          <UploadAction
            icon={<Upload size={18} />}
            title="Upload PDF"
            subtitle="Up to 5 MB"
            onClick={onUpload}
          />
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

function ConsentRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-md bg-success flex items-center justify-center shrink-0">
        <Check size={12} className="text-white" strokeWidth={3} />
      </div>
      <span className="t-body text-neutral-800">{label}</span>
    </div>
  );
}

function UploadAction({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-[var(--border-subtle)] hover:border-primary-300 hover:bg-primary-50/40 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="t-body font-semibold text-neutral-800">{title}</div>
        <div className="t-caption text-neutral-500 mt-0.5">{subtitle}</div>
      </div>
      <ChevronRight size={16} className="text-neutral-300 shrink-0" />
    </button>
  );
}
