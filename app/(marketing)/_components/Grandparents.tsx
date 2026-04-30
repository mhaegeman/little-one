import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Grandparents() {
  const t = useTranslations("marketing.grandparents");
  return (
    <section
      id="grandparents"
      className="bg-canvas px-5 py-20 md:px-10 md:py-28 lg:py-32"
    >
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="relative order-2 lg:order-1">
          <div className="relative aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded-2xl bg-sunken ring-1 ring-hairline">
            <Image
              src="/photography/grandparents-baby-smile.webp"
              alt={t("portraitImageAlt")}
              fill
              sizes="(min-width: 1024px) 460px, (min-width: 768px) 50vw, 90vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/30 to-transparent"
            />
            <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-pill bg-surface/95 px-3 py-1.5 text-xs font-semibold text-ink ring-1 ring-hairline backdrop-blur-sm">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-peach-300"
              />
              {t("portraitCaption")}
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <Eyebrow tone="peach">{t("eyebrow")}</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-display text-ink md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-[520px] text-lg leading-relaxed text-muted">
            {t("body")}
          </p>
          <ul className="mt-7 grid gap-3 text-base text-ink">
            {(["bullet1", "bullet2", "bullet3"] as const).map((key) => (
              <li key={key} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-peach-100 text-peach-ink">
                  <Check size={14} weight="bold" />
                </span>
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              href="/auth?mode=signup&next=/families"
              className={buttonClass({ variant: "accent", size: "lg" })}
            >
              <span>{t("cta")}</span>
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
