"use client";

import {
  Baby,
  Camera,
  House,
  MapPin,
  Sparkle
} from "@phosphor-icons/react/dist/ssr";
import { useLocale, useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import type { TimelineItem, TimelineItemType } from "@/lib/types";
import { formatLocalizedDate } from "@/lib/utils";

const icons: Record<TimelineItemType, typeof Baby> = {
  milestone: Sparkle,
  activity: MapPin,
  aula: House
};

const nodeStyle: Record<TimelineItemType, string> = {
  milestone: "bg-peach-100 text-peach-ink",
  activity: "bg-mint-100 text-mint-ink",
  aula: "bg-sky-100 text-sky-ink"
};

const pillTone: Record<TimelineItemType, "peach" | "mint" | "sky"> = {
  milestone: "peach",
  activity: "mint",
  aula: "sky"
};

const tagTone: Record<TimelineItemType, "peach" | "mint" | "sky" | "butter"> = {
  milestone: "peach",
  activity: "mint",
  aula: "sky"
};

function monthKey(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  const t = useTranslations("journal");
  const locale = useLocale();

  function monthLabel(iso: string) {
    return formatLocalizedDate(iso, locale, "MMMM yyyy");
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Baby size={22} weight="duotone" aria-hidden="true" />}
        title={t("empty")}
        description={t("emptyHint")}
      />
    );
  }

  const sorted = [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group by month (preserving order)
  const groups: { key: string; label: string; items: TimelineItem[] }[] = [];
  for (const item of sorted) {
    const key = monthKey(item.date);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(item);
    } else {
      groups.push({ key, label: monthLabel(item.date), items: [item] });
    }
  }

  function kindLabel(item: TimelineItem) {
    if (item.type === "milestone") return t("milestone");
    if (item.type === "activity") return t("activity");
    return item.badge ?? t("aulaBadgeNursery");
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key} id={`month-${group.key}`} className="scroll-mt-20">
          <div className="sticky top-14 z-[1] -mx-4 mb-3 flex items-center gap-2 bg-canvas/95 px-4 py-1.5 backdrop-blur lg:top-0 lg:mx-0 lg:px-0">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-muted">
              {group.label}
            </h3>
            <span className="h-px flex-1 bg-hairline" />
            <span className="text-2xs font-semibold text-subtle">
              {t("entryCount", { count: group.items.length })}
            </span>
          </div>

          <ol className="relative space-y-3 pl-0">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 left-[23px] top-3 w-[2px] rounded-full bg-hairline"
            />
            {group.items.map((item) => {
              const Icon = icons[item.type];
              return (
                <li key={item.id} className="relative flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className={`relative z-[1] grid h-12 w-12 shrink-0 place-items-center rounded-full shadow-[0_0_0_4px_rgb(251_246_238)] ${nodeStyle[item.type]}`}
                  >
                    <Icon size={20} weight="duotone" aria-hidden="true" />
                  </span>
                  <article className="min-w-0 flex-1 rounded-card bg-surface p-4 shadow-soft ring-1 ring-hairline">
                    <div className="flex items-start justify-between gap-2">
                      <Pill tone={pillTone[item.type]} size="sm">
                        {kindLabel(item)}
                      </Pill>
                      <p className="text-2xs font-semibold text-subtle">
                        {formatLocalizedDate(item.date, locale)}
                      </p>
                    </div>
                    <h4 className="mt-2 font-display text-xl font-semibold leading-snug text-ink">
                      {item.title}
                    </h4>
                    {item.description ? (
                      <p className="mt-1.5 text-sm leading-6 text-muted">
                        {item.description}
                      </p>
                    ) : null}
                    {item.photos?.length ? (
                      <div
                        className={`mt-3 grid gap-1.5 ${
                          item.photos.length === 1
                            ? "grid-cols-1"
                            : item.photos.length === 2
                              ? "grid-cols-2"
                              : "grid-cols-3"
                        }`}
                      >
                        {item.photos.slice(0, 3).map((photo) => (
                          <img
                            key={photo}
                            src={photo}
                            alt=""
                            loading="lazy"
                            className="aspect-[4/3] w-full rounded-lg object-cover ring-1 ring-hairline"
                          />
                        ))}
                      </div>
                    ) : null}
                    {item.tags?.length ? (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {item.tags.slice(0, 6).map((tag) => (
                          <Pill key={tag} tone="sunken" size="sm">
                            {tag}
                          </Pill>
                        ))}
                      </div>
                    ) : null}
                    {!item.photos?.length && !item.description ? (
                      <span className="mt-2 inline-flex items-center gap-1 text-2xs font-semibold text-subtle">
                        <Camera size={11} weight="fill" aria-hidden="true" />
                        {t("noPhoto")}
                      </span>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
