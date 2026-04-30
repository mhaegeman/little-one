import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { FamilyOnboardingWizard } from "@/components/onboarding/FamilyOnboardingWizard";
import { loadFamiliesForUser, loadOwnProfile } from "@/lib/family";
import { createClient } from "@/lib/supabase/server";

type SearchParams = Record<string, string | string[] | undefined>;

function pickString(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function safeRedirect(value: string | null, fallback: string) {
  if (!value) return fallback;
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export default async function OnboardingPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const next = safeRedirect(pickString(params.next), "/journal");

  const supabase = await createClient();
  const locale = await getLocale();
  const effectiveLocale: "da" | "en" = locale === "en" ? "en" : "da";

  if (!supabase) {
    return (
      <div className="px-4 pt-24 sm:px-6 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-3xl">
          <p className="rounded-lg bg-[#FBF1D9] p-2.5 text-xs text-warning ring-1 ring-[#F0DFB1]">
            Supabase env vars are missing.
          </p>
        </div>
      </div>
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth?next=${encodeURIComponent("/onboarding")}`);
  }

  const [profile, memberships] = await Promise.all([
    loadOwnProfile(supabase, user.id).catch(() => null),
    loadFamiliesForUser(supabase, user.id).catch(() => [])
  ]);

  // Already-onboarded users should not be stuck here.
  if (profile?.onboardingCompletedAt) {
    redirect(next);
  }

  // The wizard is owner-only: it edits the family and creates invites, both
  // gated by RLS to the owner. Non-owners (invitees who somehow landed here
  // directly) get redirected — /auth/callback already marks their onboarding
  // complete on invite acceptance.
  const ownedFamily =
    memberships.find((entry) => entry.role === "owner")?.family ?? null;

  if (!ownedFamily) {
    redirect(next);
  }

  return (
    <div className="px-4 pt-24 sm:px-6 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-3xl">
        <FamilyOnboardingWizard
          userId={user.id}
          userEmail={user.email ?? null}
          family={ownedFamily}
          profile={profile}
          next={next}
          locale={effectiveLocale}
        />
      </div>
    </div>
  );
}
