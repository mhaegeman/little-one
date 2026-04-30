"use client";

import { Baby, Plus } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { ChildProfileForm } from "@/components/onboarding/ChildProfileForm";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { formatChildAge } from "@/lib/utils";
import type { Child } from "@/lib/types";

type Props = {
  userId: string;
  locale: "da" | "en";
};

const COPY = {
  da: {
    title: "Børn",
    subtitle: "Tilføj eller redigér børnene i jeres familie.",
    empty: "Ingen børn registreret endnu.",
    addAnother: "Tilføj endnu et barn",
    cancel: "Luk"
  },
  en: {
    title: "Children",
    subtitle: "Add or edit the children in your family.",
    empty: "No children added yet.",
    addAnother: "Add another child",
    cancel: "Close"
  }
} as const;

export function FamilyChildren({ userId, locale }: Props) {
  const copy = COPY[locale];
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  async function refresh() {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    // No user_id filter: RLS already scopes this to children the current user
    // can see (their own + co-members of the same family), so an invitee gets
    // the shared family roster, not just children they personally created.
    const { data } = await supabase
      .from("children")
      .select("id,name,date_of_birth,photo_url")
      .order("date_of_birth", { ascending: true });
    setChildren(
      (data ?? []).map((row) => ({
        id: row.id as string,
        name: row.name as string,
        dateOfBirth: row.date_of_birth as string,
        photoUrl: (row.photo_url as string | null) ?? undefined
      }))
    );
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <section className="rounded-card bg-surface p-5 ring-1 ring-hairline">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-1.5 font-display text-lg font-semibold text-ink">
            <Baby size={16} weight="fill" className="text-warm-500" aria-hidden="true" />
            {copy.title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">{copy.subtitle}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={adding ? "ghost" : "secondary"}
          onClick={() => setAdding((current) => !current)}
        >
          {adding ? (
            copy.cancel
          ) : (
            <>
              <Plus size={12} weight="bold" aria-hidden="true" />
              {copy.addAnother}
            </>
          )}
        </Button>
      </div>

      {!loading && children.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {children.map((child) => {
            const initials = child.name
              .split(/\s+/)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("")
              .slice(0, 2);
            return (
              <li
                key={child.id}
                className="flex items-center gap-2.5 rounded-lg bg-sunken p-2.5 ring-1 ring-hairline"
              >
                {child.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={child.photoUrl}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover ring-2 ring-surface"
                  />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface font-display text-sm font-semibold text-warm-600 ring-2 ring-surface">
                    {initials || "?"}
                  </span>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">{child.name}</p>
                  <p className="text-xs text-muted">{formatChildAge(child.dateOfBirth, locale)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {!loading && children.length === 0 && !adding ? (
        <p className="mt-3 text-sm text-muted">{copy.empty}</p>
      ) : null}

      {adding ? (
        <div className="mt-3">
          <ChildProfileForm
            onCreated={() => {
              setAdding(false);
              refresh();
            }}
          />
        </div>
      ) : null}
    </section>
  );
}
