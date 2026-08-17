export const ONBOARDING_STEPS = [
  { label: "Expertise" },
  { label: "Personal" },
  { label: "Documents" },
];

export const ONBOARDING_TOTAL = 3;

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
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full ${
              i < current ? "bg-success" : "bg-neutral-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
