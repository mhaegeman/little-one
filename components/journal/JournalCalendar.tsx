"use client";

import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { useMemo } from "react";
import type { TimelineItem } from "@/lib/types";
import { cn, formatDanishDate } from "@/lib/utils";

type Bucket = {
  key: string;
  label: string;
  count: number;
  iso: string;
};

function monthKey(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function JournalCalendar({
  items,
  activeKey
}: {
  items: TimelineItem[];
  activeKey?: string;
}) {
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

    const sorted = Array.from(counts.entries())
      .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0)) // newest first
      .map(([key, value]) => ({
        key,
        label: formatDanishDate(value.iso, "MMM yyyy"),
        count: value.count,
        iso: value.iso
      }));

    return sorted;
  }, [items]);

  if (buckets.length <= 1) return null;

  const maxCount = buckets.reduce((max, bucket) => Math.max(max, bucket.count), 0);

  function jumpTo(key: string) {
    const target = document.getElementById(`month-${key}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <section
      aria-label="Måneds-oversigt"
      className="mt-4 rounded-card bg-surface p-3 ring-1 ring-hairline"
    >
      <div className="mb-2 flex items-center gap-1.5 text-2xs font-bold uppercase tracking-[0.12em] text-muted">
        <CalendarBlank size={11} weight="fill" aria-hidden="true" />
        Året i journalen
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 thin-scroll">
        {buckets.map((bucket) => {
          const isActive = bucket.key === activeKey;
          const intensity = Math.min(1, bucket.count / Math.max(maxCount, 1));
          // Compute opacity for the underlying density bar (10% → 100%)
          const fillPct = Math.max(15, Math.round(intensity * 100));
          return (
            <button
              key={bucket.key}
              type="button"
              onClick={() => jumpTo(bucket.key)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "focus-ring relative flex h-14 min-w-[68px] flex-col items-start justify-end overflow-hidden rounded-lg px-2 py-1.5 ring-1 transition-colors",
                isActive
                  ? "bg-sage-100 text-sage-700 ring-sage-300"
                  : "bg-sunken text-ink ring-hairline hover:ring-sage-200"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 bottom-0 origin-bottom transition-all",
                  isActive ? "bg-sage-300/60" : "bg-sage-200/60"
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
    </section>
  );
}
