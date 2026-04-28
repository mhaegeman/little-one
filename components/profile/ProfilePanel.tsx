"use client";

import {
  CheckCircle2,
  Compass,
  KeyRound,
  Loader2,
  LogOut,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { FamilyCard } from "@/components/profile/FamilyCard";
import { PersonalProfileCard } from "@/components/profile/PersonalProfileCard";
import { Button } from "@/components/ui/Button";
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

  useEffect(() => {
    if (searchParams.get("invite_accepted") === "1") {
      setBanner({ type: "success", text: "Du er nu med i familien." });
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
      const familyName = familyViews.find((view) => view.family.id === familyId)?.family.name ?? "din familie";
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

  if (loading) {
    return (
      <div className="px-4 pt-24 sm:px-6 lg:px-8 lg:pt-8">
        <div className="mx-auto flex max-w-3xl items-center gap-2 text-sm font-bold text-ink/60">
          <Loader2 className="animate-spin" size={18} aria-hidden="true" />
          Henter profil...
        </div>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="px-4 pt-20 sm:px-6 lg:px-8 lg:pt-10">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_440px]">
          <section className="rounded-card bg-white p-6 shadow-soft ring-1 ring-oat">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rust">Profil</p>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink">
              Lille Liv samler familiens hverdag
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-ink/70">
              Log ind med et magisk link, og åbn en privat plads til dig, dit barn og dem du deler hverdagen med.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              <FeaturePoint
                icon={<Sparkles size={17} className="text-rust" aria-hidden="true" />}
                title="Privat journal"
                body="Milepæle, hverdagsglimt og fotos — kun for jer."
              />
              <FeaturePoint
                icon={<Compass size={17} className="text-rust" aria-hidden="true" />}
                title="Kuraterede ture"
                body="Caféer, legepladser og oplevelser i København 0-6 år."
              />
              <FeaturePoint
                icon={<ShieldCheck size={17} className="text-rust" aria-hidden="true" />}
                title="Familiens delte rum"
                body="Inviter bedsteforældre, dagplejer eller medforælder ind."
              />
              <FeaturePoint
                icon={<KeyRound size={17} className="text-rust" aria-hidden="true" />}
                title="Sikkert magisk link"
                body="Ingen kodeord. EU-hosted. Du bestemmer hvem der ser hvad."
              />
            </ul>
            {!supabaseAvailable ? (
              <p className="mt-5 rounded-xl bg-butter/40 p-3 text-sm font-semibold text-ink/75">
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
    <div className="px-4 pt-20 sm:px-6 lg:px-8 lg:pt-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {banner ? (
          <div
            className={`flex items-start gap-2 rounded-card p-4 ring-1 ${
              banner.type === "success"
                ? "bg-mossDark/95 text-white ring-mossDark"
                : "bg-rust/95 text-white ring-rust"
            }`}
          >
            <CheckCircle2 size={18} aria-hidden="true" className="mt-0.5" />
            <p className="text-sm font-semibold">{banner.text}</p>
          </div>
        ) : null}

        <PersonalProfileCard
          email={user?.email ?? null}
          profile={profile}
          onSave={handleProfileSave}
        />

        <div className="grid gap-6 lg:grid-cols-2">
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

        {familyViews.length === 0 ? (
          <section className="rounded-card bg-white p-6 shadow-soft ring-1 ring-oat">
            <h2 className="font-display text-2xl font-semibold">Ingen familie endnu</h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              Når du logger ind næste gang, opretter vi automatisk en familie til dig. Du kan altid invitere flere ind.
            </p>
          </section>
        ) : null}

        <section className="rounded-card bg-white p-6 shadow-soft ring-1 ring-oat">
          <h2 className="font-display text-2xl font-semibold">Konto og indstillinger</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Dansk er standardsprog. Data gemmes i Supabase i EU-region med RLS-politikker, så hver familie kun ser sin egen.
          </p>
          <div className="mt-4 flex gap-3">
            <Button variant="danger" onClick={logout}>
              <LogOut size={16} aria-hidden="true" />
              Log ud
            </Button>
          </div>
          {logoutMessage ? (
            <p className="mt-3 text-sm font-semibold text-ink/70">{logoutMessage}</p>
          ) : null}
        </section>
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
    <li className="rounded-2xl bg-linen p-3 ring-1 ring-oat">
      <div className="flex items-center gap-2">
        {icon}
        <p className="font-display text-lg font-semibold">{title}</p>
      </div>
      <p className="mt-1 text-sm leading-5 text-ink/70">{body}</p>
    </li>
  );
}
