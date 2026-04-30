"use client";

import {
  ArrowRight,
  Baby,
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
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import { createClient } from "@/lib/supabase/client";
import type { Child, TimelineItem, TimelineItemType } from "@/lib/types";
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

  useEffect(() => {
    const newParam = searchParams.get("new");
    if (newParam === "milestone" || newParam === "activity") {
      setSheetMode(newParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const client = createClient();

    if (!client) {
      setChildren([demoChild]);
      setTimeline(demoTimeline);
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
        resetToDemo();
        setLoading(false);
        return;
      }

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
      setUsingDemo(true);
      setSheetMode(null);
    }

    async function loadTimeline(childId: string) {
      const [{ data: milestones }, { data: activities }, { data: highlights }] = await Promise.all([
        supabase.from("milestones").select("id,type,date,notes,photo_url").eq("child_id", childId),
        supabase
          .from("activities_log")
          .select("id,title,description,date,photos,tags")
          .eq("child_id", childId),
        supabase
          .from("aula_highlights")
          .select("id,title,content,posted_at,photos")
          .eq("child_id", childId)
      ]);

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
    return timeline.filter((item) => {
      if (filterKind !== "all" && item.type !== filterKind) return false;
      if (filterTag && !(item.tags ?? []).includes(filterTag)) return false;
      if (!q) return true;
      const haystack = `${item.title} ${item.description ?? ""} ${item.badge ?? ""} ${(item.tags ?? []).join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [timeline, filterKind, filterTag, search]);

  const filtersActive = filterKind !== "all" || filterTag !== null || search.length > 0;

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
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sage-100 text-sage-700">
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
            <Timeline items={filteredTimeline} />
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
