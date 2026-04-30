import { ArrowRight, Play } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { Button, buttonClass } from "@/components/ui/Button";
import { EyebrowBadge } from "@/components/ui/Eyebrow";
import { BrandReel } from "./BrandReel";

export function Hero() {
  const t = useTranslations("marketing.hero");
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-peach-100 opacity-70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-12 top-44 h-[260px] w-[260px] rounded-full bg-mint-100 opacity-60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-32 h-[340px] w-[340px] rounded-full bg-butter-100 opacity-60 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-[1240px] gap-12 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:py-28">
        <div className="relative">
          <EyebrowBadge tone="mint" pulse>
            {t("eyebrow")}
          </EyebrowBadge>
          <h1 className="mt-6 font-display font-medium tracking-display text-ink">
            <span className="block text-[2.75rem] leading-[1.02] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
              {t("headlineLine1")}
            </span>
            <span className="block italic text-peach-ink text-[2.75rem] leading-[1.02] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
              {t("headlineLine2")}
            </span>
            <span className="block text-[2.75rem] leading-[1.02] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
              {t("headlineLine3")}
            </span>
          </h1>
          <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-muted">
            {t("lede")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/auth?mode=signup&next=/journal"
              className={buttonClass({ variant: "primary", size: "xl" })}
            >
              <span>{t("ctaPrimary")}</span>
              <ArrowRight size={18} weight="bold" />
            </Link>
            <Button variant="ghost" size="xl">
              <Play size={14} weight="fill" />
              <span>{t("ctaSecondary")}</span>
            </Button>
          </div>
          <div className="mt-7 flex items-center gap-4 text-sm text-subtle">
            <AvatarStack>
              <Avatar tone="peach" size="sm" ring>
                MK
              </Avatar>
              <Avatar tone="butter" size="sm" ring>
                SO
              </Avatar>
              <Avatar tone="mint" size="sm" ring>
                AN
              </Avatar>
              <Avatar tone="sky" size="sm" ring>
                BI
              </Avatar>
            </AvatarStack>
            <span>{t("socialProof")}</span>
          </div>
        </div>

        <BrandReel />
      </div>
    </section>
  );
}
