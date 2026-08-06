"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card, Chip, SectionLabel } from "@/components/ui";
import { AlertTriangle, CheckCircle2, ChevronRight, Upload } from "lucide-react";

export default function DocumentsPage() {
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
            <div className="p-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="t-body-lg font-semibold text-neutral-800">
                    Bar Council ID
                  </div>
                  <div className="t-caption text-warning-bold mt-0.5">
                    Expires in 28 days · Oct 31, 2026
                  </div>
                </div>
              </div>
              <Button
                variant="primary"
                size="md"
                fullWidth
                leftIcon={<Upload size={16} />}
              >
                Upload renewed document
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
    </PhoneFrame>
  );
}

function DocRow({
  name,
  note,
  status,
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
