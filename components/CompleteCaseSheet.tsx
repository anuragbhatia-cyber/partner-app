"use client";

import { Button } from "@/components/ui";
import {
  CheckCircle2,
  Paperclip,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

export function CompleteCaseSheet({
  open,
  onClose,
  caseId,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  caseId?: string;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const [receipt, setReceipt] = useState<File | null>(null);
  const [professionalFees, setProfessionalFees] = useState("");
  const [governmentFees, setGovernmentFees] = useState("");
  const [miscCharges, setMiscCharges] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit =
    receipt !== null &&
    isValidAmount(professionalFees) &&
    isValidAmount(governmentFees) &&
    !submitted;

  const resetForm = () => {
    setReceipt(null);
    setProfessionalFees("");
    setGovernmentFees("");
    setMiscCharges("");
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setTimeout(() => {
      if (onSubmitted) {
        onSubmitted();
        setSubmitted(false);
        resetForm();
      } else {
        router.push("/home");
      }
    }, 1400);
  };

  const handleClose = () => {
    if (submitted) return;
    onClose();
    setTimeout(resetForm, 250);
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
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-[translate] duration-300 ease-out flex flex-col max-h-[90%] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        {submitted ? (
          <div className="px-6 pt-6 pb-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-success-subtle flex items-center justify-center mb-3">
              <CheckCircle2 size={30} className="text-success-bold" />
            </div>
            <div className="t-h3 font-bold text-neutral-800">
              Submitted for verification
            </div>
            <div className="t-body-sm text-neutral-500 mt-1 max-w-[280px]">
              We&apos;ll notify you once the team confirms the uploads.
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 pt-2 pb-2 flex items-start justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <div className="t-h3 font-bold text-neutral-800">
                  Complete case
                </div>
                {caseId && (
                  <div className="t-caption text-neutral-500 mt-0.5 truncate">
                    {caseId}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-9 h-9 -mr-1 shrink-0 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-500"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 py-3 space-y-3 overflow-y-auto">
              <ReceiptField
                label="Payment Receipt"
                required
                helper="Challan payment / transaction receipt"
                file={receipt}
                onFile={setReceipt}
              />
              <AmountField
                label="Professional Fees"
                required
                value={professionalFees}
                onChange={setProfessionalFees}
              />
              <AmountField
                label="Government Fees"
                required
                value={governmentFees}
                onChange={setGovernmentFees}
              />
              <AmountField
                label="Miscellaneous Charges"
                value={miscCharges}
                onChange={setMiscCharges}
              />
            </div>

            <div className="px-4 pt-3 pb-5 space-y-2 border-t border-[var(--border-subtle)] shrink-0">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                Submit for verification
              </Button>
              <Button variant="ghost" fullWidth onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function isValidAmount(v: string) {
  const t = v.trim();
  if (!t) return false;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0;
}

function AmountField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label className="t-caption font-semibold text-neutral-700 mb-1 block">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <div className="flex items-center rounded-xl border border-[var(--border-default)] bg-white overflow-hidden focus-within:border-primary-500 transition-colors">
        <span className="pl-3 pr-1 t-body text-neutral-500 shrink-0">₹</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/[^\d.]/g, "");
            const parts = cleaned.split(".");
            const normalized =
              parts.length > 1
                ? `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`
                : cleaned;
            onChange(normalized);
          }}
          className="flex-1 min-w-0 px-2 py-3 t-body text-neutral-800 placeholder:text-neutral-400 focus:outline-none bg-transparent tabular"
        />
      </div>
    </div>
  );
}

function ReceiptField({
  label,
  helper,
  file,
  onFile,
  required,
}: {
  label: string;
  helper?: string;
  file: File | null;
  onFile: (f: File | null) => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0];
    if (next) onFile(next);
    e.target.value = "";
  };

  const openPicker = () => inputRef.current?.click();
  const clear = () => onFile(null);

  return (
    <div className="min-w-0">
      <label className="t-caption font-semibold text-neutral-700 mb-1 block">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <div
        className={`flex items-center rounded-xl border bg-white overflow-hidden transition-colors ${
          file
            ? "border-success"
            : "border-[var(--border-default)] focus-within:border-primary-500"
        }`}
      >
        <span className="pl-3 pr-1 text-neutral-500 shrink-0 flex items-center">
          <Paperclip size={16} />
        </span>
        <button
          type="button"
          onClick={openPicker}
          className="flex-1 min-w-0 px-2 py-3 t-body text-left focus:outline-none bg-transparent truncate"
        >
          {file ? (
            <span className="text-neutral-800">{file.name}</span>
          ) : (
            <span className="text-neutral-400">Choose file (image or PDF)</span>
          )}
        </button>
        {file ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Remove file"
            className="shrink-0 h-full px-3 py-3 t-caption font-semibold text-neutral-500 hover:text-error transition-colors"
          >
            <X size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={openPicker}
            className="shrink-0 h-full px-3 py-3 inline-flex items-center gap-1.5 t-caption font-semibold text-primary-700 hover:bg-primary-50 transition-colors"
          >
            <Upload size={14} />
            Upload
          </button>
        )}
      </div>
      {helper && (
        <p className="mt-1 t-caption text-neutral-500">{helper}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
