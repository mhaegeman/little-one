import { Heart, MagnifyingGlass, Sun } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";

export function PhonePreview() {
  const t = useTranslations("marketing.hero");
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto h-[640px] w-[320px] rounded-[48px] bg-ink p-2.5 shadow-[0_30px_60px_rgba(31,28,22,0.18),0_6px_12px_rgba(31,28,22,0.08)]"
    >
      <div className="relative h-full w-full overflow-hidden rounded-[40px] bg-canvas">
        <div className="absolute left-1/2 top-2.5 z-10 h-6 w-24 -translate-x-1/2 rounded-pill bg-ink" />
        <div className="flex h-full flex-col gap-3 px-4 pb-5 pt-11">
          <div className="flex items-center justify-between">
            <div>
              <Eyebrow>{t("phoneEyebrow")}</Eyebrow>
              <div className="mt-0.5 font-display text-2xl tracking-display">
                {t("phoneGreeting")}
              </div>
            </div>
            <div className="h-9 w-9 rounded-pill bg-peach-200" />
          </div>

          <div className="flex items-center gap-2 rounded-pill bg-surface px-4 py-3 text-sm text-subtle ring-1 ring-hairline">
            <MagnifyingGlass size={14} weight="bold" />
            <span className="truncate">{t("phoneSearch")}</span>
          </div>

          <div className="flex gap-1.5 overflow-hidden">
            <Pill tone="mint" size="sm" selected>
              Legeplads
            </Pill>
            <Pill tone="sunken" size="sm">
              Cafe
            </Pill>
            <Pill tone="sunken" size="sm">
              Bibliotek
            </Pill>
          </div>

          <div className="rounded-lg bg-peach-50 p-3.5 ring-1 ring-peach-100">
            <div className="flex items-start justify-between">
              <div>
                <Eyebrow tone="peach">{t("phoneToday")}</Eyebrow>
                <div className="mt-1 font-display text-lg leading-tight text-peach-ink">
                  Sol &amp; vind
                </div>
              </div>
              <Sun size={28} weight="fill" className="text-peach-300" />
            </div>
            <div className="mt-2 text-xs text-peach-ink/85">
              {t("phoneTodaySub")}
            </div>
          </div>

          <div className="flex gap-3 rounded-lg bg-surface p-3 ring-1 ring-hairline">
            <div className="h-[70px] w-[70px] shrink-0 rounded-md bg-mint-100" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink">
                {t("phoneVenue1Title")}
              </div>
              <div className="mt-0.5 text-xs text-subtle">
                {t("phoneVenue1Sub")}
              </div>
              <div className="mt-2 flex gap-1">
                <Pill tone="sunken" size="sm">
                  0–3 år
                </Pill>
                <Pill tone="sky" size="sm">
                  Inde
                </Pill>
              </div>
            </div>
            <Heart
              size={18}
              weight="fill"
              className="shrink-0 text-peach-300"
            />
          </div>

          <div className="flex gap-3 rounded-lg bg-surface p-3 ring-1 ring-hairline">
            <div className="h-[70px] w-[70px] shrink-0 rounded-md bg-butter-100" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink">
                {t("phoneVenue2Title")}
              </div>
              <div className="mt-0.5 text-xs text-subtle">
                {t("phoneVenue2Sub")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
