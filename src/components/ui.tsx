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
    <section id={id} className={cn("py-20 md:py-28", className)}>
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
  align?: "left" | "center" | "split";
  action?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-12 flex flex-col gap-5 md:mb-16",
        centered
          ? "items-center text-center"
          : align === "split"
            ? "md:flex-row md:items-end md:justify-between"
            : "items-start"
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {eyebrow && (
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--glass)] px-3 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-[var(--muted)] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
            {eyebrow}
          </span>
        )}
        <h2 className="text-balance text-[clamp(1.9rem,4.2vw,3.15rem)] font-semibold leading-[1.04] tracking-[-0.035em]">
          <AccentTitle text={title} />
        </h2>
        {description && (
          <p
            className={cn(
              "mt-4 text-[15px] leading-relaxed text-[var(--muted)] md:text-[15.5px]",
              centered ? "mx-auto max-w-xl" : "max-w-xl"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Kata terakhir judul dibuat serif miring oranye, kesan editorial. */
function AccentTitle({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return <>{text}</>;
  const last = words.pop();
  return (
    <>
      {words.join(" ")}{" "}
      <span className="font-display pr-1 text-[1.1em] text-[var(--accent)]">{last}</span>
    </>
  );
}

/* ---------------- Button ---------------- */
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary:
    "accent-gradient text-[var(--on-accent)] font-semibold shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--accent)_90%,transparent)] hover:brightness-110",
  secondary:
    "bg-[var(--fg)] text-[var(--bg)] hover:opacity-90 shadow-sm",
  outline:
    "border border-[var(--border)] bg-[var(--glass)] text-[var(--fg)] backdrop-blur-sm hover:border-[var(--accent)]/60 hover:bg-[var(--border)]/40",
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
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50",
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
    default: "bg-[var(--glass)] text-[var(--muted)] ring-1 ring-inset ring-[var(--border)]",
    accent:
      "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-[var(--accent)] ring-1 ring-inset ring-[color-mix(in_oklab,var(--accent)_35%,transparent)]",
    outline: "border border-[var(--border)] text-[var(--muted)]",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors",
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
        "surface rounded-[var(--radius-base)] ring-1 ring-inset ring-[var(--border)]",
        "transition-[transform,box-shadow,border-color] duration-300",
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
