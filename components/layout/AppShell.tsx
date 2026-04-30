"use client";

import {
  Compass,
  NotePencil,
  UserCircle,
  UsersThree
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Toaster } from "@/components/ui/Toaster";
import type { CurrentUser } from "@/lib/auth/currentUser";
import { useViewTransitionRouter } from "@/hooks/useViewTransitionRouter";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/discover", key: "discover", icon: Compass },
  { href: "/journal", key: "journal", icon: NotePencil },
  { href: "/families", key: "families", icon: UsersThree },
  { href: "/profile", key: "profile", icon: UserCircle }
] as const;

export function AppShell({
  user,
  children
}: {
  user: CurrentUser | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");
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
      <SiteHeader
        mode="app"
        user={user}
        onSearchClick={() => setPaletteOpen(true)}
      />
      <main id="main" className="min-w-0 pb-20 md:pb-10">
        {children}
      </main>

      <nav
        aria-label="Hovednavigation"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-hairline bg-canvas/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 backdrop-blur md:hidden"
      >
        <div className="relative grid grid-cols-4 gap-1">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
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
                  active ? "text-mint-ink" : "text-subtle hover:text-ink"
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-lg bg-mint-50"
                    style={{ viewTransitionName: "nav-active-mobile" }}
                  />
                ) : null}
                <Icon
                  size={20}
                  weight={active ? "fill" : "regular"}
                  aria-hidden="true"
                />
                {t(item.key)}
              </Link>
            );
          })}
        </div>
      </nav>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </Toaster>
  );
}
