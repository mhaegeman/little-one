import { ArrowLeft, Compass, Key, ShieldCheck, Sparkle } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/app/(marketing)/_components/Logo";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { createClient } from "@/lib/db/supabase/server";

type SearchParams = Record<string, string | string[] | undefined>;

function pickString(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function safeRedirect(value: string | null, fallback: string) {
  if (!value) return fallback;
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return {
    title: `${t("title")} · Lille Liv`,
    description: t("body")
  };
}

export default async function AuthPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const nextParam = safeRedirect(pickString(params.next), "/journal");
  const initialMode: "signin" | "signup" =
    pickString(params.mode) === "signup" ? "signup" : "signin";
  const errorCode = pickString(params.error);

  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      redirect(nextParam);
    }
  }

  const locale = await getLocale();
  const effectiveLocale: "da" | "en" = locale === "en" ? "en" : "da";
  const t = await getTranslations("auth");
  const tProfile = await getTranslations("profilePage");
  const tHero = await getTranslations("marketing.hero");
  const backLabel = effectiveLocale === "da" ? "Tilbage" : "Back";

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="sticky top-0 z-30 border-b border-hairline/70 bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-3 px-5 md:px-10">
          <Link href="/" aria-label="Lille Liv" className="focus-ring rounded-md">
            <Logo />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <Link
              href="/"
              className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              <ArrowLeft size={14} weight="bold" aria-hidden="true" />
              <span>{backLabel}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-peach-100 opacity-70 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-12 top-44 h-[260px] w-[260px] rounded-full bg-mint-100 opacity-60 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-[1100px] gap-10 px-5 py-12 md:px-10 md:py-16 lg:grid-cols-[1.05fr_440px] lg:items-center lg:gap-14">
          <section>
            <p className="text-2xs font-bold uppercase tracking-[0.18em] text-peach-300">
              {t("eyebrow")}
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">{t("body")}</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-subtle">
              {t("magicLinkExplainer")}
            </p>

            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              <FeaturePoint
                icon={<Sparkle size={14} weight="fill" className="text-peach-300" aria-hidden="true" />}
                title={tProfile("tailoredFeed")}
                body={tProfile("tailoredFeedBody")}
              />
              <FeaturePoint
                icon={<Compass size={14} weight="fill" className="text-peach-300" aria-hidden="true" />}
                title={tProfile("curatedOutings")}
                body={tProfile("curatedOutingsBody")}
              />
              <FeaturePoint
                icon={<ShieldCheck size={14} weight="fill" className="text-peach-300" aria-hidden="true" />}
                title={tProfile("sharedFamilySpace")}
                body={tProfile("sharedFamilySpaceBody")}
              />
              <FeaturePoint
                icon={<Key size={14} weight="fill" className="text-peach-300" aria-hidden="true" />}
                title={tProfile("magicLink")}
                body={tProfile("magicLinkBody")}
              />
            </ul>

            <div className="mt-7 flex items-center gap-3 text-sm text-subtle">
              <AvatarStack>
                <Avatar tone="peach" size="sm" ring>
                  MK
                </Avatar>
                <Avatar tone="butter" size="sm" ring>
                  SO
                </Avatar>
                <Avatar tone="mint" size="sm" ring>
                  AN
                </Avatar>
                <Avatar tone="sky" size="sm" ring>
                  BI
                </Avatar>
              </AvatarStack>
              <span>{tHero("socialProof")}</span>
            </div>
          </section>

          <div>
            {errorCode === "expired_or_invalid" ? (
              <div
                role="alert"
                className="mb-3 rounded-card bg-peach-50 p-3 text-sm leading-6 text-danger ring-1 ring-peach-100"
              >
                <p className="font-semibold">{t("linkExpiredTitle")}</p>
                <p className="mt-0.5 text-danger/85">{t("linkExpiredBody")}</p>
              </div>
            ) : null}
            <LoginForm
              redirectTo={nextParam}
              locale={effectiveLocale}
              initialMode={initialMode}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeaturePoint({
  icon,
  title,
  body
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-2 rounded-card bg-surface p-3 ring-1 ring-hairline">
      <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-peach-50 ring-1 ring-peach-100">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-xs leading-5 text-muted">{body}</p>
      </div>
    </li>
  );
}
