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
  ListChecks,
  MapPinArea,
  PencilSimple,
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
  message: string;
};

const APP_NAME = "Lille Liv";

const COPY = {
  da: {
    eyebrow: "Velkommen til Lille Liv",
    title: "Lad os sætte familien op",
    subtitle:
      "Fem korte trin: navngiv familien, tilføj børn og voksne, vælg jeres områder og interesser, og bekræft inden vi sender invitationer.",
    stepLabel: "Trin {current} af {total}",
    next: "Videre",
    back: "Tilbage",
    submit: "Bekræft og færdig",
    submitting: "Gemmer…",
    skip: "Spring trinnet over",
    saveError: "Noget gik galt. Prøv igen.",
    family: {
      title: "Bekræft jeres familienavn",
      subtitle: "Vi har lavet en familie til dig. Tilpas navnet og tilføj evt. en kort beskrivelse.",
      nameLabel: "Familiens navn",
      namePlaceholder: "Fx Familien Hansen",
      descriptionLabel: "Kort beskrivelse (valgfri)",
      descriptionPlaceholder: "To forældre, to børn og en kat i Nørrebro."
    },
    members: {
      title: "Hvem er med?",
      subtitle:
        "Tilføj børnene i familien og inviter andre voksne. Det er valgfrit — du kan altid gøre det senere.",
      childrenTitle: "Børn",
      childrenSubtitle: "Navn og fødselsdato pr. barn. Lille Liv passer bedst til 0–6 år.",
      addChild: "Tilføj barn",
      addFirstChild: "Tilføj jeres første barn",
      noChildrenYet: "Ingen børn tilføjet endnu — du kan også springe trinnet over.",
      childName: "Navn",
      childNamePlaceholder: "Fx Asta",
      childDob: "Fødselsdato",
      childAgeWarning: "Børn skal være mellem 0 og 6 år for at få det meste ud af Lille Liv.",
      remove: "Fjern",
      adultsTitle: "Voksne",
      adultsSubtitle:
        "Send et loginlink, så de kan logge ind direkte og deltage i familien.",
      addAdult: "Tilføj voksen",
      noAdultsYet: "Ingen voksne tilføjet endnu — du kan invitere dem senere fra profilen.",
      adultName: "Navn",
      adultEmail: "E-mail",
      adultRole: "Rolle",
      adultMessageLabel: "Personlig besked (valgfri)",
      adultMessagePlaceholder: "Fx: Hej mor, jeg har tilføjet dig så du kan se billeder af Asta.",
      adultMessageHelp: "Vises i invitationsmailen og på indgangssiden."
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
    review: {
      title: "Klar til at gå i gang?",
      subtitle:
        "Tjek lige det hele igennem. Når du klikker færdig, opretter vi børn og sender invitationer.",
      familyHeading: "Familie",
      childrenHeading: "Børn",
      invitesHeading: "Invitationer",
      locationHeading: "Områder",
      interestsHeading: "Interesser",
      noChildren: "Ingen børn tilføjet — det kan du gøre senere.",
      noInvites: "Ingen invitationer — du kan invitere familien senere fra profilen.",
      noLocations: "Ingen områder valgt.",
      noInterests: "Ingen interesser valgt.",
      edit: "Rediger"
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
      "Five short steps: name the family, add children and adults, pick your areas and interests, then review before we send any invitations.",
    stepLabel: "Step {current} of {total}",
    next: "Continue",
    back: "Back",
    submit: "Confirm and finish",
    submitting: "Saving…",
    skip: "Skip this step",
    saveError: "Something went wrong. Please try again.",
    family: {
      title: "Confirm your family's name",
      subtitle:
        "We've created a family for you. Adjust the name and add a short description if you like.",
      nameLabel: "Family name",
      namePlaceholder: "e.g. The Hansen family",
      descriptionLabel: "Short description (optional)",
      descriptionPlaceholder: "Two parents, two kids and a cat in Nørrebro."
    },
    members: {
      title: "Who's in the family?",
      subtitle:
        "Add the children and invite other adults. It's optional — you can do this any time.",
      childrenTitle: "Children",
      childrenSubtitle:
        "One name and date of birth per child. Lille Liv works best for ages 0–6.",
      addChild: "Add another child",
      addFirstChild: "Add your first child",
      noChildrenYet: "No children added yet — that's fine, you can skip this step.",
      childName: "Name",
      childNamePlaceholder: "e.g. Asta",
      childDob: "Date of birth",
      childAgeWarning: "Children should be between 0 and 6 years old to get the most from Lille Liv.",
      remove: "Remove",
      adultsTitle: "Adults",
      adultsSubtitle: "We'll email a sign-in link so they can join the family.",
      addAdult: "Add adult",
      noAdultsYet: "No adults invited yet — you can invite them later from your profile.",
      adultName: "Name",
      adultEmail: "Email",
      adultRole: "Role",
      adultMessageLabel: "Personal message (optional)",
      adultMessagePlaceholder: "e.g. Hi mom, I added you so you can see photos of Asta.",
      adultMessageHelp: "Shown in the invitation email and on the landing page."
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
    review: {
      title: "Ready to start?",
      subtitle:
        "Have a quick look. When you finish, we'll add your children and send out invitations.",
      familyHeading: "Family",
      childrenHeading: "Children",
      invitesHeading: "Invitations",
      locationHeading: "Areas",
      interestsHeading: "Interests",
      noChildren: "No children added — you can do this later.",
      noInvites: "No invitations — you can invite family later from your profile.",
      noLocations: "No areas picked.",
      noInterests: "No interests picked.",
      edit: "Edit"
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

const TOTAL_STEPS = 5;
const REVIEW_STEP = 5;
const ADULT_ROLES: FamilyRole[] = ["parent", "family", "caregiver"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function ageInYears(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) years -= 1;
  return years;
}

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
  // Start with an empty list — auto-inserting a blank row felt like a forced ask.
  // The empty state offers an "Add your first child" CTA instead.
  const [children, setChildren] = useState<ChildDraft[]>([]);
  const [invites, setInvites] = useState<InviteDraft[]>([]);
  const todayBound = useMemo(() => todayIso(), []);
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
      { key: makeKey(), name: "", email: "", role: "parent", message: "" }
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
        const trimmedMessage = invite.message.trim() || undefined;
        const created = await createFamilyInvite(supabase, userId, {
          familyId: family.id,
          invitedEmail: invite.email,
          invitedName: invite.name || undefined,
          role: invite.role,
          message: trimmedMessage
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
              invite_message: trimmedMessage ?? null
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
        <p className="text-2xs font-bold uppercase tracking-[0.16em] text-warm-500">
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
                filled ? "bg-sage-500" : "bg-sunken"
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
            icon={<HouseLine size={16} weight="fill" className="text-sage-700" aria-hidden="true" />}
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
            icon={<Users size={16} weight="fill" className="text-sage-700" aria-hidden="true" />}
            title={copy.members.title}
            subtitle={copy.members.subtitle}
          >
            <div>
              <h3 className="flex items-center gap-1.5 font-display text-base font-semibold text-ink">
                <Baby size={14} weight="fill" className="text-warm-500" aria-hidden="true" />
                {copy.members.childrenTitle}
              </h3>
              <p className="mt-0.5 text-xs text-muted">{copy.members.childrenSubtitle}</p>
              {children.length === 0 ? (
                <p className="mt-2 rounded-lg bg-surface p-2.5 text-xs text-subtle ring-1 ring-hairline">
                  {copy.members.noChildrenYet}
                </p>
              ) : (
                <ul className="mt-2.5 space-y-2.5">
                  {children.map((child) => {
                    const age = ageInYears(child.dateOfBirth);
                    const ageOutOfRange =
                      child.dateOfBirth.length > 0 && age !== null && (age < 0 || age > 6);
                    return (
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
                              max={todayBound}
                              onChange={(event) =>
                                patchChild(child.key, { dateOfBirth: event.target.value })
                              }
                            />
                          </Field>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeChild(child.key)}
                              className="focus-ring inline-flex h-9 items-center gap-1 rounded-pill px-2.5 text-xs font-semibold text-warm-600 hover:bg-warm-50"
                              aria-label={copy.members.remove}
                            >
                              <Trash size={12} weight="bold" aria-hidden="true" />
                              {copy.members.remove}
                            </button>
                          </div>
                        </div>
                        {ageOutOfRange ? (
                          <p className="mt-2 text-xs text-warning">
                            {copy.members.childAgeWarning}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2.5"
                onClick={addChild}
              >
                <Plus size={12} weight="bold" aria-hidden="true" />
                {children.length === 0 ? copy.members.addFirstChild : copy.members.addChild}
              </Button>
            </div>

            <div className="mt-5">
              <h3 className="flex items-center gap-1.5 font-display text-base font-semibold text-ink">
                <HandHeart size={14} weight="fill" className="text-info" aria-hidden="true" />
                {copy.members.adultsTitle}
              </h3>
              <p className="mt-0.5 text-xs text-muted">{copy.members.adultsSubtitle}</p>
              {invites.length === 0 ? (
                <p className="mt-2 rounded-lg bg-surface p-2.5 text-xs text-subtle ring-1 ring-hairline">
                  {copy.members.noAdultsYet}
                </p>
              ) : (
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
                                    ? "bg-sage-500 text-white ring-sage-500"
                                    : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
                                }`}
                              >
                                {copy.roles[roleKey]}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                      <Field label={copy.members.adultMessageLabel}>
                        <Textarea
                          rows={2}
                          value={invite.message}
                          onChange={(event) =>
                            patchInvite(invite.key, { message: event.target.value })
                          }
                          placeholder={copy.members.adultMessagePlaceholder}
                          maxLength={400}
                        />
                        <span className="mt-1 block text-2xs text-subtle">
                          {copy.members.adultMessageHelp}
                        </span>
                      </Field>
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeInvite(invite.key)}
                          className="focus-ring inline-flex h-8 items-center gap-1 rounded-pill px-2.5 text-xs font-semibold text-warm-600 hover:bg-warm-50"
                        >
                          <Trash size={12} weight="bold" aria-hidden="true" />
                          {copy.members.remove}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
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
                        ? "bg-sage-700 text-white ring-sage-700"
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
            icon={<Heart size={16} weight="fill" className="text-warm-500" aria-hidden="true" />}
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
                        ? "bg-sage-500 text-white ring-sage-500"
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

        {step === REVIEW_STEP ? (
          <StepCard
            icon={<ListChecks size={16} weight="fill" className="text-sage-700" aria-hidden="true" />}
            title={copy.review.title}
            subtitle={copy.review.subtitle}
          >
            <ReviewSection
              heading={copy.review.familyHeading}
              onEdit={() => setStep(1)}
              editLabel={copy.review.edit}
            >
              <p className="text-sm font-semibold text-ink">
                {familyName.trim() || family.name}
              </p>
              {familyDescription.trim() ? (
                <p className="mt-0.5 text-sm leading-6 text-muted">
                  {familyDescription.trim()}
                </p>
              ) : null}
            </ReviewSection>

            <ReviewSection
              heading={copy.review.childrenHeading}
              onEdit={() => setStep(2)}
              editLabel={copy.review.edit}
            >
              {children.filter((c) => c.name.trim() && c.dateOfBirth.trim()).length === 0 ? (
                <p className="text-sm text-subtle">{copy.review.noChildren}</p>
              ) : (
                <ul className="space-y-1 text-sm text-ink">
                  {children
                    .filter((c) => c.name.trim() && c.dateOfBirth.trim())
                    .map((child) => (
                      <li key={child.key} className="flex items-center gap-2">
                        <Baby
                          size={12}
                          weight="fill"
                          className="text-warm-500"
                          aria-hidden="true"
                        />
                        <span className="font-semibold">{child.name.trim()}</span>
                        <span className="text-muted">· {child.dateOfBirth}</span>
                      </li>
                    ))}
                </ul>
              )}
            </ReviewSection>

            <ReviewSection
              heading={copy.review.invitesHeading}
              onEdit={() => setStep(2)}
              editLabel={copy.review.edit}
            >
              {invites.filter((i) => i.email.trim()).length === 0 ? (
                <p className="text-sm text-subtle">{copy.review.noInvites}</p>
              ) : (
                <ul className="space-y-1.5 text-sm text-ink">
                  {invites
                    .filter((i) => i.email.trim())
                    .map((invite) => (
                      <li key={invite.key}>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          {invite.name.trim() ? (
                            <span className="font-semibold">{invite.name.trim()}</span>
                          ) : null}
                          <span className="text-muted">{invite.email.trim()}</span>
                          <span className="rounded-pill bg-sage-100 px-2 py-0.5 text-2xs font-semibold uppercase tracking-[0.1em] text-sage-700">
                            {copy.roles[invite.role]}
                          </span>
                        </div>
                        {invite.message.trim() ? (
                          <p className="mt-1 text-xs italic leading-5 text-muted">
                            &ldquo;{invite.message.trim()}&rdquo;
                          </p>
                        ) : null}
                      </li>
                    ))}
                </ul>
              )}
            </ReviewSection>

            <ReviewSection
              heading={copy.review.locationHeading}
              onEdit={() => setStep(3)}
              editLabel={copy.review.edit}
            >
              {neighbourhoodPicks.length === 0 ? (
                <p className="text-sm text-subtle">{copy.review.noLocations}</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {neighbourhoodPicks.map((hood) => (
                    <span
                      key={hood}
                      className="rounded-pill bg-sage-100 px-2.5 py-1 text-2xs font-semibold text-sage-700"
                    >
                      {hood}
                    </span>
                  ))}
                </div>
              )}
            </ReviewSection>

            <ReviewSection
              heading={copy.review.interestsHeading}
              onEdit={() => setStep(4)}
              editLabel={copy.review.edit}
            >
              {interests.length === 0 ? (
                <p className="text-sm text-subtle">{copy.review.noInterests}</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((category) => (
                    <span
                      key={category}
                      className="rounded-pill bg-warm-50 px-2.5 py-1 text-2xs font-semibold text-warm-600"
                    >
                      {CATEGORY_LABELS[locale][category]}
                    </span>
                  ))}
                </div>
              )}
            </ReviewSection>
          </StepCard>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-warm-50 p-2.5 text-sm font-semibold text-danger ring-1 ring-warm-100">
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
        <div className="flex flex-wrap items-center gap-2">
          {/* Steps 2–4 are optional. Skip jumps straight to the review step
              without clearing what's already typed, so the user can come back. */}
          {step >= 2 && step <= 4 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(REVIEW_STEP)}
              disabled={submitting}
            >
              {copy.skip}
            </Button>
          ) : null}
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

function ReviewSection({
  heading,
  onEdit,
  editLabel,
  children
}: {
  heading: string;
  onEdit: () => void;
  editLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg bg-surface p-3 ring-1 ring-hairline">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-2xs font-bold uppercase tracking-[0.12em] text-muted">
          {heading}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="focus-ring inline-flex items-center gap-1 rounded-pill px-2 py-1 text-2xs font-semibold text-warm-600 hover:bg-warm-50"
        >
          <PencilSimple size={11} weight="bold" aria-hidden="true" />
          {editLabel}
        </button>
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}
