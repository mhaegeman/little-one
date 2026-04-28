"use client";

import {
  CheckCircle2,
  HeartHandshake,
  Loader2,
  Mail,
  Sparkles,
  UserRound
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { FamilyRole } from "@/lib/types";

type LoginFormProps = {
  /** Optional invite context — when provided, the form switches to "join family" copy. */
  invite?: {
    token: string;
    familyName: string | null;
    invitedByName: string | null;
    suggestedEmail?: string | null;
    message?: string | null;
  };
  /** Where to send the user after the magic link is consumed. Defaults to /journal. */
  redirectTo?: string;
  /** Locale used to pick copy and forwarded into the email template. */
  locale?: "da" | "en";
};

const APP_NAME = "Lille Liv";

const COPY = {
  da: {
    eyebrow: "Velkommen",
    title: "Et roligt rum til hele familien",
    body: "Lille Liv samler milepæle, hverdagsglimt og udflugter for jer og dem, I deler hverdagen med — bedsteforældre, dagplejere, søskende.",
    bullets: [
      "Privat journal med fotos og milepæle",
      "Kuraterede ture i København 0-6 år",
      "Plads til hele familien — sammen"
    ],
    nameLabel: "Dit navn",
    namePlaceholder: "Fx Sofie",
    nameHelp: "Vises i e-mailen og i jeres familie.",
    roleLabel: "Hvem er du?",
    emailLabel: "E-mail",
    emailPlaceholder: "navn@example.dk",
    submit: "Send magisk link",
    submitInvite: "Tilslut familien",
    sending: "Sender...",
    sentTitle: "Tjek din indbakke",
    sentBody: "Vi har sendt et magisk link til {email}. Linket virker i 60 minutter.",
    sentHintInvite: "Klikker du på linket fra denne enhed, åbner familien sig med det samme.",
    notConfigured: "Supabase mangler miljøvariabler.",
    error: "Det gik ikke. Prøv igen om lidt.",
    privacy: "EU-hosted Supabase · Vi gemmer ingen Aula-adgangskoder.",
    inviteHeadline: "{inviter} har inviteret dig til {family}",
    inviteFallback: "Du er inviteret til en familie",
    inviteIntro: "Bekræft din e-mail med et magisk link, så åbner vi familiens delte rum.",
    locale: "Sprog",
    roles: {
      parent: "Forælder",
      family: "Bedsteforælder / familie",
      caregiver: "Dagplejer"
    } as Record<FamilyRole, string>
  },
  en: {
    eyebrow: "Welcome",
    title: "A calm space for the whole family",
    body: "Lille Liv gathers milestones, everyday glimpses and outings for you and the people who share your days — grandparents, caregivers, siblings.",
    bullets: [
      "Private journal with photos and milestones",
      "Curated outings in Copenhagen for 0-6 yrs",
      "Room for the whole family — together"
    ],
    nameLabel: "Your name",
    namePlaceholder: "e.g. Sofie",
    nameHelp: "Shown in the email and in your family.",
    roleLabel: "Who are you?",
    emailLabel: "Email",
    emailPlaceholder: "name@example.com",
    submit: "Send magic link",
    submitInvite: "Join the family",
    sending: "Sending...",
    sentTitle: "Check your inbox",
    sentBody: "We sent a magic link to {email}. It is valid for 60 minutes.",
    sentHintInvite: "Open the link on this device and the family opens right away.",
    notConfigured: "Supabase environment variables are missing.",
    error: "Something went wrong. Please try again.",
    privacy: "EU-hosted Supabase · We never store Aula passwords.",
    inviteHeadline: "{inviter} invited you to {family}",
    inviteFallback: "You're invited to a family",
    inviteIntro: "Confirm your email with a magic link and we'll open the shared family space.",
    locale: "Language",
    roles: {
      parent: "Parent",
      family: "Grandparent / family",
      caregiver: "Caregiver"
    } as Record<FamilyRole, string>
  }
} as const;

const TAGLINE = {
  da: "Familieliv i København, samlet og roligt.",
  en: "Copenhagen family life, gently organized."
};

type Status = "idle" | "loading" | "sent" | "error";

export function LoginForm({ invite, redirectTo = "/journal", locale = "da" }: LoginFormProps) {
  const copy = COPY[locale];
  const [email, setEmail] = useState(invite?.suggestedEmail ?? "");
  const [displayName, setDisplayName] = useState(invite ? invite.invitedByName ?? "" : "");
  const [role, setRole] = useState<FamilyRole>(invite ? "family" : "parent");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (invite?.suggestedEmail) setEmail(invite.suggestedEmail);
  }, [invite?.suggestedEmail]);

  const supabaseAvailable = useMemo(() => Boolean(createClient()), []);

  async function submitMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();

    if (!supabase) {
      setStatus("error");
      setErrorMessage(copy.notConfigured);
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const origin = window.location.origin;
    const callbackParams = new URLSearchParams();
    if (redirectTo) callbackParams.set("next", redirectTo);
    if (invite?.token) callbackParams.set("invite", invite.token);

    const callback = `${origin}/auth/callback${
      callbackParams.toString() ? `?${callbackParams.toString()}` : ""
    }`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callback,
        // Surfaces in the auth.users.raw_user_meta_data and in the email template via {{ .Data.* }}.
        data: {
          app_name: APP_NAME,
          app_tagline: TAGLINE[locale],
          display_name: displayName.trim() || null,
          preferred_role: role,
          preferred_locale: locale,
          invite_token: invite?.token ?? null,
          invited_by_name: invite?.invitedByName ?? null,
          family_name: invite?.familyName ?? null,
          invite_message: invite?.message ?? null
        }
      }
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message || copy.error);
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-card bg-white p-6 shadow-soft ring-1 ring-oat">
        <div className="flex items-center gap-2 text-mossDark">
          <CheckCircle2 size={22} aria-hidden="true" />
          <h2 className="font-display text-2xl font-semibold text-ink">{copy.sentTitle}</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-ink/75">
          {copy.sentBody.replace("{email}", email)}
        </p>
        {invite ? (
          <p className="mt-2 text-sm leading-6 text-ink/60">{copy.sentHintInvite}</p>
        ) : null}
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="focus-ring mt-4 text-sm font-bold text-rust underline-offset-4 hover:underline"
        >
          {locale === "da" ? "Send igen" : "Resend"}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submitMagicLink}
      className="rounded-card bg-white p-6 shadow-soft ring-1 ring-oat"
    >
      {invite ? (
        <div className="mb-5 rounded-card bg-gradient-to-br from-moss to-mossDark p-5 text-white">
          <div className="flex items-center gap-2 text-butter">
            <HeartHandshake size={19} aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.18em]">
              {locale === "da" ? "Familie-invitation" : "Family invite"}
            </p>
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">
            {invite.invitedByName && invite.familyName
              ? copy.inviteHeadline
                  .replace("{inviter}", invite.invitedByName)
                  .replace("{family}", invite.familyName)
              : copy.inviteFallback}
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/85">{copy.inviteIntro}</p>
          {invite.message ? (
            <p className="mt-3 rounded-xl bg-white/10 p-3 text-sm italic leading-6 text-white/95">
              &ldquo;{invite.message}&rdquo;
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rust">{copy.eyebrow}</p>
          <h2 className="mt-1 font-display text-3xl font-semibold leading-tight text-ink">
            {copy.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">{copy.body}</p>
          <ul className="mt-3 space-y-1.5">
            {copy.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm text-ink/80">
                <Sparkles size={15} className="mt-0.5 shrink-0 text-rust" aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
            {copy.nameLabel}
          </span>
          <span className="flex h-12 items-center gap-2 rounded-xl bg-linen px-3 ring-1 ring-oat focus-within:ring-2 focus-within:ring-moss">
            <UserRound size={17} className="text-ink/45" aria-hidden="true" />
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-ink/40"
              placeholder={copy.namePlaceholder}
              autoComplete="given-name"
            />
          </span>
          <span className="mt-1 block text-xs text-ink/50">{copy.nameHelp}</span>
        </label>

        <fieldset>
          <legend className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
            {copy.roleLabel}
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(copy.roles) as FamilyRole[]).map((roleKey) => {
              const active = role === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setRole(roleKey)}
                  className={`focus-ring rounded-xl px-2 py-2 text-xs font-bold ring-1 transition ${
                    active
                      ? "bg-moss text-white ring-moss"
                      : "bg-linen text-ink/70 ring-oat hover:bg-white"
                  }`}
                >
                  {copy.roles[roleKey]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
            {copy.emailLabel}
          </span>
          <span className="flex h-12 items-center gap-2 rounded-xl bg-linen px-3 ring-1 ring-oat focus-within:ring-2 focus-within:ring-moss">
            <Mail size={17} className="text-ink/45" aria-hidden="true" />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-ink/40"
              placeholder={copy.emailPlaceholder}
              autoComplete="email"
            />
          </span>
        </label>
      </div>

      <Button type="submit" className="mt-5 h-12 w-full text-base" disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            {copy.sending}
          </>
        ) : (
          <>
            <Mail size={17} aria-hidden="true" />
            {invite ? copy.submitInvite : copy.submit}
          </>
        )}
      </Button>

      {status === "error" ? (
        <p className="mt-3 rounded-xl bg-rust/10 p-3 text-sm font-semibold text-rust">
          {errorMessage || copy.error}
        </p>
      ) : null}

      {!supabaseAvailable ? (
        <p className="mt-3 rounded-xl bg-butter/40 p-3 text-xs font-semibold text-ink/70">
          {copy.notConfigured}
        </p>
      ) : null}

      <p className="mt-4 text-[11px] leading-5 text-ink/50">{copy.privacy}</p>
    </form>
  );
}
