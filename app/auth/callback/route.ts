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

    const successUrl = new URL("/profile", requestUrl.origin);
    successUrl.searchParams.set("invite_accepted", "1");
    return NextResponse.redirect(successUrl);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
