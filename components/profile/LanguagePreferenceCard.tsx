"use client";

import { Translate } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export function LanguagePreferenceCard() {
  const t = useTranslations("language");
  return (
    <section className="rounded-card bg-surface p-5 ring-1 ring-hairline">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid h-9 w-9 place-items-center rounded-lg bg-sage-100 text-sage-700"
        >
          <Translate size={18} weight="duotone" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold text-ink">{t("title")}</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">{t("description")}</p>
          <div className="mt-3">
            <LanguageSwitcher variant="full" />
          </div>
          <p className="mt-2 text-2xs text-subtle">{t("syncNote")}</p>
        </div>
      </div>
    </section>
  );
}
