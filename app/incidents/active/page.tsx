"use client";

import { PhoneFrame, AppBar } from "@/components/PhoneFrame";
import {
  Button,
  Card,
  Chip,
  SectionLabel,
  Timeline,
} from "@/components/ui";
import {
  MoreVertical,
  Phone,
  MessageCircle,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useState } from "react";

type Tab = "details" | "notes";

export default function IncidentActivePage() {
  const [tab, setTab] = useState<Tab>("details");

  return (
    <PhoneFrame label="Incident · In Progress">
      <AppBar
        back
        href="/incidents"
        title="LWD-00842"
        action={
          <button className="w-10 h-10 flex items-center justify-center rounded-full">
            <MoreVertical size={20} className="text-neutral-700" />
          </button>
        }
      />

      <div className="px-4 pt-3 pb-3">
        <div className="flex bg-neutral-100 rounded-xl p-1">
          <TabButton active={tab === "details"} onClick={() => setTab("details")}>
            Details
          </TabButton>
          <TabButton active={tab === "notes"} onClick={() => setTab("notes")}>
            Notes
          </TabButton>
        </div>
      </div>

      <div className="px-4 py-4 pb-32 space-y-4">
        {tab === "details" ? <DetailsPanel /> : <NotesPanel />}
      </div>

      <div className="sticky bottom-0 z-20 mt-auto bg-white border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          href="/incidents/complete"
          rightIcon={<ChevronRight size={18} />}
        >
          Mark Complete
        </Button>
      </div>
    </PhoneFrame>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 h-10 rounded-lg t-body-sm font-semibold transition-all inline-flex items-center justify-center ${
        active
          ? "bg-white text-neutral-800 shadow-e1"
          : "text-neutral-500 hover:text-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}

function DetailsPanel() {
  return (
    <>
      {/* Status ribbon */}
      <div className="-mx-4 -mt-4 mb-4 px-4 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Chip tone="warning" dot>
            IN PROGRESS
          </Chip>
          <span className="t-caption text-neutral-600 font-medium">
            2 days elapsed
          </span>
        </div>
        <Chip tone="error" size="sm">HIGH</Chip>
      </div>

      {/* Incident details grid */}
      <Card padding="lg">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <Field label="Incident ID" value={<span className="font-mono">IRN-12345</span>} />
          <Field label="Challan Number" value={<span className="font-mono">MH012024789456</span>} />

          <Field
            label="Vehicle Number"
            value={<span className="font-mono">MH01AB1234</span>}
          />
          <Field label="State" value="Maharashtra" />

          <Field label="Type" value="Bulk" />
          <Field label="Challan" value="Court" />

          <Field label="Fine Amount" value={<span className="font-mono">₹2,500</span>} />
          <Field label="Created At" value="09 Jul 2026, 03:00 pm" />

          <Field label="Last Updated" value="09 Jul 2026, 03:00 pm" />
          <Field
            label="TAT Deadline"
            value={<span className="font-semibold text-error">20 Aug 2026</span>}
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
              <div className="t-caption text-neutral-500">
                RTO Coordinator · AGT-2456
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full bg-success-subtle flex items-center justify-center text-success-bold">
                <Phone size={14} />
              </button>
              <button className="w-9 h-9 rounded-full bg-info-subtle flex items-center justify-center text-info-bold">
                <MessageCircle size={14} />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Timeline mini */}
      <div>
        <SectionLabel className="mb-2">Timeline</SectionLabel>
        <Card>
          <Timeline
            steps={[
              { label: "Accepted", time: "10:24", status: "done" },
              { label: "En route", time: "10:26", status: "done" },
              { label: "Arrived", time: "10:38", status: "done" },
              { label: "In progress", time: "10:41", status: "current" },
              { label: "Completed", status: "pending" },
            ]}
          />
        </Card>
      </div>
    </>
  );
}

function NotesPanel() {
  const [notes, setNotes] = useState([
    {
      id: "n1",
      time: "10:42",
      body: "Client has previous challan history, will need to fetch records from RTO before filing dispute.",
    },
    {
      id: "n2",
      time: "10:38",
      body: "Arrived at MG Road; parking taken care of. Client waiting near metro exit.",
    },
  ]);
  const [draft, setDraft] = useState("");

  const wordCount = (s: string) =>
    s.trim().split(/\s+/).filter(Boolean).length;

  const addNote = () => {
    const body = draft.trim();
    if (!body) return;
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    setNotes((prev) => [
      { id: `n${prev.length + 1}`, time: `${hh}:${mm}`, body },
      ...prev,
    ]);
    setDraft("");
  };

  return (
    <>
      <div>
        <SectionLabel className="mb-2">Add a note</SectionLabel>
        <Card padding="md">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Capture what you saw or agreed with the client…"
            rows={4}
            className="w-full t-body text-neutral-800 placeholder:text-neutral-400 resize-none bg-transparent focus:outline-none"
          />
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
            <span className="t-caption text-neutral-500">
              {wordCount(draft)} word{wordCount(draft) === 1 ? "" : "s"}
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={addNote}
              disabled={!draft.trim()}
              leftIcon={<Plus size={14} />}
            >
              Save note
            </Button>
          </div>
        </Card>
      </div>

      <div>
        <SectionLabel className="mb-2">History ({notes.length})</SectionLabel>
        <div className="space-y-2">
          {notes.map((n) => (
            <Card key={n.id}>
              <div className="t-body-sm text-neutral-700 leading-relaxed">
                {n.body}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
                <span className="t-caption text-neutral-500">
                  {n.time} · {wordCount(n.body)} words
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setNotes((prev) => prev.filter((x) => x.id !== n.id))
                  }
                  className="t-caption font-semibold text-neutral-500 hover:text-error-bold"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
          {notes.length === 0 && (
            <Card padding="lg" className="text-center">
              <div className="t-body-sm text-neutral-400">No notes yet</div>
            </Card>
          )}
        </div>
      </div>
    </>
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

