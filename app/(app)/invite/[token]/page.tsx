import { HandHeart, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";
import { createClient } from "@/lib/db/supabase/server";

type InvitePageProps = {
  params: Promise<{ token: string }>;
};

type LoadedInvite = {
  invitedEmail: string | null;
  invitedName: string | null;
  invitedByName: string | null;
  familyName: string | null;
  message: string | null;
  status: string;
  expiresAt: string | null;
};

async function loadInvite(token: string): Promise<LoadedInvite | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("family_invites")
    .select(
      "invited_email, invited_name, invited_by, message, status, expires_at, families(name), inviter:family_profiles!family_invites_invited_by_fkey(display_name)"
    )
    .eq("token", token)
    .maybeSingle();

  if (!data) {
    return null;
  }

  // The relation alias above may not always resolve when Supabase can't infer the FK.
  // Fall back to a second lookup if needed.
  let invitedByName = (data as { inviter?: { display_name?: string | null } }).inviter
    ?.display_name ?? null;

  if (!invitedByName && data.invited_by) {
    const { data: profile } = await supabase
      .from("family_profiles")
      .select("display_name")
      .eq("user_id", data.invited_by)
      .maybeSingle();
    invitedByName = profile?.display_name ?? null;
  }

  return {
    invitedEmail: data.invited_email ?? null,
    invitedName: data.invited_name ?? null,
    invitedByName,
    familyName: (data.families as { name?: string } | null)?.name ?? null,
    message: data.message ?? null,
    status: data.status as string,
    expiresAt: data.expires_at as string
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const [invite, t] = await Promise.all([loadInvite(token), getTranslations("invite")]);

  if (!invite) {
    return (
      <div className="px-4 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto max-w-xl rounded-card bg-surface p-5 ring-1 ring-hairline">
          <h1 className="font-display text-2xl font-semibold text-ink">{t("notFoundTitle")}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{t("notFoundBody")}</p>
        </div>
      </div>
    );
  }

  const expired = invite.status !== "pending" || (invite.expiresAt && new Date(invite.expiresAt) < new Date());

  if (expired) {
    return (
      <div className="px-4 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto max-w-xl rounded-card bg-surface p-5 ring-1 ring-hairline">
          <h1 className="font-display text-2xl font-semibold text-ink">{t("expiredTitle")}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {invite.status === "accepted" ? t("expiredBodyAccepted") : t("expiredBodyOther")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1fr_440px]">
        <section className="rounded-card bg-surface p-5 ring-1 ring-hairline">
          <p className="text-2xs font-bold uppercase tracking-[0.16em] text-peach-300">
            {t("eyebrow")}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {invite.invitedByName && invite.familyName
              ? t("headline", { inviter: invite.invitedByName, family: invite.familyName })
              : invite.familyName
              ? t("welcomeFamily", { family: invite.familyName })
              : t("welcomeFallback")}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{t("body")}</p>

          {invite.message ? (
            <div className="mt-4 flex items-start gap-2.5 rounded-card bg-sunken p-3 ring-1 ring-hairline">
              <HandHeart
                className="mt-0.5 shrink-0 text-peach-300"
                size={18}
                weight="fill"
                aria-hidden="true"
              />
              <div>
                <p className="text-2xs font-bold uppercase tracking-[0.14em] text-mint-ink">
                  {invite.invitedByName
                    ? t("messageFromInviter", { inviter: invite.invitedByName })
                    : t("messageFromFamily")}
                </p>
                <p className="mt-0.5 text-sm leading-6 text-ink">{invite.message}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex items-start gap-1.5 text-sm text-muted">
            <ShieldCheck
              size={14}
              weight="fill"
              className="mt-0.5 shrink-0 text-mint-300"
              aria-hidden="true"
            />
            <p>{t("privacy")}</p>
          </div>
        </section>

        <LoginForm
          invite={{
            token,
            familyName: invite.familyName,
            invitedByName: invite.invitedByName,
            suggestedEmail: invite.invitedEmail,
            message: invite.message
          }}
          redirectTo="/journal"
        />
      </div>
    </div>
  );
}
