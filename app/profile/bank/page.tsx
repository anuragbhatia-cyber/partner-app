"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import { Button, Card, Chip, SectionLabel } from "@/components/ui";
import { Landmark, ShieldCheck, User, Hash, Building2, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";

type BankAccount = {
  bankName: string;
  last4: string;
  accountHolder: string;
  ifsc: string;
  branch: string;
};

const INITIAL_ACCOUNT: BankAccount = {
  bankName: "HDFC Bank",
  last4: "4521",
  accountHolder: "Priya Sharma",
  ifsc: "HDFC0000456",
  branch: "MG Road, Bengaluru",
};

export default function ProfileBankPage() {
  const [account, setAccount] = useState<BankAccount>(INITIAL_ACCOUNT);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <PhoneFrame label="Profile · Bank">
      <AppBar back href="/profile" title="Bank account" />

      <div className="px-4 py-4 pb-32 space-y-4">
        <SectionLabel className="mb-2">Primary account</SectionLabel>
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 shrink-0">
              <Landmark size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="t-body font-semibold text-neutral-800">
                {account.bankName}
              </div>
              <div className="t-caption text-neutral-500 font-mono">
                •••• {account.last4}
              </div>
            </div>
            <Chip tone="success" size="sm">
              Verified
            </Chip>
          </div>

          <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
            <Row label="Account holder" value={account.accountHolder} />
            <Row label="IFSC" value={account.ifsc} mono />
            <Row label="Branch" value={account.branch} />
          </div>
        </Card>

        <Card className="bg-info-subtle border-info/20 flex items-start gap-2.5">
          <ShieldCheck size={16} className="text-info-bold shrink-0 mt-0.5" />
          <div className="t-body-sm text-info-bold leading-relaxed">
            Payouts are processed via NEFT and typically settle within 1 working day.
          </div>
        </Card>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4 flex gap-2">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => setSheetOpen(true)}
        >
          Change bank
        </Button>
      </div>

      <BankFormSheet
        open={sheetOpen}
        initial={account}
        onClose={() => setSheetOpen(false)}
        onSubmit={(next) => {
          setAccount(next);
          setSheetOpen(false);
        }}
      />
    </PhoneFrame>
  );
}

function Row({
  label,
  value,
  mono,
  strong,
}: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between t-body">
      <span className="text-neutral-500">{label}</span>
      <span
        className={`text-neutral-800 ${strong ? "font-bold" : "font-semibold"} ${
          mono ? "font-mono t-body-sm" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function BankFormSheet({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial: BankAccount;
  onClose: () => void;
  onSubmit: (next: BankAccount) => void;
}) {
  const [accountHolder, setAccountHolder] = useState(initial.accountHolder);
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState(initial.ifsc);
  const [bankName, setBankName] = useState(initial.bankName);
  const [branch, setBranch] = useState(initial.branch);

  useEffect(() => {
    if (open) {
      setAccountHolder(initial.accountHolder);
      setAccountNumber("");
      setConfirmAccountNumber("");
      setIfsc(initial.ifsc);
      setBankName(initial.bankName);
      setBranch(initial.branch);
    }
  }, [open, initial]);

  const matches =
    accountNumber.length > 0 && accountNumber === confirmAccountNumber;
  const canSubmit =
    accountHolder.trim().length > 1 &&
    accountNumber.length >= 9 &&
    matches &&
    ifsc.trim().length === 11 &&
    bankName.trim().length > 0 &&
    branch.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      bankName: bankName.trim(),
      last4: accountNumber.slice(-4),
      accountHolder: accountHolder.trim(),
      ifsc: ifsc.trim().toUpperCase(),
      branch: branch.trim(),
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-e3 transition-transform duration-300 ease-out flex flex-col max-h-[92%] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        <div className="px-4 pt-2 pb-3 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="t-h3 font-bold text-neutral-800">
              Change bank account
            </div>
            <div className="t-caption text-neutral-500 mt-0.5">
              Payouts will move to the new account after verification.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 -mr-1 shrink-0 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-500"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pb-4 space-y-3 overflow-y-auto no-scrollbar">
          <Field
            label="Account holder name"
            required
            icon={<User size={14} className="text-neutral-400" />}
          >
            <input
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="As per bank records"
              className="w-full h-11 pl-9 pr-3 rounded-lg border border-[var(--border-default)] bg-white t-body text-neutral-800 focus:outline-none focus:border-primary-500 placeholder:text-neutral-400"
            />
          </Field>

          <Field
            label="Account number"
            required
            icon={<Hash size={14} className="text-neutral-400" />}
          >
            <input
              value={accountNumber}
              onChange={(e) =>
                setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 18))
              }
              placeholder="9–18 digits"
              inputMode="numeric"
              className="w-full h-11 pl-9 pr-3 rounded-lg border border-[var(--border-default)] bg-white t-body text-neutral-800 focus:outline-none focus:border-primary-500 placeholder:text-neutral-400 tabular"
            />
          </Field>

          <Field
            label="Re-enter account number"
            required
            icon={<Hash size={14} className="text-neutral-400" />}
          >
            <input
              value={confirmAccountNumber}
              onChange={(e) =>
                setConfirmAccountNumber(
                  e.target.value.replace(/\D/g, "").slice(0, 18)
                )
              }
              placeholder="Repeat account number"
              inputMode="numeric"
              className={`w-full h-11 pl-9 pr-3 rounded-lg border bg-white t-body text-neutral-800 focus:outline-none placeholder:text-neutral-400 tabular ${
                confirmAccountNumber && !matches
                  ? "border-error focus:border-error"
                  : "border-[var(--border-default)] focus:border-primary-500"
              }`}
            />
            {confirmAccountNumber && !matches && (
              <div className="mt-1 t-caption text-error">
                Account numbers don&apos;t match.
              </div>
            )}
          </Field>

          <Field
            label="IFSC code"
            required
            icon={<Landmark size={14} className="text-neutral-400" />}
          >
            <input
              value={ifsc}
              onChange={(e) =>
                setIfsc(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 11)
                )
              }
              placeholder="e.g. HDFC0000456"
              className="w-full h-11 pl-9 pr-3 rounded-lg border border-[var(--border-default)] bg-white t-body text-neutral-800 focus:outline-none focus:border-primary-500 placeholder:text-neutral-400 font-mono uppercase"
            />
          </Field>

          <Field
            label="Bank name"
            required
            icon={<Building2 size={14} className="text-neutral-400" />}
          >
            <input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. HDFC Bank"
              className="w-full h-11 pl-9 pr-3 rounded-lg border border-[var(--border-default)] bg-white t-body text-neutral-800 focus:outline-none focus:border-primary-500 placeholder:text-neutral-400"
            />
          </Field>

          <Field
            label="Branch"
            required
            icon={<MapPin size={14} className="text-neutral-400" />}
          >
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g. MG Road, Bengaluru"
              className="w-full h-11 pl-9 pr-3 rounded-lg border border-[var(--border-default)] bg-white t-body text-neutral-800 focus:outline-none focus:border-primary-500 placeholder:text-neutral-400"
            />
          </Field>

          <div className="rounded-lg bg-info-subtle border border-info/20 p-3 flex items-start gap-2">
            <ShieldCheck size={14} className="text-info-bold shrink-0 mt-0.5" />
            <div className="t-caption text-info-bold leading-relaxed">
              We&apos;ll send a ₹1 test deposit to verify the account before
              your next payout.
            </div>
          </div>
        </div>

        <div className="px-4 pt-3 pb-5 border-t border-[var(--border-subtle)] shrink-0 flex gap-2">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Update account
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="t-caption font-semibold text-neutral-700">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </span>
      <div className="relative mt-1.5">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            {icon}
          </span>
        )}
        {children}
      </div>
    </label>
  );
}
