const KEY = "lp_partner_onboarding";

export type AccountType = "individual" | "business";
export type Role = "lawyer" | "rto";
export type Gender = "male" | "female" | "other";

export type Address = {
  line?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
};

export type Qualification = {
  id: string;
  degree?: string;
  university?: string;
  yearOfCompletion?: string;
  percentage?: string;
};

export type Experience = {
  id: string;
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  functionalArea?: string;
};

export type OnboardingState = {
  accountType?: AccountType;
  roles?: Role[];
  expertise?: string[];
  personal?: {
    photo?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
    gender?: Gender;
    dob?: string;
    currentAddress?: Address;
    permanentSameAsCurrent?: boolean;
    permanentAddress?: Address;
    // legacy — retained so older stored records still deserialise
    name?: string;
    pincode?: string;
    address?: string;
  };
  business?: {
    businessType?: string;
    companyName?: string;
    gstin?: string;
    pincode?: string;
    address?: string;
  };
  qualifications?: Qualification[];
  experiences?: Experience[];
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
