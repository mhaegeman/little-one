"use client";

import { Compass, Heart } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useMemo, useState } from "react";
import { VenueCard } from "@/components/discover/VenueCard";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFavorites } from "@/hooks/useFavorites";
import { venues } from "@/lib/data/venues";

export function ProfileSaved() {
  const { favorites, clear } = useFavorites();
  const [clearOpen, setClearOpen] = useState(false);

  const savedVenues = useMemo(() => {
    const order = new Map(favorites.map((id, index) => [id, index] as const));
    return venues
      .filter((venue) => order.has(venue.id))
      .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }, [favorites]);

  if (savedVenues.length === 0) {
    return (
      <EmptyState
        icon={<Heart size={22} weight="fill" aria-hidden="true" />}
        title="Ingen gemte steder endnu"
        description="Tryk på hjertet på et sted i Opdag for at gemme det her."
        action={
          <Link href="/discover">
            <Button variant="secondary">
              <Compass size={14} weight="fill" aria-hidden="true" />
              Gå til Opdag
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-2xs font-bold uppercase tracking-[0.16em] text-warm-500">
            Gemte steder
          </p>
          <h2 className="font-display text-xl font-semibold text-ink">
            {savedVenues.length} {savedVenues.length === 1 ? "sted" : "steder"}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setClearOpen(true)}
          className="focus-ring text-2xs font-bold uppercase tracking-wide text-warm-600 hover:text-warm-700"
        >
          Ryd alle
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {savedVenues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} layout="compact" />
        ))}
      </div>

      <ConfirmDialog
        open={clearOpen}
        title="Ryd alle gemte steder?"
        description="Du kan altid gemme steder igen ved at trykke på hjertet."
        confirmLabel="Ryd alle"
        cancelLabel="Behold"
        danger
        onConfirm={() => {
          clear();
          setClearOpen(false);
        }}
        onCancel={() => setClearOpen(false)}
      />
    </section>
  );
}
