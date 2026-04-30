"use client";

import {
  CheckCircle,
  CircleNotch,
  EnvelopeSimple,
  HandHeart,
  UserCircle
} from "@phosphor-icons/react/dist/ssr";
import { useLocale } from "next-intl";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
  /**
   * "signin" — minimal email-only form for returning users.
   * "signup" — full form (name + role + email) for first-time users and invitees.
   * Defaults to "signin". Forced to "signup" when an invite is present.
   */
  initialMode?: "signin" | "signup";
};

const APP_NAME = "Lille Liv";

const COPY = {
  da: {
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
    signinTitle: "Log ind",
    signinSubtitle: "Indtast din e-mail, så sender vi et magisk loginlink.",
    signupTitle: "Opret jeres familie",
    signupSubtitle: "Få adgang ved at oprette en familie og få et magisk link.",
    toSignup: "Første gang? Opret jeres familie",
    toSignin: "Har I allerede en familie? Log ind",
    roles: {
      parent: "Forælder",
      family: "Bedsteforælder / familie",
      caregiver: "Dagplejer"
    } as Record<FamilyRole, string>
  },
  en: {
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
    signinTitle: "Sign in",
    signinSubtitle: "Enter your email and we'll send a magic sign-in link.",
    signupTitle: "Create your family",
    signupSubtitle: "Get started by creating a family and receiving a magic link.",
    toSignup: "First time? Create your family",
    toSignin: "Already have a family? Sign in",
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

export function LoginForm({
  invite,
  redirectTo = "/journal",
  locale,
  initialMode = "signin"
}: LoginFormProps) {
  const activeLocale = useLocale();
  const effectiveLocale: "da" | "en" =
    locale ?? (activeLocale === "en" ? "en" : "da");
  const copy = COPY[effectiveLocale];
  const [mode, setMode] = useState<"signin" | "signup">(invite ? "signup" : initialMode);
  const isSignup = mode === "signup" || Boolean(invite);
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

    // In sign-in mode we don't collect a name or role — only forward email-template
    // basics so we don't overwrite an existing user's metadata. Sign-up and invite
    // flows still pass the full payload.
    const data = isSignup
      ? {
          app_name: APP_NAME,
          app_tagline: TAGLINE[effectiveLocale],
          display_name: displayName.trim() || null,
          preferred_role: role,
          preferred_locale: effectiveLocale,
          invite_token: invite?.token ?? null,
          invited_by_name: invite?.invitedByName ?? null,
          family_name: invite?.familyName ?? null,
          invite_message: invite?.message ?? null
        }
      : {
          app_name: APP_NAME,
          app_tagline: TAGLINE[effectiveLocale],
          preferred_locale: effectiveLocale
        };

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callback,
        data
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
      <div className="rounded-card bg-surface p-5 ring-1 ring-hairline">
        <div className="flex items-center gap-2 text-mint-ink">
          <CheckCircle size={20} weight="fill" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold text-ink">{copy.sentTitle}</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">
          {copy.sentBody.replace("{email}", email)}
        </p>
        {invite ? (
          <p className="mt-1 text-sm leading-6 text-subtle">{copy.sentHintInvite}</p>
        ) : null}
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="focus-ring mt-4 text-sm font-semibold text-peach-ink underline-offset-4 hover:underline"
        >
          {locale === "da" ? "Send igen" : "Resend"}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submitMagicLink}
      className="rounded-card bg-surface p-5 ring-1 ring-hairline"
    >
      {invite ? (
        <div className="mb-4 rounded-card bg-mint-ink p-4 text-white">
          <div className="flex items-center gap-2 text-canvas">
            <HandHeart size={16} weight="fill" aria-hidden="true" />
            <p className="text-2xs font-bold uppercase tracking-[0.16em]">
              {locale === "da" ? "Familie-invitation" : "Family invite"}
            </p>
          </div>
          <h2 className="mt-1.5 font-display text-xl font-semibold leading-tight">
            {invite.invitedByName && invite.familyName
              ? copy.inviteHeadline
                  .replace("{inviter}", invite.invitedByName)
                  .replace("{family}", invite.familyName)
              : copy.inviteFallback}
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-white/85">{copy.inviteIntro}</p>
          {invite.message ? (
            <p className="mt-2.5 rounded-lg bg-white/10 p-2.5 text-sm italic leading-6 text-white/95">
              &ldquo;{invite.message}&rdquo;
            </p>
          ) : null}
        </div>
      ) : null}

      {!invite ? (
        <div className="mb-4">
          <h2 className="font-display text-xl font-semibold text-ink">
            {isSignup ? copy.signupTitle : copy.signinTitle}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            {isSignup ? copy.signupSubtitle : copy.signinSubtitle}
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {isSignup ? (
          <>
            <label className="block">
              <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
                {copy.nameLabel}
              </span>
              <Input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder={copy.namePlaceholder}
                autoComplete="given-name"
                leadingIcon={<UserCircle size={15} weight="fill" aria-hidden="true" />}
              />
              <span className="mt-1 block text-xs text-subtle">{copy.nameHelp}</span>
            </label>

            <fieldset>
              <legend className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
                {copy.roleLabel}
              </legend>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(copy.roles) as FamilyRole[]).map((roleKey) => {
                  const active = role === roleKey;
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => setRole(roleKey)}
                      className={`focus-ring rounded-lg px-2 py-2 text-xs font-semibold ring-1 transition-colors ${
                        active
                          ? "bg-mint-300 text-white ring-mint-300"
                          : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
                      }`}
                    >
                      {copy.roles[roleKey]}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </>
        ) : null}

        <label className="block">
          <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
            {copy.emailLabel}
          </span>
          <Input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={copy.emailPlaceholder}
            autoComplete="email"
            leadingIcon={<EnvelopeSimple size={15} weight="fill" aria-hidden="true" />}
          />
        </label>
      </div>

      <Button type="submit" size="lg" className="mt-4 w-full" disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            <CircleNotch size={16} weight="bold" className="animate-spin" aria-hidden="true" />
            {copy.sending}
          </>
        ) : (
          <>
            <EnvelopeSimple size={15} weight="fill" aria-hidden="true" />
            {invite ? copy.submitInvite : copy.submit}
          </>
        )}
      </Button>

      {!invite ? (
        <button
          type="button"
          onClick={() => setMode(isSignup ? "signin" : "signup")}
          className="focus-ring mt-3 block w-full text-center text-sm font-semibold text-peach-ink underline-offset-4 hover:underline"
        >
          {isSignup ? copy.toSignin : copy.toSignup}
        </button>
      ) : null}

      {status === "error" ? (
        <p className="mt-3 rounded-lg bg-peach-50 p-2.5 text-sm font-semibold text-danger ring-1 ring-peach-100">
          {errorMessage || copy.error}
        </p>
      ) : null}

      {!supabaseAvailable ? (
        <p className="mt-3 rounded-lg bg-[#FBF1D9] p-2.5 text-xs font-semibold text-warning ring-1 ring-[#F0DFB1]">
          {copy.notConfigured}
        </p>
      ) : null}

      <p className="mt-3 text-2xs leading-5 text-subtle">{copy.privacy}</p>
    </form>
  );
}
