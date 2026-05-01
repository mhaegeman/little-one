import { useTranslations } from "next-intl";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { Logo } from "./Logo";

type LinkKey = "discover" | "journal" | "families" | "contact";

const columns: {
  titleKey: "columnProduct" | "columnCompany";
  links: { key: LinkKey; href: string }[];
}[] = [
  {
    titleKey: "columnProduct",
    links: [
      { key: "discover", href: "/discover" },
      { key: "journal", href: "/journal" },
      { key: "families", href: "/families" }
    ]
  },
  {
    titleKey: "columnCompany",
    links: [{ key: "contact", href: "mailto:hej@lilleliv.dk" }]
  }
];

export function MarketingFooter() {
  const t = useTranslations("marketing.footer");
  return (
    <footer className="bg-ink px-5 py-14 text-canvas md:px-10 md:py-16">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo tone="canvas" />
            <p className="mt-4 max-w-[320px] text-sm leading-relaxed text-canvas/70">
              {t("tagline")}
            </p>
            <div className="mt-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-canvas/55">
                {t("languageLabel")}
              </div>
              <div className="mt-2">
                <LanguageSwitcher variant="compact" />
              </div>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.titleKey}>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-canvas/55">
                {t(col.titleKey)}
              </div>
              <ul className="mt-4 grid gap-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="focus-ring rounded-md text-canvas/85 hover:text-canvas"
                    >
                      {t(`links.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/12 pt-6 text-xs text-canvas/55 md:flex-row md:items-center md:justify-between">
          <span>{t("copyright")}</span>
          <span>{t("madeWith")}</span>
        </div>
      </div>
    </footer>
  );
}
