"use client";

import {
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  MessageSquare,
  Navigation2,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityTone = "primary" | "success" | "warning" | "error" | "neutral";

export type HistoryActivity = {
  id: string;
  icon: LucideIcon;
  tone?: ActivityTone;
  title: string;
  description?: string;
  actor?: string;
  at: string;
};

const toneBg: Record<ActivityTone, string> = {
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-subtle text-success-bold",
  warning: "bg-warning-subtle text-warning-bold",
  error: "bg-error-subtle text-error-bold",
  neutral: "bg-neutral-100 text-neutral-600",
};

const toneConnector: Record<ActivityTone, string> = {
  primary: "bg-primary-200",
  success: "bg-success/40",
  warning: "bg-warning/40",
  error: "bg-error/40",
  neutral: "bg-neutral-200",
};

const DEFAULT_HISTORY: HistoryActivity[] = [
  {
    id: "h-accepted",
    icon: CheckCircle2,
    tone: "success",
    title: "Case accepted",
    description: "Vikram Rao accepted this incident.",
    actor: "Vikram Rao",
    at: "Today, 10:24",
  },
  {
    id: "h-enroute",
    icon: Navigation2,
    tone: "primary",
    title: "En route to location",
    description: "MG Road · ETA 12 min",
    at: "Today, 10:28",
  },
  {
    id: "h-arrived",
    icon: Clock,
    tone: "primary",
    title: "Arrived on scene",
    description: "Marked arrival at MG Road.",
    at: "Today, 10:41",
  },
  {
    id: "h-chat1",
    icon: MessageSquare,
    tone: "neutral",
    title: "Chat message to support",
    description: "Reached MG Road for the challan handover…",
    actor: "You",
    at: "Today, 10:46",
  },
  {
    id: "h-assigned",
    icon: Users,
    tone: "primary",
    title: "Assigned to Priya · Support",
    description: "Thread owner updated.",
    at: "Today, 10:48",
  },
  {
    id: "h-docs-req",
    icon: FileText,
    tone: "warning",
    title: "Documents requested from client",
    description: "Driving licence, RC, Original challan.",
    actor: "You",
    at: "Today, 10:52",
  },
  {
    id: "h-docs-recv",
    icon: FileCheck2,
    tone: "success",
    title: "Documents received",
    description: "3 files uploaded to the case file.",
    at: "Today, 11:02",
  },
  {
    id: "h-dispute",
    icon: FileText,
    tone: "primary",
    title: "Dispute PDF shared by support",
    description: "dispute-form-MH012024.pdf · 412 KB",
    actor: "Priya · Support",
    at: "Today, 11:14",
  },
];

export function IncidentHistoryPanel({
  activities = DEFAULT_HISTORY,
  closingEvent,
}: {
  activities?: HistoryActivity[];
  closingEvent?: HistoryActivity;
}) {
  const items = closingEvent ? [...activities, closingEvent] : activities;
  return (
    <div className="space-y-1">
      <div className="t-caption font-semibold text-neutral-500 px-1 mb-2">
        Activity ({items.length})
      </div>
      <div className="rounded-xl bg-white border border-[var(--border-subtle)] px-3 py-3">
        {items.map((a, i) => (
          <ActivityRow
            key={a.id}
            activity={a}
            isLast={i === items.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityRow({
  activity,
  isLast,
}: {
  activity: HistoryActivity;
  isLast: boolean;
}) {
  const Icon = activity.icon;
  const tone = activity.tone ?? "neutral";
  return (
    <div className="flex gap-3 relative pb-4 last:pb-0">
      {!isLast && (
        <div
          className={cn(
            "absolute left-[17px] top-8 bottom-0 w-px -translate-x-1/2",
            toneConnector[tone]
          )}
        />
      )}
      <div
        className={cn(
          "relative z-10 shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          toneBg[tone]
        )}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <div className="t-body-sm font-semibold text-neutral-800 truncate">
            {activity.title}
          </div>
          <div className="shrink-0 t-micro tabular text-neutral-500">
            {activity.at}
          </div>
        </div>
        {activity.description && (
          <p className="mt-0.5 t-caption text-neutral-600 leading-snug">
            {activity.description}
          </p>
        )}
        {activity.actor && (
          <div className="mt-0.5 t-micro text-neutral-500">
            by {activity.actor}
          </div>
        )}
      </div>
    </div>
  );
}

export const COMPLETED_CLOSING_EVENT: HistoryActivity = {
  id: "h-closed",
  icon: CheckCircle2,
  tone: "success",
  title: "Case marked complete",
  description: "Payout credited to wallet.",
  actor: "Vikram Rao",
  at: "Today, 11:18",
};

export const CANCELLED_CLOSING_EVENT: HistoryActivity = {
  id: "h-cancelled",
  icon: XCircle,
  tone: "error",
  title: "Case cancelled",
  description: "Client no-show at pickup point.",
  actor: "Vikram Rao",
  at: "Yesterday, 15:00",
};
