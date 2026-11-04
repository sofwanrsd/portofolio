import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------------- Container ---------------- */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5", className)}>{children}</div>
  );
}

/* ---------------- Section ---------------- */
export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-16 md:py-24", className)}>
      {children}
    </section>
  );
}

/* ---------------- Section heading ---------------- */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-3 md:mb-14",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
            <span className="accent-gradient h-1.5 w-1.5 rounded-full" />
            {eyebrow}
          </span>
        )}
        <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ---------------- Button ---------------- */
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--fg)] text-[var(--bg)] hover:opacity-90 shadow-sm",
  secondary:
    "bg-[var(--accent)] text-white hover:brightness-110 shadow-sm",
  outline:
    "border border-[var(--border)] text-[var(--fg)] hover:border-[var(--accent)] hover:bg-[var(--border)]/40",
  ghost: "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--border)]/40",
};

export function Button({
  children,
  href,
  variant = "primary",
  className,
  size = "md",
  ...rest
}: {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
  size?: "sm" | "md" | "lg";
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "ref">) {
  const sizes = {
    sm: "h-9 px-3.5 text-[13px]",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-[15px]",
  }[size];

  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-50",
    sizes,
    BUTTON_STYLES[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

/* ---------------- Badge ---------------- */
export function Badge({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "accent" | "outline";
}) {
  const variants = {
    default: "bg-[var(--border)]/50 text-[var(--muted)]",
    accent:
      "bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] text-[var(--accent)]",
    outline: "border border-[var(--border)] text-[var(--muted)]",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-medium",
        variants,
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---------------- Card ---------------- */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)]",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ---------------- Empty state ---------------- */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-base)] border border-dashed border-[var(--border)] px-6 py-16 text-center">
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-[13px] text-[var(--muted)]">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
