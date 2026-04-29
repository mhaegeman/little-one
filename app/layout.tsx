import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import type { ReactNode } from "react";
import { syncLocaleFromProfile } from "@/app/actions/locale";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lille Liv",
  description: "Familieguide og privat journal for småbørnsfamilier i København.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#FBF6EE",
  width: "device-width",
  initialScale: 1
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // If a signed-in user has a preferred_locale in their family_profile but no
  // cookie yet, hydrate it before next-intl reads. Best-effort; ignored if not
  // signed in or Supabase unavailable.
  await syncLocaleFromProfile().catch(() => null);

  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
