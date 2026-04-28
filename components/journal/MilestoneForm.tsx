"use client";

import { Calendar, ImagePlus, PenLine, Sparkles } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { milestoneLabels, milestoneTypes } from "@/lib/data/taxonomy";
import { createClient } from "@/lib/supabase/client";
import type { MilestoneType, TimelineItem } from "@/lib/types";

type MilestoneFormProps = {
  childId: string;
  onAdd: (item: TimelineItem) => void;
};

export function MilestoneForm({ childId, onAdd }: MilestoneFormProps) {
  const [type, setType] = useState<MilestoneType>("first_smile");
  const [customTitle, setCustomTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submitMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const title = type === "custom" && customTitle ? customTitle : milestoneLabels[type];
    const optimisticItem: TimelineItem = {
      id: crypto.randomUUID(),
      type: "milestone",
      title,
      description: notes || undefined,
      date,
      photos: photoUrl ? [photoUrl] : undefined
    };

    const supabase = createClient();

    if (supabase && !childId.startsWith("demo-")) {
      const { error } = await supabase.from("milestones").insert({
        child_id: childId,
        type,
        date,
        notes: notes || null,
        photo_url: photoUrl || null
      });

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }
    }

    onAdd(optimisticItem);
    setNotes("");
    setPhotoUrl("");
    setCustomTitle("");
    setMessage("Milepælen er tilføjet.");
    setSaving(false);
  }

  return (
    <form onSubmit={submitMilestone} className="rounded-card bg-white p-5 shadow-soft ring-1 ring-oat">
      <div className="flex items-center gap-2 text-rust">
        <Sparkles size={19} aria-hidden="true" />
        <h2 className="font-display text-2xl font-semibold text-ink">Tilføj milepæl</h2>
      </div>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-bold text-ink/70">Type</span>
        <select
          value={type}
          onChange={(event) => setType(event.target.value as MilestoneType)}
          className="focus-ring h-12 w-full rounded-xl bg-linen px-3 text-sm font-semibold ring-1 ring-oat"
        >
          {milestoneTypes.map((item) => (
            <option key={item} value={item}>
              {milestoneLabels[item]}
            </option>
          ))}
        </select>
      </label>

      {type === "custom" ? (
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-bold text-ink/70">Titel</span>
          <input
            value={customTitle}
            onChange={(event) => setCustomTitle(event.target.value)}
            className="focus-ring h-12 w-full rounded-xl bg-linen px-3 text-sm font-semibold ring-1 ring-oat"
            placeholder="Første tur i ladcyklen"
          />
        </label>
      ) : null}

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
        <span className="mb-2 block text-sm font-bold text-ink/70">Note</span>
        <span className="flex items-start gap-2 rounded-xl bg-linen px-3 py-3 ring-1 ring-oat">
          <PenLine size={17} className="mt-1 text-ink/45" aria-hidden="true" />
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="w-full resize-none bg-transparent text-sm font-semibold outline-none"
            placeholder="Hvad skete der?"
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
        {saving ? "Gemmer..." : "Gem milepæl"}
      </Button>
      {message ? <p className="mt-3 text-sm font-semibold text-ink/70">{message}</p> : null}
    </form>
  );
}
