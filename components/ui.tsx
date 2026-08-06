"use client";

import { ReactNode, ButtonHTMLAttributes, HTMLAttributes, ElementType } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============ TYPOGRAPHY ============
   All text should use these primitives (or the t-* utility classes)
   instead of arbitrary text-[Npx] values. */

type HeadingLevel = "display" | "h1" | "h2" | "h3";
type TextVariant = "body-lg" | "body" | "body-sm" | "caption" | "overline" | "micro";
type TextColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "inverse"
  | "brand"
  | "success"
  | "warning"
  | "error"
  | "info";

const scaleClass: Record<HeadingLevel | TextVariant, string> = {
  display: "t-display",
  h1: "t-h1",
  h2: "t-h2",
  h3: "t-h3",
  "body-lg": "t-body-lg",
  body: "t-body",
  "body-sm": "t-body-sm",
  caption: "t-caption",
  overline: "t-overline",
  micro: "t-micro",
};

const colorClass: Record<TextColor, string> = {
  primary: "text-neutral-800",
  secondary: "text-neutral-600",
  tertiary: "text-neutral-500",
  inverse: "text-white",
  brand: "text-primary-700",
  success: "text-success-bold",
  warning: "text-warning-bold",
  error: "text-error",
  info: "text-info-bold",
};

export function Heading({
  level = "h2",
  as,
  color = "primary",
  className,
  children,
}: {
  level?: HeadingLevel;
  as?: ElementType;
  color?: TextColor;
  className?: string;
  children: ReactNode;
}) {
  const Tag = (as ?? (level === "display" || level === "h1" ? "h1" : level === "h2" ? "h2" : "h3")) as ElementType;
  return (
    <Tag className={cn(scaleClass[level], colorClass[color], className)}>
      {children}
    </Tag>
  );
}

export function Text({
  variant = "body",
  as: Tag = "span",
  color = "secondary",
  weight,
  tabular,
  className,
  children,
}: {
  variant?: TextVariant;
  as?: ElementType;
  color?: TextColor;
  weight?: "normal" | "medium" | "semibold" | "bold";
  tabular?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const weightClass =
    weight === "medium"
      ? "font-medium"
      : weight === "semibold"
        ? "font-semibold"
        : weight === "bold"
          ? "font-bold"
          : undefined;
  return (
    <Tag
      className={cn(
        scaleClass[variant],
        colorClass[color],
        weightClass,
        tabular && "tabular",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/* ============ BUTTON ============ */
type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  href?: string;
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none rounded-xl";

const variantMap: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
  secondary:
    "bg-white text-neutral-800 border border-[var(--border-default)] hover:bg-neutral-50",
  ghost: "text-primary-600 hover:bg-primary-50",
  destructive: "bg-error text-white hover:bg-error-bold",
};

const sizeMap: Record<ButtonSize, string> = {
  sm: "h-9 px-3 t-body-sm",
  md: "h-11 px-4 t-body-lg",
  lg: "h-14 px-6 t-h3",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  leftIcon,
  rightIcon,
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    buttonBase,
    variantMap[variant],
    sizeMap[size],
    fullWidth && "w-full",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {leftIcon}
        <span>{children}</span>
        {rightIcon}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  );
}

/* ============ CARD ============ */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined" | "elevated" | "tinted";
  padding?: "sm" | "md" | "lg" | "none";
}

const cardVariants = {
  default: "bg-white border border-[var(--border-subtle)] shadow-e1",
  outlined: "bg-white border border-[var(--border-default)]",
  elevated: "bg-white shadow-e2",
  tinted: "bg-primary-50 border border-primary-100",
};

const cardPadding = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl",
        cardVariants[variant],
        cardPadding[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ============ CHIP / BADGE ============ */
type ChipTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "gold";

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone;
  size?: "sm" | "md";
  dot?: boolean;
}

const chipTone: Record<ChipTone, string> = {
  neutral: "bg-neutral-100 text-neutral-700",
  primary: "bg-primary-100 text-primary-700",
  success: "bg-success-subtle text-success-bold",
  warning: "bg-warning-subtle text-warning-bold",
  error: "bg-error-subtle text-error-bold",
  info: "bg-info-subtle text-info-bold",
  gold: "bg-accent-100 text-accent-700",
};

const chipDotColor: Record<ChipTone, string> = {
  neutral: "bg-neutral-400",
  primary: "bg-primary-500",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
  gold: "bg-accent-500",
};

export function Chip({
  tone = "neutral",
  size = "sm",
  dot = false,
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full whitespace-nowrap",
        chipTone[tone],
        size === "sm" ? "text-[11px] leading-[14px] px-2 py-0.5" : "t-body-sm px-3 py-1",
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", chipDotColor[tone])} />
      )}
      {children}
    </span>
  );
}

/* ============ SECTION LABEL ============ */
export function SectionLabel({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between px-1", className)}>
      <span className="t-caption font-semibold text-neutral-500">
        {children}
      </span>
      {action}
    </div>
  );
}

/* ============ LIST ROW ============ */
interface ListRowProps {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  href?: string;
  onClick?: () => void;
  showChevron?: boolean;
  className?: string;
  tone?: "default" | "warning" | "success" | "danger";
}

export function ListRow({
  icon,
  title,
  subtitle,
  right,
  href,
  onClick,
  showChevron = true,
  className,
  tone = "default",
}: ListRowProps) {
  const content = (
    <div
      className={cn(
        "flex items-center gap-3 py-3 px-4 min-h-[52px]",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 [&>svg]:w-4 [&>svg]:h-4",
            tone === "warning"
              ? "bg-warning-subtle text-warning-bold"
              : tone === "success"
                ? "bg-success-subtle text-success-bold"
                : tone === "danger"
                  ? "bg-error-subtle text-error-bold"
                  : "bg-neutral-100 text-neutral-600"
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="t-body font-medium text-neutral-800 truncate">
          {title}
        </div>
        {subtitle && (
          <div className="t-caption text-neutral-500 truncate mt-0.5">
            {subtitle}
          </div>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
      {showChevron && !right && (href || onClick) && (
        <ChevronRight size={16} className="text-neutral-300 shrink-0" />
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:bg-neutral-50/50">
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button onClick={onClick} className="block w-full text-left hover:bg-neutral-50/50">
        {content}
      </button>
    );
  }
  return content;
}

/* ============ DIVIDER ============ */
export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-[var(--border-subtle)]", className)} />;
}

/* ============ STICKY FOOTER CTA ============ */
export function StickyFooter({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 pt-3 pb-4">
      {children}
    </div>
  );
}

/* ============ AVATAR ============ */
export function Avatar({
  initials,
  size = 40,
  tone = "primary",
}: {
  initials: string;
  size?: number;
  tone?: "primary" | "accent" | "neutral";
}) {
  const bg =
    tone === "primary"
      ? "bg-primary-100 text-primary-700"
      : tone === "accent"
        ? "bg-accent-100 text-accent-700"
        : "bg-neutral-100 text-neutral-700";
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold",
        bg
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

/* ============ PROGRESS BAR ============ */
export function ProgressBar({
  value,
  tone = "primary",
}: {
  value: number;
  tone?: "primary" | "accent" | "success";
}) {
  const bg =
    tone === "primary"
      ? "bg-primary-600"
      : tone === "accent"
        ? "bg-accent-500"
        : "bg-success";
  return (
    <div className="h-3 w-full rounded-full bg-neutral-100 overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all", bg)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/* ============ STEPPER ============ */
export function Stepper({
  steps,
  current,
  className,
}: {
  steps: Array<{ label: string; icon?: ReactNode }>;
  current: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-2", className)}>
      {steps.map((s, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        const filled = done || active;
        return (
          <div
            key={s.label}
            className="flex-1 min-w-0 flex flex-col items-start gap-1.5"
            aria-current={active ? "step" : undefined}
          >
            {s.icon && (
              <div
                className={cn(
                  "transition-colors",
                  active
                    ? "text-primary-700"
                    : done
                      ? "text-primary-600"
                      : "text-neutral-400"
                )}
              >
                {s.icon}
              </div>
            )}
            <div
              className={cn(
                "w-full h-1.5 rounded-full transition-colors",
                filled ? "bg-primary-600" : "bg-neutral-200"
              )}
            />
            <div
              className={cn(
                "t-caption truncate max-w-full transition-colors",
                active
                  ? "text-primary-700 font-semibold"
                  : "text-neutral-400 font-medium"
              )}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============ TIMELINE ============ */
interface TimelineStep {
  label: string;
  time?: string;
  status: "done" | "current" | "pending";
}

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="relative">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3 pb-3 relative last:pb-0">
          {i < steps.length - 1 && (
            <div
              className={cn(
                "absolute left-[9px] top-5 w-px h-full -translate-x-1/2",
                step.status === "done" ? "bg-success" : "bg-neutral-200"
              )}
            />
          )}
          <div className="relative z-10 shrink-0 pt-0.5">
            {step.status === "done" ? (
              <div className="w-[18px] h-[18px] rounded-full bg-success flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5.5L4 7.5L8 3"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : step.status === "current" ? (
              <div className="w-[18px] h-[18px] rounded-full border-2 border-warning bg-warning-subtle flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              </div>
            ) : (
              <div className="w-[18px] h-[18px] rounded-full border-2 border-neutral-200 bg-white" />
            )}
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span
              className={cn(
                "t-body",
                step.status === "pending"
                  ? "text-neutral-400"
                  : "text-neutral-800 font-medium"
              )}
            >
              {step.label}
            </span>
            {step.time && (
              <span className="t-caption text-neutral-500 tabular">
                {step.time}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
