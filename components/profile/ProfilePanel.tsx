"use client";

import {
  CheckCircle,
  Compass,
  Heart,
  Key,
  Sparkle,
  ShieldCheck,
  SignOut,
  SlidersHorizontal,
  SquaresFour,
  UserCircle,
  Users
} from "@phosphor-icons/react/dist/ssr";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { FamilyCard } from "@/components/profile/FamilyCard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { ProfilePreferences } from "@/components/profile/ProfilePreferences";
import { ProfileRecommendations } from "@/components/profile/ProfileRecommendations";
import { ProfileSaved } from "@/components/profile/ProfileSaved";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  createFamilyInvite,
  loadFamilyInvites,
  loadFamilyMembers,
  loadFamiliesForUser,
  loadOwnProfile,
  revokeFamilyInvite,
  updateFamily,
  upsertOwnProfile
} from "@/lib/family";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Family, FamilyInvite, FamilyMember, FamilyProfile } from "@/lib/types";

type FamilyView = {
  family: Family;
  isOwner: boolean;
  members: FamilyMember[];
  invites: FamilyInvite[];
};

type SessionUser = {
  id: string;
  email: string | null;
};

type Section =
  | "overview"
  | "profile"
  | "family"
  | "saved"
  | "recommendations"
  | "preferences"
  | "account";

const SECTIONS: {
  id: Section;
  label: string;
  description: string;
  icon: typeof SquaresFour;
}[] = [
  {
    id: "overview",
    label: "Oversigt",
    description: "Dit hjem her",
    icon: SquaresFour
  },
  {
    id: "profile",
    label: "Profil",
    description: "Navn, billede, bio",
    icon: UserCircle
  },
  {
    id: "family",
    label: "Familie",
    description: "Medlemmer & invitationer",
    icon: Users
  },
  {
    id: "saved",
    label: "Gemte",
    description: "Dine favoritsteder",
    icon: Heart
  },
  {
    id: "recommendations",
    label: "Anbefalinger",
    description: "Tilpasset feed",
    icon: Sparkle
  },
  {
    id: "preferences",
    label: "Præferencer",
    description: "Sprog, alder, notifikationer",
    icon: SlidersHorizontal
  },
  {
    id: "account",
    label: "Konto",
    description: "Privatliv & log ud",
    icon: ShieldCheck
  }
];

export function ProfilePanel() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [supabaseAvailable, setSupabaseAvailable] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<FamilyProfile | null>(null);
  const [familyViews, setFamilyViews] = useState<FamilyView[]>([]);
  const [logoutMessage, setLogoutMessage] = useState("");
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [section, setSection] = useState<Section>("overview");

  useEffect(() => {
    const sectionParam = searchParams.get("section");
    if (
      sectionParam === "overview" ||
      sectionParam === "profile" ||
      sectionParam === "family" ||
      sectionParam === "saved" ||
      sectionParam === "recommendations" ||
      sectionParam === "preferences" ||
      sectionParam === "account"
    ) {
      setSection(sectionParam);
    }
    if (searchParams.get("invite_accepted") === "1") {
      setBanner({ type: "success", text: "Du er nu med i familien." });
      setSection("family");
    } else if (searchParams.get("invite_error")) {
      setBanner({
        type: "error",
        text: `Invitation kunne ikke aktiveres: ${searchParams.get("invite_error")}`
      });
    }
  }, [searchParams]);

  async function refresh() {
    const supabase = createClient();
    if (!supabase) {
      setSupabaseAvailable(false);
      setLoading(false);
      return;
    }

    const {
      data: { user: authUser }
    } = await supabase.auth.getUser();

    if (!authUser) {
      setSignedIn(false);
      setLoading(false);
      return;
    }

    const sessionUser: SessionUser = { id: authUser.id, email: authUser.email ?? null };
    setUser(sessionUser);
    setSignedIn(true);

    const [profileRow, families] = await Promise.all([
      loadOwnProfile(supabase, authUser.id).catch(() => null),
      loadFamiliesForUser(supabase, authUser.id).catch(() => [])
    ]);

    setProfile(profileRow);

    const views: FamilyView[] = [];
    for (const entry of families) {
      const [members, invites] = await Promise.all([
        loadFamilyMembers(supabase, entry.family.id).catch(() => []),
        entry.role === "owner"
          ? loadFamilyInvites(supabase, entry.family.id).catch(() => [])
          : Promise.resolve<FamilyInvite[]>([])
      ]);
      views.push({
        family: entry.family,
        isOwner: entry.role === "owner",
        members,
        invites
      });
    }
    setFamilyViews(views);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    const supabase = createClient();
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function logout() {
    const supabase = createClient();
    if (!supabase) {
      setLogoutMessage("Supabase er ikke konfigureret i denne lokale demo.");
      return;
    }
    await supabase.auth.signOut();
    setLogoutMessage("Du er logget ud.");
    setSignedIn(false);
    setUser(null);
    setProfile(null);
    setFamilyViews([]);
  }

  async function handleProfileSave(patch: Omit<FamilyProfile, "userId">) {
    const supabase = createClient();
    if (!supabase || !user) throw new Error("Ikke logget ind.");
    const next = await upsertOwnProfile(supabase, user.id, patch);
    setProfile(next);
  }

  async function handleFamilyUpdate(
    familyId: string,
    patch: Partial<Pick<Family, "name" | "description" | "coverUrl">>
  ) {
    const supabase = createClient();
    if (!supabase) throw new Error("Ikke konfigureret.");
    const next = await updateFamily(supabase, familyId, patch);
    setFamilyViews((current) =>
      current.map((view) => (view.family.id === familyId ? { ...view, family: next } : view))
    );
  }

  async function handleCreateInvite(
    familyId: string,
    input: {
      invitedEmail?: string;
      invitedName?: string;
      role: FamilyInvite["role"];
      message?: string;
    }
  ) {
    const supabase = createClient();
    if (!supabase || !user) throw new Error("Ikke logget ind.");
    const invite = await createFamilyInvite(supabase, user.id, { familyId, ...input });

    if (input.invitedEmail) {
      const inviter = profile?.displayName ?? user.email ?? "Et familiemedlem";
      const familyName =
        familyViews.find((view) => view.family.id === familyId)?.family.name ?? "din familie";
      const origin = window.location.origin;
      await supabase.auth.signInWithOtp({
        email: input.invitedEmail,
        options: {
          emailRedirectTo: `${origin}/auth/callback?invite=${invite.token}&next=/journal`,
          data: {
            app_name: "Lille Liv",
            app_tagline: "Familieliv i København, samlet og roligt.",
            display_name: input.invitedName ?? null,
            preferred_role: input.role,
            preferred_locale: profile?.preferredLocale ?? "da",
            invite_token: invite.token,
            invited_by_name: inviter,
            family_name: familyName,
            invite_message: input.message ?? null
          }
        }
      });
    }

    setFamilyViews((current) =>
      current.map((view) =>
        view.family.id === familyId ? { ...view, invites: [invite, ...view.invites] } : view
      )
    );
    return invite;
  }

  async function handleRevokeInvite(familyId: string, inviteId: string) {
    const supabase = createClient();
    if (!supabase) throw new Error("Ikke konfigureret.");
    await revokeFamilyInvite(supabase, inviteId);
    setFamilyViews((current) =>
      current.map((view) =>
        view.family.id === familyId
          ? {
              ...view,
              invites: view.invites.map((invite) =>
                invite.id === inviteId ? { ...invite, status: "revoked" } : invite
              )
            }
          : view
      )
    );
  }

  const allMembers = useMemo(
    () => familyViews.flatMap((view) => view.members),
    [familyViews]
  );
  const ownerCount = useMemo(
    () => familyViews.filter((view) => view.isOwner).length,
    [familyViews]
  );

  if (loading) {
    return (
      <div className="px-4 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto max-w-5xl space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1fr_420px]">
          <section className="rounded-card bg-surface p-5 ring-1 ring-hairline">
            <p className="text-2xs font-bold uppercase tracking-[0.18em] text-warm-500">Profil</p>
            <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-ink">
              En personlig plads til familien
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              Log ind med et magisk link og åbn en privat hub: profil, præferencer, anbefalinger og
              en delt familieplads.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              <FeaturePoint
                icon={<Sparkle size={14} weight="fill" className="text-warm-500" aria-hidden="true" />}
                title="Skræddersyet feed"
                body="Anbefalinger der lytter til interesser, bydele og barnets alder."
              />
              <FeaturePoint
                icon={<Compass size={14} weight="fill" className="text-warm-500" aria-hidden="true" />}
                title="Kuraterede ture"
                body="Caféer, legepladser og oplevelser i København 0-6 år."
              />
              <FeaturePoint
                icon={<ShieldCheck size={14} weight="fill" className="text-warm-500" aria-hidden="true" />}
                title="Familiens delte rum"
                body="Inviter bedsteforældre, dagplejer eller medforælder ind."
              />
              <FeaturePoint
                icon={<Key size={14} weight="fill" className="text-warm-500" aria-hidden="true" />}
                title="Sikkert magisk link"
                body="Ingen kodeord. EU-hosted. Du bestemmer hvem der ser hvad."
              />
            </ul>
            {!supabaseAvailable ? (
              <p className="mt-4 rounded-lg bg-[#FBF1D9] p-2.5 text-xs text-warning ring-1 ring-[#F0DFB1]">
                Login virker, når Supabase-miljøvariabler er sat. Indtil da er journalen tilgængelig som demo.
              </p>
            ) : null}
          </section>
          <LoginForm redirectTo="/profile" locale="da" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
      <div className="mx-auto max-w-6xl">
        <PageHeader eyebrow="Profil" title="Indstillinger" description="Din konto, familie og personlige præferencer." />

        {banner ? (
          <div
            className={cn(
              "mt-4 flex items-start gap-2 rounded-card p-3 ring-1",
              banner.type === "success"
                ? "bg-sage-100 text-sage-700 ring-sage-200"
                : "bg-warm-50 text-danger ring-warm-100"
            )}
          >
            <CheckCircle size={16} weight="fill" aria-hidden="true" className="mt-0.5" />
            <p className="text-sm font-semibold">{banner.text}</p>
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 lg:grid-cols-[220px_1fr]">
          {/* Sub-nav */}
          <aside aria-label="Profilsektioner">
            {/* Mobile horizontal scroll */}
            <div className="-mx-4 overflow-x-auto px-4 lg:hidden">
              <div className="flex gap-1.5">
                {SECTIONS.map((entry) => {
                  const Icon = entry.icon;
                  const active = section === entry.id;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setSection(entry.id)}
                      aria-pressed={active}
                      className={cn(
                        "focus-ring inline-flex h-9 shrink-0 items-center gap-1.5 rounded-pill px-3 text-xs font-semibold transition-colors",
                        active
                          ? "bg-sage-500 text-white"
                          : "bg-surface text-muted ring-1 ring-hairline hover:bg-sunken hover:text-ink"
                      )}
                    >
                      <Icon size={14} weight={active ? "fill" : "regular"} aria-hidden="true" />
                      {entry.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop vertical list */}
            <nav className="hidden lg:flex lg:flex-col lg:gap-0.5">
              {SECTIONS.map((entry) => {
                const Icon = entry.icon;
                const active = section === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setSection(entry.id)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "focus-ring flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition-colors",
                      active
                        ? "bg-sage-100 text-sage-700"
                        : "text-muted hover:bg-sunken hover:text-ink"
                    )}
                  >
                    <Icon size={15} weight={active ? "fill" : "regular"} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{entry.label}</span>
                      <span
                        className={cn(
                          "block truncate text-2xs font-normal",
                          active ? "text-sage-700/70" : "text-subtle"
                        )}
                      >
                        {entry.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <div className="min-w-0 space-y-4">
            {section === "overview" ? (
              <div className="space-y-4">
                <ProfileStats />
                <ProfileOverview
                  profile={profile}
                  members={allMembers}
                  onJumpTo={(target) => setSection(target)}
                />
              </div>
            ) : null}

            {section === "profile" ? (
              <ProfileHeader
                email={user?.email ?? null}
                profile={profile}
                familyCount={familyViews.length}
                ownerCount={ownerCount}
                onEdit={() => setSection("preferences")}
              />
            ) : null}

            {section === "saved" ? <ProfileSaved /> : null}

            {section === "recommendations" ? (
              <ProfileRecommendations
                profile={profile}
                onTunePreferences={() => setSection("preferences")}
              />
            ) : null}

            {section === "preferences" ? (
              <ProfilePreferences profile={profile} onSave={handleProfileSave} />
            ) : null}

            {section === "family" ? (
              <div className="space-y-4">
                {familyViews.length === 0 ? (
                  <section className="rounded-card bg-surface p-5 ring-1 ring-hairline">
                    <h2 className="font-display text-xl font-semibold text-ink">Ingen familie endnu</h2>
                    <p className="mt-2 text-sm text-muted">
                      Næste gang du logger ind, opretter vi automatisk en familie til dig. Du kan
                      altid invitere flere ind.
                    </p>
                  </section>
                ) : (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {familyViews.map((view) => (
                      <FamilyCard
                        key={view.family.id}
                        family={view.family}
                        members={view.members}
                        invites={view.invites}
                        isOwner={view.isOwner}
                        onUpdateFamily={(patch) => handleFamilyUpdate(view.family.id, patch)}
                        onCreateInvite={(input) => handleCreateInvite(view.family.id, input)}
                        onRevokeInvite={(inviteId) => handleRevokeInvite(view.family.id, inviteId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {section === "account" ? (
              <section className="rounded-card bg-surface p-5 ring-1 ring-hairline">
                <div className="flex items-start gap-2">
                  <ShieldCheck
                    size={16}
                    weight="fill"
                    className="mt-0.5 text-sage-500"
                    aria-hidden="true"
                  />
                  <div>
                    <h2 className="font-display text-lg font-semibold text-ink">
                      Konto og privatliv
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      Data gemmes i Supabase i EU-region med RLS-politikker, så hver familie kun
                      ser sin egen. Du kan logge ud her — alle dine præferencer ligger sikkert klar
                      igen næste gang.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setSection("preferences")}>
                    <Heart size={14} weight="fill" aria-hidden="true" />
                    Mine præferencer
                  </Button>
                  <Button variant="danger" onClick={logout}>
                    <SignOut size={14} weight="bold" aria-hidden="true" />
                    Log ud
                  </Button>
                </div>
                {logoutMessage ? (
                  <p className="mt-3 text-sm font-semibold text-muted">{logoutMessage}</p>
                ) : null}
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturePoint({
  icon,
  title,
  body
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-lg bg-sunken p-2.5 ring-1 ring-hairline">
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="font-display text-sm font-semibold text-ink">{title}</p>
      </div>
      <p className="mt-1 text-xs leading-5 text-muted">{body}</p>
    </li>
  );
}
