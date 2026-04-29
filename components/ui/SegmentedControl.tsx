"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SegmentedOption<T extends string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className
}: {
  value: T;
  onChange: (next: T) => void;
  options: SegmentedOption<T>[];
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg bg-sunken p-0.5 ring-1 ring-hairline",
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "focus-ring inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors duration-150 ease-nordic",
              active
                ? "bg-surface text-ink shadow-sm"
                : "text-muted hover:text-ink"
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
