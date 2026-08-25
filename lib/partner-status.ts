const KEY = "lp_partner_status";

export type PartnerStatus = "online" | "offline";

export function getStatus(): PartnerStatus {
  if (typeof window === "undefined") return "online";
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw === "offline" ? "offline" : "online";
  } catch {
    return "online";
  }
}

export function setStatus(status: PartnerStatus) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, status);
}
