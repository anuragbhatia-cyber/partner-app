import { useSyncExternalStore } from "react";

export type TxnKind = "earning" | "payout" | "deduction";
export type TxnCategory = "challan" | "rto" | "case";

type Base = {
  id: string;
  kind: TxnKind;
  date: string;
  day: string;
};

export type EarningTxn = Base & {
  kind: "earning";
  category: TxnCategory;
  incidentId: string;
  batchId: string;
  batchType: string;
  state: string;
  gross: number;
  platformFee: number;
  tds: number;
  net: number;
  closedAt: string;
  closure: "resolved" | "cancelled";
  closureNote?: string;
};

export type PayoutSource = {
  earningId: string;
  incidentId: string;
  batchId: string;
  net: number;
};

export type PayoutTxn = Base & {
  kind: "payout";
  bank: string;
  utr?: string;
  amount: number;
  status: "pending" | "completed";
  requestedAt: string;
  settledAt?: string;
  sources: PayoutSource[];
};

export type DeductionTxn = Base & {
  kind: "deduction";
  reason: "TDS" | "Platform fee";
  amount: number;
  linkedEarningId: string;
  gross: number;
  ratePct: number;
};

export type WalletTxn = EarningTxn | PayoutTxn | DeductionTxn;

export const TRANSACTIONS: WalletTxn[] = [
  {
    id: "ERN-100842",
    kind: "earning",
    day: "Aug 3",
    date: "2026-08-03",
    category: "challan",
    incidentId: "IRN-100842",
    batchId: "BATCH-2309",
    batchType: "RTO Renewals",
    state: "Karnataka",
    gross: 850,
    platformFee: 30,
    tds: 85,
    net: 735,
    closedAt: "03 Aug 2026, 11:42",
    closure: "resolved",
    closureNote: "Challan paid and e-receipt uploaded",
  },
  {
    id: "PYT-56784321",
    kind: "payout",
    day: "Aug 2",
    date: "2026-08-02",
    bank: "HDFC ****4521",
    utr: "N123456789",
    amount: 8000,
    status: "completed",
    requestedAt: "02 Aug 2026, 09:12",
    settledAt: "02 Aug 2026, 14:08",
    sources: [
      {
        earningId: "ERN-100838",
        incidentId: "IRN-100838",
        batchId: "BATCH-2309",
        net: 700,
      },
      {
        earningId: "ERN-100831",
        incidentId: "IRN-100831",
        batchId: "BATCH-2307",
        net: 2400,
      },
      {
        earningId: "ERN-100825",
        incidentId: "IRN-100825",
        batchId: "BATCH-2306",
        net: 3800,
      },
      {
        earningId: "ERN-100820",
        incidentId: "IRN-100820",
        batchId: "BATCH-2305",
        net: 1100,
      },
    ],
  },
  {
    id: "ERN-100838",
    kind: "earning",
    day: "Aug 2",
    date: "2026-08-02",
    category: "rto",
    incidentId: "IRN-100838",
    batchId: "BATCH-2309",
    batchType: "RTO Renewals",
    state: "Karnataka",
    gross: 820,
    platformFee: 40,
    tds: 80,
    net: 700,
    closedAt: "02 Aug 2026, 16:21",
    closure: "resolved",
    closureNote: "RTO renewal filed · Form 60 submitted",
  },
  {
    id: "DED-TDS-0801",
    kind: "deduction",
    day: "Aug 1",
    date: "2026-08-01",
    reason: "TDS",
    amount: 85,
    linkedEarningId: "ERN-100842",
    gross: 850,
    ratePct: 10,
  },
  {
    id: "PYT-56784200",
    kind: "payout",
    day: "Jul 28",
    date: "2026-07-28",
    bank: "HDFC ****4521",
    utr: "N456789123",
    amount: 12400,
    status: "completed",
    requestedAt: "28 Jul 2026, 10:02",
    settledAt: "28 Jul 2026, 18:30",
    sources: [
      {
        earningId: "ERN-100812",
        incidentId: "IRN-100812",
        batchId: "BATCH-2304",
        net: 4800,
      },
      {
        earningId: "ERN-100809",
        incidentId: "IRN-100809",
        batchId: "BATCH-2303",
        net: 3600,
      },
      {
        earningId: "ERN-100805",
        incidentId: "IRN-100805",
        batchId: "BATCH-2302",
        net: 4000,
      },
    ],
  },
  {
    id: "PYT-56784050",
    kind: "payout",
    day: "Jul 21",
    date: "2026-07-21",
    bank: "HDFC ****4521",
    utr: "N321654987",
    amount: 9750,
    status: "completed",
    requestedAt: "21 Jul 2026, 09:40",
    settledAt: "21 Jul 2026, 15:12",
    sources: [
      {
        earningId: "ERN-100798",
        incidentId: "IRN-100798",
        batchId: "BATCH-2301",
        net: 5250,
      },
      {
        earningId: "ERN-100790",
        incidentId: "IRN-100790",
        batchId: "BATCH-2301",
        net: 4500,
      },
    ],
  },
  {
    id: "PYT-56784400",
    kind: "payout",
    day: "Today",
    date: "2026-08-04",
    bank: "HDFC ****4521",
    amount: 2000,
    status: "pending",
    requestedAt: "04 Aug 2026, 09:42",
    sources: [
      {
        earningId: "ERN-100842",
        incidentId: "IRN-100842",
        batchId: "BATCH-2309",
        net: 735,
      },
      {
        earningId: "ERN-100838",
        incidentId: "IRN-100838",
        batchId: "BATCH-2309",
        net: 700,
      },
      {
        earningId: "ERN-100820",
        incidentId: "IRN-100820",
        batchId: "BATCH-2305",
        net: 565,
      },
    ],
  },
];

export function getTxn(id: string): WalletTxn | undefined {
  return TRANSACTIONS.find((t) => t.id === id);
}

export function txnTitle(t: WalletTxn): string {
  if (t.kind === "earning") {
    const prefix =
      t.category === "challan"
        ? "Challan"
        : t.category === "rto"
          ? "RTO"
          : "Case";
    return `${prefix} ${t.incidentId}`;
  }
  if (t.kind === "payout") return `Payout to ${t.bank}`;
  return `${t.reason} on ₹${t.gross.toLocaleString("en-IN")}`;
}

export function txnSignedAmount(t: WalletTxn): string {
  if (t.kind === "earning") return `+₹${t.net.toLocaleString("en-IN")}`;
  if (t.kind === "payout") return `-₹${t.amount.toLocaleString("en-IN")}`;
  return `-₹${t.amount.toLocaleString("en-IN")}`;
}

export function txnDirection(t: WalletTxn): "in" | "out" {
  return t.kind === "earning" ? "in" : "out";
}

let previewTxnId: string | null = null;
const previewListeners = new Set<() => void>();
const previewSubscribe = (fn: () => void) => {
  previewListeners.add(fn);
  return () => {
    previewListeners.delete(fn);
  };
};
const previewGet = () => previewTxnId;

export function setPreviewTxnId(id: string | null) {
  previewTxnId = id;
  previewListeners.forEach((fn) => fn());
}

export function usePreviewTxnId(): string | null {
  return useSyncExternalStore(previewSubscribe, previewGet, previewGet);
}

export function groupByDay(txns: WalletTxn[]): { day: string; items: WalletTxn[] }[] {
  const map = new Map<string, WalletTxn[]>();
  for (const t of txns) {
    const arr = map.get(t.day) ?? [];
    arr.push(t);
    map.set(t.day, arr);
  }
  return Array.from(map.entries()).map(([day, items]) => ({ day, items }));
}
