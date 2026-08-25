const KEY = "lp_partner_profile";

export type Profile = {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
};

const DEFAULT_PROFILE: Profile = {
  fullName: "Advocate Priya Sharma",
  email: "priya.sharma@lawyered.in",
  phone: "+91 98765 43210",
  dob: "1990-04-12",
};

export function getProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<Profile>;
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function setProfile(patch: Partial<Profile>) {
  if (typeof window === "undefined") return;
  const existing = getProfile();
  const next: Profile = { ...existing, ...patch };
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
