"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card, SectionLabel } from "@/components/ui";
import {
  CheckCircle2,
  FileText,
  Upload,
  X,
  Plus,
} from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";

const ALL_SPECIALTIES = [
  "Traffic",
  "Motor accidents",
  "Criminal",
  "Consumer",
  "Family",
  "Civil",
  "Property",
];

type BarDoc = { name: string; size: string };

export default function ProfileProfessionalPage() {
  const [barDoc, setBarDoc] = useState<BarDoc>({
    name: "bar-council-id.pdf",
    size: "982 KB",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [specialties, setSpecialties] = useState<string[]>([
    "Traffic",
    "Motor accidents",
    "Criminal",
  ]);

  const toggle = (s: string) =>
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0];
    if (next) {
      setBarDoc({
        name: next.name,
        size: formatSize(next.size),
      });
    }
    e.target.value = "";
  };

  return (
    <PhoneFrame label="Profile · Professional">
      <AppBar back href="/profile" title="Professional" />

      <div className="px-4 py-4 pb-32 space-y-4">
        <SectionLabel className="mb-2">Bar Council ID</SectionLabel>
        <Card padding="none">
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="t-body-sm font-semibold text-neutral-800 truncate">
                {barDoc.name}
              </div>
              <div className="t-caption text-neutral-500 mt-0.5 flex items-center gap-1.5">
                <CheckCircle2
                  size={12}
                  className="text-success-bold shrink-0"
                />
                <span>Verified · {barDoc.size}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 h-9 px-3 inline-flex items-center gap-1.5 rounded-lg t-caption font-semibold text-primary-700 hover:bg-primary-50 transition-colors"
            >
              <Upload size={14} />
              Replace
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFile}
          />
        </Card>

        <SectionLabel className="mb-2">Specialisations</SectionLabel>
        <Card padding="lg">
          <div className="flex flex-wrap gap-2">
            {ALL_SPECIALTIES.map((s) => {
              const active = specialties.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(s)}
                  className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-full border transition-colors t-body-sm font-medium ${
                    active
                      ? "bg-primary-50 border-primary-500 text-primary-700"
                      : "bg-white border-[var(--border-default)] text-neutral-700 hover:border-primary-300"
                  }`}
                >
                  {active ? <X size={14} /> : <Plus size={14} />}
                  {s}
                </button>
              );
            })}
          </div>
          <div className="mt-3 t-caption text-neutral-500">
            {specialties.length} selected
          </div>
        </Card>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button variant="primary" size="lg" fullWidth href="/profile">
          Save changes
        </Button>
      </div>
    </PhoneFrame>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
