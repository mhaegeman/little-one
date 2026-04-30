"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TabItem<T extends string> = {
  id: T;
  label: ReactNode;
  icon?: ReactNode;
};

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  ariaLabel,
  className
}: {
  value: T;
  onChange: (next: T) => void;
  items: TabItem<T>[];
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex gap-1 border-b border-hairline", className)}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "focus-ring relative inline-flex h-10 items-center gap-2 px-3 text-sm font-semibold transition-colors duration-150 ease-nordic",
              active ? "text-ink" : "text-muted hover:text-ink"
            )}
          >
            {item.icon}
            {item.label}
            {active ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-mint-300"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
