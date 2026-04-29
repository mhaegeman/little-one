import type { SelectHTMLAttributes } from "react";
import { forwardRef } from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...props },
  ref
) {
  return (
    <span className="relative block">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-lg bg-surface px-3 pr-9 text-sm text-ink ring-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sage-400",
          invalid ? "ring-danger" : "ring-border",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <CaretDown
        size={14}
        weight="bold"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-subtle"
        aria-hidden="true"
      />
    </span>
  );
});
