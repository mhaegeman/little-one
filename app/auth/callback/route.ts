import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const inviteToken = requestUrl.searchParams.get("invite");
  const nextParam = requestUrl.searchParams.get("next") ?? "/journal";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/journal";
  const supabase = await createClient();

  if (code && supabase) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (inviteToken && supabase) {
    const { error } = await supabase.rpc("accept_family_invite", {
      invite_token: inviteToken
    });

    if (error) {
      const errorUrl = new URL("/profile", requestUrl.origin);
      errorUrl.searchParams.set("invite_error", error.message);
      return NextResponse.redirect(errorUrl);
    }

    // Invitees join an existing family that already has its info filled in,
    // so the family wizard would have nothing meaningful for them to fill.
    // Mark onboarding complete so they don't bounce through /onboarding on
    // their next sign-in.
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("family_profiles")
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("onboarding_completed_at", null);
    }

    const successUrl = new URL("/profile", requestUrl.origin);
    successUrl.searchParams.set("invite_accepted", "1");
    return NextResponse.redirect(successUrl);
  }

  // First-time users (no completed onboarding) get routed through /onboarding
  // before hitting the requested destination. The wizard preserves `next` so
  // the user lands where they originally intended once they're done.
  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("family_profiles")
        .select("onboarding_completed_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!profile?.onboarding_completed_at) {
        const onboardingUrl = new URL("/onboarding", requestUrl.origin);
        if (next !== "/journal") onboardingUrl.searchParams.set("next", next);
        return NextResponse.redirect(onboardingUrl);
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
