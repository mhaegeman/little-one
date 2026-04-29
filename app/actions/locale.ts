"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, isLocale, type Locale } from "@/i18n/request";
import { createClient } from "@/lib/supabase/server";

const COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 year
  sameSite: "lax" as const
};

export async function setLocaleAction(locale: string) {
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, COOKIE_OPTIONS);

  // If signed in, persist to family_profiles.preferred_locale.
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("family_profiles")
        .update({ preferred_locale: locale, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
    }
  }

  revalidatePath("/", "layout");
}

export async function syncLocaleFromProfile(): Promise<Locale | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const existing = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(existing)) return existing;

  const { data } = await supabase
    .from("family_profiles")
    .select("preferred_locale")
    .eq("user_id", user.id)
    .maybeSingle();

  const profileLocale = data?.preferred_locale as string | undefined;
  if (isLocale(profileLocale)) {
    cookieStore.set(LOCALE_COOKIE, profileLocale, COOKIE_OPTIONS);
    return profileLocale;
  }

  return null;
}
