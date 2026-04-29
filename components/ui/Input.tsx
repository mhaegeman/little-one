import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leadingIcon, trailingIcon, invalid, ...props },
  ref
) {
  if (leadingIcon || trailingIcon) {
    return (
      <span
        className={cn(
          "flex h-10 items-center gap-2 rounded-lg bg-surface px-3 ring-1 transition-colors",
          invalid ? "ring-danger" : "ring-border focus-within:ring-sage-400",
          className
        )}
      >
        {leadingIcon ? (
          <span className="grid place-items-center text-subtle">{leadingIcon}</span>
        ) : null}
        <input
          ref={ref}
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-subtle"
          {...props}
        />
        {trailingIcon ? (
          <span className="grid place-items-center text-subtle">{trailingIcon}</span>
        ) : null}
      </span>
    );
  }
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg bg-surface px-3 text-sm text-ink ring-1 outline-none transition-colors placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-sage-400",
        invalid ? "ring-danger" : "ring-border",
        className
      )}
      {...props}
    />
  );
});
