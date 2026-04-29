"use client";

import { X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SheetSide = "right" | "bottom";

export function Sheet({
  open,
  onClose,
  side = "right",
  title,
  description,
  children,
  className,
  size = "md"
}: {
  open: boolean;
  onClose: () => void;
  side?: SheetSide;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass =
    side === "right"
      ? size === "sm"
        ? "w-[320px]"
        : size === "lg"
          ? "w-[520px]"
          : "w-[420px]"
      : size === "sm"
        ? "max-h-[50vh]"
        : size === "lg"
          ? "max-h-[90vh]"
          : "max-h-[75vh]";

  const positionClass =
    side === "right"
      ? "right-0 top-0 h-full"
      : "bottom-0 left-0 right-0 rounded-t-2xl";

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm transition-opacity"
      />
      <div
        className={cn(
          "absolute flex flex-col bg-canvas shadow-lift",
          positionClass,
          side === "right" ? sizeClass : `w-full ${sizeClass}`,
          className
        )}
      >
        {(title || description) && (
          <header className="flex items-start justify-between gap-3 border-b border-hairline px-5 py-4">
            <div className="min-w-0">
              {title ? (
                <h2 className="font-display text-xl font-semibold text-ink">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-1 text-sm text-muted">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Luk"
              className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-sunken hover:text-ink"
            >
              <X size={18} weight="bold" aria-hidden="true" />
            </button>
          </header>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4 thin-scroll">{children}</div>
      </div>
    </div>
  );
}
