import { HeartHandshake, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/server";

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
  const invite = await loadInvite(token);

  if (!invite) {
    return (
      <div className="px-4 pt-24 sm:px-6 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-xl rounded-card bg-white p-6 shadow-soft ring-1 ring-oat">
          <h1 className="font-display text-3xl font-semibold">Invitationen findes ikke</h1>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Linket er udløbet eller forkert. Bed afsenderen om at sende et nyt.
          </p>
        </div>
      </div>
    );
  }

  const expired = invite.status !== "pending" || (invite.expiresAt && new Date(invite.expiresAt) < new Date());

  if (expired) {
    return (
      <div className="px-4 pt-24 sm:px-6 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-xl rounded-card bg-white p-6 shadow-soft ring-1 ring-oat">
          <h1 className="font-display text-3xl font-semibold">Invitationen er ikke aktiv længere</h1>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            {invite.status === "accepted"
              ? "Den er allerede brugt."
              : "Den er udløbet eller trukket tilbage. Bed familien om en ny invitation."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-20 sm:px-6 lg:px-8 lg:pt-10">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_440px]">
        <section className="rounded-card bg-white p-6 shadow-soft ring-1 ring-oat">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rust">Du er inviteret</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink">
            {invite.invitedByName && invite.familyName
              ? `${invite.invitedByName} har inviteret dig til ${invite.familyName}`
              : invite.familyName
              ? `Velkommen til ${invite.familyName}`
              : "Velkommen til familien"}
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-ink/70">
            Lille Liv er en privat plads til familiens hverdag — milepæle, små glimt, fotos og udflugter, samlet for jer.
          </p>

          {invite.message ? (
            <div className="mt-5 flex items-start gap-3 rounded-card bg-linen p-4 ring-1 ring-oat">
              <HeartHandshake className="mt-0.5 shrink-0 text-rust" size={20} aria-hidden="true" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-mossDark/80">
                  Hilsen fra {invite.invitedByName ?? "familien"}
                </p>
                <p className="mt-1 text-sm leading-6 text-ink/80">{invite.message}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex items-start gap-2 text-sm text-ink/65">
            <ShieldCheck size={17} className="mt-0.5 shrink-0 text-moss" aria-hidden="true" />
            <p>
              Vi gemmer dine data i EU-region med strikte adgangsregler. Du kan til enhver tid forlade familien igen.
            </p>
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
