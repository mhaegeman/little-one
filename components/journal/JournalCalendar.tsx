"use client";

import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { TimelineItem } from "@/lib/types";
import { cn, formatLocalizedDate } from "@/lib/utils";

type Bucket = {
  key: string;
  label: string;
  count: number;
  iso: string;
  year: number;
  month: number; // 0-indexed
};

function monthKey(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function jumpToMonth(key: string) {
  const target = document.getElementById(`month-${key}`);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function JournalCalendar({
  items,
  activeKey
}: {
  items: TimelineItem[];
  activeKey?: string;
}) {
  const t = useTranslations("journal");
  const locale = useLocale();
  const weekdayLabels = t("calendarWeekdays").split(",");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const buckets = useMemo<Bucket[]>(() => {
    if (items.length === 0) return [];
    const counts = new Map<string, { count: number; iso: string }>();
    for (const item of items) {
      const key = monthKey(item.date);
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { count: 1, iso: item.date });
      }
    }

    return Array.from(counts.entries())
      .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0)) // newest first
      .map(([key, value]) => {
        const date = new Date(value.iso);
        return {
          key,
          label: formatLocalizedDate(value.iso, locale, "MMM yyyy"),
          count: value.count,
          iso: value.iso,
          year: date.getFullYear(),
          month: date.getMonth()
        };
      });
  }, [items, locale]);

  const dayCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      const date = new Date(item.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [items]);

  if (buckets.length <= 1) return null;

  const maxCount = buckets.reduce((max, bucket) => Math.max(max, bucket.count), 0);

  function handleChipClick(bucketKey: string) {
    if (expandedKey === bucketKey) {
      setExpandedKey(null);
      jumpToMonth(bucketKey);
    } else {
      setExpandedKey(bucketKey);
    }
  }

  const expanded = expandedKey ? buckets.find((bucket) => bucket.key === expandedKey) : null;

  return (
    <section
      aria-label={t("calendarOverviewAria")}
      className="mt-4 rounded-card bg-surface p-3 ring-1 ring-hairline"
    >
      <div className="mb-2 flex items-center gap-1.5 text-2xs font-bold uppercase tracking-[0.12em] text-muted">
        <CalendarBlank size={11} weight="fill" aria-hidden="true" />
        {t("calendarYearInJournal")}
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 thin-scroll">
        {buckets.map((bucket) => {
          const isActive = bucket.key === activeKey;
          const isExpanded = bucket.key === expandedKey;
          const intensity = Math.min(1, bucket.count / Math.max(maxCount, 1));
          const fillPct = Math.max(15, Math.round(intensity * 100));
          return (
            <button
              key={bucket.key}
              type="button"
              onClick={() => handleChipClick(bucket.key)}
              aria-current={isActive ? "true" : undefined}
              aria-expanded={isExpanded}
              className={cn(
                "focus-ring relative flex h-14 min-w-[68px] flex-col items-start justify-end overflow-hidden rounded-lg px-2 py-1.5 ring-1 transition-colors",
                isExpanded
                  ? "bg-sage-100 text-sage-700 ring-sage-400"
                  : isActive
                    ? "bg-sage-100 text-sage-700 ring-sage-300"
                    : "bg-sunken text-ink ring-hairline hover:ring-sage-200"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 bottom-0 origin-bottom transition-all",
                  isExpanded || isActive ? "bg-sage-300/60" : "bg-sage-200/60"
                )}
                style={{ height: `${fillPct}%` }}
              />
              <span className="relative z-[1] text-2xs font-bold uppercase tracking-wide">
                {bucket.label}
              </span>
              <span className="relative z-[1] font-display text-sm font-semibold">
                {bucket.count}
              </span>
            </button>
          );
        })}
      </div>

      {expanded ? (
        <div className="mt-3 rounded-lg bg-sunken p-3 ring-1 ring-hairline">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-2xs font-bold uppercase tracking-[0.12em] text-muted">
              {expanded.label} · {t("entryCount", { count: expanded.count })}
            </p>
            <button
              type="button"
              onClick={() => {
                setExpandedKey(null);
                jumpToMonth(expanded.key);
              }}
              className="focus-ring text-2xs font-bold uppercase tracking-wide text-warm-600 hover:text-warm-700"
            >
              {t("calendarGoToMonth")}
            </button>
          </div>
          <DayGrid year={expanded.year} month={expanded.month} dayCounts={dayCounts} weekdayLabels={weekdayLabels} />
        </div>
      ) : null}
    </section>
  );
}

function DayGrid({
  year,
  month,
  dayCounts,
  weekdayLabels
}: {
  year: number;
  month: number;
  dayCounts: Map<string, number>;
  weekdayLabels: string[];
}) {
  const t = useTranslations("journal");
  const locale = useLocale();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Compute leading blank cells. JS getDay(): Sun=0..Sat=6. Monday-first → shift.
  const firstWeekday = new Date(year, month, 1).getDay();
  const leadingBlanks = (firstWeekday + 6) % 7; // 0 if Mon, 6 if Sun

  const cells: Array<{ day: number; iso: string; count: number } | null> = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, iso, count: dayCounts.get(iso) ?? 0 });
  }
  const maxDayCount = cells.reduce(
    (max, cell) => (cell ? Math.max(max, cell.count) : max),
    0
  );

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-subtle">
        {weekdayLabels.map((label, i) => (
          <span key={`${label}-${i}`} className="text-center">
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          if (!cell) {
            return <span key={`b-${index}`} aria-hidden="true" className="aspect-square" />;
          }
          const intensity = maxDayCount > 0 ? cell.count / maxDayCount : 0;
          const monthYear = formatLocalizedDate(cell.iso, locale, "MMM yyyy");
          const countPart = cell.count ? t("calendarEntryCount", { count: cell.count }) : "";
          const tooltip = `${cell.day}. ${monthYear}${countPart}`;
          return (
            <button
              key={cell.iso}
              type="button"
              title={tooltip}
              aria-label={tooltip}
              onClick={() => {
                const monthKeyValue = `${year}-${String(month + 1).padStart(2, "0")}`;
                jumpToMonth(monthKeyValue);
              }}
              className={cn(
                "focus-ring relative grid aspect-square place-items-center rounded-md text-[11px] font-semibold transition-colors",
                cell.count === 0
                  ? "bg-surface text-subtle ring-1 ring-hairline"
                  : "text-sage-800"
              )}
              style={
                cell.count > 0
                  ? {
                      backgroundColor: `rgba(91, 131, 119, ${0.18 + intensity * 0.6})`,
                      color: intensity > 0.5 ? "#FFFFFF" : "#33554C"
                    }
                  : undefined
              }
            >
              {cell.day}
              {cell.count > 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute right-0.5 top-0.5 grid h-3 w-3 place-items-center rounded-full bg-warm-500 text-[8px] font-bold text-white"
                >
                  {cell.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
