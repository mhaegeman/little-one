"use client";

import {
  ChatsCircle,
  Compass,
  UsersThree
} from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { ConnectionsInbox } from "@/components/families/ConnectionsInbox";
import { FamilyDiscover } from "@/components/families/FamilyDiscover";
import { MessagesPanel } from "@/components/families/MessagesPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { createClient } from "@/lib/supabase/client";
import { loadFamiliesForUser } from "@/lib/family";
import type { Family } from "@/lib/types";

type SubTab = "discover" | "connections" | "messages";

const TAB_ICONS: Record<SubTab, typeof Compass> = {
  discover: Compass,
  connections: UsersThree,
  messages: ChatsCircle
};

const TAB_ORDER: SubTab[] = ["discover", "connections", "messages"];

export function FamiliesPanel() {
  const t = useTranslations("families");
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<SubTab>(() => {
    const t = searchParams.get("tab");
    if (t === "connections" || t === "messages") return t;
    return "discover";
  });
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [supabaseAvailable, setSupabaseAvailable] = useState(true);
  const [me, setMe] = useState<{ userId: string; email: string | null } | null>(null);
  const [primaryFamily, setPrimaryFamily] = useState<Family | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setSupabaseAvailable(false);
      setLoading(false);
      return;
    }

    async function load() {
      const {
        data: { user }
      } = await supabase!.auth.getUser();
      if (!user) {
        setSignedIn(false);
        setLoading(false);
        return;
      }
      setSignedIn(true);
      setMe({ userId: user.id, email: user.email ?? null });
      const families = await loadFamiliesForUser(supabase!, user.id).catch(() => []);
      // Pick the family the user owns first; otherwise the first they belong to.
      const owner = families.find((entry) => entry.role === "owner");
      const chosen = owner?.family ?? families[0]?.family ?? null;
      setPrimaryFamily(chosen);
      setLoading(false);
    }

    load();
    const { data } = supabase.auth.onAuthStateChange(() => load());
    return () => data.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto max-w-5xl space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!supabaseAvailable) {
    return (
      <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto max-w-3xl rounded-card bg-surface p-5 ring-1 ring-hairline">
          <p className="text-2xs font-bold uppercase tracking-[0.16em] text-warm-500">{t("eyebrow")}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{t("loginRequiredTitle")}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{t("loginRequiredBody")}</p>
        </div>
      </div>
    );
  }

  if (!signedIn || !me) {
    return (
      <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1fr_420px]">
          <section className="rounded-card bg-surface p-5 ring-1 ring-hairline">
            <p className="text-2xs font-bold uppercase tracking-[0.16em] text-warm-500">{t("eyebrow")}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-ink">
              {t("signInTitle")}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{t("signInBody")}</p>
          </section>
          <LoginForm redirectTo="/families" />
        </div>
      </div>
    );
  }

  if (!primaryFamily) {
    return (
      <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto max-w-3xl rounded-card bg-surface p-5 ring-1 ring-hairline">
          <p className="text-2xs font-bold uppercase tracking-[0.16em] text-warm-500">{t("eyebrow")}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{t("noFamilyTitle")}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{t("noFamilyBody")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <div className="mt-4">
          <Tabs<SubTab>
            ariaLabel={t("eyebrow")}
            value={tab}
            onChange={setTab}
            items={TAB_ORDER.map((id) => {
              const Icon = TAB_ICONS[id];
              return {
                id,
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon
                      size={14}
                      weight={tab === id ? "fill" : "regular"}
                      aria-hidden="true"
                    />
                    {t(`tabs.${id}`)}
                  </span>
                )
              };
            })}
          />
        </div>

        <div className="mt-4">
          {tab === "discover" ? (
            <FamilyDiscover me={me} primaryFamily={primaryFamily} />
          ) : null}
          {tab === "connections" ? (
            <ConnectionsInbox me={me} primaryFamily={primaryFamily} />
          ) : null}
          {tab === "messages" ? (
            <MessagesPanel me={me} primaryFamily={primaryFamily} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
