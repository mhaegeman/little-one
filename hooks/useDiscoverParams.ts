"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { IndoorOutdoor, Neighbourhood, VenueCategory } from "@/lib/types";

export type DiscoverState = {
  categories: VenueCategory[];
  neighbourhood: Neighbourhood | "all";
  indoorOutdoor: IndoorOutdoor | "all";
  openNow: boolean;
  ageMin: number;
  ageMax: number;
  query: string;
  view: "split" | "list" | "map";
  savedOnly: boolean;
};

const DEFAULTS: DiscoverState = {
  categories: [],
  neighbourhood: "all",
  indoorOutdoor: "all",
  openNow: false,
  ageMin: 0,
  ageMax: 72,
  query: "",
  view: "split",
  savedOnly: false
};

function parseInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function useDiscoverParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const state: DiscoverState = useMemo(() => {
    const cat = params.get("c");
    const view = params.get("v");
    return {
      categories: cat ? (cat.split(",").filter(Boolean) as VenueCategory[]) : DEFAULTS.categories,
      neighbourhood: (params.get("n") as Neighbourhood | "all") ?? DEFAULTS.neighbourhood,
      indoorOutdoor: (params.get("io") as IndoorOutdoor | "all") ?? DEFAULTS.indoorOutdoor,
      openNow: params.get("o") === "1",
      ageMin: parseInt(params.get("amin"), DEFAULTS.ageMin),
      ageMax: parseInt(params.get("amax"), DEFAULTS.ageMax),
      query: params.get("q") ?? DEFAULTS.query,
      view: view === "list" || view === "map" ? view : "split",
      savedOnly: params.get("s") === "1"
    };
  }, [params]);

  const update = useCallback(
    (patch: Partial<DiscoverState>) => {
      const merged = { ...state, ...patch };
      const next = new URLSearchParams();
      if (merged.categories.length) next.set("c", merged.categories.join(","));
      if (merged.neighbourhood !== "all") next.set("n", merged.neighbourhood);
      if (merged.indoorOutdoor !== "all") next.set("io", merged.indoorOutdoor);
      if (merged.openNow) next.set("o", "1");
      if (merged.ageMin !== DEFAULTS.ageMin) next.set("amin", String(merged.ageMin));
      if (merged.ageMax !== DEFAULTS.ageMax) next.set("amax", String(merged.ageMax));
      if (merged.query) next.set("q", merged.query);
      if (merged.view !== "split") next.set("v", merged.view);
      if (merged.savedOnly) next.set("s", "1");

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, state]
  );

  const reset = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return { state, update, reset };
}
