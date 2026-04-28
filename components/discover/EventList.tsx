import { CalendarDays, Ticket } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { categoryColors, categoryLabels } from "@/lib/data/taxonomy";
import type { FamilyEvent } from "@/lib/types";
import { formatDanishDate, monthRangeLabel } from "@/lib/utils";

export function EventList({ events }: { events: FamilyEvent[] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()
  );

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-rust">Kalender</p>
          <h2 className="font-display text-2xl font-semibold">Kommende oplevelser</h2>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((event) => (
          <Link
            key={event.id}
            href={event.bookingUrl ?? "#"}
            target="_blank"
            className="focus-ring rounded-card bg-white p-4 shadow-soft ring-1 ring-oat/70 transition hover:-translate-y-0.5 hover:ring-moss/30"
          >
            <Badge className={categoryColors[event.category]}>{categoryLabels[event.category]}</Badge>
            <h3 className="mt-3 font-display text-xl font-semibold">{event.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/70">{event.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-ink/70">
              <span className="inline-flex items-center gap-1 rounded-full bg-linen px-2.5 py-1">
                <CalendarDays size={14} aria-hidden="true" />
                {formatDanishDate(event.dateStart, "d. MMM. HH:mm")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-linen px-2.5 py-1">
                <Ticket size={14} aria-hidden="true" />
                {event.price}
              </span>
              <span className="rounded-full bg-linen px-2.5 py-1">
                {monthRangeLabel(event.ageMinMonths, event.ageMaxMonths)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
