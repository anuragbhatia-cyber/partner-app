let pendingCase: string | null = null;
let pendingAt = 0;

const FRESH_WINDOW_MS = 2000;

export function requestOpenChatOnIncident(caseId: string) {
  pendingCase = caseId;
  pendingAt = Date.now();
}

/** Returns the pending case ID only if it was requested within the last 2 seconds. */
export function peekRecentOpenChatRequest(): string | null {
  if (!pendingCase) return null;
  if (Date.now() - pendingAt > FRESH_WINDOW_MS) return null;
  return pendingCase;
}
