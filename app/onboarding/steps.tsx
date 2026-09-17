import type { AccountType } from "@/lib/onboarding-store";

type Step = { label: string; href: string };

const BASE_STEPS: Step[] = [
  { label: "Account Type", href: "/account-type" },
  { label: "Expertise", href: "/role" },
  { label: "Personal", href: "/onboarding/personal" },
  { label: "Documents", href: "/onboarding/documents" },
];

const BUSINESS_STEPS: Step[] = [
  { label: "Account Type", href: "/account-type" },
  { label: "Expertise", href: "/role" },
  { label: "Personal", href: "/onboarding/personal" },
  { label: "Business", href: "/onboarding/business" },
  { label: "Documents", href: "/onboarding/documents" },
];

export function getOnboardingSteps(accountType?: AccountType): Step[] {
  return accountType === "business" ? BUSINESS_STEPS : BASE_STEPS;
}

export const ONBOARDING_STEPS = BASE_STEPS;
export const ONBOARDING_TOTAL = BASE_STEPS.length;

export function OnboardingStepBar({
  current,
  label,
  stepNumber,
  steps = BASE_STEPS,
}: {
  current: number;
  label: string;
  stepNumber?: number;
  steps?: Step[];
}) {
  const total = steps.length;
  return (
    <div>
      <div className="t-body-sm font-medium text-neutral-500 mb-2">
        Step {stepNumber ?? current}: {label}
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => {
          const stepNum = i + 1;
          const step = steps[i];
          const done = stepNum < current;
          const filled = done || stepNum === current;
          const canEdit = done && !!step?.href;

          const barClass = `flex-1 h-1.5 rounded-full transition-colors ${
            filled ? "bg-success" : "bg-neutral-200"
          }`;

          if (canEdit) {
            return (
              <a
                key={i}
                href={step.href}
                aria-label={`Edit ${step.label}`}
                title={`Edit ${step.label}`}
                className={`${barClass} hover:opacity-80 focus-visible:outline-2 focus-visible:outline-primary-600 rounded-full`}
              />
            );
          }
          return <div key={i} className={barClass} />;
        })}
      </div>
    </div>
  );
}
