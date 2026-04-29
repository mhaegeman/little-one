"use client";

import {
  Baby,
  Plus,
  ShieldCheck,
  Sparkle
} from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { ActivityForm } from "@/components/journal/ActivityForm";
import { MilestoneForm } from "@/components/journal/MilestoneForm";
import { Timeline } from "@/components/journal/Timeline";
import { ChildProfileForm } from "@/components/onboarding/ChildProfileForm";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Sheet } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import type { Child, TimelineItem } from "@/lib/types";
import { cn, formatChildAge } from "@/lib/utils";

const demoChild: Child = {
  id: "demo-asta",
  name: "Asta",
  dateOfBirth: "2024-08-12",
  photoUrl: "https://images.unsplash.com/photo-1546015720-b8b30df5aa27?auto=format&fit=crop&w=600&q=80"
};

const demoTimeline: TimelineItem[] = [
  {
    id: "demo-aula-1",
    type: "aula",
    title: "En blød formiddag i puderummet",
    description: "Børnehaven delte et lille glimt fra dagens motorikleg.",
    date: "2026-04-23",
    badge: "Fra børnehaven"
  },
  {
    id: "demo-activity-1",
    type: "activity",
    title: "Superkilen med løbecykel",
    description: "Vi øvede stop og start ved den røde plads og spiste boller på vejen hjem.",
    date: "2026-04-19"
  },
  {
    id: "demo-milestone-1",
    type: "milestone",
    title: "Første hele sætning",
    description: "“Mere vand, tak.” Meget bestemt og meget sødt.",
    date: "2026-04-10"
  }
];

type SheetMode = "milestone" | "activity" | null;

export function JournalClient() {
  const t = useTranslations("journal");
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string>(demoChild.id);
  const [timeline, setTimeline] = useState<TimelineItem[]>(demoTimeline);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [usingDemo, setUsingDemo] = useState(false);

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
        setLoading(false);
        return;
      }

      const { data: childRows } = await supabase
        .from("children")
        .select("id,name,date_of_birth,photo_url,gender")
        .order("created_at", { ascending: true });

      if (!childRows?.length) {
        setChildren([]);
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

    async function loadTimeline(childId: string) {
      const [{ data: milestones }, { data: activities }, { data: highlights }] = await Promise.all([
        supabase.from("milestones").select("id,type,date,notes,photo_url").eq("child_id", childId),
        supabase
          .from("activities_log")
          .select("id,title,description,date,photos")
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
          photos: item.photos ?? undefined
        })),
        ...(highlights ?? []).map((item) => ({
          id: item.id,
          type: "aula" as const,
          title: item.title,
          description: item.content ?? undefined,
          date: item.posted_at,
          photos: item.photos ?? undefined,
          badge: "Fra vuggestuen"
        }))
      ];

      setTimeline(nextTimeline);
    }

    loadSession();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const activeChild = useMemo(
    () => children.find((child) => child.id === activeChildId) ?? children[0],
    [activeChildId, children]
  );

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

  if (!signedIn && !usingDemo) {
    return (
      <div className="px-4 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1fr_420px]">
          <section className="rounded-card bg-surface p-5 ring-1 ring-hairline">
            <p className="text-2xs font-bold uppercase tracking-[0.16em] text-warm-500">
              {t("private")}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              {t("loginRequiredBody")}
            </p>
          </section>
          <LoginForm />
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
            <div className="flex items-center gap-2">
              <Button onClick={() => setSheetMode("milestone")}>
                <Plus size={14} weight="bold" aria-hidden="true" />
                {t("milestone")}
              </Button>
              <Button variant="secondary" onClick={() => setSheetMode("activity")}>
                <Plus size={14} weight="bold" aria-hidden="true" />
                {t("activity")}
              </Button>
            </div>
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
                {formatChildAge(activeChild.dateOfBirth)}
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
                        ? "bg-sage-500 text-white ring-sage-500"
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
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-sage-50 p-2.5 text-xs text-sage-700 ring-1 ring-sage-100">
              <ShieldCheck className="mt-0.5 shrink-0" size={14} weight="fill" aria-hidden="true" />
              Demojournalen kører lokalt, indtil Supabase er konfigureret.
            </div>
          ) : null}
        </section>

        {/* Timeline */}
        <section className="mt-5">
          <Timeline items={timeline} />
        </section>

        {/* Aula footer */}
        <aside className="mt-6 rounded-card bg-surface p-4 ring-1 ring-hairline">
          <div className="flex items-start gap-2">
            <Sparkle size={16} weight="fill" className="mt-0.5 text-warm-500" aria-hidden="true" />
            <div>
              <h3 className="font-display text-base font-semibold text-ink">Aula</h3>
              <p className="mt-1 text-sm leading-6 text-muted">
                Aula-forbindelse kommer snart som sikker MitID-baseret import. Lille Liv gemmer
                ikke Aula-adgangskoder i MVP-demoen.
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
        title={sheetMode === "milestone" ? t("addMilestone") : t("addActivity")}
        description={sheetMode === "milestone" ? "Marker en milepæl for senere." : "Tilføj en lille tur eller hverdagsoplevelse."}
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
      </Sheet>
    </div>
  );
}
