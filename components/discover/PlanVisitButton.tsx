"use client";

import {
  CalendarBlank,
  CalendarCheck,
  CalendarPlus,
  CheckCircle,
  X
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toaster";
import { usePlannedOutings } from "@/hooks/usePlannedOutings";
import { trapFocus } from "@/lib/focus";
import { formatLocalizedDate } from "@/lib/utils";

export function PlanVisitButton({
  venueId,
  venueName,
  className
}: {
  venueId: string;
  venueName: string;
  className?: string;
}) {
  const t = useTranslations("planVisit");
  const locale = useLocale();
  const { toast } = useToast();
  const { outings, add, remove, isPlanned } = usePlannedOutings();
  const planned = isPlanned(venueId);
  const existing = outings.find((entry) => entry.venueId === venueId);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onClickAway(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClickAway);
    const release = popoverRef.current ? trapFocus(popoverRef.current) : undefined;
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClickAway);
      release?.();
    };
  }, [open]);

  function handleSave() {
    add({ venueId, date, note });
    setOpen(false);
    setNote("");
    toast({
      title: t("addedToast"),
      description: `${venueName} · ${formatLocalizedDate(date, locale)}`,
      variant: "success"
    });
  }

  function handleCancel() {
    if (!existing) return;
    remove(existing.id);
    toast({
      title: t("removedToast"),
      description: venueName,
      variant: "info",
      duration: 2200
    });
  }

  if (planned && existing) {
    return (
      <div className={className}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <span className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-sage-100 px-3 text-sm font-semibold text-sage-700 ring-1 ring-sage-200">
            <CheckCircle size={14} weight="fill" aria-hidden="true" />
            {t("plannedLabel", { date: formatLocalizedDate(existing.date, locale) })}
          </span>
          <Button variant="ghost" onClick={handleCancel}>
            <X size={14} weight="bold" aria-hidden="true" />
            {t("removePlan")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <Button
        size="lg"
        variant="primary"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="w-full"
      >
        <CalendarPlus size={14} weight="fill" aria-hidden="true" />
        {t("buttonLabel")}
      </Button>

      {open ? (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={t("dialogLabel", { name: venueName })}
          className="absolute left-0 right-0 top-12 z-30 rounded-card bg-surface p-3 shadow-lift ring-1 ring-hairline"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-2xs font-bold uppercase tracking-[0.14em] text-warm-500">
                {t("planHeading")}
              </p>
              <p className="font-display text-sm font-semibold text-ink">{venueName}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("closeLabel")}
              className="focus-ring grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-sunken hover:text-ink"
            >
              <X size={12} weight="bold" aria-hidden="true" />
            </button>
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
              {t("dateLabel")}
            </span>
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              leadingIcon={<CalendarBlank size={13} weight="fill" aria-hidden="true" />}
              min={new Date().toISOString().slice(0, 10)}
            />
          </label>

          <label className="mt-2 block">
            <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
              {t("noteLabel")}
            </span>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              placeholder={t("notePlaceholder")}
            />
          </label>

          <div className="mt-3 flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <CalendarCheck size={14} weight="fill" aria-hidden="true" />
              {t("savePlan")}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
