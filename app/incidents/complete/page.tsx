"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card, SectionLabel } from "@/components/ui";
import {
  CheckCircle2,
  AlertTriangle,
  Camera,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function CompleteCasePage() {
  const [outcome, setOutcome] = useState("resolved");
  return (
    <PhoneFrame label="Incident · Complete">
      <AppBar back href="/incidents/active" title="Complete Case" />

      <div className="px-4 py-4 pb-32 space-y-4">
        {/* Case ref */}
        <div className="text-center py-3">
          <div className="t-caption font-mono text-neutral-500">
            LWD-00842
          </div>
          <div className="t-h3 font-semibold text-neutral-800 mt-1">
            Traffic Challan Dispute
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
              className="w-full h-24 t-body text-neutral-800 placeholder:text-neutral-400 resize-none focus:outline-none"
              placeholder="Required (min 20 characters)..."
            />
          </Card>
        </div>

        {/* Completion evidence */}
        <div>
          <SectionLabel className="mb-2">Completion Evidence</SectionLabel>
          <Card>
            <button className="w-full aspect-[16/9] rounded-lg border-2 border-dashed border-[var(--border-default)] flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50/50 transition-colors">
              <Camera size={22} className="text-neutral-400" />
              <span className="t-body-sm text-neutral-500 font-medium">
                Add photo
              </span>
              <span className="t-caption text-neutral-400">
                e.g. signed doc, client receipt
              </span>
            </button>
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
          href="/home"
          rightIcon={<ChevronRight size={18} />}
        >
          Confirm &amp; Close
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
