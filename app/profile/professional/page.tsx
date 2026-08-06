"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card, Chip, SectionLabel } from "@/components/ui";
import { Scale, X, Plus } from "lucide-react";
import { useState } from "react";

const ALL_SPECIALTIES = [
  "Traffic",
  "Motor accidents",
  "Criminal",
  "Consumer",
  "Family",
  "Civil",
  "Property",
];

export default function ProfileProfessionalPage() {
  const [barId, setBarId] = useState("KAR/12345/2018");
  const [years, setYears] = useState("7");
  const [specialties, setSpecialties] = useState<string[]>([
    "Traffic",
    "Motor accidents",
    "Criminal",
  ]);

  const toggle = (s: string) =>
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  return (
    <PhoneFrame label="Profile · Professional">
      <AppBar back href="/profile" title="Professional" />

      <div className="px-4 py-4 pb-32 space-y-4">
        <SectionLabel className="mb-2">Credentials</SectionLabel>
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 shrink-0">
              <Scale size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="t-body font-semibold text-neutral-800">
                Bar Council of Karnataka
              </div>
              <div className="t-caption text-neutral-500">Verified</div>
            </div>
            <Chip tone="success" size="sm">
              Active
            </Chip>
          </div>

          <Field
            label="Bar Council ID"
            value={barId}
            onChange={(e) => setBarId(e.target.value)}
          />
          <Field
            label="Years of practice"
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
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

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="t-caption font-semibold text-neutral-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="mt-1.5 w-full h-11 px-3 rounded-lg border border-[var(--border-default)] bg-white t-body text-neutral-800 focus:outline-none focus:border-primary-500 transition-colors"
      />
    </label>
  );
}
