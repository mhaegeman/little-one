"use client";

import { CalendarBlank, MapPin } from "@phosphor-icons/react/dist/ssr";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PhotoUploader } from "@/components/ui/PhotoUploader";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toaster";
import { venues } from "@/lib/data/venues";
import { createClient } from "@/lib/supabase/client";
import type { TimelineItem } from "@/lib/types";

type ActivityFormProps = {
  childId: string;
  onAdd: (item: TimelineItem) => void;
};

export function ActivityForm({ childId, onAdd }: ActivityFormProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [venueId, setVenueId] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
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
      photos: photos.length ? photos : undefined
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
        photos,
        location_lat: selectedVenue?.lat ?? null,
        location_lng: selectedVenue?.lng ?? null,
        tags: selectedVenue?.tags ?? []
      });

      if (error) {
        setMessage(error.message);
        toast({ title: "Kunne ikke gemme", description: error.message, variant: "danger" });
        setSaving(false);
        return;
      }
    }

    onAdd(optimisticItem);
    setTitle("");
    setVenueId("");
    setNotes("");
    setPhotos([]);
    setMessage("");
    toast({ title: "Turen er tilføjet", variant: "success" });
    setSaving(false);
  }

  return (
    <form onSubmit={submitActivity} className="space-y-3">
      <FieldLabel label="Titel">
        <Input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Formiddag i Fælledparken"
        />
      </FieldLabel>

      <FieldLabel label="Dato">
        <Input
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
          leadingIcon={<CalendarBlank size={14} weight="fill" aria-hidden="true" />}
        />
      </FieldLabel>

      <FieldLabel label="Sted">
        <Select value={venueId} onChange={(event) => setVenueId(event.target.value)}>
          <option value="">Frit sted</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </Select>
      </FieldLabel>

      <FieldLabel label="Note">
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Hvad vil I huske?"
        />
      </FieldLabel>

      <PhotoUploader
        value={photos}
        onChange={setPhotos}
        multiple
        max={4}
        label="Fotos"
        hint="Op til 4 — træk billeder hertil eller indsæt et link."
      />


      <Button type="submit" size="lg" className="w-full" disabled={saving}>
        <MapPin size={14} weight="fill" aria-hidden="true" />
        {saving ? "Gemmer…" : "Gem tur"}
      </Button>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </form>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
