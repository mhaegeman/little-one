import { CalendarDots, Ticket } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { categoryBadgeVariant, categoryLabels } from "@/lib/data/taxonomy";
import type { FamilyEvent } from "@/lib/types";
import { formatDanishDate, monthRangeLabel } from "@/lib/utils";

export function EventList({ events }: { events: FamilyEvent[] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()
  );

  if (sorted.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xs font-bold uppercase tracking-[0.16em] text-warm-500">Kalender</p>
          <h2 className="font-display text-xl font-semibold text-ink">Kommende oplevelser</h2>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((event) => (
          <Link
            key={event.id}
            href={event.bookingUrl ?? "#"}
            target="_blank"
            className="focus-ring group rounded-card bg-surface p-3.5 ring-1 ring-hairline transition-colors hover:ring-sage-300"
          >
            <Badge variant={categoryBadgeVariant[event.category]}>
              {categoryLabels[event.category]}
            </Badge>
            <h3 className="mt-2 font-display text-base font-semibold text-ink">{event.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{event.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-2xs font-semibold text-muted">
              <span className="inline-flex items-center gap-1 rounded-pill bg-sunken px-2 py-0.5">
                <CalendarDots size={12} weight="fill" aria-hidden="true" />
                {formatDanishDate(event.dateStart, "d. MMM. HH:mm")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-pill bg-sunken px-2 py-0.5">
                <Ticket size={12} weight="fill" aria-hidden="true" />
                {event.price}
              </span>
              <span className="rounded-pill bg-sunken px-2 py-0.5">
                {monthRangeLabel(event.ageMinMonths, event.ageMaxMonths)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
