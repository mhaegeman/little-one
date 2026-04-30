"use client";

import { CalendarDots, Ticket } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { categoryBadgeVariant } from "@/lib/data/taxonomy";
import type { FamilyEvent, VenueCategory } from "@/lib/types";
import { formatLocalizedDate, monthRangeLabel } from "@/lib/utils";

export function EventList({ events }: { events: FamilyEvent[] }) {
  const t = useTranslations("discover");
  const tRec = useTranslations("profileRecommendations");
  const tTaxonomy = useTranslations("taxonomy");
  const locale = useLocale();

  const sorted = [...events].sort(
    (a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()
  );

  if (sorted.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xs font-bold uppercase tracking-[0.18em] text-peach-ink">{t("calendar")}</p>
          <h2 className="font-display text-xl font-semibold text-ink">{t("events")}</h2>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((event) => (
          <Link
            key={event.id}
            href={event.bookingUrl ?? "#"}
            target="_blank"
            className="focus-ring group rounded-card bg-surface p-3.5 ring-1 ring-hairline transition-colors hover:ring-mint-200"
          >
            <Badge variant={categoryBadgeVariant[event.category]}>
              {tTaxonomy(event.category as VenueCategory)}
            </Badge>
            <h3 className="mt-2 font-display text-base font-semibold text-ink">{event.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{event.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-2xs font-semibold text-muted">
              <span className="inline-flex items-center gap-1 rounded-pill bg-sunken px-2 py-0.5">
                <CalendarDots size={12} weight="fill" aria-hidden="true" />
                {formatLocalizedDate(event.dateStart, locale, tRec("eventDatePattern"))}
              </span>
              <span className="inline-flex items-center gap-1 rounded-pill bg-sunken px-2 py-0.5">
                <Ticket size={12} weight="fill" aria-hidden="true" />
                {event.price}
              </span>
              <span className="rounded-pill bg-sunken px-2 py-0.5">
                {monthRangeLabel(event.ageMinMonths, event.ageMaxMonths, locale)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
