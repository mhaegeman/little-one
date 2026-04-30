"use client";

import {
  ArrowLeft,
  Baby,
  ChatsCircle,
  CheckCircle,
  Clock,
  MapPin,
  PaperPlaneTilt,
  ShieldCheck,
  ShieldSlash,
  UsersThree,
  Warning,
  X
} from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toaster";
import { categoryBadgeVariant } from "@/lib/data/taxonomy";
import { loadFamiliesForUser, loadFamilyMembers } from "@/lib/services/family";
import {
  blockFamily,
  countOutgoingRequestsToday,
  loadConnectionBetween,
  MAX_REQUESTS_PER_DAY,
  reportFamily,
  sendConnectionRequest,
  type FamilyConnection
} from "@/lib/services/connections";
import { getOrCreateThread } from "@/lib/services/messaging";
import {
  loadPublicProfileForFamily,
  type FamilyPublicProfile
} from "@/lib/services/visibility";
import { createClient } from "@/lib/db/supabase/client";
import type { Family, FamilyMember, VenueCategory } from "@/lib/types";

type Props = {
  familyId: string;
};

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; profile: FamilyPublicProfile }
  | { kind: "missing" }
  | { kind: "error"; message: string };

export function FamilyDetailPanel({ familyId }: Props) {
  const t = useTranslations("families.detail");
  const tCommon = useTranslations("common");
  const tBands = useTranslations("families.ageBands");
  const tReasons = useTranslations("families.detail.reasons");
  const tTaxonomy = useTranslations("taxonomy");
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  const [me, setMe] = useState<{ userId: string; email: string | null } | null>(null);
  const [primaryFamily, setPrimaryFamily] = useState<Family | null>(null);
  const [connection, setConnection] = useState<FamilyConnection | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] =
    useState<"harassment" | "spam" | "inappropriate" | "safety" | "other">("inappropriate");
  const [reportDetails, setReportDetails] = useState("");
  const [blockOpen, setBlockOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoad({ kind: "error", message: t("loginRequiredError") });
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const {
          data: { user }
        } = await supabase!.auth.getUser();
        if (!user) {
          if (!cancelled) {
            router.push(`/families`);
          }
          return;
        }
        if (cancelled) return;
        setMe({ userId: user.id, email: user.email ?? null });

        const [families, profile] = await Promise.all([
          loadFamiliesForUser(supabase!, user.id),
          loadPublicProfileForFamily(supabase!, familyId)
        ]);
        if (cancelled) return;
        const ownerEntry = families.find((entry) => entry.role === "owner") ?? families[0];
        const family = ownerEntry?.family ?? null;
        setPrimaryFamily(family);

        if (!profile || !profile.searchable) {
          setLoad({ kind: "missing" });
          return;
        }

        if (family) {
          const [conn, mem] = await Promise.all([
            loadConnectionBetween(supabase!, family.id, profile.familyId),
            loadFamilyMembers(supabase!, profile.familyId).catch(() => [] as FamilyMember[])
          ]);
          setConnection(conn);
          setMembers(mem);
        }

        setLoad({ kind: "ready", profile });
      } catch (error) {
        if (!cancelled) {
          setLoad({
            kind: "error",
            message: error instanceof Error ? error.message : "Ukendt fejl"
          });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, familyId, router]);

  async function submitRequest() {
    if (!supabase || !primaryFamily || !me || load.kind !== "ready") return;
    setSubmitting(true);
    try {
      const used = await countOutgoingRequestsToday(supabase, primaryFamily.id);
      if (used >= MAX_REQUESTS_PER_DAY) {
        toast({
          title: t("rateLimitTitle"),
          description: t("rateLimitBody", { max: MAX_REQUESTS_PER_DAY }),
          variant: "warning"
        });
        setSubmitting(false);
        return;
      }
      const conn = await sendConnectionRequest(supabase, {
        requesterFamilyId: primaryFamily.id,
        addresseeFamilyId: load.profile.familyId,
        requestedByUserId: me.userId,
        introMessage: requestMessage
      });
      setConnection(conn);
      setRequestOpen(false);
      setRequestMessage("");
      toast({ title: t("requestSentToast"), variant: "success" });
    } catch (error) {
      toast({
        title: t("requestError"),
        description: error instanceof Error ? error.message : tCommon("unknownError"),
        variant: "danger"
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function startThread(otherUserId: string) {
    if (!supabase || !primaryFamily || !me || !connection || connection.status !== "accepted")
      return;
    try {
      const thread = await getOrCreateThread(supabase, {
        connectionId: connection.id,
        me: { userId: me.userId, familyId: primaryFamily.id },
        them: { userId: otherUserId, familyId: familyId }
      });
      router.push(`/families?tab=messages&thread=${thread.id}`);
    } catch (error) {
      toast({
        title: t("openThreadError"),
        description: error instanceof Error ? error.message : tCommon("unknownError"),
        variant: "danger"
      });
    }
  }

  async function submitReport() {
    if (!supabase || !primaryFamily || load.kind !== "ready") return;
    try {
      await reportFamily(supabase, {
        reporterFamilyId: primaryFamily.id,
        reportedFamilyId: load.profile.familyId,
        reason: reportReason,
        details: reportDetails
      });
      setReportOpen(false);
      setReportDetails("");
      toast({ title: t("reportSentToast"), description: t("reportSentBody"), variant: "info" });
    } catch (error) {
      toast({
        title: t("reportError"),
        description: error instanceof Error ? error.message : tCommon("unknownError"),
        variant: "danger"
      });
    }
  }

  async function submitBlock() {
    if (!supabase || !primaryFamily || !me || load.kind !== "ready") return;
    try {
      await blockFamily(supabase, {
        familyId: primaryFamily.id,
        blockedFamilyId: load.profile.familyId,
        blockedByUserId: me.userId
      });
      setBlockOpen(false);
      toast({ title: t("blockedToast"), variant: "info" });
      router.push("/families");
    } catch (error) {
      toast({
        title: t("blockError"),
        description: error instanceof Error ? error.message : tCommon("unknownError"),
        variant: "danger"
      });
    }
  }

  if (load.kind === "loading") {
    return (
      <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto max-w-3xl space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (load.kind === "missing") {
    return (
      <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto max-w-3xl">
          <EmptyState
            icon={<UsersThree size={20} weight="duotone" aria-hidden="true" />}
            title={t("missingTitle")}
            description={t("missingBody")}
            action={
              <Link href="/families">
                <Button variant="secondary">
                  <ArrowLeft size={14} weight="bold" aria-hidden="true" />
                  {t("backToFamilies")}
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (load.kind === "error") {
    return (
      <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto max-w-3xl rounded-card bg-peach-50 p-5 ring-1 ring-peach-100">
          <h1 className="font-display text-lg font-semibold text-danger">{t("errorTitle")}</h1>
          <p className="mt-2 text-sm text-muted">{load.message}</p>
        </div>
      </div>
    );
  }

  const profile = load.profile;
  const showCover = profile.visibility !== "minimal" && profile.coverUrl;
  const showDescription = profile.visibility !== "minimal" && profile.description;
  const showParentNames = profile.visibility === "open" && profile.showParentFirstNames;

  const canRequest =
    !connection ||
    connection.status === "declined" ||
    connection.status === "cancelled";
  const isPending = connection?.status === "pending";
  const isAccepted = connection?.status === "accepted";
  const isBlocked = connection?.status === "blocked";

  return (
    <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/families"
          className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-pill bg-surface px-3 text-xs font-semibold text-muted ring-1 ring-hairline transition-colors hover:text-ink"
        >
          <ArrowLeft size={13} weight="bold" aria-hidden="true" />
          {t("back")}
        </Link>

        <article className="mt-4 overflow-hidden rounded-card bg-surface ring-1 ring-hairline">
          {showCover ? (
            <div className="relative h-32 overflow-hidden bg-sunken sm:h-44">
              <img src={profile.coverUrl ?? ""} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-20 bg-gradient-to-br from-mint-50 via-canvas to-sunken" />
          )}

          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-2xs font-bold uppercase tracking-[0.16em] text-peach-300">
                  {t("eyebrow")}
                </p>
                <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-ink">
                  {profile.familyName ?? t("fallbackName")}
                </h1>
                {profile.neighbourhoods.length > 0 ? (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                    <MapPin size={13} weight="fill" aria-hidden="true" />
                    {profile.neighbourhoods.join(" · ")}
                  </p>
                ) : null}
              </div>
              {isAccepted ? (
                <Badge variant="success">
                  <CheckCircle size={11} weight="fill" aria-hidden="true" />
                  {t("connected")}
                </Badge>
              ) : isPending ? (
                <Badge variant="warning">
                  <Clock size={11} weight="fill" aria-hidden="true" />
                  {t("pendingPill")}
                </Badge>
              ) : null}
            </div>

            {showDescription ? (
              <p className="mt-4 text-sm leading-6 text-ink">{profile.description}</p>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {profile.childAgeBands.length > 0 ? (
                <div className="rounded-lg bg-sunken p-3 ring-1 ring-hairline">
                  <p className="flex items-center gap-1 text-2xs font-bold uppercase tracking-[0.12em] text-muted">
                    <Baby size={11} weight="fill" aria-hidden="true" />
                    {t("children")}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {profile.childAgeBands.map((band) => tBands(String(band))).join(" · ")}
                  </p>
                </div>
              ) : null}
              {profile.interests.length > 0 ? (
                <div className="rounded-lg bg-sunken p-3 ring-1 ring-hairline">
                  <p className="text-2xs font-bold uppercase tracking-[0.12em] text-muted">
                    {t("interests")}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {profile.interests.map((interest) => (
                      <Badge key={interest} variant={categoryBadgeVariant[interest]}>
                        {tTaxonomy(interest as VenueCategory)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {canRequest && primaryFamily?.id !== profile.familyId ? (
                <Button onClick={() => setRequestOpen(true)}>
                  <PaperPlaneTilt size={14} weight="fill" aria-hidden="true" />
                  {t("sendRequest")}
                </Button>
              ) : null}
              {isAccepted ? (
                <div className="flex flex-wrap gap-2">
                  {showParentNames && members.length > 0 ? (
                    members.map((member) => {
                      const name = member.profile?.displayName ?? member.displayName ?? "Parent";
                      return (
                        <Button
                          key={member.userId}
                          variant="primary"
                          onClick={() => startThread(member.userId)}
                        >
                          <ChatsCircle size={14} weight="fill" aria-hidden="true" />
                          {t("messageSomeone", { name })}
                        </Button>
                      );
                    })
                  ) : members.length > 0 ? (
                    <Button onClick={() => startThread(members[0].userId)}>
                      <ChatsCircle size={14} weight="fill" aria-hidden="true" />
                      {t("messageGeneric")}
                    </Button>
                  ) : null}
                </div>
              ) : null}
              {isPending ? (
                <Badge variant="warning">
                  <Clock size={11} weight="fill" aria-hidden="true" />
                  {t("waitForReply")}
                </Badge>
              ) : null}
              {isBlocked ? (
                <Badge variant="danger">
                  <ShieldSlash size={11} weight="fill" aria-hidden="true" />
                  {t("blockedPill")}
                </Badge>
              ) : null}
              <span className="ml-auto flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setReportOpen(true)}>
                  <Warning size={12} weight="fill" aria-hidden="true" />
                  {t("report")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setBlockOpen(true)}>
                  <ShieldSlash size={12} weight="fill" aria-hidden="true" />
                  {t("block")}
                </Button>
              </span>
            </div>
          </div>
        </article>

        <p className="mt-3 inline-flex items-center gap-1.5 text-2xs text-subtle">
          <ShieldCheck size={11} weight="fill" aria-hidden="true" />
          {t("privacyNote")}
        </p>
      </div>

      {/* Send connection request dialog */}
      <Dialog
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title={t("requestDialogTitle")}
        description={t("requestDialogBody")}
      >
        <Textarea
          value={requestMessage}
          onChange={(event) => setRequestMessage(event.target.value)}
          placeholder={t("requestPlaceholder")}
          rows={4}
          maxLength={600}
        />
        <div className="mt-3 flex items-center justify-between text-2xs text-subtle">
          <span>{t("requestVisibility")}</span>
          <span>{requestMessage.length}/600</span>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRequestOpen(false)}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={submitRequest} disabled={submitting}>
            <PaperPlaneTilt size={14} weight="fill" aria-hidden="true" />
            {t("requestSubmit")}
          </Button>
        </div>
      </Dialog>

      {/* Report dialog */}
      <Dialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={t("reportDialogTitle")}
        description={t("reportDialogBody")}
      >
        <label className="block">
          <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
            {t("reportReason")}
          </span>
          <Select
            value={reportReason}
            onChange={(event) =>
              setReportReason(
                event.target.value as "harassment" | "spam" | "inappropriate" | "safety" | "other"
              )
            }
          >
            <option value="harassment">{tReasons("harassment")}</option>
            <option value="spam">{tReasons("spam")}</option>
            <option value="inappropriate">{tReasons("inappropriate")}</option>
            <option value="safety">{tReasons("safety")}</option>
            <option value="other">{tReasons("other")}</option>
          </Select>
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
            {t("reportDetails")}
          </span>
          <Textarea
            value={reportDetails}
            onChange={(event) => setReportDetails(event.target.value)}
            rows={3}
            maxLength={2000}
            placeholder={t("reportDetailsPlaceholder")}
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setReportOpen(false)}>
            {tCommon("cancel")}
          </Button>
          <Button variant="danger" onClick={submitReport}>
            <Warning size={14} weight="fill" aria-hidden="true" />
            {t("reportSubmit")}
          </Button>
        </div>
      </Dialog>

      <ConfirmDialog
        open={blockOpen}
        title={t("blockDialogTitle")}
        description={t("blockDialogBody")}
        confirmLabel={t("blockConfirm")}
        cancelLabel={t("blockKeep")}
        danger
        onConfirm={submitBlock}
        onCancel={() => setBlockOpen(false)}
      />
    </div>
  );
}
