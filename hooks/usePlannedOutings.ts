"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "lille-liv:planned-outings:v1";
const EVENT = "lille-liv:planned-outings-change";

export type PlannedOuting = {
  id: string;
  venueId: string;
  date: string;
  note?: string;
  createdAt: string;
};

function read(): PlannedOuting[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PlannedOuting =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as PlannedOuting).id === "string" &&
        typeof (item as PlannedOuting).venueId === "string" &&
        typeof (item as PlannedOuting).date === "string"
    );
  } catch {
    return [];
  }
}

function write(values: PlannedOuting[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(values));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: values }));
  } catch {
    /* quota / private mode */
  }
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Persisted "I'd like to visit X" plans, keyed by venue.
 * Stored in localStorage with the same migration story as useFavorites:
 * the shape mirrors a future Supabase `planned_outings` table.
 */
export function usePlannedOutings() {
  const [outings, setOutings] = useState<PlannedOuting[]>([]);

  useEffect(() => {
    setOutings(read());
    function onChange(event: Event) {
      if (event instanceof CustomEvent) {
        setOutings(event.detail as PlannedOuting[]);
      } else {
        setOutings(read());
      }
    }
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const add = useCallback((input: { venueId: string; date: string; note?: string }) => {
    const next: PlannedOuting = {
      id: makeId(),
      venueId: input.venueId,
      date: input.date,
      note: input.note?.trim() || undefined,
      createdAt: new Date().toISOString()
    };
    write([next, ...read()]);
    return next;
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((item) => item.id !== id));
  }, []);

  const removeForVenue = useCallback((venueId: string) => {
    write(read().filter((item) => item.venueId !== venueId));
  }, []);

  const isPlanned = useCallback(
    (venueId: string) => outings.some((item) => item.venueId === venueId),
    [outings]
  );

  return { outings, add, remove, removeForVenue, isPlanned };
}
