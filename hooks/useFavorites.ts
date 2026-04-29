"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "lille-liv:favorites:v1";
const EVENT = "lille-liv:favorites-change";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value) => typeof value === "string");
  } catch {
    return [];
  }
}

function writeFavorites(values: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(values));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: values }));
  } catch {
    /* quota / private mode */
  }
}

/**
 * Persisted set of venue IDs the user has saved as favorites.
 * Backed by localStorage for now; same shape as a future Supabase table
 * (`saved_venues` keyed by user_id + venue_id) so the upgrade is mechanical.
 *
 * Cross-tab and cross-component updates use a custom DOM event + the native
 * `storage` event so multiple consumers stay in sync.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readFavorites());

    function onChange(event: Event) {
      if (event instanceof CustomEvent) {
        setFavorites(event.detail as string[]);
      } else {
        setFavorites(readFavorites());
      }
    }

    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const toggleFavorite = useCallback((id: string) => {
    const current = readFavorites();
    const next = current.includes(id)
      ? current.filter((value) => value !== id)
      : [id, ...current];
    writeFavorites(next);
    return next.includes(id);
  }, []);

  const clear = useCallback(() => writeFavorites([]), []);

  return { favorites, isFavorite, toggleFavorite, clear };
}
