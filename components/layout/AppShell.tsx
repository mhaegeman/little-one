"use client";

import {
  Compass,
  MagnifyingGlass,
  NotePencil,
  UserCircle
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { Toaster } from "@/components/ui/Toaster";
import { useViewTransitionRouter } from "@/hooks/useViewTransitionRouter";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", key: "discover", icon: Compass },
  { href: "/journal", key: "journal", icon: NotePencil },
  { href: "/profile", key: "profile", icon: UserCircle }
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tApp = useTranslations("app");
  const transitionTo = useViewTransitionRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Toaster>
      <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      <a href="#main" className="skip-link">
        Spring til indhold
      </a>

      {/* Desktop sidebar */}
      <aside
        className="sticky top-0 hidden h-screen border-r border-hairline bg-canvas/85 px-4 py-5 backdrop-blur lg:flex lg:flex-col"
        aria-label="Hovednavigation"
      >
        <Link
          href="/"
          className="focus-ring mb-2 flex items-center gap-2.5 rounded-lg px-1.5 py-1"
          aria-label={tApp("name")}
        >
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-xl bg-sage-500 text-white shadow-sm"
          >
            <span className="font-display text-lg font-semibold leading-none">LL</span>
          </span>
          <span className="min-w-0">
            <span className="block font-display text-base font-semibold leading-tight text-ink">
              {tApp("name")}
            </span>
            <span className="block text-2xs font-semibold uppercase tracking-[0.16em] text-subtle">
              København
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="focus-ring mt-3 flex h-9 items-center gap-2 rounded-lg bg-sunken px-2.5 text-xs text-muted ring-1 ring-hairline transition-colors hover:bg-sand-100 hover:text-ink"
          aria-label="Søg (cmd+k)"
        >
          <MagnifyingGlass size={14} weight="bold" aria-hidden="true" />
          <span className="flex-1 text-left">{t("search")}</span>
          <kbd className="rounded bg-surface px-1.5 py-0.5 text-2xs font-bold text-muted ring-1 ring-hairline">
            ⌘K
          </kbd>
        </button>

        <nav className="mt-5 flex flex-col gap-0.5" aria-label="Sektioner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={(event) => {
                  if (
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey ||
                    event.button !== 0
                  ) {
                    return;
                  }
                  if (active) return;
                  event.preventDefault();
                  transitionTo(item.href);
                }}
                className={cn(
                  "focus-ring relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-semibold transition-colors duration-150 ease-nordic",
                  active ? "text-sage-700" : "text-muted hover:bg-sunken hover:text-ink"
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-lg bg-sage-100"
                    style={{ viewTransitionName: "nav-active-desktop" }}
                  />
                ) : null}
                <Icon size={17} weight={active ? "fill" : "regular"} aria-hidden="true" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-3">
          <p className="px-2 text-2xs leading-snug text-subtle">
            {tApp("tagline")}
          </p>
        </div>
      </aside>

      <main id="main" className="min-w-0 pb-20 lg:pb-10">
        {children}
      </main>

      {/* Mobile top bar */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-hairline bg-canvas/90 px-4 backdrop-blur lg:hidden">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-lg px-1 py-1" aria-label={tApp("name")}>
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-lg bg-sage-500 text-white"
          >
            <span className="font-display text-sm font-semibold">LL</span>
          </span>
          <span className="font-display text-base font-semibold">{tApp("name")}</span>
        </Link>
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-label={t("search")}
          className="focus-ring grid h-9 w-9 place-items-center rounded-lg bg-sunken text-muted ring-1 ring-hairline"
        >
          <MagnifyingGlass size={16} weight="bold" aria-hidden="true" />
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Hovednavigation"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-hairline bg-canvas/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 backdrop-blur lg:hidden"
      >
        <div className="relative grid grid-cols-3 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={(event) => {
                  if (
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey ||
                    event.button !== 0
                  ) {
                    return;
                  }
                  if (active) return;
                  event.preventDefault();
                  transitionTo(item.href);
                }}
                className={cn(
                  "focus-ring relative flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-2xs font-semibold transition-colors duration-150 ease-nordic",
                  active ? "text-sage-700" : "text-subtle hover:text-ink"
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-lg bg-sage-50"
                    style={{ viewTransitionName: "nav-active-mobile" }}
                  />
                ) : null}
                <Icon size={20} weight={active ? "fill" : "regular"} aria-hidden="true" />
                {t(item.key)}
              </Link>
            );
          })}
        </div>
      </nav>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </div>
    </Toaster>
  );
}
