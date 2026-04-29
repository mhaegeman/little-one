import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "sage" | "warm" | "sky" | "sand" | "success" | "warning" | "danger";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-sunken text-muted ring-border",
  sage: "bg-sage-100 text-sage-700 ring-sage-200",
  warm: "bg-warm-50 text-warm-600 ring-warm-100",
  sky: "bg-sky-100 text-info ring-sky-200",
  sand: "bg-sand-100 text-muted ring-sand-200",
  success: "bg-sage-100 text-success ring-sage-200",
  warning: "bg-[#FBF1D9] text-warning ring-[#F0DFB1]",
  danger: "bg-warm-50 text-danger ring-warm-100"
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
