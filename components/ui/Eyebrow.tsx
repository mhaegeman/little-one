import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type EyebrowTone = "subtle" | "muted" | "ink" | "mint" | "peach" | "butter" | "sky";

const toneClasses: Record<EyebrowTone, string> = {
  subtle: "text-subtle",
  muted: "text-muted",
  ink: "text-ink",
  mint: "text-mint-ink",
  peach: "text-peach-ink",
  butter: "text-butter-ink",
  sky: "text-sky-ink"
};

type EyebrowProps = HTMLAttributes<HTMLDivElement> & {
  tone?: EyebrowTone;
  children: ReactNode;
};

export function Eyebrow({
  tone = "subtle",
  className,
  children,
  ...props
}: EyebrowProps) {
  return (
    <div
      className={cn(
        "font-sans text-eyebrow font-bold uppercase",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type EyebrowBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "mint" | "peach" | "butter" | "sky";
  pulse?: boolean;
  children: ReactNode;
};

const badgeTones: Record<NonNullable<EyebrowBadgeProps["tone"]>, string> = {
  mint: "bg-mint-50 text-mint-ink shadow-[inset_0_0_0_1.5px_var(--mint-ring)] [--mint-ring:#C2E1CB]",
  peach:
    "bg-peach-50 text-peach-ink shadow-[inset_0_0_0_1.5px_var(--peach-ring)] [--peach-ring:#F7D2BE]",
  butter:
    "bg-butter-50 text-butter-ink shadow-[inset_0_0_0_1.5px_var(--butter-ring)] [--butter-ring:#F7DC9C]",
  sky: "bg-sky-50 text-sky-ink shadow-[inset_0_0_0_1.5px_var(--sky-ring)] [--sky-ring:#C2D8E5]"
};

const pulseClasses: Record<NonNullable<EyebrowBadgeProps["tone"]>, string> = {
  mint: "bg-mint-300",
  peach: "bg-peach-300",
  butter: "bg-butter-300",
  sky: "bg-sky-300"
};

export function EyebrowBadge({
  tone = "mint",
  pulse = false,
  className,
  children,
  ...props
}: EyebrowBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-pill px-5 py-3 text-sm font-semibold tracking-[-0.005em]",
        badgeTones[tone],
        className
      )}
      {...props}
    >
      {pulse ? (
        <span
          aria-hidden="true"
          className={cn("h-2.5 w-2.5 shrink-0 rounded-full", pulseClasses[tone])}
        />
      ) : null}
      {children}
    </span>
  );
}
