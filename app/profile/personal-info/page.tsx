"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card, SectionLabel } from "@/components/ui";
import { useState } from "react";

export default function ProfilePersonalInfoPage() {
  const [form, setForm] = useState({
    fullName: "Advocate Priya Sharma",
    email: "priya.sharma@lawyered.in",
    phone: "+91 98765 43210",
    dob: "1990-04-12",
  });

  const update = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <PhoneFrame label="Profile · Personal Info">
      <AppBar back href="/profile" title="Personal info" />

      <div className="px-4 py-4 pb-32 space-y-4">
        <SectionLabel className="mb-2">Basic details</SectionLabel>
        <Card padding="lg" className="space-y-4">
          <Field
            label="Full name"
            value={form.fullName}
            onChange={update("fullName")}
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={update("email")}
          />
          <Field
            label="Mobile"
            value={form.phone}
            onChange={update("phone")}
          />
          <Field
            label="Date of birth"
            type="date"
            value={form.dob}
            onChange={update("dob")}
          />
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
