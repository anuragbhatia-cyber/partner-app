"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card, SectionLabel } from "@/components/ui";
import {
  CheckCircle2,
  AlertTriangle,
  Camera,
  ChevronRight,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

const NOTES_MIN = 20;
const NOTES_MAX = 500;
const PHOTO_MAX_MB = 5;
const PHOTO_MAX_BYTES = PHOTO_MAX_MB * 1024 * 1024;
const IRN = "IRN-100842";
const SERVICE = "Traffic Challan Dispute";
const PAYOUT = 850;

const OUTCOME_LABEL: Record<string, string> = {
  resolved: "Successfully resolved",
  partial: "Partially resolved",
  withdrew: "Client withdrew",
  "no-show": "Client no-show",
  escalated: "Escalated to ops",
};

export default function CompleteCasePage() {
  const [outcome, setOutcome] = useState("resolved");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<{ url: string; name: string } | null>(
    null
  );
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const notesLen = notes.trim().length;
  const notesOk = notesLen >= NOTES_MIN;
  const photoOk = photo !== null;
  const canConfirm = notesOk && photoOk;

  const handleConfirm = () => {
    if (!canConfirm || submitting) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 900);
  };

  const handlePhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please pick an image file.");
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setPhotoError(
        `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Max ${PHOTO_MAX_MB} MB.`
      );
      return;
    }
    setPhotoError(null);
    setPhoto({ url: URL.createObjectURL(file), name: file.name });
  };

  const handleRemovePhoto = () => {
    if (photo?.url) URL.revokeObjectURL(photo.url);
    setPhoto(null);
    setPhotoError(null);
  };

  if (done) {
    return (
      <PhoneFrame label="Incident · Closed">
        <div className="flex flex-col min-h-full">
          <div className="flex-1 px-6 pt-14 pb-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-success-subtle flex items-center justify-center mb-4">
              <CheckCircle2
                size={44}
                strokeWidth={2.5}
                className="text-success-bold"
              />
            </div>
            <h1 className="t-h1 font-bold text-neutral-800">Case closed</h1>
            <p className="t-body-sm text-neutral-500 mt-1 tabular font-mono">
              {IRN}
            </p>
            <p className="t-body text-neutral-700 mt-1">{SERVICE}</p>

            <Card padding="none" className="w-full mt-6 text-left">
              <div className="divide-y divide-[var(--border-subtle)]">
                <SummaryRow
                  label="Outcome"
                  value={OUTCOME_LABEL[outcome] ?? outcome}
                />
                <SummaryRow
                  label="Payout"
                  value={`₹${PAYOUT.toLocaleString("en-IN")}`}
                  highlight
                />
                <SummaryRow
                  label="Settles"
                  value="In 3 working days · to HDFC ****4521"
                />
                {notes && (
                  <div className="px-4 py-3">
                    <div className="t-caption font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                      Notes
                    </div>
                    <p className="t-body-sm text-neutral-700 leading-relaxed">
                      {notes.length > 160
                        ? `${notes.slice(0, 160).trim()}…`
                        : notes}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <div className="mt-5 rounded-xl bg-info-subtle border border-info/20 px-3 py-2.5 flex items-start gap-2 text-left">
              <CheckCircle2
                size={16}
                className="text-info-bold mt-0.5 shrink-0"
              />
              <p className="t-body-sm text-info-bold leading-snug">
                Our team will verify the uploads within 24 hours. You&apos;ll be
                notified once the payout is released.
              </p>
            </div>
          </div>

          <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4 space-y-2">
            <Button variant="primary" size="lg" fullWidth href="/home">
              Back to home
            </Button>
            <Button variant="ghost" size="lg" fullWidth href="/wallet">
              View wallet
            </Button>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame label="Incident · Complete">
      <AppBar back href="/incidents/active" title="Complete Case" />

      <div className="px-4 py-4 pb-32 space-y-4">
        {/* Case ref */}
        <div className="text-center py-3">
          <div className="t-caption font-mono text-neutral-500">{IRN}</div>
          <div className="t-h3 font-semibold text-neutral-800 mt-1">
            {SERVICE}
          </div>
        </div>

        {/* Final check */}
        <div>
          <SectionLabel className="mb-2">Final Check</SectionLabel>
          <Card padding="none">
            <div className="divide-y divide-[var(--border-subtle)]">
              <CheckItem
                label="Client identity verified"
                status="done"
              />
              <CheckItem
                label="Vehicle photo captured"
                status="done"
              />
              <CheckItem
                label="Client consent obtained"
                status="done"
              />
              <CheckItem
                label="Case notes empty"
                status="warning"
              />
              <CheckItem
                label="No completion photo"
                status="warning"
              />
            </div>
          </Card>
        </div>

        {/* Outcome */}
        <div>
          <SectionLabel className="mb-2">Outcome</SectionLabel>
          <Card padding="none">
            <div className="divide-y divide-[var(--border-subtle)]">
              {[
                { value: "resolved", label: "Successfully resolved" },
                { value: "partial", label: "Partially resolved" },
                { value: "withdrew", label: "Client withdrew" },
                { value: "no-show", label: "Client no-show" },
                { value: "escalated", label: "Escalated to ops" },
              ].map((o) => (
                <button
                  key={o.value}
                  onClick={() => setOutcome(o.value)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50/50 text-left"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      outcome === o.value
                        ? "border-primary-600"
                        : "border-neutral-300"
                    }`}
                  >
                    {outcome === o.value && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                    )}
                  </div>
                  <span className="t-body text-neutral-800 flex-1">
                    {o.label}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Final notes */}
        <div>
          <SectionLabel className="mb-2">Final Notes</SectionLabel>
          <Card>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, NOTES_MAX))}
              className={`w-full h-24 t-body text-neutral-800 placeholder:text-neutral-400 resize-none focus:outline-none ${
                notesLen > 0 && !notesOk ? "text-neutral-800" : ""
              }`}
              placeholder={`Required (at least ${NOTES_MIN} characters)…`}
              aria-invalid={notesLen > 0 && !notesOk ? true : undefined}
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)]">
              <span
                className={`t-caption font-medium ${
                  notesLen === 0
                    ? "text-neutral-400"
                    : notesOk
                      ? "text-success-bold"
                      : "text-warning-bold"
                }`}
              >
                {notesLen === 0
                  ? `Required · at least ${NOTES_MIN} characters`
                  : notesOk
                    ? "Looks good"
                    : `${NOTES_MIN - notesLen} more character${
                        NOTES_MIN - notesLen === 1 ? "" : "s"
                      } needed`}
              </span>
              <span
                className={`t-caption tabular ${
                  notesLen > NOTES_MAX - 40
                    ? "text-warning-bold"
                    : "text-neutral-400"
                }`}
              >
                {notesLen}/{NOTES_MAX}
              </span>
            </div>
          </Card>
        </div>

        {/* Completion evidence */}
        <div>
          <SectionLabel className="mb-2">
            Completion Evidence <span className="text-error">*</span>
          </SectionLabel>
          <Card>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoPick}
            />
            {photo ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt="Completion evidence"
                  className="w-full aspect-[16/9] object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  aria-label="Remove photo"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <X size={16} />
                </button>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="t-caption text-neutral-600 truncate">
                    {photo.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="t-caption font-semibold text-primary-600 shrink-0"
                  >
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                aria-invalid={photoError ? true : undefined}
                className={`w-full aspect-[16/9] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
                  photoError
                    ? "border-error bg-error-subtle/40"
                    : "border-[var(--border-default)] hover:border-primary-400 hover:bg-primary-50/50"
                }`}
              >
                <Camera size={22} className="text-neutral-400" />
                <span className="t-body-sm text-neutral-500 font-medium">
                  Add photo
                </span>
                <span className="t-caption text-neutral-400">
                  e.g. signed doc, client receipt
                </span>
              </button>
            )}
            {photoError && (
              <p
                role="alert"
                className="mt-2 t-caption text-error font-medium"
              >
                {photoError}
              </p>
            )}
          </Card>
        </div>

        {/* Client signature */}
        <div>
          <SectionLabel className="mb-2">Client Signature</SectionLabel>
          <Card>
            <div className="h-24 rounded-lg bg-neutral-25 border border-dashed border-[var(--border-default)] flex items-center justify-center">
              <span className="t-body-sm text-neutral-400">Sign here</span>
            </div>
            <div className="text-right mt-2">
              <button className="t-caption font-semibold text-neutral-500">
                Clear
              </button>
            </div>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canConfirm}
          loading={submitting}
          onClick={handleConfirm}
        >
          {submitting ? "Closing…" : "Confirm & Close"}
        </Button>
      </div>
    </PhoneFrame>
  );
}

function CheckItem({
  label,
  status,
}: {
  label: string;
  status: "done" | "warning";
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {status === "done" ? (
        <CheckCircle2 size={18} className="text-success shrink-0" />
      ) : (
        <AlertTriangle size={18} className="text-warning shrink-0" />
      )}
      <span
        className={`t-body flex-1 ${
          status === "warning" ? "text-warning-bold" : "text-neutral-800"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="t-caption font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      <span
        className={`t-body-lg font-semibold text-right ${
          highlight ? "text-accent-700" : "text-neutral-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
