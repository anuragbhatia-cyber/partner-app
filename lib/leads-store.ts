"use client";

import { useSyncExternalStore } from "react";

export type LeadCategory = "case" | "challan" | "rto";
export type LeadUrgency = "high" | "medium" | "low";

export type LeadItem = {
  incidentId: string;
  challanNumber: string;
  vehicleNumber: string;
  state: string;
  fineAmount: number;
  tatDeadline: string;
};

export type Lead = {
  id: string;
  type: string;
  category: LeadCategory;
  itemLabel: string;
  location: string;
  earnings: number;
  postedMinAgo: number;
  urgency: LeadUrgency;
  items: LeadItem[];
};

export function leadTotalAmount(lead: Lead): number {
  return lead.items.reduce((sum, item) => sum + item.fineAmount, 0);
}

export type IncidentStatus =
  | "ACCEPTED"
  | "EN ROUTE"
  | "ARRIVED"
  | "IN PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type ActiveIncident = {
  caseId: string;
  vehicle: string;
  description: string;
  status: IncidentStatus;
  deadlineDays: number;
  category?: LeadCategory;
  amount?: number;
  area?: string;
  batchId?: string;
  /** Millis · when the partner tapped Accept */
  assignedAt?: number;
  /** Millis · when the partner marked arrived on scene */
  arrivedAt?: number;
  /** Millis · when the case was closed successfully */
  completedAt?: number;
  /** Millis · when the case was cancelled */
  cancelledAt?: number;
};

/** Deadline in ms, derived from assignedAt + deadlineDays. */
export function incidentDeadlineAt(inc: ActiveIncident): number | null {
  if (!inc.assignedAt) return null;
  return inc.assignedAt + inc.deadlineDays * 24 * 60 * 60 * 1000;
}

/** True when the case is past its SLA deadline and not yet closed. */
export function isSlaBreached(
  inc: ActiveIncident,
  now: number = Date.now()
): boolean {
  if (inc.status === "COMPLETED" || inc.status === "CANCELLED") return false;
  const dl = incidentDeadlineAt(inc);
  return dl !== null && now > dl;
}

/** Ms elapsed since the partner accepted (0 if not accepted yet). */
export function incidentElapsedMs(
  inc: ActiveIncident,
  now: number = Date.now()
): number {
  if (!inc.assignedAt) return 0;
  const end = inc.completedAt ?? inc.cancelledAt ?? now;
  return Math.max(0, end - inc.assignedAt);
}

type State = {
  leads: Lead[];
  assigned: ActiveIncident[];
  closed: ActiveIncident[];
};

function buildItems(
  prefix: string,
  state: string,
  stateCode: string,
  count: number,
  fine: number,
  tat: string
): LeadItem[] {
  return Array.from({ length: count }, (_, i) => {
    const idx = i + 1;
    const seq = String(idx).padStart(4, "0");
    const vehSeq = String(1234 + i).padStart(4, "0");
    const vehLetters = String.fromCharCode(65 + (i % 26)) +
      String.fromCharCode(65 + ((i + 7) % 26));
    return {
      incidentId: `IRN-${prefix}${seq}`,
      challanNumber: `${stateCode}01${2024}${String(700000 + i * 37 + idx).padStart(6, "0")}`,
      vehicleNumber: `${stateCode}01${vehLetters}${vehSeq}`,
      state,
      fineAmount: fine,
      tatDeadline: tat,
    };
  });
}

const SEED_LEADS: Lead[] = [
  {
    id: "BATCH-2311",
    type: "Traffic Challans",
    category: "challan",
    itemLabel: "Challans",
    location: "Mumbai, Maharashtra",
    earnings: 500,
    postedMinAgo: 2,
    urgency: "high",
    items: buildItems("12", "Maharashtra", "MH", 10, 2500, "20 Aug 2026"),
  },
  {
    id: "BATCH-2310",
    type: "Court Cases",
    category: "case",
    itemLabel: "Cases",
    location: "Bengaluru, Karnataka",
    earnings: 1200,
    postedMinAgo: 6,
    urgency: "medium",
    items: buildItems("13", "Karnataka", "KA", 12, 3500, "28 Aug 2026"),
  },
  {
    id: "BATCH-2309",
    type: "RTO Renewals",
    category: "rto",
    itemLabel: "RTO Tasks",
    location: "HSR Layout, Bengaluru",
    earnings: 320,
    postedMinAgo: 8,
    urgency: "high",
    items: buildItems("14", "Karnataka", "KA", 6, 1800, "15 Aug 2026"),
  },
  {
    id: "BATCH-2308",
    type: "Traffic Challans",
    category: "challan",
    itemLabel: "Challans",
    location: "Pune, Maharashtra",
    earnings: 220,
    postedMinAgo: 14,
    urgency: "medium",
    items: buildItems("15", "Maharashtra", "MH", 4, 1500, "02 Sep 2026"),
  },
  {
    id: "BATCH-2307",
    type: "Court Cases",
    category: "case",
    itemLabel: "Cases",
    location: "BTM Layout, Bengaluru",
    earnings: 650,
    postedMinAgo: 22,
    urgency: "low",
    items: buildItems("16", "Karnataka", "KA", 5, 2800, "10 Sep 2026"),
  },
  {
    id: "BATCH-2306",
    type: "Court Cases",
    category: "case",
    itemLabel: "Cases",
    location: "Shivajinagar, Bengaluru",
    earnings: 1800,
    postedMinAgo: 34,
    urgency: "high",
    items: buildItems("17", "Karnataka", "KA", 15, 4000, "22 Aug 2026"),
  },
  {
    id: "BATCH-2305",
    type: "RTO Renewals",
    category: "rto",
    itemLabel: "RTO Tasks",
    location: "Jayanagar, Bengaluru",
    earnings: 180,
    postedMinAgo: 51,
    urgency: "low",
    items: buildItems("18", "Karnataka", "KA", 3, 1200, "18 Sep 2026"),
  },
];

const SEED_ASSIGNED: ActiveIncident[] = [
  {
    caseId: "IRN-100842",
    vehicle: "MH012024789456",
    description:
      "Running a red light at the intersection of Maple Street and 5th Avenue.",
    status: "IN PROGRESS",
    deadlineDays: 2,
    category: "challan",
    area: "Mumbai, Maharashtra",
    batchId: "BATCH-2301",
  },
  {
    caseId: "IRN-100843",
    vehicle: "MH012024789457",
    description:
      "Rear-end collision on the Outer Ring Road near Silk Board junction.",
    status: "EN ROUTE",
    deadlineDays: 1,
    category: "case",
    area: "Bengaluru, Karnataka",
    batchId: "BATCH-2302",
  },
  {
    caseId: "IRN-100844",
    vehicle: "MH012024789458",
    description:
      "RTO documentation pending for ownership transfer at Koramangala office.",
    status: "ARRIVED",
    deadlineDays: 5,
    category: "rto",
    area: "Koramangala, Bengaluru",
    batchId: "BATCH-2302",
  },
  {
    caseId: "IRN-100845",
    vehicle: "MH012024789459",
    description:
      "Court appearance scheduled at City Civil Court for pending challan hearing.",
    status: "ACCEPTED",
    deadlineDays: 15,
    category: "case",
    area: "Mumbai, Maharashtra",
    batchId: "BATCH-2301",
  },
];

const SEED_CLOSED: ActiveIncident[] = [
  {
    caseId: "IRN-100820",
    vehicle: "MH012024789440",
    description:
      "Signal violation at Dadar junction — challan paid at the counter.",
    status: "COMPLETED",
    deadlineDays: 2,
    category: "challan",
    area: "Mumbai, Maharashtra",
    batchId: "BATCH-2301",
  },
  {
    caseId: "IRN-100830",
    vehicle: "KA053021456789",
    description:
      "Court filing closed after the client settled with the complainant.",
    status: "COMPLETED",
    deadlineDays: 3,
    category: "case",
    area: "Bengaluru, Karnataka",
    batchId: "BATCH-2302",
  },
  {
    caseId: "IRN-100831",
    vehicle: "KA053021456790",
    description:
      "Client no-show at the pickup point. Case cancelled per policy.",
    status: "CANCELLED",
    deadlineDays: 5,
    category: "rto",
    area: "Koramangala, Bengaluru",
    batchId: "BATCH-2302",
  },
];

let state: State = {
  leads: SEED_LEADS,
  assigned: SEED_ASSIGNED,
  closed: SEED_CLOSED,
};
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((fn) => fn());
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

const getSnapshot = () => state;
const getServerSnapshot = () => state;

let irnCounter = 100846;
const nextIrn = () => `IRN-${irnCounter++}`;

let previewLeadId: string | null = null;
const previewListeners = new Set<() => void>();
const previewSubscribe = (fn: () => void) => {
  previewListeners.add(fn);
  return () => {
    previewListeners.delete(fn);
  };
};
const previewGet = () => previewLeadId;

export function setPreviewLeadId(id: string | null) {
  previewLeadId = id;
  previewListeners.forEach((fn) => fn());
}

export function usePreviewLeadId(): string | null {
  return useSyncExternalStore(previewSubscribe, previewGet, previewGet);
}

export function useLeadsStore(): State {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function assignLead(id: string) {
  const lead = state.leads.find((l) => l.id === id);
  if (!lead) return;
  const first = lead.items[0];
  const incident: ActiveIncident = {
    caseId: nextIrn(),
    vehicle: first?.vehicleNumber ?? "",
    description: `${lead.items.length} ${lead.itemLabel} · ${lead.location}`,
    status: "ACCEPTED",
    deadlineDays: lead.urgency === "high" ? 2 : lead.urgency === "medium" ? 5 : 10,
    category: lead.category,
    amount: leadTotalAmount(lead),
    area: lead.location,
    batchId: lead.id,
    assignedAt: Date.now(),
  };
  state = {
    ...state,
    leads: state.leads.filter((l) => l.id !== id),
    assigned: [incident, ...state.assigned],
  };
  emit();
}

export function skipLead(id: string) {
  state = {
    ...state,
    leads: state.leads.filter((l) => l.id !== id),
  };
  emit();
}

export const CATEGORY_LABELS: Record<LeadCategory, string> = {
  case: "Case",
  challan: "Challan",
  rto: "RTO",
};

export const CATEGORY_TONE: Record<
  LeadCategory,
  "primary" | "gold" | "info"
> = {
  case: "primary",
  challan: "gold",
  rto: "info",
};
