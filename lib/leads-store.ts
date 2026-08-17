"use client";

import { useSyncExternalStore } from "react";

export type LeadCategory = "case" | "challan" | "rto";
export type LeadUrgency = "high" | "medium" | "low";

export type Lead = {
  id: string;
  type: string;
  category: LeadCategory;
  amount: number;
  payoutRange?: [number, number];
  distanceKm: number;
  area: string;
  postedMinAgo: number;
  urgency: LeadUrgency;
  vehicle: string;
  description: string;
};

export type ActiveIncident = {
  caseId: string;
  vehicle: string;
  description: string;
  status: "IN PROGRESS" | "EN ROUTE" | "ARRIVED" | "ACCEPTED";
  deadlineDays: number;
  category?: LeadCategory;
  amount?: number;
  area?: string;
  assignedAt?: number;
};

type State = {
  leads: Lead[];
  assigned: ActiveIncident[];
};

const SEED_LEADS: Lead[] = [
  {
    id: "LEAD-2311",
    type: "Traffic Challan",
    category: "challan",
    amount: 500,
    distanceKm: 3.2,
    area: "MG Road",
    postedMinAgo: 2,
    urgency: "high",
    vehicle: "KA05MJ4421",
    description:
      "Running a red light at the intersection of MG Road and Brigade Road.",
  },
  {
    id: "LEAD-2310",
    type: "RTO Renewal",
    category: "rto",
    amount: 160,
    payoutRange: [140, 180],
    distanceKm: 5.8,
    area: "Koramangala",
    postedMinAgo: 6,
    urgency: "medium",
    vehicle: "KA03NP7788",
    description: "RC renewal & fitness certificate at Koramangala RTO office.",
  },
  {
    id: "LEAD-2309",
    type: "Accident Response",
    category: "case",
    amount: 900,
    distanceKm: 1.4,
    area: "HSR Layout",
    postedMinAgo: 8,
    urgency: "high",
    vehicle: "KA51AB1234",
    description:
      "Rear-end collision on the Outer Ring Road near HSR Layout junction.",
  },
  {
    id: "LEAD-2308",
    type: "Vehicle Transfer",
    category: "rto",
    amount: 175,
    payoutRange: [150, 200],
    distanceKm: 4.6,
    area: "Indiranagar",
    postedMinAgo: 14,
    urgency: "medium",
    vehicle: "KA02CD5678",
    description: "Ownership transfer documentation at Indiranagar RTO.",
  },
  {
    id: "LEAD-2307",
    type: "Challan Dispute",
    category: "challan",
    amount: 250,
    distanceKm: 7.9,
    area: "BTM Layout",
    postedMinAgo: 22,
    urgency: "low",
    vehicle: "KA04EF9012",
    description: "Overspeeding challan disputed — client requests review.",
  },
  {
    id: "LEAD-2306",
    type: "Court Appearance",
    category: "case",
    amount: 1500,
    distanceKm: 2.1,
    area: "Shivajinagar",
    postedMinAgo: 34,
    urgency: "high",
    vehicle: "KA01GH3456",
    description:
      "Court appearance scheduled at City Civil Court for pending challan hearing.",
  },
  {
    id: "LEAD-2305",
    type: "RC Renewal",
    category: "rto",
    amount: 125,
    payoutRange: [100, 150],
    distanceKm: 6.4,
    area: "Jayanagar",
    postedMinAgo: 51,
    urgency: "low",
    vehicle: "KA06IJ7890",
    description: "RC renewal for 2019 hatchback at Jayanagar RTO.",
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
  },
  {
    caseId: "IRN-100843",
    vehicle: "MH012024789457",
    description:
      "Rear-end collision on the Outer Ring Road near Silk Board junction.",
    status: "EN ROUTE",
    deadlineDays: 1,
    category: "case",
  },
  {
    caseId: "IRN-100844",
    vehicle: "MH012024789458",
    description:
      "RTO documentation pending for ownership transfer at Koramangala office.",
    status: "ARRIVED",
    deadlineDays: 5,
    category: "rto",
  },
  {
    caseId: "IRN-100845",
    vehicle: "MH012024789459",
    description:
      "Court appearance scheduled at City Civil Court for pending challan hearing.",
    status: "ACCEPTED",
    deadlineDays: 15,
    category: "case",
  },
];

let state: State = { leads: SEED_LEADS, assigned: SEED_ASSIGNED };
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

export function useLeadsStore(): State {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function assignLead(id: string) {
  const lead = state.leads.find((l) => l.id === id);
  if (!lead) return;
  const incident: ActiveIncident = {
    caseId: nextIrn(),
    vehicle: lead.vehicle,
    description: lead.description,
    status: "ACCEPTED",
    deadlineDays: lead.urgency === "high" ? 2 : lead.urgency === "medium" ? 5 : 10,
    category: lead.category,
    amount: lead.amount,
    area: lead.area,
    assignedAt: Date.now(),
  };
  state = {
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
