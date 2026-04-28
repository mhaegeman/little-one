"use client";

import { KeyRound, LogOut, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export function ProfilePanel() {
  const [message, setMessage] = useState("");

  async function logout() {
    const supabase = createClient();

    if (!supabase) {
      setMessage("Supabase er ikke konfigureret i denne lokale demo.");
      return;
    }

    await supabase.auth.signOut();
    setMessage("Du er logget ud.");
  }

  return (
    <div className="px-4 pt-24 sm:px-6 lg:px-8 lg:pt-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-card bg-white p-6 shadow-soft ring-1 ring-oat">
          <div className="flex items-center gap-3 text-rust">
            <UserRound size={22} aria-hidden="true" />
            <h1 className="font-display text-4xl font-semibold text-ink">Profil</h1>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ProfileCard
              icon={<Sparkles size={19} />}
              title="Børn"
              body="Administrer profiler, fødselsdatoer og billeder for familiens børn."
            />
            <ProfileCard
              icon={<ShieldCheck size={19} />}
              title="Forbundne konti"
              body="Aula står som sikker placeholder, indtil en godkendt integration er klar."
            />
          </div>

          <div className="mt-6 rounded-card bg-linen p-5 ring-1 ring-oat">
            <div className="flex items-center gap-2 text-rust">
              <KeyRound size={19} aria-hidden="true" />
              <h2 className="font-display text-2xl font-semibold text-ink">Aula</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-bold text-ink/70">Aula e-mail</span>
                <input
                  disabled
                  className="h-12 w-full rounded-xl bg-white px-3 text-sm font-semibold text-ink/45 ring-1 ring-oat"
                  placeholder="kommer snart"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-ink/70">Institution</span>
                <input
                  disabled
                  className="h-12 w-full rounded-xl bg-white px-3 text-sm font-semibold text-ink/45 ring-1 ring-oat"
                  placeholder="vuggestue eller børnehave"
                />
              </label>
            </div>
            <Button disabled className="mt-4">
              Forbind Aula
            </Button>
            <p className="mt-3 text-sm leading-6 text-ink/70">
              Forbindelsen åbnes først, når en godkendt MitID- eller tokenbaseret Aula-adgang er klar.
            </p>
          </div>

          <div className="mt-6 rounded-card bg-linen p-5 ring-1 ring-oat">
            <h2 className="font-display text-2xl font-semibold">Indstillinger</h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              Dansk er standardsprog. Data gemmes i Supabase-projektet med RLS-politikker og EU-region som
              produktkrav.
            </p>
            <Button variant="danger" className="mt-4" onClick={logout}>
              <LogOut size={17} aria-hidden="true" />
              Log ud
            </Button>
            {message ? <p className="mt-3 text-sm font-semibold text-ink/70">{message}</p> : null}
          </div>
        </section>

        <LoginForm />
      </div>
    </div>
  );
}

function ProfileCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-card bg-linen p-4 ring-1 ring-oat">
      <div className="flex items-center gap-2 text-rust">
        {icon}
        <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-ink/70">{body}</p>
    </div>
  );
}
