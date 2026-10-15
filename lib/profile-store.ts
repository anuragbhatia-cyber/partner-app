const KEY = "lp_partner_profile";

export type Gender = "male" | "female" | "other";

export type Address = {
  line?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
};

export type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: Gender | "";
  dob: string;
  currentAddress: Address;
  permanentSameAsCurrent: boolean;
  permanentAddress: Address;
  // legacy — retained so older stored records still deserialise
  fullName?: string;
};

const EMPTY_ADDRESS: Address = {
  line: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

const DEFAULT_PROFILE: Profile = {
  firstName: "Priya",
  lastName: "Sharma",
  email: "priya.sharma@lawyered.in",
  phone: "+91 98765 43210",
  gender: "female",
  dob: "1990-04-12",
  currentAddress: {
    line: "202, Prestige Meridian",
    area: "MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    country: "India",
  },
  permanentSameAsCurrent: true,
  permanentAddress: { ...EMPTY_ADDRESS },
};

export function getProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<Profile>;
    // Backfill from legacy single-name field if present
    let firstName = parsed.firstName;
    let lastName = parsed.lastName;
    if ((!firstName || !lastName) && parsed.fullName) {
      const [legacyFirst = "", ...rest] = parsed.fullName.trim().split(/\s+/);
      firstName = firstName || legacyFirst;
      lastName = lastName || rest.join(" ");
    }
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      firstName: firstName ?? DEFAULT_PROFILE.firstName,
      lastName: lastName ?? DEFAULT_PROFILE.lastName,
      currentAddress: {
        ...DEFAULT_PROFILE.currentAddress,
        ...(parsed.currentAddress ?? {}),
      },
      permanentAddress: {
        ...EMPTY_ADDRESS,
        ...(parsed.permanentAddress ?? {}),
      },
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function setProfile(patch: Partial<Profile>) {
  if (typeof window === "undefined") return;
  const existing = getProfile();
  const next: Profile = { ...existing, ...patch };
  next.fullName = `${next.firstName} ${next.lastName}`.trim();
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
