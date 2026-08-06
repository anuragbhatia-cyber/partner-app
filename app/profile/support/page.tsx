"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Card, ListRow, SectionLabel } from "@/components/ui";
import {
  Search,
  IndianRupee,
  ClipboardList,
  ShieldCheck,
  Smartphone,
  MessageCircle,
  Phone,
} from "lucide-react";

export default function SupportPage() {
  return (
    <PhoneFrame label="Profile · Support">
      <AppBar back href="/profile" title="Support" />

      <div className="px-4 py-4 pb-24 space-y-4">
        {/* Search */}
        <Card padding="sm" className="flex items-center gap-2">
          <Search size={16} className="text-neutral-400" />
          <input
            className="flex-1 t-body bg-transparent placeholder:text-neutral-400 focus:outline-none"
            placeholder="Search help topics"
          />
        </Card>

        <div>
          <SectionLabel className="mb-2">Quick Help</SectionLabel>
          <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
            <ListRow icon={<IndianRupee size={18} />} title="Payment questions" href="/profile/support/faq/payment" />
            <ListRow icon={<ClipboardList size={18} />} title="About cases" href="/profile/support/faq/cases" />
            <ListRow icon={<ShieldCheck size={18} />} title="KYC & documents" href="/profile/support/faq/kyc" />
            <ListRow icon={<Smartphone size={18} />} title="App & technical" href="/profile/support/faq/app" />
          </Card>
        </div>

        <div>
          <SectionLabel className="mb-2">Contact Us</SectionLabel>
          <Card padding="none" className="divide-y divide-[var(--border-subtle)]">
            <ListRow
              icon={<MessageCircle size={18} />}
              title="Chat with support"
              subtitle="Usually replies in <5 min"
              tone="success"
              href="/profile/support/chat"
            />
            <ListRow
              icon={<Phone size={18} />}
              title="Click to call"
              subtitle="24/7 for critical cases · 1800-XXX-XXXX"
              href="tel:1800XXXXXXX"
            />
          </Card>
        </div>

      </div>
    </PhoneFrame>
  );
}
