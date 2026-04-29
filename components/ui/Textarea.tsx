import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, rows = 4, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full rounded-lg bg-surface px-3 py-2 text-sm text-ink ring-1 outline-none transition-colors placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-sage-400",
        invalid ? "ring-danger" : "ring-border",
        className
      )}
      {...props}
    />
  );
});
