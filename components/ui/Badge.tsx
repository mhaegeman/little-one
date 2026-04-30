import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "neutral"
  | "mint"
  | "peach"
  | "butter"
  | "sky"
  | "ink"
  | "sage"
  | "warm"
  | "sand"
  | "success"
  | "warning"
  | "danger";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-sunken text-muted ring-border",
  mint: "bg-mint-50 text-mint-ink ring-mint-100",
  peach: "bg-peach-50 text-peach-ink ring-peach-100",
  butter: "bg-butter-50 text-butter-ink ring-butter-100",
  sky: "bg-sky-50 text-sky-ink ring-sky-100",
  ink: "bg-ink text-canvas ring-ink",
  // Legacy tones — kept for surfaces not yet migrated.
  sage: "bg-mint-50 text-mint-ink ring-mint-100",
  warm: "bg-peach-50 text-peach-ink ring-peach-100",
  sand: "bg-sand-100 text-muted ring-sand-200",
  success: "bg-mint-50 text-mint-ink ring-mint-100",
  warning: "bg-butter-50 text-butter-ink ring-butter-100",
  danger: "bg-peach-50 text-peach-ink ring-peach-100"
};

export function Badge({
  children,
  variant = "neutral",
  className
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide ring-1",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
