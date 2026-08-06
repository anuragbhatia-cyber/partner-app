"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card } from "@/components/ui";
import { Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type Role = "lawyer" | "rto";

const ROLES: {
  key: Role;
  title: string;
  desc: string;
  img: string;
  alt: string;
}[] = [
  {
    key: "lawyer",
    title: "I am a Lawyer",
    desc: "On-spot legal representation for challans, accidents, and court matters",
    img: "/lawyer-icon.png",
    alt: "Lawyer",
  },
  {
    key: "rto",
    title: "I am an RTO Agent",
    desc: "RTO documentation, registration, and challan management services",
    img: "/rto-agent-icon.png",
    alt: "RTO Agent",
  },
];

export default function RoleSelectPage() {
  const [selected, setSelected] = useState<Role | null>(null);

  return (
    <PhoneFrame label="Role Selection">
      <AppBar back href="/otp" />

      <div className="flex flex-col min-h-[calc(100%-4rem)] px-4 pt-6 pb-6">
        <h1 className="t-h1 font-bold text-neutral-800 tracking-tight">
          What Is Your Area Of Practice?
        </h1>
        <p className="t-body-lg text-neutral-500 mt-3">
          Choose the role that best matches your practice
        </p>

        <div className="space-y-4 mt-10">
          {ROLES.map((r) => {
            const active = selected === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => setSelected(r.key)}
                className="w-full text-left"
              >
                <Card
                  padding="lg"
                  className={`transition-all min-h-[172px] ${
                    active
                      ? "border-primary-600!"
                      : "hover:border-primary-300"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative bg-[#e0f2fe]">
                      <Image
                        src={r.img}
                        alt={r.alt}
                        fill
                        sizes="96px"
                        className="object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="t-h3 font-bold text-neutral-800">
                        {r.title}
                      </div>
                      <div className="t-body-sm text-neutral-500 mt-1.5 leading-relaxed">
                        {r.desc}
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 shrink-0 mt-1 rounded-full flex items-center justify-center transition-all ${
                        active
                          ? "bg-primary-600 text-white"
                          : "border-2 border-neutral-200 bg-white"
                      }`}
                      aria-hidden
                    >
                      {active && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          href={selected ? "/onboarding" : undefined}
          disabled={!selected}
        >
          Continue →
        </Button>
      </div>
    </PhoneFrame>
  );
}
