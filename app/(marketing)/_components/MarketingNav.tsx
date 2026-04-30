"use client";

import { List, X } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

export function MarketingNav() {
  const t = useTranslations("marketing.nav");
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#pillars", label: t("findPlaces") },
    { href: "#preview", label: t("journal") },
    { href: "#grandparents", label: t("families") },
    { href: "#faq", label: t("about") }
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-hairline/70",
        "bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 md:px-10">
        <Link href="/" aria-label="Lille Liv" className="focus-ring rounded-md">
          <Logo />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-7 text-sm font-medium text-muted md:flex"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="focus-ring rounded-md transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/auth"
            className={buttonClass({ variant: "ghost", size: "sm" })}
          >
            {t("login")}
          </Link>
          <Link
            href="/auth"
            className={buttonClass({ variant: "primary", size: "sm" })}
          >
            {t("createFamily")}
          </Link>
        </div>

        <button
          type="button"
          className="focus-ring grid h-10 w-10 place-items-center rounded-md text-ink md:hidden"
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-hairline bg-canvas md:hidden">
          <nav
            aria-label="Mobile"
            className="mx-auto flex max-w-[1240px] flex-col gap-1 px-5 py-4"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="focus-ring rounded-md px-2 py-2.5 text-base font-medium text-ink hover:bg-sunken"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-2">
              <Link
                href="/auth"
                className={buttonClass({
                  variant: "ghost",
                  size: "md",
                  className: "flex-1"
                })}
              >
                {t("login")}
              </Link>
              <Link
                href="/auth"
                className={buttonClass({
                  variant: "primary",
                  size: "md",
                  className: "flex-1"
                })}
              >
                {t("createFamily")}
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
