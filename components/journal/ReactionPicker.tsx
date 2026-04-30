"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import type { ReactionKind } from "@/lib/types";
import { REACTION_KINDS } from "@/lib/reactions";
import { cn } from "@/lib/utils";

const emoji: Record<ReactionKind, string> = {
  heart: "❤️",
  clap: "👏",
  smile: "😊",
  star: "⭐"
};

type ReactionPickerProps = {
  open: boolean;
  active: ReactionKind[];
  onSelect: (kind: ReactionKind) => void;
  onClose: () => void;
};

export function ReactionPicker({
  open,
  active,
  onSelect,
  onClose
}: ReactionPickerProps) {
  const t = useTranslations("journal.reactions");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="menu"
      aria-label={t("pickerLabel")}
      className="absolute -top-12 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-pill bg-surface p-1 shadow-lift ring-1 ring-hairline"
    >
      {REACTION_KINDS.map((kind) => {
        const isActive = active.includes(kind);
        return (
          <button
            key={kind}
            type="button"
            role="menuitemcheckbox"
            onClick={() => onSelect(kind)}
            aria-label={t(`kind.${kind}`)}
            aria-checked={isActive}
            className={cn(
              "focus-ring grid h-9 w-9 place-items-center rounded-pill text-lg transition-transform duration-150 ease-nordic hover:scale-110 active:scale-95",
              isActive && "bg-peach-50 ring-1 ring-peach-100"
            )}
          >
            <span aria-hidden="true">{emoji[kind]}</span>
          </button>
        );
      })}
    </div>
  );
}

export const reactionEmoji = emoji;
