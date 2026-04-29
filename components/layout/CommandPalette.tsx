"use client";

import {
  Compass,
  MagnifyingGlass,
  MapTrifold,
  NotePencil,
  Sparkle,
  UserCircle
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { categoryLabels } from "@/lib/data/taxonomy";
import { venues } from "@/lib/data/venues";
import { cn } from "@/lib/utils";

type Item =
  | { kind: "route"; id: string; label: string; description: string; href: string; icon: typeof Compass }
  | { kind: "venue"; id: string; label: string; description: string; href: string };

const routes: Extract<Item, { kind: "route" }>[] = [
  {
    kind: "route",
    id: "discover",
    label: "Opdag",
    description: "Find steder og oplevelser",
    href: "/",
    icon: Compass
  },
  {
    kind: "route",
    id: "journal",
    label: "Journal",
    description: "Milepæle og hverdagsglimt",
    href: "/journal",
    icon: NotePencil
  },
  {
    kind: "route",
    id: "profile",
    label: "Profil",
    description: "Familie, indstillinger og konto",
    href: "/profile",
    icon: UserCircle
  }
];

export function CommandPalette({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const venueResults: Item[] = venues
      .filter((v) =>
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
        description: `${categoryLabels[v.category]} · ${v.neighbourhood}`,
        href: `/venues/${v.id}`
      }));

    const routeResults: Item[] = routes.filter((r) =>
      !q || r.label.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );

    return q ? [...routeResults, ...venueResults] : [...routes, ...venueResults];
  }, [query]);

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
          router.push(item.href);
          onClose();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, active, router, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true">
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
            placeholder="Søg steder, sider eller bydele…"
            className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-subtle"
            aria-label="Søg"
          />
          <kbd className="rounded-md bg-sunken px-1.5 py-0.5 text-2xs font-bold text-muted ring-1 ring-hairline">
            ESC
          </kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto py-2 thin-scroll" role="listbox">
          {items.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-muted">
              Ingen resultater for &ldquo;{query}&rdquo;
            </li>
          ) : null}
          {items.map((item, i) => {
            const isActive = i === active;
            const Icon = item.kind === "route" ? item.icon : item.kind === "venue" ? MapTrifold : Sparkle;
            return (
              <li key={`${item.kind}-${item.id}`} role="option" aria-selected={isActive}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                    isActive ? "bg-sage-50 text-ink" : "text-ink hover:bg-sunken"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                      isActive ? "bg-sage-100 text-sage-700" : "bg-sunken text-muted"
                    )}
                  >
                    <Icon size={16} weight="bold" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{item.label}</span>
                    <span className="block truncate text-xs text-muted">{item.description}</span>
                  </span>
                  <span className="text-2xs font-semibold uppercase tracking-wide text-subtle">
                    {item.kind === "route" ? "Side" : "Sted"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between gap-3 border-t border-hairline bg-canvas px-4 py-2 text-2xs text-muted">
          <span className="flex items-center gap-2">
            <kbd className="rounded bg-sunken px-1.5 py-0.5 font-bold ring-1 ring-hairline">↑↓</kbd>
            naviger
            <kbd className="rounded bg-sunken px-1.5 py-0.5 font-bold ring-1 ring-hairline">↵</kbd>
            vælg
          </span>
          <span>Lille Liv</span>
        </div>
      </div>
    </div>
  );
}
