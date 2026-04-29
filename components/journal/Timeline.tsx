import {
  Baby,
  Camera,
  House,
  MapPin,
  Sparkle
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { TimelineItem, TimelineItemType } from "@/lib/types";
import { formatDanishDate } from "@/lib/utils";

const icons: Record<TimelineItemType, typeof Baby> = {
  milestone: Sparkle,
  activity: MapPin,
  aula: House
};

const dotStyle: Record<TimelineItemType, string> = {
  milestone: "bg-warm-100 text-warm-600",
  activity: "bg-sage-100 text-sage-700",
  aula: "bg-sky-100 text-info"
};

function monthKey(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(iso: string) {
  return formatDanishDate(iso, "MMMM yyyy");
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Baby size={22} weight="duotone" aria-hidden="true" />}
        title="Tidslinjen er klar"
        description="Tilføj den første milepæl, når øjeblikket lander."
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

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key}>
          <div className="sticky top-14 z-[1] -mx-4 mb-2 flex items-center gap-2 bg-canvas/95 px-4 py-1.5 backdrop-blur lg:top-0 lg:mx-0 lg:px-0">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-muted">
              {group.label}
            </h3>
            <span className="h-px flex-1 bg-hairline" />
            <span className="text-2xs font-semibold text-subtle">
              {group.items.length} {group.items.length === 1 ? "indslag" : "indslag"}
            </span>
          </div>

          <ol className="relative space-y-2 pl-4">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-2 left-[7px] top-2 w-px bg-hairline"
            />
            {group.items.map((item) => {
              const Icon = icons[item.type];
              return (
                <li key={item.id} className="relative">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[3px] top-3 grid h-3.5 w-3.5 place-items-center rounded-full ring-2 ring-canvas ${dotStyle[item.type]}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  </span>
                  <article className="ml-4 rounded-card bg-surface p-3.5 ring-1 ring-hairline">
                    <div className="flex items-start gap-3">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${dotStyle[item.type]}`}
                      >
                        <Icon size={16} weight="duotone" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display text-base font-semibold text-ink">
                            {item.title}
                          </h4>
                          {item.badge ? (
                            <Badge variant="sky">{item.badge}</Badge>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs font-semibold text-subtle">
                          {formatDanishDate(item.date)}
                        </p>
                        {item.description ? (
                          <p className="mt-2 text-sm leading-6 text-muted">
                            {item.description}
                          </p>
                        ) : null}
                        {item.photos?.length ? (
                          <div className="mt-2.5 flex gap-1.5 overflow-x-auto thin-scroll">
                            {item.photos.map((photo) => (
                              <img
                                key={photo}
                                src={photo}
                                alt=""
                                loading="lazy"
                                className="h-20 w-20 shrink-0 rounded-lg object-cover ring-1 ring-hairline"
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="mt-2 inline-flex items-center gap-1 text-2xs font-semibold text-subtle">
                            <Camera size={11} weight="fill" aria-hidden="true" />
                            Ingen foto endnu
                          </span>
                        )}
                      </div>
                    </div>
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
