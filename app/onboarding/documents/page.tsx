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
  AlertCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OnboardingStepBar } from "@/app/onboarding/steps";

type DocKey = "aadhaar" | "pan" | "bar" | "selfie";
type SourceKind = "camera" | "gallery" | "pdf";

type Doc = {
  key: DocKey;
  title: string;
  note?: string;
  done: boolean;
  filename?: string;
};

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export default function DocumentsHubPage() {
  const [docs, setDocs] = useState<Doc[]>([
    { key: "aadhaar", title: "Aadhaar Card", note: "Front + Back", done: true, filename: "aadhaar.pdf" },
    { key: "pan", title: "PAN Card", done: true, filename: "pan.jpg" },
    { key: "bar", title: "Bar Council ID", done: false },
    { key: "selfie", title: "Selfie", done: false },
  ]);
  const [active, setActive] = useState<DocKey | null>(null);
  const [agreementConsent, setAgreementConsent] = useState(false);
  const [kycConsent, setKycConsent] = useState(false);
  const [policySheet, setPolicySheet] = useState<PolicyKey | null>(null);

  const activeDoc = docs.find((d) => d.key === active) ?? null;
  const uploadedCount = docs.filter((d) => d.done).length;
  const allDocsUploaded = uploadedCount === docs.length;
  const canContinue = allDocsUploaded && agreementConsent && kycConsent;

  const handleUploaded = (filename: string) => {
    if (!active) return;
    setDocs((prev) =>
      prev.map((d) =>
        d.key === active ? { ...d, done: true, filename } : d
      )
    );
    setActive(null);
  };

  return (
    <PhoneFrame label="Onboarding · Documents">
      <AppBar back href="/onboarding/personal" title="Documents" />

      <div className="px-4 pt-4 pb-32">
        <OnboardingStepBar current={4} label="Documents" />

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
              filename={d.filename}
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
          <ConsentRow
            checked={agreementConsent}
            onChange={setAgreementConsent}
          >
            I have read and accept the{" "}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPolicySheet("agreement");
              }}
              className="font-semibold text-primary-600 underline"
            >
              Partner Agreement
            </button>
          </ConsentRow>
          <ConsentRow checked={kycConsent} onChange={setKycConsent}>
            I consent to{" "}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPolicySheet("kyc");
              }}
              className="font-semibold text-primary-600 underline"
            >
              KYC verification
            </button>{" "}
            of my documents
          </ConsentRow>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          href={canContinue ? "/onboarding/kyc-status" : undefined}
          disabled={!canContinue}
        >
          Continue
        </Button>
      </div>

      <UploadSheet
        doc={activeDoc}
        onClose={() => setActive(null)}
        onUploaded={handleUploaded}
      />

      <PolicySheet
        open={policySheet}
        onClose={() => setPolicySheet(null)}
      />
    </PhoneFrame>
  );
}

function DocCard({
  title,
  note,
  done,
  filename,
  onClick,
}: {
  title: string;
  note?: string;
  done: boolean;
  filename?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left">
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
            {done && filename ? (
              <div className="t-caption text-neutral-500 mt-0.5 truncate">
                {filename} · Tap to replace
              </div>
            ) : !done ? (
              <div className="t-caption text-error font-medium mt-0.5">
                Required
              </div>
            ) : null}
          </div>
          <ChevronRight size={16} className="text-neutral-900 shrink-0" />
        </div>
      </Card>
    </button>
  );
}

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; filename: string; sourceLabel: string }
  | { kind: "error"; filename: string; message: string };

function UploadSheet({
  doc,
  onClose,
  onUploaded,
}: {
  doc: Doc | null;
  onClose: () => void;
  onUploaded: (filename: string) => void;
}) {
  const open = doc !== null;
  const [state, setState] = useState<UploadState>({ kind: "idle" });
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    if (state.kind === "uploading") return;
    setState({ kind: "idle" });
    onClose();
  };

  const handleFile = (
    source: SourceKind,
    input: HTMLInputElement,
    shiftKey: boolean
  ) => {
    const file = input.files?.[0];
    if (!file) return;
    const sourceLabel =
      source === "camera"
        ? "Camera"
        : source === "gallery"
          ? "Gallery"
          : "PDF";

    const typeError = validateType(source, file);
    if (typeError) {
      setState({ kind: "error", filename: file.name, message: typeError });
      input.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setState({
        kind: "error",
        filename: file.name,
        message: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Max ${MAX_MB} MB.`,
      });
      input.value = "";
      return;
    }

    setState({ kind: "uploading", filename: file.name, sourceLabel });
    input.value = "";

    window.setTimeout(() => {
      if (shiftKey) {
        setState({
          kind: "error",
          filename: file.name,
          message: "Upload failed. Check your connection and retry.",
        });
      } else {
        onUploaded(file.name);
        setState({ kind: "idle" });
      }
    }, 1200);
  };

  const trigger = (kind: SourceKind) => (e: React.MouseEvent) => {
    const shift = e.shiftKey;
    const el =
      kind === "camera" ? cameraRef.current
      : kind === "gallery" ? galleryRef.current
      : pdfRef.current;
    if (!el) return;
    // stash shift so the change handler can see it
    el.dataset.shift = shift ? "1" : "";
    el.click();
  };

  const onChange =
    (kind: SourceKind) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const shift = e.currentTarget.dataset.shift === "1";
      handleFile(kind, e.currentTarget, shift);
    };

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={handleClose}
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
            onClick={handleClose}
            disabled={state.kind === "uploading"}
            className="w-9 h-9 -mr-1 shrink-0 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-500 disabled:opacity-40"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {state.kind === "uploading" && (
          <div className="mx-4 mt-1 mb-3 rounded-xl border border-primary-200 bg-primary-50/60 px-3 py-3">
            <div className="flex items-center gap-3">
              <span className="inline-block w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <div className="min-w-0 flex-1">
                <p className="t-body-sm font-semibold text-neutral-800 truncate">
                  Uploading {state.filename}
                </p>
              </div>
            </div>
          </div>
        )}

        {state.kind === "error" && (
          <div
            role="alert"
            className="mx-4 mt-1 mb-3 rounded-xl border border-error/30 bg-error-subtle px-3 py-3 flex items-start gap-2.5"
          >
            <AlertCircle size={16} className="text-error-bold mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="t-body-sm font-semibold text-error-bold">
                Couldn&apos;t upload {state.filename}
              </p>
              <p className="t-caption text-neutral-700 mt-0.5">
                {state.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setState({ kind: "idle" })}
              className="t-body-sm font-semibold text-primary-600 shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {state.kind !== "uploading" && (
          <div className="px-4 py-3 space-y-2">
            <UploadAction
              icon={<Camera size={18} />}
              title="Take a photo"
              subtitle={`JPG or PNG · up to ${MAX_MB} MB`}
              onClick={trigger("camera")}
            />
            <UploadAction
              icon={<ImageIcon size={18} />}
              title="Choose from gallery"
              subtitle={`JPG or PNG · up to ${MAX_MB} MB`}
              onClick={trigger("gallery")}
            />
            <UploadAction
              icon={<Upload size={18} />}
              title="Upload PDF"
              subtitle={`Up to ${MAX_MB} MB`}
              onClick={trigger("pdf")}
            />
          </div>
        )}

        <div className="px-4 pt-1 pb-4">
          <Button
            variant="ghost"
            fullWidth
            onClick={handleClose}
            disabled={state.kind === "uploading"}
          >
            Cancel
          </Button>
        </div>

        {/* Hidden real file inputs */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={onChange("camera")}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange("gallery")}
        />
        <input
          ref={pdfRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onChange("pdf")}
        />
      </div>
    </div>
  );
}

function validateType(source: SourceKind, file: File): string | null {
  if (source === "pdf") {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) return null;
    return "Please pick a PDF file.";
  }
  if (file.type.startsWith("image/")) return null;
  return "Please pick an image file (JPG or PNG).";
}

function ConsentRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const toggle = () => onChange(!checked);
  return (
    <div className="w-full flex items-start gap-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={toggle}
        aria-label={checked ? "Uncheck consent" : "Check consent"}
        className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center shrink-0 transition-all ${
          checked
            ? "bg-primary-600 text-white"
            : "border-2 border-neutral-300 bg-white"
        }`}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </button>
      <span
        role="presentation"
        onClick={toggle}
        className="t-body text-neutral-800 leading-snug cursor-pointer"
      >
        {children}
      </span>
    </div>
  );
}

type PolicyKey = "agreement" | "kyc";

const POLICY_CONTENT: Record<
  PolicyKey,
  { title: string; updated: string; sections: { heading: string; body: string }[] }
> = {
  agreement: {
    title: "Partner Agreement",
    updated: "Updated 1 Jul 2026",
    sections: [
      {
        heading: "1. Your engagement",
        body: "You are engaged as an independent professional partner. This is not an employment relationship. You choose when to be available and which cases to accept.",
      },
      {
        heading: "2. Service standards",
        body: "You agree to respond within stated SLAs, follow the case SOPs from the Knowledge section, and maintain client confidentiality at all times.",
      },
      {
        heading: "3. Compensation",
        body: "You will be paid the case fee shown at assignment time, less platform fees and statutory deductions (TDS/GST). Payouts settle to your linked bank account per the payout schedule.",
      },
      {
        heading: "4. Conduct",
        body: "Repeated cancellations, no-shows, or verified complaints may lead to suspension. Impersonation, fraud, or breach of confidentiality will result in immediate removal.",
      },
      {
        heading: "5. Termination",
        body: "Either party may end the engagement at any time. Pending payouts for completed cases will settle in the normal cycle.",
      },
      {
        heading: "6. Full terms",
        body: "This is a short summary. The full Partner Agreement is available in Profile · Settings after onboarding.",
      },
    ],
  },
  kyc: {
    title: "KYC verification consent",
    updated: "Updated 1 Jul 2026",
    sections: [
      {
        heading: "What we verify",
        body: "We verify your identity, professional credentials (Bar Council or equivalent), and bank details against the documents you upload.",
      },
      {
        heading: "How we verify",
        body: "Your Aadhaar and PAN are validated against Government of India registries (UIDAI, NSDL) through certified KYC service providers. Your Bar Council ID is checked against publicly available registers.",
      },
      {
        heading: "What we share",
        body: "Only the minimum data required to complete verification is shared with the KYC provider. We do not sell or share this data with third parties.",
      },
      {
        heading: "How long we keep it",
        body: "Verified KYC records are retained for the duration of your engagement plus seven years, in line with Indian record-keeping requirements.",
      },
      {
        heading: "Your rights",
        body: "You can request access, correction, or deletion of your data any time by writing to privacy@lawyered.in. Deletion may be limited where retention is legally required.",
      },
    ],
  },
};

function PolicySheet({
  open,
  onClose,
}: {
  open: PolicyKey | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  const doc = POLICY_CONTENT[open];

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-sheet-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 animate-[fadeInBackdrop_180ms_ease-out]"
      />
      <div className="mt-auto relative bg-white rounded-t-3xl shadow-e3 max-h-[88%] flex flex-col animate-[sheetIn_260ms_cubic-bezier(0.2,0,0,1)]">
        <div className="pt-2 pb-1 flex justify-center">
          <span className="w-10 h-1.5 rounded-full bg-neutral-200" />
        </div>
        <div className="px-5 pt-2 pb-3 border-b border-[var(--border-subtle)] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              id="policy-sheet-title"
              className="t-h2 font-bold text-neutral-800 tracking-tight"
            >
              {doc.title}
            </h2>
            <p className="t-caption text-neutral-500 mt-0.5">{doc.updated}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h3 className="t-body-lg font-semibold text-neutral-800">
                {s.heading}
              </h3>
              <p className="t-body-sm text-neutral-600 mt-1 leading-relaxed">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes sheetIn {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
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
  onClick: (e: React.MouseEvent) => void;
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
