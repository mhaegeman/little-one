"use client";

import { Mail } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submitMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();

    if (!supabase) {
      setStatus("error");
      setMessage("Supabase mangler miljøvariabler.");
      return;
    }

    setStatus("loading");
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`
      }
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Tjek din indbakke for dit magiske link.");
  }

  return (
    <form onSubmit={submitMagicLink} className="rounded-card bg-white p-5 shadow-soft ring-1 ring-oat">
      <div className="flex items-center gap-2 text-rust">
        <Mail size={19} aria-hidden="true" />
        <h2 className="font-display text-2xl font-semibold text-ink">Log ind</h2>
      </div>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-bold text-ink/70">E-mail</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="focus-ring h-12 w-full rounded-xl bg-linen px-3 text-sm font-semibold ring-1 ring-oat"
          placeholder="navn@example.dk"
        />
      </label>
      <Button type="submit" className="mt-4 w-full" disabled={status === "loading"}>
        {status === "loading" ? "Sender..." : "Send magisk link"}
      </Button>
      {message ? (
        <p className="mt-3 rounded-xl bg-linen p-3 text-sm font-semibold text-ink/70">{message}</p>
      ) : null}
    </form>
  );
}
