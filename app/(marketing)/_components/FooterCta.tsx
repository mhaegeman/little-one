import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function FooterCta() {
  const t = useTranslations("marketing.footerCta");
  return (
    <section className="px-5 py-20 md:px-10 md:py-24">
      <div className="relative mx-auto max-w-[1080px] overflow-hidden rounded-2xl bg-peach-50 px-7 py-14 ring-1 ring-peach-100 md:px-14 md:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-peach-200/60 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-butter-200/50 blur-3xl"
        />
        <div className="relative max-w-[680px]">
          <Eyebrow tone="peach">{t("eyebrow")}</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-display text-peach-ink md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-[480px] text-lg leading-relaxed text-peach-ink/85">
            {t("body")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/auth"
              className={buttonClass({ variant: "primary", size: "xl" })}
            >
              <span>{t("ctaPrimary")}</span>
              <ArrowRight size={18} weight="bold" />
            </Link>
            <Link
              href="/auth"
              className={buttonClass({ variant: "ghost", size: "xl" })}
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
