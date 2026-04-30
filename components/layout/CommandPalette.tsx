"use client";

import {
  Compass,
  Lightning,
  MagnifyingGlass,
  MapTrifold,
  NotePencil,
  Plus,
  Sparkle,
  UserCircle,
  ClockCounterClockwise,
  X
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { venues } from "@/lib/data/venues";
import { cn } from "@/lib/utils";

type Item =
  | {
      kind: "route";
      id: string;
      label: string;
      description: string;
      href: string;
      icon: typeof Compass;
      shortcut?: string;
    }
  | {
      kind: "action";
      id: string;
      label: string;
      description: string;
      href: string;
      icon: typeof Plus;
      shortcut?: string;
    }
  | {
      kind: "venue";
      id: string;
      label: string;
      description: string;
      href: string;
    };

const routes: Extract<Item, { kind: "route" }>[] = [
  {
    kind: "route",
    id: "discover",
    label: "Opdag",
    description: "Find steder og oplevelser",
    href: "/",
    icon: Compass,
    shortcut: "G D"
  },
  {
    kind: "route",
    id: "journal",
    label: "Journal",
    description: "Milepæle og hverdagsglimt",
    href: "/journal",
    icon: NotePencil,
    shortcut: "G J"
  },
  {
    kind: "route",
    id: "profile",
    label: "Profil",
    description: "Familie, indstillinger og konto",
    href: "/profile",
    icon: UserCircle,
    shortcut: "G P"
  }
];

const actions: Extract<Item, { kind: "action" }>[] = [
  {
    kind: "action",
    id: "add-milestone",
    label: "Tilføj milepæl",
    description: "Marker et øjeblik i journalen",
    href: "/journal?new=milestone",
    icon: Sparkle
  },
  {
    kind: "action",
    id: "add-activity",
    label: "Tilføj tur",
    description: "Notér en udflugt eller hverdagsoplevelse",
    href: "/journal?new=activity",
    icon: Plus
  }
];

const RECENT_KEY = "lille-liv:cmdk:recent";
const MAX_RECENT = 4;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecent(values: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(values.slice(0, MAX_RECENT)));
  } catch {
    /* ignore quota */
  }
}

export function CommandPalette({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const tTaxonomy = useTranslations("taxonomy");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setRecent(loadRecent());
      requestAnimationFrame(() => inputRef.current?.focus());
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [open]);

  const venueIndex = useMemo(() => new Map(venues.map((v) => [v.id, v])), []);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();

    const venueResults: Item[] = venues
      .filter(
        (v) =>
          !q ||
          v.name.toLowerCase().includes(q) ||
          v.neighbourhood.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 8)
      .map((v) => ({
        kind: "venue",
        id: v.id,
        label: v.name,
        description: `${tTaxonomy(v.category)} · ${v.neighbourhood}`,
        href: `/venues/${v.id}`
      }));

    const routeResults = routes.filter(
      (r) =>
        !q ||
        r.label.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
    const actionResults = actions.filter(
      (a) =>
        !q ||
        a.label.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
    );

    if (q) {
      return [...routeResults, ...actionResults, ...venueResults];
    }

    const recentVenues: Item[] = recent
      .map((id) => venueIndex.get(id))
      .filter(<T,>(x: T | undefined): x is T => Boolean(x))
      .map((v) => ({
        kind: "venue" as const,
        id: v.id,
        label: v.name,
        description: `${tTaxonomy(v.category)} · ${v.neighbourhood}`,
        href: `/venues/${v.id}`
      }));

    return [...recentVenues, ...routeResults, ...actionResults, ...venueResults.slice(0, 6)];
  }, [query, recent, venueIndex, tTaxonomy]);

  const sectionBoundaries = useMemo(() => {
    // Build labels for sections based on item position
    const labels: { startIndex: number; label: string }[] = [];
    let lastKind: string | null = null;
    let recentCount = 0;
    if (!query.trim()) {
      recentCount = recent.filter((id) => venueIndex.has(id)).length;
    }
    items.forEach((item, index) => {
      if (!query.trim() && index < recentCount) {
        if (lastKind !== "recent") {
          labels.push({ startIndex: index, label: "Sidst besøgt" });
          lastKind = "recent";
        }
      } else if (item.kind !== lastKind) {
        labels.push({
          startIndex: index,
          label:
            item.kind === "route"
              ? "Sider"
              : item.kind === "action"
                ? "Hurtige handlinger"
                : "Steder"
        });
        lastKind = item.kind;
      }
    });
    return labels;
  }, [items, query, recent, venueIndex]);

  function commit(item: Item) {
    if (item.kind === "venue") {
      const next = [item.id, ...recent.filter((id) => id !== item.id)];
      saveRecent(next);
      setRecent(next);
    }
    router.push(item.href);
    onClose();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const item = items[active];
        if (item) {
          e.preventDefault();
          commit(item);
        }
      } else if (e.key >= "1" && e.key <= "9" && (e.metaKey || e.ctrlKey)) {
        const i = Number(e.key) - 1;
        const item = items[i];
        if (item) {
          e.preventDefault();
          commit(item);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, items, active]);

  if (!open) return null;

  const renderedSections = new Set<number>();

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Søg og hurtige handlinger"
    >
      <button
        type="button"
        aria-label="Luk søgning"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-surface shadow-lift ring-1 ring-hairline">
        <div className="flex items-center gap-2 border-b border-hairline px-4">
          <MagnifyingGlass size={18} weight="bold" className="text-subtle" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Søg steder, sider, eller skriv en handling…"
            className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-subtle"
            aria-label="Søg"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Ryd søgning"
              className="focus-ring grid h-6 w-6 place-items-center rounded-md text-muted hover:bg-sunken hover:text-ink"
            >
              <X size={11} weight="bold" aria-hidden="true" />
            </button>
          ) : null}
          <kbd className="rounded-md bg-sunken px-1.5 py-0.5 text-2xs font-bold text-muted ring-1 ring-hairline">
            ESC
          </kbd>
        </div>
        <ul className="max-h-[55vh] overflow-y-auto py-1.5 thin-scroll" role="listbox">
          {items.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-muted">
              Ingen resultater for &ldquo;{query}&rdquo;
            </li>
          ) : null}
          {items.map((item, i) => {
            const sectionLabel = sectionBoundaries.find((s) => s.startIndex === i)?.label;
            const showSection = sectionLabel && !renderedSections.has(i);
            if (showSection) renderedSections.add(i);
            const isActive = i === active;
            const Icon =
              item.kind === "route"
                ? item.icon
                : item.kind === "action"
                  ? item.icon
                  : MapTrifold;
            const tag =
              item.kind === "route" ? "Side" : item.kind === "action" ? "Handling" : "Sted";

            const isRecent = !query.trim() && sectionLabel === "Sidst besøgt";

            return (
              <div key={`${item.kind}-${item.id}`}>
                {showSection ? (
                  <div className="flex items-center gap-1.5 px-4 pb-1 pt-2 text-2xs font-bold uppercase tracking-[0.12em] text-subtle">
                    {sectionLabel === "Sidst besøgt" ? (
                      <ClockCounterClockwise size={11} weight="fill" aria-hidden="true" />
                    ) : sectionLabel === "Hurtige handlinger" ? (
                      <Lightning size={11} weight="fill" aria-hidden="true" />
                    ) : null}
                    {sectionLabel}
                  </div>
                ) : null}
                <li role="option" aria-selected={isActive}>
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      commit(item);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                      isActive ? "bg-mint-50 text-ink" : "text-ink hover:bg-sunken"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                        isActive
                          ? "bg-mint-50 text-mint-ink"
                          : isRecent
                            ? "bg-sunken text-muted"
                            : item.kind === "action"
                              ? "bg-peach-50 text-peach-ink"
                              : "bg-sunken text-muted"
                      )}
                    >
                      <Icon size={15} weight="bold" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{item.label}</span>
                      <span className="block truncate text-xs text-muted">
                        {item.description}
                      </span>
                    </span>
                    {item.kind !== "venue" && item.shortcut ? (
                      <kbd className="rounded bg-sunken px-1.5 py-0.5 text-2xs font-bold text-muted ring-1 ring-hairline">
                        {item.shortcut}
                      </kbd>
                    ) : null}
                    <span className="text-2xs font-semibold uppercase tracking-wide text-subtle">
                      {tag}
                    </span>
                  </Link>
                </li>
              </div>
            );
          })}
        </ul>
        <div className="flex items-center justify-between gap-3 border-t border-hairline bg-canvas px-4 py-2 text-2xs text-muted">
          <span className="flex items-center gap-2">
            <kbd className="rounded bg-sunken px-1.5 py-0.5 font-bold ring-1 ring-hairline">↑↓</kbd>
            naviger
            <kbd className="rounded bg-sunken px-1.5 py-0.5 font-bold ring-1 ring-hairline">↵</kbd>
            vælg
            <kbd className="rounded bg-sunken px-1.5 py-0.5 font-bold ring-1 ring-hairline">⌘1–9</kbd>
            spring
          </span>
          <span>Lille Liv</span>
        </div>
      </div>
    </div>
  );
}
