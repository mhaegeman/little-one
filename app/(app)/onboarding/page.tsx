import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { OnboardingFinalizer } from "@/components/onboarding/OnboardingFinalizer";
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

  let userId: string | null = null;
  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      redirect(`/auth?next=${encodeURIComponent("/onboarding")}`);
    }
    userId = user.id;

    // Already-onboarded users should not be stuck here — send them on.
    const { data: profile } = await supabase
      .from("family_profiles")
      .select("onboarding_completed_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profile?.onboarding_completed_at) {
      redirect(next);
    }
  }

  return (
    <div className="px-4 pt-24 sm:px-6 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-rust">Velkommen</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Opret barnets profil</h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-ink/70">
          Barnets profil binder journal, udflugter og kommende Aula-glimt sammen.
        </p>
        <div className="mt-6">
          {userId ? (
            <OnboardingFinalizer userId={userId} next={next} locale={effectiveLocale} />
          ) : (
            <p className="rounded-lg bg-[#FBF1D9] p-2.5 text-xs text-warning ring-1 ring-[#F0DFB1]">
              Supabase env vars are missing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
