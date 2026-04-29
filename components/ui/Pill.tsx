import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PillTone =
  | "default"
  | "sunken"
  | "mint"
  | "peach"
  | "butter"
  | "sky"
  | "ink";

type PillSize = "sm" | "md";

const toneClasses: Record<PillTone, string> = {
  default: "bg-surface text-ink ring-border",
  sunken: "bg-sunken text-ink ring-hairline",
  mint: "bg-mint-50 text-mint-ink ring-mint-100",
  peach: "bg-peach-50 text-peach-ink ring-peach-100",
  butter: "bg-butter-50 text-butter-ink ring-butter-100",
  sky: "bg-sky-50 text-sky-ink ring-sky-100",
  ink: "bg-ink text-canvas ring-ink"
};

const toneSelectedClasses: Record<PillTone, string> = {
  default: "bg-ink text-canvas ring-ink",
  sunken: "bg-ink text-canvas ring-ink",
  mint: "bg-mint-300 text-mint-ink ring-mint-300",
  peach: "bg-peach-300 text-peach-ink ring-peach-300",
  butter: "bg-butter-300 text-butter-ink ring-butter-300",
  sky: "bg-sky-300 text-sky-ink ring-sky-300",
  ink: "bg-ink text-canvas ring-ink"
};

const sizeClasses: Record<PillSize, string> = {
  sm: "h-6 px-2.5 text-2xs",
  md: "h-[30px] px-3 text-xs"
};

const baseClass =
  "inline-flex items-center gap-1.5 rounded-pill font-semibold tracking-[-0.005em] ring-1 whitespace-nowrap transition-colors duration-150 ease-nordic";

type PillCommon = {
  children: ReactNode;
  tone?: PillTone;
  size?: PillSize;
  icon?: ReactNode;
  selected?: boolean;
};

type StaticPillProps = HTMLAttributes<HTMLSpanElement> &
  PillCommon & {
    interactive?: false;
  };

type InteractivePillProps = ButtonHTMLAttributes<HTMLButtonElement> &
  PillCommon & {
    interactive: true;
  };

export type PillProps = StaticPillProps | InteractivePillProps;

export function Pill(props: PillProps) {
  const {
    children,
    tone = "default",
    size = "md",
    icon,
    selected = false,
    className,
    interactive,
    ...rest
  } = props as PillCommon &
    (HTMLAttributes<HTMLElement> & { interactive?: boolean });

  const classes = cn(
    baseClass,
    sizeClasses[size],
    selected ? toneSelectedClasses[tone] : toneClasses[tone],
    interactive && "focus-ring cursor-pointer",
    className
  );

  if (interactive) {
    return (
      <button
        type="button"
        aria-pressed={selected || undefined}
        className={classes}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {icon ? (
          <span aria-hidden="true" className="grid place-items-center">
            {icon}
          </span>
        ) : null}
        {children}
      </button>
    );
  }

  return (
    <span className={classes} {...(rest as HTMLAttributes<HTMLSpanElement>)}>
      {icon ? (
        <span aria-hidden="true" className="grid place-items-center">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}
