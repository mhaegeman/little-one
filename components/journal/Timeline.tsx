import { Baby, Camera, Home, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { TimelineItem } from "@/lib/types";
import { formatDanishDate } from "@/lib/utils";

const icons = {
  milestone: Sparkles,
  activity: MapPin,
  aula: Home
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      {sorted.map((item) => {
        const Icon = icons[item.type];

        return (
          <article key={item.id} className="rounded-card bg-white p-4 shadow-soft ring-1 ring-oat/70">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-linen text-rust">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl font-semibold text-ink">{item.title}</h3>
                  {item.badge ? <Badge className="bg-skywash text-mossDark ring-moss/20">{item.badge}</Badge> : null}
                </div>
                <p className="mt-1 text-sm font-bold text-ink/55">{formatDanishDate(item.date)}</p>
                {item.description ? (
                  <p className="mt-3 text-sm leading-6 text-ink/72">{item.description}</p>
                ) : null}
                {item.photos?.length ? (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {item.photos.map((photo) => (
                      <img
                        key={photo}
                        src={photo}
                        alt=""
                        className="h-24 w-24 shrink-0 rounded-xl object-cover"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-linen px-2.5 py-1 text-xs font-bold text-ink/50">
                    <Camera size={13} aria-hidden="true" />
                    Ingen foto endnu
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}

      {sorted.length === 0 ? (
        <div className="rounded-card bg-white p-8 text-center shadow-soft ring-1 ring-oat">
          <Baby className="mx-auto text-rust" size={30} aria-hidden="true" />
          <h3 className="mt-3 font-display text-2xl font-semibold">Tidslinjen er klar</h3>
          <p className="mt-2 text-sm text-ink/64">Tilføj den første milepæl, når øjeblikket lander.</p>
        </div>
      ) : null}
    </div>
  );
}
