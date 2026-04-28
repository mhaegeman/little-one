"use client";

import { Baby, Camera } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
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
    <form onSubmit={submitChild} className="rounded-card bg-white p-5 shadow-soft ring-1 ring-oat">
      <div className="flex items-center gap-2 text-rust">
        <Baby size={19} aria-hidden="true" />
        <h2 className="font-display text-2xl font-semibold text-ink">Barnets profil</h2>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-bold text-ink/70">Navn</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="focus-ring h-12 w-full rounded-xl bg-linen px-3 text-sm font-semibold ring-1 ring-oat"
            placeholder="Asta"
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-ink/70">Fødselsdato</span>
          <input
            required
            type="date"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
            className="focus-ring h-12 w-full rounded-xl bg-linen px-3 text-sm font-semibold ring-1 ring-oat"
          />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-bold text-ink/70">Foto URL</span>
        <span className="flex h-12 items-center gap-2 rounded-xl bg-linen px-3 ring-1 ring-oat">
          <Camera size={17} className="text-ink/45" aria-hidden="true" />
          <input
            value={photoUrl}
            onChange={(event) => setPhotoUrl(event.target.value)}
            className="w-full bg-transparent text-sm font-semibold outline-none"
            placeholder="https://res.cloudinary.com/..."
          />
        </span>
      </label>
      <Button type="submit" className="mt-4 w-full" disabled={saving}>
        {saving ? "Gemmer..." : "Gem profil"}
      </Button>
      {message ? <p className="mt-3 text-sm font-semibold text-ink/70">{message}</p> : null}
    </form>
  );
}
