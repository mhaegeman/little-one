"use client";

import { X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, type ReactNode } from "react";
import { trapFocus } from "@/lib/focus";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  hideCloseButton = false
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  hideCloseButton?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const release = panelRef.current ? trapFocus(panelRef.current) : null;

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      release?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[55] grid place-items-center px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Luk"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-2xl bg-surface shadow-lift outline-none ring-1 ring-hairline",
          className
        )}
      >
        {(title || description) && (
          <header className="flex items-start justify-between gap-3 border-b border-hairline px-5 py-4">
            <div className="min-w-0">
              {title ? (
                <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
              ) : null}
              {description ? (
                <p className="mt-1 text-sm text-muted">{description}</p>
              ) : null}
            </div>
            {!hideCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Luk"
                className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-sunken hover:text-ink"
              >
                <X size={16} weight="bold" aria-hidden="true" />
              </button>
            ) : null}
          </header>
        )}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
