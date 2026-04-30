"use client";

import {
  ArrowRight,
  Baby,
  Confetti,
  House,
  MagnifyingGlass,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkle,
  UserPlus,
  X
} from "@phosphor-icons/react/dist/ssr";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityForm } from "@/components/journal/ActivityForm";
import { JournalCalendar } from "@/components/journal/JournalCalendar";
import { MilestoneForm } from "@/components/journal/MilestoneForm";
import { PlannedOutings } from "@/components/journal/PlannedOutings";
import { Timeline } from "@/components/journal/Timeline";
import { ChildProfileForm } from "@/components/onboarding/ChildProfileForm";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Sheet } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  addReaction,
  loadReactions,
  reactionKey,
  removeReaction
} from "@/lib/services/reactions";
import { createClient } from "@/lib/db/supabase/client";
import type {
  Child,
  Reaction,
  ReactionKind,
  TimelineItem,
  TimelineItemType
} from "@/lib/types";
import { cn, formatChildAge } from "@/lib/utils";

type FilterKind = "all" | TimelineItemType;

const demoChild: Child = {
  id: "demo-asta",
  name: "Asta",
  dateOfBirth: "2024-08-12",
  photoUrl: "https://images.unsplash.com/photo-1546015720-b8b30df5aa27?auto=format&fit=crop&w=600&q=80"
};

type SheetMode = "milestone" | "activity" | "child" | null;

export function JournalClient() {
  const t = useTranslations("journal");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [welcome, setWelcome] = useState<{
    children: number;
    invites: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string>(demoChild.id);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [usingDemo, setUsingDemo] = useState(false);
  const [filterKind, setFilterKind] = useState<FilterKind>("all");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentDisplayName, setCurrentDisplayName] = useState<string | null>(
    null
  );
  const [reactionMap, setReactionMap] = useState<Map<string, Reaction[]>>(
    () => new Map()
  );
  // Optimistic reactions whose insert hasn't returned but that the user has
  // already toggled off. The add path checks this set when the insert
  // resolves and deletes the just-saved row instead of reflecting it.
  const pendingDeletionsRef = useRef<Set<string>>(new Set());

  const demoTimeline: TimelineItem[] = useMemo(() => [
    {
      id: "demo-aula-1",
      type: "aula",
      title: t("demo.aula1Title"),
      description: t("demo.aula1Description"),
      date: "2026-04-23",
      badge: t("aulaBadgeKindergarten")
    },
    {
      id: "demo-activity-1",
      type: "activity",
      title: t("demo.activity1Title"),
      description: t("demo.activity1Description"),
      date: "2026-04-19"
    },
    {
      id: "demo-milestone-1",
      type: "milestone",
      title: t("demo.milestone1Title"),
      description: t("demo.milestone1Description"),
      date: "2026-04-10"
    }
  ], [t]);

  const demoReactionMap = useMemo(() => {
    const map = new Map<string, Reaction[]>();
    map.set(reactionKey("activity", "demo-activity-1"), [
      {
        id: "demo-reaction-mormor",
        kind: "heart",
        userId: "demo-mormor",
        displayName: "Mormor",
        createdAt: "2026-04-19T18:12:00Z"
      },
      {
        id: "demo-reaction-morfar",
        kind: "clap",
        userId: "demo-morfar",
        displayName: "Morfar",
        createdAt: "2026-04-19T18:14:00Z"
      }
    ]);
    map.set(reactionKey("milestone", "demo-milestone-1"), [
      {
        id: "demo-reaction-mormor-2",
        kind: "smile",
        userId: "demo-mormor",
        displayName: "Mormor",
        createdAt: "2026-04-10T20:01:00Z"
      }
    ]);
    return map;
  }, []);

  useEffect(() => {
    const newParam = searchParams.get("new");
    if (newParam === "milestone" || newParam === "activity") {
      setSheetMode(newParam);
    }

    if (searchParams.get("welcome") === "1") {
      const childrenCount = Number(searchParams.get("children") ?? "0") || 0;
      const invitesCount = Number(searchParams.get("invites") ?? "0") || 0;
      setWelcome({ children: childrenCount, invites: invitesCount });

      // Strip the query params so a refresh doesn't show the banner again.
      const next = new URLSearchParams(searchParams.toString());
      next.delete("welcome");
      next.delete("children");
      next.delete("invites");
      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    }
  }, [searchParams, router, pathname]);

  useEffect(() => {
    const client = createClient();

    if (!client) {
      setChildren([demoChild]);
      setTimeline(demoTimeline);
      setReactionMap(demoReactionMap);
      setUsingDemo(true);
      setLoading(false);
      return;
    }

    const supabase = client;

    async function loadSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      setSignedIn(Boolean(session));

      if (!session) {
        setCurrentUserId(null);
        setCurrentDisplayName(null);
        resetToDemo();
        setLoading(false);
        return;
      }

      setCurrentUserId(session.user.id);
      const meta = session.user.user_metadata as
        | { full_name?: string; name?: string; display_name?: string }
        | undefined;
      setCurrentDisplayName(
        meta?.display_name || meta?.full_name || meta?.name || session.user.email || null
      );
      setUsingDemo(false);
      setSheetMode(null);

      const { data: childRows } = await supabase
        .from("children")
        .select("id,name,date_of_birth,photo_url,gender")
        .order("created_at", { ascending: true });

      if (!childRows?.length) {
        setChildren([]);
        setActiveChildId("");
        setTimeline([]);
        setReactionMap(new Map());
        setLoading(false);
        return;
      }

      const loadedChildren = childRows.map((child) => ({
        id: child.id,
        name: child.name,
        dateOfBirth: child.date_of_birth,
        photoUrl: child.photo_url ?? undefined,
        gender: child.gender ?? undefined
      }));
      setChildren(loadedChildren);
      setActiveChildId(loadedChildren[0].id);
      await loadTimeline(loadedChildren[0].id);
      setLoading(false);
    }

    function resetToDemo() {
      setChildren([demoChild]);
      setActiveChildId(demoChild.id);
      setTimeline(demoTimeline);
      setReactionMap(demoReactionMap);
      setUsingDemo(true);
      setSheetMode(null);
    }

    async function loadTimeline(childId: string) {
      const [{ data: milestones }, { data: activities }, { data: highlights }, reactions] = await Promise.all([
        supabase.from("milestones").select("id,type,date,notes,photo_url").eq("child_id", childId),
        supabase
          .from("activities_log")
          .select("id,title,description,date,photos,tags")
          .eq("child_id", childId),
        supabase
          .from("aula_highlights")
          .select("id,title,content,posted_at,photos")
          .eq("child_id", childId),
        loadReactions(supabase, childId)
      ]);
      setReactionMap(reactions);

      const nextTimeline: TimelineItem[] = [
        ...(milestones ?? []).map((item) => ({
          id: item.id,
          type: "milestone" as const,
          title: String(item.type).replaceAll("_", " "),
          description: item.notes ?? undefined,
          date: item.date,
          photos: item.photo_url ? [item.photo_url] : undefined
        })),
        ...(activities ?? []).map((item) => ({
          id: item.id,
          type: "activity" as const,
          title: item.title,
          description: item.description ?? undefined,
          date: item.date,
          photos: item.photos ?? undefined,
          tags: (item.tags as string[] | null) ?? undefined
        })),
        ...(highlights ?? []).map((item) => ({
          id: item.id,
          type: "aula" as const,
          title: item.title,
          description: item.content ?? undefined,
          date: item.posted_at,
          photos: item.photos ?? undefined,
          badge: t("aulaBadgeNursery")
        }))
      ];

      setTimeline(nextTimeline);
    }

    loadSession();

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setSignedIn(false);
        resetToDemo();
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        loadSession();
      }
    });

    return () => data.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeChild = useMemo(
    () => children.find((child) => child.id === activeChildId) ?? children[0],
    [activeChildId, children]
  );

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of timeline) {
      for (const tag of item.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [timeline]);

  const filteredTimeline = useMemo(() => {
    const q = search.trim().toLowerCase();
    return timeline
      .filter((item) => {
        if (filterKind !== "all" && item.type !== filterKind) return false;
        if (filterTag && !(item.tags ?? []).includes(filterTag)) return false;
        if (!q) return true;
        const haystack = `${item.title} ${item.description ?? ""} ${item.badge ?? ""} ${(item.tags ?? []).join(" ")}`.toLowerCase();
        return haystack.includes(q);
      })
      .map((item) => ({
        ...item,
        reactions: reactionMap.get(reactionKey(item.type, item.id)) ?? []
      }));
  }, [timeline, filterKind, filterTag, search, reactionMap]);

  const filtersActive = filterKind !== "all" || filterTag !== null || search.length > 0;

  const reactorIdentity = useMemo(() => {
    if (currentUserId) {
      return { userId: currentUserId, displayName: currentDisplayName };
    }
    if (usingDemo) {
      return { userId: "demo-self", displayName: t("reactions.demoActor") };
    }
    return null;
  }, [currentUserId, currentDisplayName, usingDemo, t]);

  async function handleToggleReaction(item: TimelineItem, kind: ReactionKind) {
    if (item.type === "aula") return;
    if (!reactorIdentity) return;
    const key = reactionKey(item.type, item.id);
    const existing = reactionMap.get(key) ?? [];
    const mine = existing.find(
      (reaction) =>
        reaction.kind === kind && reaction.userId === reactorIdentity.userId
    );

    if (mine) {
      // Optimistic remove
      const next = new Map(reactionMap);
      next.set(
        key,
        existing.filter((reaction) => reaction.id !== mine.id)
      );
      setReactionMap(next);

      if (currentUserId) {
        // The reaction's insert may still be in flight — its id is a
        // `local-*` placeholder and isn't a row on the server yet. Mark it
        // for deletion in the add path's success handler instead of firing
        // a no-op DELETE that races the pending INSERT.
        if (mine.id.startsWith("local-")) {
          pendingDeletionsRef.current.add(mine.id);
          return;
        }
        const supabase = createClient();
        if (supabase) {
          const ok = await removeReaction(supabase, mine.id);
          if (!ok) {
            // Revert on failure
            setReactionMap((current) => {
              const reverted = new Map(current);
              reverted.set(key, existing);
              return reverted;
            });
          }
        }
      }
      return;
    }

    // Optimistic add
    const optimistic: Reaction = {
      id: `local-${crypto.randomUUID()}`,
      kind,
      userId: reactorIdentity.userId,
      displayName: reactorIdentity.displayName,
      createdAt: new Date().toISOString()
    };
    const nextList = [...existing, optimistic];
    const next = new Map(reactionMap);
    next.set(key, nextList);
    setReactionMap(next);

    if (currentUserId) {
      const supabase = createClient();
      if (!supabase) return;
      const saved = await addReaction(supabase, {
        childId: activeChildId,
        entryType: item.type,
        entryId: item.id,
        kind,
        userId: currentUserId,
        displayName: reactorIdentity.displayName
      });

      // The user toggled the reaction back off while the insert was in
      // flight (handleToggleReaction took the `local-*` branch and
      // recorded the optimistic id here). Honour that by deleting the
      // just-saved row and leaving local state alone — it already shows
      // the reaction as removed.
      if (pendingDeletionsRef.current.delete(optimistic.id)) {
        if (saved) {
          await removeReaction(supabase, saved.id);
        }
        return;
      }

      if (saved) {
        // Replace optimistic with saved
        setReactionMap((current) => {
          const swapped = new Map(current);
          const list = swapped.get(key) ?? [];
          swapped.set(
            key,
            list.map((reaction) =>
              reaction.id === optimistic.id ? saved : reaction
            )
          );
          return swapped;
        });
      } else {
        // Revert on failure
        setReactionMap((current) => {
          const reverted = new Map(current);
          reverted.set(key, existing);
          return reverted;
        });
      }
    }
  }

  if (loading) {
    return (
      <div className="px-4 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto max-w-5xl space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!activeChild) {
    return (
      <div className="px-4 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto max-w-3xl">
          <ChildProfileForm
            onCreated={(child) => {
              setChildren([child]);
              setActiveChildId(child.id);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          eyebrow={t("private")}
          title={t("title")}
          description={t("subtitle")}
          action={
            signedIn ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={() => setSheetMode("milestone")}>
                  <Plus size={14} weight="bold" aria-hidden="true" />
                  {t("milestone")}
                </Button>
                <Button variant="secondary" onClick={() => setSheetMode("activity")}>
                  <Plus size={14} weight="bold" aria-hidden="true" />
                  {t("activity")}
                </Button>
                {!usingDemo ? (
                  <Button
                    variant="ghost"
                    onClick={() => setSheetMode("child")}
                    aria-label={t("addChildTitle")}
                  >
                    <UserPlus size={14} weight="bold" aria-hidden="true" />
                    {t("addChildButton")}
                  </Button>
                ) : null}
              </div>
            ) : null
          }
        />

        {welcome ? (
          <section
            role="status"
            className="mt-4 flex flex-wrap items-start gap-3 rounded-card bg-mint-50 p-4 ring-1 ring-mint-100"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-50 text-mint-ink">
              <Confetti size={20} weight="fill" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold text-mint-ink">
                {t("welcomeTitle")}
              </h2>
              <p className="mt-0.5 text-sm leading-6 text-mint-ink/85">
                {t("welcomeBody")}
              </p>
              {welcome.children > 0 || welcome.invites > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {welcome.children > 0 ? (
                    <span className="rounded-pill bg-white/70 px-2.5 py-0.5 text-2xs font-semibold text-mint-ink">
                      {t("welcomeChildren", { count: welcome.children })}
                    </span>
                  ) : null}
                  {welcome.invites > 0 ? (
                    <span className="rounded-pill bg-white/70 px-2.5 py-0.5 text-2xs font-semibold text-mint-ink">
                      {t("welcomeInvites", { count: welcome.invites })}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setWelcome(null)}
              aria-label={t("welcomeDismiss")}
              className="focus-ring grid h-7 w-7 shrink-0 place-items-center rounded-md text-mint-ink/70 hover:bg-white/60 hover:text-mint-ink"
            >
              <X size={13} weight="bold" aria-hidden="true" />
            </button>
          </section>
        ) : null}

        {/* Child header card */}
        <section className="mt-4 rounded-card bg-surface p-3.5 ring-1 ring-hairline">
          <div className="flex items-center gap-3">
            {activeChild.photoUrl ? (
              <img
                src={activeChild.photoUrl}
                alt=""
                className="h-14 w-14 rounded-2xl object-cover ring-2 ring-canvas"
              />
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-mint-50 text-mint-ink">
                <Baby size={26} weight="duotone" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-semibold text-ink">
                {activeChild.name}
              </h2>
              <p className="text-xs font-semibold text-muted">
                {formatChildAge(activeChild.dateOfBirth, locale)}
              </p>
            </div>

            {children.length > 1 ? (
              <div className="flex flex-wrap gap-1">
                {children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => setActiveChildId(child.id)}
                    className={cn(
                      "focus-ring rounded-pill px-2.5 py-1 text-xs font-semibold ring-1 transition-colors",
                      child.id === activeChild.id
                        ? "bg-mint-300 text-mint-ink ring-mint-300"
                        : "bg-surface text-muted ring-hairline hover:bg-sunken"
                    )}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {usingDemo ? (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-mint-50 p-2.5 text-xs text-mint-ink ring-1 ring-mint-100">
              <ShieldCheck className="mt-0.5 shrink-0" size={14} weight="fill" aria-hidden="true" />
              <span className="flex-1">{t("demoBanner")}</span>
              {!signedIn ? (
                <Link
                  href="/auth?next=/journal"
                  className="focus-ring inline-flex items-center gap-1 rounded-pill bg-mint-300 px-2.5 py-1 text-2xs font-bold uppercase tracking-[0.08em] text-mint-ink hover:bg-mint-200"
                >
                  {t("demoBannerCta")}
                  <ArrowRight size={11} weight="bold" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </section>

        {/* Planned outings (Discover → Journal loop) */}
        <PlannedOutings
          childId={activeChild.id}
          onAdd={(item) => setTimeline((current) => [item, ...current])}
        />

        {/* Filter bar */}
        {timeline.length > 0 ? (
          <section
            aria-label={t("filterLabel")}
            className="mt-4 flex flex-wrap items-center gap-2 rounded-card bg-surface p-2 ring-1 ring-hairline"
          >
            <div className="flex flex-wrap items-center gap-1">
              <FilterChip
                active={filterKind === "all"}
                onClick={() => setFilterKind("all")}
                label={t("filter.all")}
                count={timeline.length}
              />
              <FilterChip
                active={filterKind === "milestone"}
                onClick={() => setFilterKind("milestone")}
                icon={<Sparkle size={11} weight="fill" aria-hidden="true" />}
                label={t("filter.milestones")}
                count={timeline.filter((i) => i.type === "milestone").length}
              />
              <FilterChip
                active={filterKind === "activity"}
                onClick={() => setFilterKind("activity")}
                icon={<MapPin size={11} weight="fill" aria-hidden="true" />}
                label={t("filter.outings")}
                count={timeline.filter((i) => i.type === "activity").length}
              />
              <FilterChip
                active={filterKind === "aula"}
                onClick={() => setFilterKind("aula")}
                icon={<House size={11} weight="fill" aria-hidden="true" />}
                label={t("filter.aula")}
                count={timeline.filter((i) => i.type === "aula").length}
              />
            </div>
            <div className="ml-auto min-w-[160px] flex-1 sm:flex-initial sm:basis-64">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("filter.searchPlaceholder")}
                leadingIcon={<MagnifyingGlass size={14} weight="bold" aria-hidden="true" />}
                trailingIcon={
                  search ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label={t("filter.clearSearch")}
                      className="focus-ring grid h-5 w-5 place-items-center rounded-md hover:bg-sunken"
                    >
                      <X size={11} weight="bold" aria-hidden="true" />
                    </button>
                  ) : null
                }
              />
            </div>
            {allTags.length > 0 ? (
              <div className="flex w-full flex-wrap items-center gap-1 border-t border-hairline pt-2">
                <span className="text-2xs font-bold uppercase tracking-[0.12em] text-subtle">
                  Tags
                </span>
                {allTags.map(([tag, count]) => {
                  const active = filterTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFilterTag(active ? null : tag)}
                      aria-pressed={active}
                      className={cn(
                        "focus-ring inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-2xs font-semibold ring-1 transition-colors",
                        active
                          ? "bg-mint-300 text-mint-ink ring-mint-300"
                          : "bg-sunken text-muted ring-hairline hover:text-ink"
                      )}
                    >
                      {tag}
                      <span
                        className={cn(
                          "rounded-full px-1 text-2xs",
                          active ? "bg-white/25" : "bg-surface text-subtle"
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
                {filterTag ? (
                  <button
                    type="button"
                    onClick={() => setFilterTag(null)}
                    className="focus-ring text-2xs font-bold uppercase tracking-[0.14em] text-peach-ink hover:text-peach-300"
                  >
                    {t("filter.clearTag")}
                  </button>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Year-at-a-glance */}
        <JournalCalendar items={filteredTimeline} />

        {/* Timeline */}
        <section className="mt-4">
          {filteredTimeline.length === 0 && filtersActive ? (
            <EmptyState
              icon={<MagnifyingGlass size={20} weight="bold" aria-hidden="true" />}
              title={t("noEntriesMatch")}
              description={t("noEntriesMatchHint")}
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setFilterKind("all");
                    setFilterTag(null);
                    setSearch("");
                  }}
                >
                  <X size={12} weight="bold" aria-hidden="true" />
                  {t("resetFilter")}
                </Button>
              }
            />
          ) : (
            <Timeline
              items={filteredTimeline}
              currentUserId={reactorIdentity?.userId ?? null}
              onToggleReaction={
                reactorIdentity
                  ? (item, kind) => handleToggleReaction(item, kind)
                  : undefined
              }
            />
          )}
        </section>

        {/* Aula footer */}
        <aside className="mt-6 rounded-card bg-surface p-4 ring-1 ring-hairline">
          <div className="flex items-start gap-2">
            <Sparkle size={16} weight="fill" className="mt-0.5 text-peach-300" aria-hidden="true" />
            <div>
              <h3 className="font-display text-base font-semibold text-ink">{t("aulaSectionTitle")}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">
                {t("aulaSectionBody")}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Sheet for new entry */}
      <Sheet
        open={sheetMode !== null}
        onClose={() => setSheetMode(null)}
        side="right"
        size="md"
        title={
          sheetMode === "milestone"
            ? t("addMilestone")
            : sheetMode === "activity"
              ? t("addActivity")
              : sheetMode === "child"
                ? t("addChildTitle")
                : ""
        }
        description={
          sheetMode === "milestone"
            ? t("sheetDescriptionMilestone")
            : sheetMode === "activity"
              ? t("sheetDescriptionActivity")
              : sheetMode === "child"
                ? t("addChildDescription")
                : ""
        }
      >
        {sheetMode === "milestone" ? (
          <MilestoneForm
            childId={activeChild.id}
            onAdd={(item) => {
              setTimeline((current) => [item, ...current]);
              setSheetMode(null);
            }}
          />
        ) : null}
        {sheetMode === "activity" ? (
          <ActivityForm
            childId={activeChild.id}
            onAdd={(item) => {
              setTimeline((current) => [item, ...current]);
              setSheetMode(null);
            }}
          />
        ) : null}
        {sheetMode === "child" ? (
          <ChildProfileForm
            onCreated={(child) => {
              setChildren((current) => [...current, child]);
              setActiveChildId(child.id);
              setTimeline([]);
              setSheetMode(null);
            }}
          />
        ) : null}
      </Sheet>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  icon,
  count
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "focus-ring inline-flex h-8 items-center gap-1.5 rounded-pill px-2.5 text-xs font-semibold ring-1 transition-colors",
        active
          ? "bg-ink text-canvas ring-ink"
          : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
      )}
    >
      {icon}
      {label}
      <span
        className={cn(
          "grid h-4 min-w-[1rem] place-items-center rounded-full px-1 text-2xs font-bold",
          active ? "bg-canvas/25 text-canvas" : "bg-sunken text-muted"
        )}
      >
        {count}
      </span>
    </button>
  );
}
