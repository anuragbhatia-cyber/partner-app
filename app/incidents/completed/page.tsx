"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Card, Chip, SectionLabel } from "@/components/ui";
import {
  MoreVertical,
  Phone,
  CheckCircle2,
  IdCard,
  Car,
  Receipt,
  FileText,
  Eye,
} from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function IncidentCompletedPage() {
  return (
    <Suspense fallback={null}>
      <IncidentCompletedView />
    </Suspense>
  );
}

function IncidentCompletedView() {
  const params = useSearchParams();
  const caseId = params.get("id") || "IRN-100838";
  const amount = params.get("amount") || "₹700";

  return (
    <PhoneFrame label="Incident · Completed">
      <AppBar
        back
        href="/incidents"
        title={caseId}
        action={
          <button className="w-10 h-10 flex items-center justify-center rounded-full">
            <MoreVertical size={20} className="text-neutral-700" />
          </button>
        }
      />

      <div className="px-4 py-4 pb-8 space-y-4">
        {/* Status ribbon */}
        <div className="-mx-4 -mt-4 mb-4 px-4 py-3 bg-success-subtle border-b border-success/20 flex items-center">
          <Chip tone="success" dot>
            COMPLETED
          </Chip>
        </div>

        {/* Amount earned hero */}
        <Card padding="none" className="overflow-hidden">
          <div className="p-4 bg-gradient-to-br from-success-subtle/70 to-white">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-success flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <div className="t-caption text-neutral-500 font-semibold uppercase tracking-wider">
                  Amount credited to wallet
                </div>
                <div className="mt-0.5 t-h1 font-bold text-neutral-800 tabular">
                  {amount}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Incident details grid */}
        <Card padding="lg">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <Field label="Incident ID" value={<span className="font-mono">{caseId}</span>} />
            <Field label="Challan Number" value={<span className="font-mono">MH012024789456</span>} />
            <Field label="Vehicle Number" value={<span className="font-mono">MH01AB1234</span>} />
            <Field label="State" value="Maharashtra" />
            <Field label="Fine Amount" value={<span className="font-mono">₹2,500</span>} />
            <Field
              label="Closed On"
              value={<span className="font-semibold text-success-bold">Today, 11:18</span>}
            />
          </div>
        </Card>

        {/* Agent */}
        <div>
          <SectionLabel className="mb-2">Agent</SectionLabel>
          <Card padding="none">
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold t-body-sm">
                VR
              </div>
              <div className="flex-1 min-w-0">
                <div className="t-body font-semibold text-neutral-800">
                  Vikram Rao
                </div>
                <div className="t-caption text-neutral-500">LLD-12121</div>
              </div>
              <button className="w-9 h-9 rounded-full bg-success-subtle flex items-center justify-center text-success-bold">
                <Phone size={14} />
              </button>
            </div>
          </Card>
        </div>

        {/* Timeline */}
        <div>
          <SectionLabel className="mb-2">Timeline</SectionLabel>
          <Card>
            <TimelineDone label="Accepted" time="10:24" />
            <TimelineDone label="In progress" time="10:41" />
            <TimelineDone label="Completed" time="11:18" isLast highlight />
          </Card>
        </div>

        {/* Documents */}
        <div>
          <SectionLabel className="mb-2">Documents</SectionLabel>
          <Card padding="none">
            <div className="divide-y divide-[var(--border-subtle)]">
              {COMPLETED_DOCS.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PhoneFrame>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="t-caption text-neutral-500">{label}</div>
      <div className="mt-1 t-body font-semibold text-neutral-800 break-words">
        {value}
      </div>
    </div>
  );
}

function TimelineDone({
  label,
  time,
  isLast,
  highlight,
}: {
  label: string;
  time: string;
  isLast?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-[18px] h-[18px] rounded-full bg-success flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5.5L4 7.5L8 3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {!isLast && <div className="w-px flex-1 bg-success/40 my-1" />}
      </div>
      <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-4"}`}>
        <div className="flex items-baseline justify-between gap-3">
          <span
            className={`t-body font-semibold ${
              highlight ? "text-success-bold" : "text-neutral-800"
            }`}
          >
            {label}
          </span>
          <span className="t-caption text-neutral-500 tabular">{time}</span>
        </div>
      </div>
    </div>
  );
}

type CompletedDoc = {
  id: string;
  label: string;
  file: { name: string; size: string };
  icon: React.ReactNode;
};

const COMPLETED_DOCS: CompletedDoc[] = [
  {
    id: "driving-license",
    label: "Driving licence",
    file: { name: "driving-licence.pdf", size: "1.2 MB" },
    icon: <IdCard size={18} />,
  },
  {
    id: "rc",
    label: "Registration certificate",
    file: { name: "rc-book.pdf", size: "864 KB" },
    icon: <Car size={18} />,
  },
  {
    id: "challan",
    label: "Original challan / notice",
    file: { name: "e-challan-MH012024.pdf", size: "412 KB" },
    icon: <Receipt size={18} />,
  },
];

function DocumentRow({ doc }: { doc: CompletedDoc }) {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary-50 text-primary-700">
        {doc.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="t-body-sm font-semibold text-neutral-800 truncate">
          {doc.label}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-neutral-500 t-caption min-w-0">
          <FileText size={12} className="text-error-bold shrink-0" />
          <span className="truncate">{doc.file.name}</span>
          <span className="shrink-0">· {doc.file.size}</span>
        </div>
      </div>
      <button
        type="button"
        aria-label={`Preview ${doc.file.name}`}
        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
      >
        <Eye size={16} />
      </button>
    </div>
  );
}
