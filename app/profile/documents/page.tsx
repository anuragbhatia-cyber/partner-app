"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card, SectionLabel } from "@/components/ui";
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

type BarState =
  | { kind: "expiring"; expiresAt: string }
  | { kind: "renewed"; filename: string; renewedOn: string; expiresAt: string };

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export default function DocumentsPage() {
  const [bar, setBar] = useState<BarState>({
    kind: "expiring",
    expiresAt: "Oct 31, 2026",
  });
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleRenewed = (filename: string) => {
    setBar({
      kind: "renewed",
      filename,
      renewedOn: "Aug 24, 2026",
      expiresAt: "Aug 24, 2029",
    });
    setUploadOpen(false);
  };

  return (
    <PhoneFrame label="Profile · Documents">
      <AppBar back href="/profile" title="Documents" />

      <div className="px-4 py-4 pb-24 space-y-4">
        <div>
          <SectionLabel className="mb-2">Identity</SectionLabel>
          <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
            <DocRow name="Aadhaar" note="Uploaded Aug 1, 2026" status="verified" />
            <DocRow name="PAN" note="Uploaded Aug 1, 2026" status="verified" />
            <DocRow name="Selfie" note="Verified" status="verified" />
          </Card>
        </div>

        <div>
          <SectionLabel className="mb-2">Professional</SectionLabel>
          <Card padding="none">
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                {bar.kind === "expiring" ? (
                  <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 size={20} className="text-success-bold shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="t-body-lg font-semibold text-neutral-800">
                    Bar Council ID
                  </div>
                  {bar.kind === "expiring" ? (
                    <div className="t-caption text-warning-bold mt-0.5">
                      Expires in 28 days · {bar.expiresAt}
                    </div>
                  ) : (
                    <div className="t-caption text-neutral-500 mt-0.5">
                      Renewed {bar.renewedOn} · Valid till {bar.expiresAt}
                      <div className="truncate text-neutral-400 mt-0.5">
                        {bar.filename}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant={bar.kind === "expiring" ? "primary" : "secondary"}
                size="md"
                fullWidth
                leftIcon={<Upload size={16} />}
                onClick={() => setUploadOpen(true)}
              >
                {bar.kind === "expiring"
                  ? "Upload renewed document"
                  : "Replace document"}
              </Button>
            </div>
          </Card>
        </div>

        <div>
          <SectionLabel className="mb-2">Additional</SectionLabel>
          <Card padding="none">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-500 shrink-0">
                <Upload size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="t-body font-medium text-neutral-800">
                  Practice certificate
                </div>
                <div className="t-caption text-neutral-500 mt-0.5">
                  Optional · Not uploaded
                </div>
              </div>
              <ChevronRight size={16} className="text-neutral-300" />
            </div>
          </Card>
        </div>
      </div>

      <RenewSheet
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={handleRenewed}
      />
    </PhoneFrame>
  );
}

function DocRow({
  name,
  note,
}: {
  name: string;
  note: string;
  status: "verified" | "pending" | "rejected";
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-9 h-9 rounded-lg bg-success-subtle flex items-center justify-center text-success-bold shrink-0">
        <CheckCircle2 size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="t-body font-medium text-neutral-800">{name}</div>
        <div className="t-caption text-neutral-500 mt-0.5">{note}</div>
      </div>
      <button className="t-caption font-semibold text-primary-600 shrink-0">
        View
      </button>
    </div>
  );
}

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; filename: string }
  | { kind: "error"; filename: string; message: string };

function RenewSheet({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: (filename: string) => void;
}) {
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
    source: "camera" | "gallery" | "pdf",
    input: HTMLInputElement,
    shiftKey: boolean
  ) => {
    const file = input.files?.[0];
    if (!file) return;

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

    setState({ kind: "uploading", filename: file.name });
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

  const trigger =
    (kind: "camera" | "gallery" | "pdf") => (e: React.MouseEvent) => {
      const shift = e.shiftKey;
      const el =
        kind === "camera"
          ? cameraRef.current
          : kind === "gallery"
            ? galleryRef.current
            : pdfRef.current;
      if (!el) return;
      el.dataset.shift = shift ? "1" : "";
      el.click();
    };

  const onChange =
    (kind: "camera" | "gallery" | "pdf") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
            <div className="t-h3 font-bold text-neutral-800">
              Renew Bar Council ID
            </div>
            <div className="t-caption text-neutral-500 mt-0.5">
              Upload the current copy from your Bar Council portal.
            </div>
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
            <AlertCircle
              size={16}
              className="text-error-bold mt-0.5 shrink-0"
            />
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

function validateType(
  source: "camera" | "gallery" | "pdf",
  file: File
): string | null {
  if (source === "pdf") {
    if (
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")
    )
      return null;
    return "Please pick a PDF file.";
  }
  if (file.type.startsWith("image/")) return null;
  return "Please pick an image file (JPG or PNG).";
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
