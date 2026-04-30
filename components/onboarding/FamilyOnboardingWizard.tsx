"use client";

import {
  ArrowLeft,
  ArrowRight,
  Baby,
  CheckCircle,
  CircleNotch,
  EnvelopeSimple,
  HandHeart,
  Heart,
  HouseLine,
  MapPinArea,
  Plus,
  Trash,
  Users
} from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { categories, neighbourhoods } from "@/lib/data/taxonomy";
import {
  createFamilyInvite,
  markOnboardingComplete,
  updateFamily,
  upsertOwnProfile
} from "@/lib/family";
import { createClient } from "@/lib/supabase/client";
import type {
  Family,
  FamilyProfile,
  FamilyRole,
  Neighbourhood,
  VenueCategory
} from "@/lib/types";

type Props = {
  userId: string;
  userEmail: string | null;
  family: Family;
  profile: FamilyProfile | null;
  next: string;
  locale: "da" | "en";
};

type ChildDraft = {
  key: string;
  name: string;
  dateOfBirth: string;
};

type InviteDraft = {
  key: string;
  name: string;
  email: string;
  role: FamilyRole;
};

const APP_NAME = "Lille Liv";

const COPY = {
  da: {
    eyebrow: "Velkommen til Lille Liv",
    title: "Lad os sætte familien op",
    subtitle:
      "Fire korte trin: navngiv familien, tilføj børn og voksne, vælg jeres områder og interesser.",
    stepLabel: "Trin {current} af {total}",
    next: "Videre",
    back: "Tilbage",
    submit: "Færdig",
    submitting: "Gemmer…",
    skip: "Spring trinnet over",
    saveError: "Noget gik galt. Prøv igen.",
    family: {
      title: "Jeres familie",
      subtitle: "Et navn og en kort beskrivelse — det vises i delte øjeblikke.",
      nameLabel: "Familiens navn",
      namePlaceholder: "Fx Familien Hansen",
      descriptionLabel: "Kort beskrivelse",
      descriptionPlaceholder: "To forældre, to børn og en kat i Nørrebro."
    },
    members: {
      title: "Hvem er med?",
      subtitle:
        "Tilføj børnene i familien og inviter andre voksne. Du kan altid ændre det senere.",
      childrenTitle: "Børn",
      childrenSubtitle: "Navn og fødselsdato pr. barn.",
      addChild: "Tilføj barn",
      childName: "Navn",
      childNamePlaceholder: "Fx Asta",
      childDob: "Fødselsdato",
      remove: "Fjern",
      adultsTitle: "Voksne",
      adultsSubtitle:
        "Send et magisk link, så de kan logge ind direkte og deltage i familien.",
      addAdult: "Tilføj voksen",
      adultName: "Navn",
      adultEmail: "E-mail",
      adultRole: "Rolle"
    },
    location: {
      title: "Hvor leger I helst?",
      subtitle: "Vælg de bydele og områder I færdes mest i.",
      none: "Ingen valgt endnu — det er også ok."
    },
    interests: {
      title: "Hvad er I til?",
      subtitle: "Det hjælper os med at foreslå steder og oplevelser, I vil elske.",
      none: "Ingen valgt endnu — vi viser jer et udvalg uanset hvad."
    },
    roles: {
      parent: "Forælder",
      family: "Familie",
      caregiver: "Dagplejer"
    } as Record<FamilyRole, string>
  },
  en: {
    eyebrow: "Welcome to Lille Liv",
    title: "Let's set your family up",
    subtitle:
      "Four short steps: name the family, add children and adults, pick your areas and interests.",
    stepLabel: "Step {current} of {total}",
    next: "Continue",
    back: "Back",
    submit: "Finish",
    submitting: "Saving…",
    skip: "Skip this step",
    saveError: "Something went wrong. Please try again.",
    family: {
      title: "Your family",
      subtitle: "A name and a short description — shown in shared moments.",
      nameLabel: "Family name",
      namePlaceholder: "e.g. The Hansen family",
      descriptionLabel: "Short description",
      descriptionPlaceholder: "Two parents, two kids and a cat in Nørrebro."
    },
    members: {
      title: "Who's in the family?",
      subtitle: "Add the children and invite other adults. You can change it any time.",
      childrenTitle: "Children",
      childrenSubtitle: "One name and date of birth per child.",
      addChild: "Add child",
      childName: "Name",
      childNamePlaceholder: "e.g. Asta",
      childDob: "Date of birth",
      remove: "Remove",
      adultsTitle: "Adults",
      adultsSubtitle: "We'll send a magic link so they can sign in and join the family.",
      addAdult: "Add adult",
      adultName: "Name",
      adultEmail: "Email",
      adultRole: "Role"
    },
    location: {
      title: "Where do you spend time?",
      subtitle: "Pick the neighbourhoods you visit most.",
      none: "Nothing picked yet — that's fine too."
    },
    interests: {
      title: "What do you love?",
      subtitle: "We'll use this to suggest places and experiences you'll enjoy.",
      none: "Nothing picked yet — we'll still show a curated mix."
    },
    roles: {
      parent: "Parent",
      family: "Family",
      caregiver: "Caregiver"
    } as Record<FamilyRole, string>
  }
} as const;

const TAGLINE = {
  da: "Familieliv i København, samlet og roligt.",
  en: "Copenhagen family life, gently organized."
};

const TOTAL_STEPS = 4;
const ADULT_ROLES: FamilyRole[] = ["parent", "family", "caregiver"];

function makeKey() {
  return Math.random().toString(36).slice(2, 10);
}

export function FamilyOnboardingWizard({
  userId,
  userEmail,
  family,
  profile,
  next,
  locale
}: Props) {
  const router = useRouter();
  const copy = COPY[locale];

  const [step, setStep] = useState(1);
  const [familyName, setFamilyName] = useState(family.name);
  const [familyDescription, setFamilyDescription] = useState(family.description ?? "");
  const [children, setChildren] = useState<ChildDraft[]>([
    { key: makeKey(), name: "", dateOfBirth: "" }
  ]);
  const [invites, setInvites] = useState<InviteDraft[]>([]);
  const [neighbourhoodPicks, setNeighbourhoodPicks] = useState<Neighbourhood[]>(
    profile?.neighbourhoods ?? []
  );
  const [interests, setInterests] = useState<VenueCategory[]>(profile?.interests ?? []);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const inviterName = useMemo(
    () => profile?.displayName?.trim() || userEmail || "A family member",
    [profile?.displayName, userEmail]
  );

  function addChild() {
    setChildren((current) => [...current, { key: makeKey(), name: "", dateOfBirth: "" }]);
  }
  function removeChild(key: string) {
    setChildren((current) => current.filter((c) => c.key !== key));
  }
  function patchChild(key: string, patch: Partial<ChildDraft>) {
    setChildren((current) => current.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  }

  function addInvite() {
    setInvites((current) => [
      ...current,
      { key: makeKey(), name: "", email: "", role: "parent" }
    ]);
  }
  function removeInvite(key: string) {
    setInvites((current) => current.filter((i) => i.key !== key));
  }
  function patchInvite(key: string, patch: Partial<InviteDraft>) {
    setInvites((current) => current.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function toggleNeighbourhood(name: Neighbourhood) {
    setNeighbourhoodPicks((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    );
  }

  function toggleCategory(category: VenueCategory) {
    setInterests((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  }

  const familyValid = familyName.trim().length > 0;

  function goNext(event?: FormEvent) {
    event?.preventDefault();
    if (step < TOTAL_STEPS) setStep(step + 1);
  }
  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setError(copy.saveError);
      setSubmitting(false);
      return;
    }

    try {
      // 1. Family details
      if (
        familyName.trim() !== family.name ||
        (familyDescription.trim() || null) !== (family.description ?? null)
      ) {
        await updateFamily(supabase, family.id, {
          name: familyName.trim() || family.name,
          description: familyDescription.trim() || null
        });
      }

      // 2. Profile preferences (interests + neighbourhoods)
      await upsertOwnProfile(supabase, userId, {
        displayName: profile?.displayName ?? null,
        pronouns: profile?.pronouns ?? null,
        bio: profile?.bio ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
        preferredRole: profile?.preferredRole ?? "parent",
        preferredLocale: profile?.preferredLocale ?? locale,
        interests,
        neighbourhoods: neighbourhoodPicks,
        indoorPreference: profile?.indoorPreference ?? "any",
        childAgeMinMonths: profile?.childAgeMinMonths ?? null,
        childAgeMaxMonths: profile?.childAgeMaxMonths ?? null,
        notifyEmail: profile?.notifyEmail ?? true,
        onboardingCompletedAt: profile?.onboardingCompletedAt ?? null
      });

      // 3. Children rows
      const validChildren = children.filter(
        (c) => c.name.trim() && c.dateOfBirth.trim()
      );
      if (validChildren.length > 0) {
        const { error: childError } = await supabase.from("children").insert(
          validChildren.map((child) => ({
            user_id: userId,
            name: child.name.trim(),
            date_of_birth: child.dateOfBirth
          }))
        );
        if (childError) throw childError;
      }

      // 4. Adult invites — create row + send magic link (matches ProfilePanel pattern).
      const validInvites = invites.filter((i) => i.email.trim());
      const origin = typeof window === "undefined" ? "" : window.location.origin;
      for (const invite of validInvites) {
        const created = await createFamilyInvite(supabase, userId, {
          familyId: family.id,
          invitedEmail: invite.email,
          invitedName: invite.name || undefined,
          role: invite.role
        });
        await supabase.auth.signInWithOtp({
          email: invite.email.trim(),
          options: {
            emailRedirectTo: `${origin}/auth/callback?invite=${created.token}&next=/journal`,
            data: {
              app_name: APP_NAME,
              app_tagline: TAGLINE[locale],
              display_name: invite.name || null,
              preferred_role: invite.role,
              preferred_locale: locale,
              invite_token: created.token,
              invited_by_name: inviterName,
              family_name: familyName.trim() || family.name,
              invite_message: null
            }
          }
        });
      }

      // 5. Mark complete.
      await markOnboardingComplete(supabase, userId);

      router.replace(next);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : copy.saveError;
      setError(message);
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-card bg-surface p-5 ring-1 ring-hairline sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xs font-bold uppercase tracking-[0.16em] text-peach-300">
          {copy.eyebrow}
        </p>
        <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-subtle">
          {copy.stepLabel
            .replace("{current}", String(step))
            .replace("{total}", String(TOTAL_STEPS))}
        </p>
      </div>
      <div className="mt-2.5 flex gap-1.5" aria-hidden="true">
        {Array.from({ length: TOTAL_STEPS }, (_, index) => {
          const filled = index < step;
          return (
            <span
              key={index}
              className={`h-1 flex-1 rounded-pill transition-colors ${
                filled ? "bg-mint-300" : "bg-sunken"
              }`}
            />
          );
        })}
      </div>

      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
        {copy.title}
      </h1>
      <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted">{copy.subtitle}</p>

      <div className="mt-5">
        {step === 1 ? (
          <StepCard
            icon={<HouseLine size={16} weight="fill" className="text-mint-ink" aria-hidden="true" />}
            title={copy.family.title}
            subtitle={copy.family.subtitle}
          >
            <Field label={copy.family.nameLabel}>
              <Input
                required
                value={familyName}
                onChange={(event) => setFamilyName(event.target.value)}
                placeholder={copy.family.namePlaceholder}
              />
            </Field>
            <Field label={copy.family.descriptionLabel}>
              <Textarea
                value={familyDescription}
                onChange={(event) => setFamilyDescription(event.target.value)}
                rows={3}
                placeholder={copy.family.descriptionPlaceholder}
              />
            </Field>
          </StepCard>
        ) : null}

        {step === 2 ? (
          <StepCard
            icon={<Users size={16} weight="fill" className="text-mint-ink" aria-hidden="true" />}
            title={copy.members.title}
            subtitle={copy.members.subtitle}
          >
            <div>
              <h3 className="flex items-center gap-1.5 font-display text-base font-semibold text-ink">
                <Baby size={14} weight="fill" className="text-peach-300" aria-hidden="true" />
                {copy.members.childrenTitle}
              </h3>
              <p className="mt-0.5 text-xs text-muted">{copy.members.childrenSubtitle}</p>
              <ul className="mt-2.5 space-y-2.5">
                {children.map((child) => (
                  <li
                    key={child.key}
                    className="rounded-lg bg-sunken p-3 ring-1 ring-hairline"
                  >
                    <div className="grid gap-2 sm:grid-cols-[1fr_180px_auto]">
                      <Field label={copy.members.childName}>
                        <Input
                          value={child.name}
                          onChange={(event) =>
                            patchChild(child.key, { name: event.target.value })
                          }
                          placeholder={copy.members.childNamePlaceholder}
                        />
                      </Field>
                      <Field label={copy.members.childDob}>
                        <Input
                          type="date"
                          value={child.dateOfBirth}
                          onChange={(event) =>
                            patchChild(child.key, { dateOfBirth: event.target.value })
                          }
                        />
                      </Field>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeChild(child.key)}
                          className="focus-ring inline-flex h-9 items-center gap-1 rounded-pill px-2.5 text-xs font-semibold text-peach-ink hover:bg-peach-50"
                          aria-label={copy.members.remove}
                        >
                          <Trash size={12} weight="bold" aria-hidden="true" />
                          {copy.members.remove}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2.5"
                onClick={addChild}
              >
                <Plus size={12} weight="bold" aria-hidden="true" />
                {copy.members.addChild}
              </Button>
            </div>

            <div className="mt-5">
              <h3 className="flex items-center gap-1.5 font-display text-base font-semibold text-ink">
                <HandHeart size={14} weight="fill" className="text-info" aria-hidden="true" />
                {copy.members.adultsTitle}
              </h3>
              <p className="mt-0.5 text-xs text-muted">{copy.members.adultsSubtitle}</p>
              {invites.length > 0 ? (
                <ul className="mt-2.5 space-y-2.5">
                  {invites.map((invite) => (
                    <li
                      key={invite.key}
                      className="rounded-lg bg-sunken p-3 ring-1 ring-hairline"
                    >
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Field label={copy.members.adultName}>
                          <Input
                            value={invite.name}
                            onChange={(event) =>
                              patchInvite(invite.key, { name: event.target.value })
                            }
                          />
                        </Field>
                        <Field label={copy.members.adultEmail}>
                          <Input
                            type="email"
                            value={invite.email}
                            onChange={(event) =>
                              patchInvite(invite.key, { email: event.target.value })
                            }
                            placeholder="grandma@example.com"
                            leadingIcon={
                              <EnvelopeSimple size={13} weight="fill" aria-hidden="true" />
                            }
                          />
                        </Field>
                      </div>
                      <fieldset className="mt-2.5">
                        <legend className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
                          {copy.members.adultRole}
                        </legend>
                        <div className="flex flex-wrap gap-1.5">
                          {ADULT_ROLES.map((roleKey) => {
                            const active = invite.role === roleKey;
                            return (
                              <button
                                key={roleKey}
                                type="button"
                                onClick={() => patchInvite(invite.key, { role: roleKey })}
                                className={`focus-ring rounded-pill px-3 py-1.5 text-xs font-semibold ring-1 transition-colors ${
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
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeInvite(invite.key)}
                          className="focus-ring inline-flex h-8 items-center gap-1 rounded-pill px-2.5 text-xs font-semibold text-peach-ink hover:bg-peach-50"
                        >
                          <Trash size={12} weight="bold" aria-hidden="true" />
                          {copy.members.remove}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2.5"
                onClick={addInvite}
              >
                <Plus size={12} weight="bold" aria-hidden="true" />
                {copy.members.addAdult}
              </Button>
            </div>
          </StepCard>
        ) : null}

        {step === 3 ? (
          <StepCard
            icon={<MapPinArea size={16} weight="fill" className="text-info" aria-hidden="true" />}
            title={copy.location.title}
            subtitle={copy.location.subtitle}
          >
            <div className="flex flex-wrap gap-1.5">
              {neighbourhoods.map((hood) => {
                const active = neighbourhoodPicks.includes(hood);
                return (
                  <button
                    key={hood}
                    type="button"
                    onClick={() => toggleNeighbourhood(hood)}
                    className={`focus-ring rounded-pill px-3 py-1.5 text-xs font-semibold ring-1 transition-colors ${
                      active
                        ? "bg-mint-ink text-white ring-mint-ink"
                        : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
                    }`}
                  >
                    {hood}
                  </button>
                );
              })}
            </div>
            {neighbourhoodPicks.length === 0 ? (
              <p className="mt-3 text-xs text-subtle">{copy.location.none}</p>
            ) : null}
          </StepCard>
        ) : null}

        {step === 4 ? (
          <StepCard
            icon={<Heart size={16} weight="fill" className="text-peach-300" aria-hidden="true" />}
            title={copy.interests.title}
            subtitle={copy.interests.subtitle}
          >
            <div className="flex flex-wrap gap-1.5">
              {categories.map((category) => {
                const active = interests.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`focus-ring rounded-pill px-3 py-1.5 text-xs font-semibold ring-1 transition-colors ${
                      active
                        ? "bg-mint-300 text-white ring-mint-300"
                        : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
                    }`}
                  >
                    {CATEGORY_LABELS[locale][category]}
                  </button>
                );
              })}
            </div>
            {interests.length === 0 ? (
              <p className="mt-3 text-xs text-subtle">{copy.interests.none}</p>
            ) : null}
          </StepCard>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-peach-50 p-2.5 text-sm font-semibold text-danger ring-1 ring-peach-100">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          disabled={step === 1 || submitting}
        >
          <ArrowLeft size={14} weight="bold" aria-hidden="true" />
          {copy.back}
        </Button>
        {step < TOTAL_STEPS ? (
          <Button
            type="button"
            onClick={() => goNext()}
            disabled={step === 1 && !familyValid}
          >
            {copy.next}
            <ArrowRight size={14} weight="bold" aria-hidden="true" />
          </Button>
        ) : (
          <Button type="button" onClick={submit} disabled={submitting}>
            {submitting ? (
              <>
                <CircleNotch size={14} weight="bold" className="animate-spin" aria-hidden="true" />
                {copy.submitting}
              </>
            ) : (
              <>
                <CheckCircle size={14} weight="fill" aria-hidden="true" />
                {copy.submit}
              </>
            )}
          </Button>
        )}
      </div>
    </section>
  );
}

const CATEGORY_LABELS: Record<"da" | "en", Record<VenueCategory, string>> = {
  da: {
    cafe: "Café",
    playground: "Legeplads",
    indoor_play: "Indendørs leg",
    cinema: "Babybio",
    library: "Bibliotek",
    swimming: "Svømning",
    theatre: "Teater",
    event: "Sæson"
  },
  en: {
    cafe: "Cafe",
    playground: "Playground",
    indoor_play: "Indoor play",
    cinema: "Baby cinema",
    library: "Library",
    swimming: "Swimming",
    theatre: "Theatre",
    event: "Seasonal"
  }
};

function StepCard({
  icon,
  title,
  subtitle,
  children
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card bg-sunken p-4 ring-1 ring-hairline sm:p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      </div>
      {subtitle ? <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p> : null}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
