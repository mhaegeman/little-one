"use client";

import { Calendar, ImagePlus, MapPin, PenLine } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { venues } from "@/lib/data/venues";
import { createClient } from "@/lib/supabase/client";
import type { TimelineItem } from "@/lib/types";

type ActivityFormProps = {
  childId: string;
  onAdd: (item: TimelineItem) => void;
};

export function ActivityForm({ childId, onAdd }: ActivityFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [venueId, setVenueId] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submitActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const selectedVenue = venues.find((venue) => venue.id === venueId);
    const optimisticItem: TimelineItem = {
      id: crypto.randomUUID(),
      type: "activity",
      title,
      description: selectedVenue ? `${notes} ${notes ? "· " : ""}${selectedVenue.name}` : notes,
      date,
      photos: photoUrl ? [photoUrl] : undefined
    };

    const supabase = createClient();

    if (supabase && !childId.startsWith("demo-")) {
      const { data: venueRow } = selectedVenue
        ? await supabase.from("venues").select("id").eq("slug", selectedVenue.id).single()
        : { data: null };

      const { error } = await supabase.from("activities_log").insert({
        child_id: childId,
        venue_id: venueRow?.id ?? null,
        title,
        description: notes || null,
        date,
        photos: photoUrl ? [photoUrl] : [],
        location_lat: selectedVenue?.lat ?? null,
        location_lng: selectedVenue?.lng ?? null,
        tags: selectedVenue?.tags ?? []
      });

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }
    }

    onAdd(optimisticItem);
    setTitle("");
    setVenueId("");
    setNotes("");
    setPhotoUrl("");
    setMessage("Turen er tilføjet.");
    setSaving(false);
  }

  return (
    <form onSubmit={submitActivity} className="rounded-card bg-white p-5 shadow-soft ring-1 ring-oat">
      <div className="flex items-center gap-2 text-rust">
        <MapPin size={19} aria-hidden="true" />
        <h2 className="font-display text-2xl font-semibold text-ink">Tilføj tur</h2>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-bold text-ink/70">Titel</span>
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="focus-ring h-12 w-full rounded-xl bg-linen px-3 text-sm font-semibold ring-1 ring-oat"
          placeholder="Formiddag i Fælledparken"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-bold text-ink/70">Dato</span>
        <span className="flex h-12 items-center gap-2 rounded-xl bg-linen px-3 ring-1 ring-oat">
          <Calendar size={17} className="text-ink/45" aria-hidden="true" />
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full bg-transparent text-sm font-semibold outline-none"
          />
        </span>
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-bold text-ink/70">Sted</span>
        <select
          value={venueId}
          onChange={(event) => setVenueId(event.target.value)}
          className="focus-ring h-12 w-full rounded-xl bg-linen px-3 text-sm font-semibold ring-1 ring-oat"
        >
          <option value="">Frit sted</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-bold text-ink/70">Note</span>
        <span className="flex items-start gap-2 rounded-xl bg-linen px-3 py-3 ring-1 ring-oat">
          <PenLine size={17} className="mt-1 text-ink/45" aria-hidden="true" />
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="w-full resize-none bg-transparent text-sm font-semibold outline-none"
            placeholder="Hvad vil I huske?"
          />
        </span>
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-bold text-ink/70">Foto URL</span>
        <span className="flex h-12 items-center gap-2 rounded-xl bg-linen px-3 ring-1 ring-oat">
          <ImagePlus size={17} className="text-ink/45" aria-hidden="true" />
          <input
            value={photoUrl}
            onChange={(event) => setPhotoUrl(event.target.value)}
            className="w-full bg-transparent text-sm font-semibold outline-none"
            placeholder="https://res.cloudinary.com/..."
          />
        </span>
      </label>

      <Button type="submit" className="mt-4 w-full" disabled={saving}>
        {saving ? "Gemmer..." : "Gem tur"}
      </Button>
      {message ? <p className="mt-3 text-sm font-semibold text-ink/70">{message}</p> : null}
    </form>
  );
}
