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
  offence: string;
  courtLocation: string;
  challanDate: string;
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

export type ArchivedLead = Lead & {
  /** Millis · when the batch was rejected or completed. */
  archivedAt: number;
};

type State = {
  leads: Lead[];
  assigned: ActiveIncident[];
  closed: ActiveIncident[];
  rejected: ArchivedLead[];
  completed: ArchivedLead[];
};

const OFFENCES_BY_CATEGORY: Record<LeadCategory, string[]> = {
  challan: [
    "Running a red light at a signalised intersection",
    "Over-speeding above the posted limit",
    "Driving without a valid licence",
    "Riding without a helmet",
    "Using mobile phone while driving",
    "No seat belt — driver",
    "Parking in a no-parking zone",
    "Jumping the stop line",
  ],
  case: [
    "Section 279 IPC — rash & negligent driving",
    "Section 304A IPC — causing death by negligence",
    "Section 184 MV Act — driving dangerously",
    "Section 185 MV Act — drunk driving",
    "Section 134 MV Act — hit and run",
    "Section 3/181 MV Act — driving without licence",
    "Section 177 MV Act — general obstruction",
  ],
  rto: [
    "Vehicle ownership transfer",
    "Registration certificate renewal",
    "Change of address on RC",
    "Hypothecation addition",
    "Hypothecation termination",
    "Duplicate RC issuance",
    "Fitness certificate renewal",
  ],
};

const COURTS_BY_STATE: Record<string, string[]> = {
  Maharashtra: [
    "Shivaji Nagar Court, Mumbai",
    "Esplanade Court, Mumbai",
    "Dadar Mahanagar Court, Mumbai",
    "Shivajinagar Court, Pune",
    "Bandra Metropolitan Court, Mumbai",
  ],
  Karnataka: [
    "City Civil Court, Bengaluru",
    "Mayo Hall Court, Bengaluru",
    "Magistrate Court, Jayanagar",
    "Traffic Court, Shivajinagar",
    "ACMM Court, Bengaluru",
  ],
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parseDate(s: string): Date | null {
  // Expect format "DD MMM YYYY"
  const parts = s.split(" ");
  if (parts.length !== 3) return null;
  const day = Number(parts[0]);
  const month = MONTHS.indexOf(parts[1]);
  const year = Number(parts[2]);
  if (!day || month < 0 || !year) return null;
  return new Date(year, month, day);
}

function fmtDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function buildItems(
  prefix: string,
  state: string,
  stateCode: string,
  count: number,
  fine: number,
  tat: string,
  category: LeadCategory
): LeadItem[] {
  const pool = OFFENCES_BY_CATEGORY[category];
  const courts = COURTS_BY_STATE[state] ?? [`District Court, ${state}`];
  const tatDate = parseDate(tat);
  return Array.from({ length: count }, (_, i) => {
    const idx = i + 1;
    const seq = String(idx).padStart(4, "0");
    const vehSeq = String(1234 + i).padStart(4, "0");
    const vehLetters = String.fromCharCode(65 + (i % 26)) +
      String.fromCharCode(65 + ((i + 7) % 26));
    let challanDate = tat;
    if (tatDate) {
      const d = new Date(tatDate);
      d.setDate(d.getDate() - (30 + ((i * 3) % 20)));
      challanDate = fmtDate(d);
    }
    return {
      incidentId: `IRN-${prefix}${seq}`,
      challanNumber: `${stateCode}01${2024}${String(700000 + i * 37 + idx).padStart(6, "0")}`,
      vehicleNumber: `${stateCode}01${vehLetters}${vehSeq}`,
      state,
      fineAmount: fine,
      tatDeadline: tat,
      offence: pool[i % pool.length],
      courtLocation: courts[i % courts.length],
      challanDate,
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
    items: buildItems("12", "Maharashtra", "MH", 10, 2500, "20 Aug 2026", "challan"),
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
    items: buildItems("13", "Karnataka", "KA", 12, 3500, "28 Aug 2026", "case"),
  },
  {
    id: "BATCH-2309",
    type: "RTO Renewals",
    category: "rto",
    itemLabel: "RTO's",
    location: "HSR Layout, Bengaluru",
    earnings: 320,
    postedMinAgo: 8,
    urgency: "high",
    items: buildItems("14", "Karnataka", "KA", 6, 1800, "15 Aug 2026", "rto"),
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
    items: buildItems("15", "Maharashtra", "MH", 4, 1500, "02 Sep 2026", "challan"),
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
    items: buildItems("16", "Karnataka", "KA", 5, 2800, "10 Sep 2026", "case"),
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
    items: buildItems("17", "Karnataka", "KA", 15, 4000, "22 Aug 2026", "case"),
  },
  {
    id: "BATCH-2305",
    type: "RTO Renewals",
    category: "rto",
    itemLabel: "RTO's",
    location: "Jayanagar, Bengaluru",
    earnings: 180,
    postedMinAgo: 51,
    urgency: "low",
    items: buildItems("18", "Karnataka", "KA", 3, 1200, "18 Sep 2026", "rto"),
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

const DAY_MS = 24 * 60 * 60 * 1000;

const SEED_COMPLETED: ArchivedLead[] = [
  {
    id: "BATCH-2298",
    type: "Traffic Challans",
    category: "challan",
    itemLabel: "Challans",
    location: "Mumbai, Maharashtra",
    earnings: 850,
    postedMinAgo: 60 * 24 * 3,
    urgency: "medium",
    items: buildItems("08", "Maharashtra", "MH", 8, 2200, "12 Aug 2026", "challan"),
    archivedAt: Date.now() - 2 * DAY_MS,
  },
  {
    id: "BATCH-2294",
    type: "Court Cases",
    category: "case",
    itemLabel: "Cases",
    location: "Bengaluru, Karnataka",
    earnings: 1400,
    postedMinAgo: 60 * 24 * 5,
    urgency: "high",
    items: buildItems("09", "Karnataka", "KA", 7, 3200, "05 Aug 2026", "case"),
    archivedAt: Date.now() - 5 * DAY_MS,
  },
  {
    id: "BATCH-2288",
    type: "RTO Renewals",
    category: "rto",
    itemLabel: "RTO's",
    location: "Jayanagar, Bengaluru",
    earnings: 240,
    postedMinAgo: 60 * 24 * 7,
    urgency: "low",
    items: buildItems("10", "Karnataka", "KA", 4, 1600, "01 Aug 2026", "rto"),
    archivedAt: Date.now() - 7 * DAY_MS,
  },
];

const SEED_REJECTED: ArchivedLead[] = [
  {
    id: "BATCH-2303",
    type: "Court Cases",
    category: "case",
    itemLabel: "Cases",
    location: "Mumbai, Maharashtra",
    earnings: 900,
    postedMinAgo: 60 * 24,
    urgency: "medium",
    items: buildItems("11", "Maharashtra", "MH", 6, 3000, "10 Sep 2026", "case"),
    archivedAt: Date.now() - 1 * DAY_MS,
  },
  {
    id: "BATCH-2300",
    type: "Traffic Challans",
    category: "challan",
    itemLabel: "Challans",
    location: "Pune, Maharashtra",
    earnings: 300,
    postedMinAgo: 60 * 24 * 2,
    urgency: "low",
    items: buildItems("07", "Maharashtra", "MH", 5, 1500, "20 Sep 2026", "challan"),
    archivedAt: Date.now() - 2 * DAY_MS,
  },
];

let state: State = {
  leads: SEED_LEADS,
  assigned: SEED_ASSIGNED,
  closed: SEED_CLOSED,
  rejected: SEED_REJECTED,
  completed: SEED_COMPLETED,
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
    description: lead.type,
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
  const lead = state.leads.find((l) => l.id === id);
  state = {
    ...state,
    leads: state.leads.filter((l) => l.id !== id),
    rejected: lead
      ? [{ ...lead, archivedAt: Date.now() }, ...state.rejected]
      : state.rejected,
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
