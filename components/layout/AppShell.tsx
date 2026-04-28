"use client";

import { Baby, Compass, NotebookTabs, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Opdag", icon: Compass },
  { href: "/journal", label: "Journal", icon: NotebookTabs },
  { href: "/profile", label: "Profil", icon: UserRound }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-oat/80 bg-linen/88 px-5 py-6 backdrop-blur lg:block">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-moss text-white">
            <Baby size={22} aria-hidden="true" />
          </span>
          <span>
            <span className="block font-display text-2xl font-semibold">Lille Liv</span>
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-mossDark/70">
              København
            </span>
          </span>
        </Link>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "focus-ring flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  active ? "bg-white text-mossDark shadow-soft" : "text-ink/70 hover:bg-white/60"
                )}
              >
                <Icon size={19} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 pb-24 lg:pb-0">{children}</main>

      <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-oat/80 bg-linen/95 px-4 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-moss text-white">
            <Baby size={20} aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-semibold">Lille Liv</span>
        </Link>
        <Link
          href="/profile"
          className="focus-ring grid h-10 w-10 place-items-center rounded-xl bg-white text-ink ring-1 ring-oat"
          aria-label="Profil"
        >
          <UserRound size={19} aria-hidden="true" />
        </Link>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-oat bg-[#FFFDF8]/95 px-3 pb-3 pt-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-3 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "focus-ring flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold transition",
                  active ? "bg-moss text-white" : "text-ink/70 hover:bg-linen"
                )}
              >
                <Icon size={19} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
