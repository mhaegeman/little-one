"use client";

import { CalendarBlank, ImageSquare, NotePencil } from "@phosphor-icons/react/dist/ssr";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toaster";
import { milestoneLabels, milestoneTypes } from "@/lib/data/taxonomy";
import { createClient } from "@/lib/supabase/client";
import type { MilestoneType, TimelineItem } from "@/lib/types";

type MilestoneFormProps = {
  childId: string;
  onAdd: (item: TimelineItem) => void;
};

export function MilestoneForm({ childId, onAdd }: MilestoneFormProps) {
  const { toast } = useToast();
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
        toast({ title: "Kunne ikke gemme", description: error.message, variant: "danger" });
        setSaving(false);
        return;
      }
    }

    onAdd(optimisticItem);
    setNotes("");
    setPhotoUrl("");
    setCustomTitle("");
    setMessage("");
    toast({ title: "Milepælen er tilføjet", variant: "success" });
    setSaving(false);
  }

  return (
    <form onSubmit={submitMilestone} className="space-y-3">
      <FieldLabel label="Type">
        <Select value={type} onChange={(event) => setType(event.target.value as MilestoneType)}>
          {milestoneTypes.map((item) => (
            <option key={item} value={item}>
              {milestoneLabels[item]}
            </option>
          ))}
        </Select>
      </FieldLabel>

      {type === "custom" ? (
        <FieldLabel label="Titel">
          <Input
            value={customTitle}
            onChange={(event) => setCustomTitle(event.target.value)}
            placeholder="Første tur i ladcyklen"
          />
        </FieldLabel>
      ) : null}

      <FieldLabel label="Dato">
        <Input
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
          leadingIcon={<CalendarBlank size={14} weight="fill" aria-hidden="true" />}
        />
      </FieldLabel>

      <FieldLabel label="Note">
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Hvad skete der?"
        />
      </FieldLabel>

      <FieldLabel label="Foto URL">
        <Input
          value={photoUrl}
          onChange={(event) => setPhotoUrl(event.target.value)}
          placeholder="https://res.cloudinary.com/…"
          leadingIcon={<ImageSquare size={14} weight="fill" aria-hidden="true" />}
        />
      </FieldLabel>

      <Button type="submit" size="lg" className="w-full" disabled={saving}>
        <NotePencil size={14} weight="fill" aria-hidden="true" />
        {saving ? "Gemmer…" : "Gem milepæl"}
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
