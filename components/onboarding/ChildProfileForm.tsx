"use client";

import { Baby, Camera } from "@phosphor-icons/react/dist/ssr";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

type ChildProfileFormProps = {
  onCreated?: (child: { id: string; name: string; dateOfBirth: string; photoUrl?: string }) => void;
};

export function ChildProfileForm({ onCreated }: ChildProfileFormProps) {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submitChild(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const localChild = {
      id: crypto.randomUUID(),
      name,
      dateOfBirth,
      photoUrl: photoUrl || undefined
    };

    if (!supabase) {
      onCreated?.(localChild);
      setMessage("Barnet er oprettet lokalt i demoen. Tilføj Supabase-miljøvariabler for databasegemning.");
      setSaving(false);
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Log ind først.");
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("children")
      .insert({
        user_id: user.id,
        name,
        date_of_birth: dateOfBirth,
        photo_url: photoUrl || null
      })
      .select("id,name,date_of_birth,photo_url")
      .single();

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    onCreated?.({
      id: data.id,
      name: data.name,
      dateOfBirth: data.date_of_birth,
      photoUrl: data.photo_url ?? undefined
    });
    setName("");
    setDateOfBirth("");
    setPhotoUrl("");
    setMessage("Barnet er gemt.");
    setSaving(false);
  }

  return (
    <form onSubmit={submitChild} className="rounded-card bg-surface p-5 ring-1 ring-hairline">
      <div className="flex items-center gap-2">
        <Baby size={18} weight="duotone" className="text-sage-700" aria-hidden="true" />
        <h2 className="font-display text-xl font-semibold text-ink">Barnets profil</h2>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
            Navn
          </span>
          <Input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Asta"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
            Fødselsdato
          </span>
          <Input
            required
            type="date"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
          />
        </label>
      </div>
      <label className="mt-3 block">
        <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
          Foto URL
        </span>
        <Input
          value={photoUrl}
          onChange={(event) => setPhotoUrl(event.target.value)}
          placeholder="https://res.cloudinary.com/…"
          leadingIcon={<Camera size={14} weight="fill" aria-hidden="true" />}
        />
      </label>
      <Button type="submit" size="lg" className="mt-4 w-full" disabled={saving}>
        {saving ? "Gemmer…" : "Gem profil"}
      </Button>
      {message ? <p className="mt-2 text-sm text-muted">{message}</p> : null}
    </form>
  );
}
