"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/app/actions/locale";
import { cn } from "@/lib/utils";

const LANGS = [
  { value: "da", label: "DA", a11y: "Dansk" },
  { value: "en", label: "EN", a11y: "English" }
] as const;

type Variant = "compact" | "full";

export function LanguageSwitcher({
  variant = "compact",
  className
}: {
  variant?: Variant;
  className?: string;
}) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(next: string) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  if (variant === "full") {
    return (
      <div
        role="radiogroup"
        aria-label="Language"
        className={cn(
          "inline-grid grid-cols-2 gap-2 rounded-lg bg-sunken p-1 ring-1 ring-hairline",
          className
        )}
      >
        {LANGS.map((lang) => {
          const active = locale === lang.value;
          return (
            <button
              key={lang.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={pending}
              onClick={() => handleChange(lang.value)}
              className={cn(
                "focus-ring rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-surface text-ink shadow-soft ring-1 ring-hairline"
                  : "text-muted hover:text-ink"
              )}
            >
              <span className="block font-display text-base">{lang.a11y}</span>
              <span className="text-2xs uppercase tracking-[0.16em]">
                {lang.value}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className={cn(
        "inline-flex rounded-pill bg-sunken p-0.5 ring-1 ring-hairline",
        pending && "opacity-60",
        className
      )}
    >
      {LANGS.map((lang) => {
        const active = locale === lang.value;
        return (
          <button
            key={lang.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={lang.a11y}
            disabled={pending}
            onClick={() => handleChange(lang.value)}
            className={cn(
              "focus-ring rounded-pill px-2.5 py-1 text-2xs font-bold uppercase tracking-[0.12em] transition-colors",
              active
                ? "bg-surface text-ink shadow-soft"
                : "text-muted hover:text-ink"
            )}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
