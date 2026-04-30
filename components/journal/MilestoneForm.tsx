"use client";

import { CalendarBlank, NotePencil } from "@phosphor-icons/react/dist/ssr";
import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PhotoUploader } from "@/components/ui/PhotoUploader";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toaster";
import { milestoneTypes } from "@/lib/data/taxonomy";
import { createClient } from "@/lib/db/supabase/client";
import type { MilestoneType, TimelineItem } from "@/lib/types";

type MilestoneFormProps = {
  childId: string;
  onAdd: (item: TimelineItem) => void;
};

export function MilestoneForm({ childId, onAdd }: MilestoneFormProps) {
  const t = useTranslations("journal.form");
  const tTaxonomy = useTranslations("taxonomy");
  const { toast } = useToast();
  const [type, setType] = useState<MilestoneType>("first_smile");
  const [customTitle, setCustomTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submitMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const title = type === "custom" && customTitle ? customTitle : tTaxonomy(type);
    const photoUrl = photos[0];
    const optimisticItem: TimelineItem = {
      id: crypto.randomUUID(),
      type: "milestone",
      title,
      description: notes || undefined,
      date,
      photos: photos.length ? photos : undefined
    };

    const supabase = createClient();

    if (supabase && !childId.startsWith("demo-")) {
      const { error } = await supabase.from("milestones").insert({
        child_id: childId,
        type,
        date,
        notes: notes || null,
        photo_url: photoUrl ?? null
      });

      if (error) {
        setMessage(error.message);
        toast({ title: t("saveFailed"), description: error.message, variant: "danger" });
        setSaving(false);
        return;
      }
    }

    onAdd(optimisticItem);
    setNotes("");
    setPhotos([]);
    setCustomTitle("");
    setMessage("");
    toast({ title: t("milestoneAdded"), variant: "success" });
    setSaving(false);
  }

  return (
    <form onSubmit={submitMilestone} className="space-y-3">
      <FieldLabel label={t("fieldType")}>
        <Select value={type} onChange={(event) => setType(event.target.value as MilestoneType)}>
          {milestoneTypes.map((item) => (
            <option key={item} value={item}>
              {tTaxonomy(item)}
            </option>
          ))}
        </Select>
      </FieldLabel>

      {type === "custom" ? (
        <FieldLabel label={t("fieldTitle")}>
          <Input
            value={customTitle}
            onChange={(event) => setCustomTitle(event.target.value)}
            placeholder={t("customTitlePlaceholder")}
          />
        </FieldLabel>
      ) : null}

      <FieldLabel label={t("fieldDate")}>
        <Input
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
          leadingIcon={<CalendarBlank size={14} weight="fill" aria-hidden="true" />}
        />
      </FieldLabel>

      <FieldLabel label={t("fieldNote")}>
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder={t("milestoneNotePlaceholder")}
        />
      </FieldLabel>

      <PhotoUploader value={photos} onChange={setPhotos} label={t("fieldPhoto")} />

      <Button type="submit" size="lg" className="w-full" disabled={saving}>
        <NotePencil size={14} weight="fill" aria-hidden="true" />
        {saving ? t("saving") : t("saveMilestone")}
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
