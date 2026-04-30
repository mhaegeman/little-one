"use client";

import {
  CheckCircle,
  Clock,
  PaperPlaneTilt,
  ShieldSlash,
  UsersThree,
  X
} from "@phosphor-icons/react/dist/ssr";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toaster";
import {
  cancelOutgoingConnection,
  loadConnectionsForFamily,
  loadPublicProfileForFamily,
  respondToConnection,
  type FamilyConnection,
  type FamilyPublicProfile
} from "@/lib/social";
import { createClient } from "@/lib/supabase/client";
import type { Family } from "@/lib/types";
import { formatLocalizedDate } from "@/lib/utils";

type Props = {
  me: { userId: string; email: string | null };
  primaryFamily: Family;
};

type SubTab = "incoming" | "outgoing" | "accepted";

export function ConnectionsInbox({ me, primaryFamily }: Props) {
  const t = useTranslations("families.connections");
  const tCommon = useTranslations("common");
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [tab, setTab] = useState<SubTab>("incoming");
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<FamilyConnection[]>([]);
  const [profiles, setProfiles] = useState<Map<string, FamilyPublicProfile>>(new Map());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);

  async function refresh() {
    if (!supabase) return;
    setLoading(true);
    try {
      const conns = await loadConnectionsForFamily(supabase, primaryFamily.id);
      setConnections(conns);

      const otherFamilyIds = Array.from(
        new Set(
          conns.map((conn) =>
            conn.requesterFamilyId === primaryFamily.id
              ? conn.addresseeFamilyId
              : conn.requesterFamilyId
          )
        )
      );
      const profileMap = new Map<string, FamilyPublicProfile>();
      await Promise.all(
        otherFamilyIds.map(async (id) => {
          const profile = await loadPublicProfileForFamily(supabase, id).catch(() => null);
          if (profile) profileMap.set(id, profile);
        })
      );
      setProfiles(profileMap);
    } catch (error) {
      toast({
        title: t("errorTitle"),
        description: error instanceof Error ? error.message : tCommon("unknownError"),
        variant: "danger"
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, primaryFamily.id]);

  const incoming = useMemo(
    () =>
      connections.filter(
        (conn) => conn.addresseeFamilyId === primaryFamily.id && conn.status === "pending"
      ),
    [connections, primaryFamily.id]
  );
  const outgoing = useMemo(
    () =>
      connections.filter(
        (conn) => conn.requesterFamilyId === primaryFamily.id && conn.status === "pending"
      ),
    [connections, primaryFamily.id]
  );
  const accepted = useMemo(
    () => connections.filter((conn) => conn.status === "accepted"),
    [connections]
  );

  function getOtherFamilyId(conn: FamilyConnection) {
    return conn.requesterFamilyId === primaryFamily.id
      ? conn.addresseeFamilyId
      : conn.requesterFamilyId;
  }

  async function accept(conn: FamilyConnection) {
    if (!supabase) return;
    setBusyId(conn.id);
    try {
      await respondToConnection(supabase, conn.id, "accepted", me.userId);
      toast({ title: t("acceptedToast"), variant: "success" });
      await refresh();
    } catch (error) {
      toast({
        title: t("acceptError"),
        description: error instanceof Error ? error.message : tCommon("unknownError"),
        variant: "danger"
      });
    } finally {
      setBusyId(null);
    }
  }

  async function decline(conn: FamilyConnection) {
    if (!supabase) return;
    setBusyId(conn.id);
    try {
      await respondToConnection(supabase, conn.id, "declined", me.userId);
      toast({ title: t("declinedToast"), variant: "info" });
      await refresh();
    } catch (error) {
      toast({
        title: t("declineError"),
        description: error instanceof Error ? error.message : tCommon("unknownError"),
        variant: "danger"
      });
    } finally {
      setBusyId(null);
      setDecliningId(null);
    }
  }

  async function cancel(conn: FamilyConnection) {
    if (!supabase) return;
    setBusyId(conn.id);
    try {
      await cancelOutgoingConnection(supabase, conn.id);
      toast({ title: t("withdrawnToast"), variant: "info" });
      await refresh();
    } catch (error) {
      toast({
        title: t("withdrawError"),
        description: error instanceof Error ? error.message : tCommon("unknownError"),
        variant: "danger"
      });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Tabs<SubTab>
        ariaLabel={t("incomingTab")}
        value={tab}
        onChange={setTab}
        items={[
          {
            id: "incoming",
            label: (
              <span className="inline-flex items-center gap-1">
                {t("incomingTab")}
                {incoming.length > 0 ? (
                  <span className="rounded-full bg-peach-300 px-1.5 text-2xs font-bold text-peach-ink">
                    {incoming.length}
                  </span>
                ) : null}
              </span>
            )
          },
          {
            id: "outgoing",
            label: <span>{t("outgoingTab", { count: outgoing.length })}</span>
          },
          {
            id: "accepted",
            label: <span>{t("acceptedTab", { count: accepted.length })}</span>
          }
        ]}
      />

      {tab === "incoming" ? (
        incoming.length === 0 ? (
          <EmptyState
            icon={<Clock size={20} weight="duotone" aria-hidden="true" />}
            title={t("emptyIncomingTitle")}
            description={t("emptyIncomingBody")}
          />
        ) : (
          <ul className="space-y-2">
            {incoming.map((conn) => (
              <li
                key={conn.id}
                className="rounded-card bg-surface p-3 ring-1 ring-hairline"
              >
                <ConnectionRow
                  conn={conn}
                  profile={profiles.get(getOtherFamilyId(conn))}
                  primary={
                    <Button
                      size="sm"
                      onClick={() => accept(conn)}
                      disabled={busyId === conn.id}
                    >
                      <CheckCircle size={12} weight="fill" aria-hidden="true" />
                      {t("accept")}
                    </Button>
                  }
                  secondary={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDecliningId(conn.id)}
                      disabled={busyId === conn.id}
                    >
                      <X size={12} weight="bold" aria-hidden="true" />
                      {t("decline")}
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>
        )
      ) : null}

      {tab === "outgoing" ? (
        outgoing.length === 0 ? (
          <EmptyState
            icon={<PaperPlaneTilt size={20} weight="duotone" aria-hidden="true" />}
            title={t("emptyOutgoingTitle")}
            description={t("emptyOutgoingBody")}
          />
        ) : (
          <ul className="space-y-2">
            {outgoing.map((conn) => (
              <li key={conn.id} className="rounded-card bg-surface p-3 ring-1 ring-hairline">
                <ConnectionRow
                  conn={conn}
                  profile={profiles.get(getOtherFamilyId(conn))}
                  primary={
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => cancel(conn)}
                      disabled={busyId === conn.id}
                    >
                      <X size={12} weight="bold" aria-hidden="true" />
                      {t("withdraw")}
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>
        )
      ) : null}

      {tab === "accepted" ? (
        accepted.length === 0 ? (
          <EmptyState
            icon={<UsersThree size={20} weight="duotone" aria-hidden="true" />}
            title={t("emptyAcceptedTitle")}
            description={t("emptyAcceptedBody")}
          />
        ) : (
          <ul className="space-y-2">
            {accepted.map((conn) => {
              const otherId = getOtherFamilyId(conn);
              const profile = profiles.get(otherId);
              return (
                <li
                  key={conn.id}
                  className="rounded-card bg-surface p-3 ring-1 ring-hairline"
                >
                  <ConnectionRow
                    conn={conn}
                    profile={profile}
                    primary={
                      <Link href={`/families/${otherId}`}>
                        <Button size="sm" variant="secondary">
                          {t("viewProfile")}
                        </Button>
                      </Link>
                    }
                  />
                </li>
              );
            })}
          </ul>
        )
      ) : null}

      <ConfirmDialog
        open={Boolean(decliningId)}
        title={t("declineConfirmTitle")}
        description={t("declineConfirmBody")}
        confirmLabel={t("decline")}
        cancelLabel={t("declineConfirmKeep")}
        danger
        onConfirm={() => {
          const conn = incoming.find((c) => c.id === decliningId);
          if (conn) decline(conn);
        }}
        onCancel={() => setDecliningId(null)}
      />
    </div>
  );
}

function ConnectionRow({
  conn,
  profile,
  primary,
  secondary
}: {
  conn: FamilyConnection;
  profile?: FamilyPublicProfile;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
}) {
  const t = useTranslations("families.connections");
  const locale = useLocale();
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sunken text-mint-ink ring-1 ring-hairline">
        <UsersThree size={18} weight="duotone" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-display text-sm font-semibold text-ink">
            {profile?.familyName ?? t("fallbackName")}
          </p>
          {profile?.neighbourhoods?.[0] ? (
            <Badge variant="sky">{profile.neighbourhoods[0]}</Badge>
          ) : null}
        </div>
        <p className="text-2xs font-semibold text-subtle">
          {formatLocalizedDate(conn.createdAt, locale)}
        </p>
        {conn.introMessage ? (
          <p className="mt-1.5 rounded-lg bg-sunken p-2 text-xs italic leading-5 text-ink ring-1 ring-hairline">
            &ldquo;{conn.introMessage}&rdquo;
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
        {primary}
        {secondary}
      </div>
    </div>
  );
}
