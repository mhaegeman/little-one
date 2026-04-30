"use client";

import {
  CaretDown,
  Compass,
  List,
  MagnifyingGlass,
  NotePencil,
  Plus,
  SignOut,
  UserCircle,
  UsersThree,
  X
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Logo } from "@/app/(marketing)/_components/Logo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClass } from "@/components/ui/Button";
import { useViewTransitionRouter } from "@/hooks/useViewTransitionRouter";
import type { CurrentUser } from "@/lib/auth/currentUser";
import { createClient as createBrowserClient } from "@/lib/db/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "marketing" | "app";

const NAV_ITEMS = [
  { href: "/discover", key: "discover", icon: Compass },
  { href: "/journal", key: "journal", icon: NotePencil },
  { href: "/families", key: "families", icon: UsersThree }
] as const;

function initialsFor(user: CurrentUser): string {
  const source = user.familyName ?? user.displayName ?? user.email ?? "";
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function SiteHeader({
  mode,
  user,
  onSearchClick
}: {
  mode: Mode;
  user: CurrentUser | null;
  onSearchClick?: () => void;
}) {
  const t = useTranslations("nav");
  const tApp = useTranslations("app");
  const pathname = usePathname();
  const router = useRouter();
  const transitionTo = useViewTransitionRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!userOpen) return;
    function onPointer(e: MouseEvent) {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setUserOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [userOpen]);

  async function handleSignOut() {
    setUserOpen(false);
    const supabase = createBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.refresh();
    router.push("/");
  }

  const homeHref = mode === "app" || user ? "/discover" : "/";
  const familyLabel = user?.familyName ?? user?.displayName ?? t("myFamily");

  return (
    <>
      <a href="#main" className="skip-link">
        {t("skipToContent")}
      </a>
      <header
        className={cn(
          "sticky top-0 z-30 border-b border-hairline/70",
          "bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70"
        )}
      >
        <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-3 px-4 md:h-16 md:px-8">
          <Link
            href={homeHref}
            aria-label={tApp("name")}
            className="focus-ring flex shrink-0 items-center rounded-md"
          >
            <Logo />
          </Link>

          <nav
            aria-label="Primary"
            className="ml-4 hidden items-center gap-1 md:flex"
          >
            {NAV_ITEMS.map((item) => {
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
                    "focus-ring relative flex h-9 items-center gap-2 rounded-pill px-3 text-sm font-semibold transition-colors duration-150 ease-nordic",
                    active
                      ? "text-mint-ink"
                      : "text-muted hover:bg-sunken hover:text-ink"
                  )}
                >
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-pill bg-mint-50"
                      style={{ viewTransitionName: "nav-active-header" }}
                    />
                  ) : null}
                  <Icon
                    size={16}
                    weight={active ? "fill" : "regular"}
                    aria-hidden="true"
                  />
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {mode === "app" && onSearchClick ? (
              <button
                type="button"
                onClick={onSearchClick}
                aria-label={t("search")}
                className="focus-ring hidden h-9 items-center gap-2 rounded-pill bg-sunken px-3 text-xs font-medium text-muted ring-1 ring-hairline transition-colors hover:bg-canvas hover:text-ink md:flex"
              >
                <MagnifyingGlass size={14} weight="bold" aria-hidden="true" />
                <span>{t("search")}</span>
                <kbd className="rounded bg-surface px-1.5 py-0.5 text-2xs font-bold text-muted ring-1 ring-hairline">
                  ⌘K
                </kbd>
              </button>
            ) : null}

            {mode === "app" && onSearchClick ? (
              <button
                type="button"
                onClick={onSearchClick}
                aria-label={t("search")}
                className="focus-ring grid h-9 w-9 place-items-center rounded-pill bg-sunken text-muted ring-1 ring-hairline transition-colors hover:bg-canvas hover:text-ink md:hidden"
              >
                <MagnifyingGlass size={16} weight="bold" aria-hidden="true" />
              </button>
            ) : null}

            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {!user ? (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/auth"
                  className={buttonClass({ variant: "ghost", size: "sm" })}
                >
                  {t("signIn")}
                </Link>
                <Link
                  href="/auth?mode=signup&next=/journal"
                  className={buttonClass({ variant: "primary", size: "sm" })}
                >
                  {t("signUp")}
                </Link>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                {mode === "marketing" ? (
                  <Link
                    href="/discover"
                    className={buttonClass({ variant: "primary", size: "sm" })}
                  >
                    {t("goToApp")}
                  </Link>
                ) : (
                  <Link
                    href="/journal?new=activity"
                    className={buttonClass({ variant: "accent", size: "sm" })}
                  >
                    <Plus size={14} weight="bold" aria-hidden="true" />
                    {t("quickLog")}
                  </Link>
                )}

                <div ref={userMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setUserOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={userOpen}
                    aria-label={t("userMenu")}
                    className="focus-ring flex h-9 items-center gap-2 rounded-pill bg-surface pl-1 pr-2.5 ring-1 ring-hairline transition-colors hover:bg-sunken"
                  >
                    <Avatar
                      size="xs"
                      tone="mint"
                      src={user.avatarUrl ?? undefined}
                      alt={familyLabel}
                      initials={initialsFor(user)}
                    />
                    <span className="max-w-[140px] truncate text-xs font-semibold text-ink">
                      {familyLabel}
                    </span>
                    <CaretDown size={12} weight="bold" aria-hidden="true" />
                  </button>
                  {userOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-64 overflow-hidden rounded-md border border-hairline bg-surface shadow-lift"
                    >
                      <div className="border-b border-hairline/70 bg-sunken px-3 py-3">
                        <div className="font-display text-sm font-semibold text-ink">
                          {familyLabel}
                        </div>
                        {user.email ? (
                          <div className="mt-0.5 truncate text-2xs text-muted">
                            {user.email}
                          </div>
                        ) : null}
                      </div>
                      <Link
                        href="/profile"
                        role="menuitem"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink transition-colors hover:bg-sunken"
                      >
                        <UserCircle
                          size={16}
                          weight="regular"
                          aria-hidden="true"
                        />
                        {t("myAccount")}
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 border-t border-hairline/70 px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-sunken"
                      >
                        <SignOut
                          size={16}
                          weight="regular"
                          aria-hidden="true"
                        />
                        {t("signOut")}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Mobile-only: avatar (logged in) or login link (logged out) */}
            {user ? (
              <Link
                href="/profile"
                aria-label={t("myAccount")}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-pill md:hidden"
              >
                <Avatar
                  size="xs"
                  tone="mint"
                  src={user.avatarUrl ?? undefined}
                  alt={familyLabel}
                  initials={initialsFor(user)}
                />
              </Link>
            ) : (
              <Link
                href="/auth"
                className={buttonClass({
                  variant: "primary",
                  size: "sm",
                  className: "md:hidden"
                })}
              >
                {t("signIn")}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={menuOpen}
              className="focus-ring grid h-9 w-9 place-items-center rounded-pill text-ink md:hidden"
            >
              {menuOpen ? <X size={20} /> : <List size={20} />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-hairline bg-canvas md:hidden">
            <nav
              aria-label="Mobile"
              className="mx-auto flex max-w-[1240px] flex-col gap-1 px-4 py-3"
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "focus-ring flex items-center gap-2.5 rounded-md px-3 py-2.5 text-base font-semibold",
                      active
                        ? "bg-mint-50 text-mint-ink"
                        : "text-ink hover:bg-sunken"
                    )}
                  >
                    <Icon
                      size={18}
                      weight={active ? "fill" : "regular"}
                      aria-hidden="true"
                    />
                    {t(item.key)}
                  </Link>
                );
              })}

              <div className="mt-2 flex items-center justify-between gap-2 border-t border-hairline/70 pt-3">
                <LanguageSwitcher />
                {user && mode === "app" ? (
                  <Link
                    href="/journal?new=activity"
                    onClick={() => setMenuOpen(false)}
                    className={buttonClass({ variant: "accent", size: "sm" })}
                  >
                    <Plus size={14} weight="bold" aria-hidden="true" />
                    {t("quickLog")}
                  </Link>
                ) : null}
                {user && mode === "marketing" ? (
                  <Link
                    href="/discover"
                    onClick={() => setMenuOpen(false)}
                    className={buttonClass({ variant: "primary", size: "sm" })}
                  >
                    {t("goToApp")}
                  </Link>
                ) : null}
              </div>

              {!user ? (
                <div className="mt-2 flex items-center gap-2">
                  <Link
                    href="/auth"
                    onClick={() => setMenuOpen(false)}
                    className={buttonClass({
                      variant: "ghost",
                      size: "md",
                      className: "flex-1"
                    })}
                  >
                    {t("signIn")}
                  </Link>
                  <Link
                    href="/auth?mode=signup&next=/journal"
                    onClick={() => setMenuOpen(false)}
                    className={buttonClass({
                      variant: "primary",
                      size: "md",
                      className: "flex-1"
                    })}
                  >
                    {t("signUp")}
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleSignOut();
                  }}
                  className="mt-2 flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-ink hover:bg-sunken"
                >
                  <SignOut size={16} weight="regular" aria-hidden="true" />
                  {t("signOut")}
                </button>
              )}
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}
