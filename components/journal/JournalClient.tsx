"use client";

import { Baby, Plus, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { ActivityForm } from "@/components/journal/ActivityForm";
import { MilestoneForm } from "@/components/journal/MilestoneForm";
import { Timeline } from "@/components/journal/Timeline";
import { ChildProfileForm } from "@/components/onboarding/ChildProfileForm";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { Child, TimelineItem } from "@/lib/types";
import { formatChildAge } from "@/lib/utils";

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

export function JournalClient() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string>(demoChild.id);
  const [timeline, setTimeline] = useState<TimelineItem[]>(demoTimeline);
  const [showMilestoneForm, setShowMilestoneForm] = useState(true);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [usingDemo, setUsingDemo] = useState(false);

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
    return <div className="px-4 pt-24 text-sm font-bold text-ink/60 lg:px-8 lg:pt-8">Henter journal...</div>;
  }

  if (!signedIn && !usingDemo) {
    return (
      <div className="px-4 pt-24 sm:px-6 lg:px-8 lg:pt-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
          <div className="rounded-card bg-white p-6 shadow-soft ring-1 ring-oat">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-rust">Privat</p>
            <h1 className="mt-2 font-display text-4xl font-semibold">Journal</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-ink/70">
              Journalen kræver login, fordi børns billeder, milepæle og institutionsglimt er private.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  if (!activeChild) {
    return (
      <div className="px-4 pt-24 sm:px-6 lg:px-8 lg:pt-8">
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
    <div className="px-4 pt-20 sm:px-6 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-card bg-white p-5 shadow-soft ring-1 ring-oat/70 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {activeChild.photoUrl ? (
                <img
                  src={activeChild.photoUrl}
                  alt=""
                  className="h-20 w-20 rounded-2xl object-cover ring-4 ring-linen"
                />
              ) : (
                <span className="grid h-20 w-20 place-items-center rounded-2xl bg-linen text-rust">
                  <Baby size={34} aria-hidden="true" />
                </span>
              )}
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-rust">Journal</p>
                <h1 className="font-display text-4xl font-semibold text-ink">{activeChild.name}</h1>
                <p className="mt-1 text-sm font-bold text-ink/60">
                  {formatChildAge(activeChild.dateOfBirth)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setActiveChildId(child.id)}
                  className={`focus-ring rounded-full px-3 py-2 text-sm font-bold ring-1 ${
                    child.id === activeChild.id
                      ? "bg-moss text-white ring-moss"
                      : "bg-linen text-ink/70 ring-oat"
                  }`}
                >
                  {child.name}
                </button>
              ))}
            </div>
          </div>

          {usingDemo ? (
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-linen p-3 text-sm font-semibold text-ink/70">
              <ShieldCheck className="mt-0.5 shrink-0 text-moss" size={17} aria-hidden="true" />
              Demojournalen kører lokalt, indtil Supabase er konfigureret.
            </div>
          ) : null}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold">Tidslinje</h2>
              <div className="flex gap-2">
                <Button className="h-10 px-3" onClick={() => setShowMilestoneForm((value) => !value)}>
                  <Plus size={16} aria-hidden="true" />
                  Milepæl
                </Button>
                <Button
                  variant="secondary"
                  className="h-10 px-3"
                  onClick={() => setShowActivityForm((value) => !value)}
                >
                  <Plus size={16} aria-hidden="true" />
                  Tur
                </Button>
              </div>
            </div>
            <Timeline items={timeline} />
          </section>

          <aside className="space-y-4">
            {showMilestoneForm ? (
              <MilestoneForm
                childId={activeChild.id}
                onAdd={(item) => setTimeline((current) => [item, ...current])}
              />
            ) : null}

            {showActivityForm ? (
              <ActivityForm
                childId={activeChild.id}
                onAdd={(item) => setTimeline((current) => [item, ...current])}
              />
            ) : null}

            <div className="rounded-card bg-white p-5 shadow-soft ring-1 ring-oat">
              <h2 className="font-display text-2xl font-semibold">Aula</h2>
              <p className="mt-2 text-sm leading-6 text-ink/70">
                Aula-forbindelse kommer snart som sikker MitID-baseret import. Lille Liv gemmer ikke
                Aula-adgangskoder i MVP-demoen.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
