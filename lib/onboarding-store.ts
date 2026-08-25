const KEY = "lp_partner_onboarding";

export type AccountType = "individual" | "business";
export type Role = "lawyer" | "rto";

export type OnboardingState = {
  accountType?: AccountType;
  roles?: Role[];
  personal?: {
    name?: string;
    dob?: string;
    email?: string;
    pincode?: string;
    address?: string;
    photo?: string;
  };
};

export function getOnboarding(): OnboardingState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OnboardingState) : {};
  } catch {
    return {};
  }
}

export function setOnboarding(patch: Partial<OnboardingState>) {
  if (typeof window === "undefined") return;
  const existing = getOnboarding();
  window.localStorage.setItem(KEY, JSON.stringify({ ...existing, ...patch }));
}

export function clearOnboarding() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
