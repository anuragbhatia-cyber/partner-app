export const ONBOARDING_STEPS = [
  { label: "Account Type", href: "/account-type" },
  { label: "Expertise", href: "/role" },
  { label: "Personal", href: "/onboarding/personal" },
  { label: "Documents", href: "/onboarding/documents" },
] as const;

export const ONBOARDING_TOTAL = ONBOARDING_STEPS.length;

export function OnboardingStepBar({
  current,
  label,
  stepNumber,
  total = ONBOARDING_TOTAL,
}: {
  current: number;
  label: string;
  stepNumber?: number;
  total?: number;
}) {
  return (
    <div>
      <div className="t-body-sm font-medium text-neutral-500 mb-2">
        Step {stepNumber ?? current}: {label}
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => {
          const stepNum = i + 1;
          const step = ONBOARDING_STEPS[i];
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
