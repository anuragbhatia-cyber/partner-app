const KEY = "lp_partner_session";
const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type Session = {
  phone: string;
  createdAt: number;
  expiresAt: number;
};

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!parsed.phone || !parsed.createdAt) return null;
    return {
      phone: parsed.phone,
      createdAt: parsed.createdAt,
      expiresAt: parsed.expiresAt ?? parsed.createdAt + DEFAULT_TTL_MS,
    };
  } catch {
    return null;
  }
}

export function setSession(
  input: { phone: string; createdAt: number; expiresAt?: number }
) {
  if (typeof window === "undefined") return;
  const session: Session = {
    phone: input.phone,
    createdAt: input.createdAt,
    expiresAt: input.expiresAt ?? input.createdAt + DEFAULT_TTL_MS,
  };
  window.localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function isSessionValid(session: Session | null): boolean {
  if (!session) return false;
  return session.expiresAt > Date.now();
}

export function getValidSession(): Session | null {
  const s = getSession();
  if (!s) return null;
  if (!isSessionValid(s)) {
    clearSession();
    return null;
  }
  return s;
}
