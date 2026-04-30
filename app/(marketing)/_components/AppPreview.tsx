import { Heart, MapPin } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/Avatar";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function AppPreview() {
  const t = useTranslations("marketing.appPreview");
  return (
    <section
      id="preview"
      className="relative overflow-hidden bg-sunken px-5 py-20 md:px-10 md:py-28 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-12 h-[320px] w-[320px] rounded-full bg-peach-100 opacity-50 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-display text-ink md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-[460px] text-lg leading-relaxed text-muted">
            {t("body")}
          </p>
        </div>

        <div className="relative">
          <div className="rounded-2xl bg-surface p-6 shadow-lift ring-1 ring-hairline md:p-8">
            <header className="flex items-center gap-3">
              <Avatar tone="peach" size="md">
                A
              </Avatar>
              <div>
                <div className="font-display text-lg font-medium tracking-display text-ink">
                  {t("timelineHeader")}
                </div>
                <div className="text-xs text-subtle">2 år · Nørrebro</div>
              </div>
            </header>

            <div className="relative mt-6 pl-6">
              <span
                aria-hidden="true"
                className="absolute left-[5px] top-2 bottom-2 w-px bg-hairline"
              />

              <div className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-6 top-2 h-3 w-3 rounded-full bg-peach-300 ring-4 ring-canvas"
                />
                <Eyebrow tone="peach">{t("timelineToday")}</Eyebrow>
                <div className="mt-2 overflow-hidden rounded-xl ring-1 ring-hairline">
                  <div className="aspect-[4/3] bg-gradient-to-br from-peach-100 via-butter-100 to-mint-100" />
                  <div className="bg-surface p-4">
                    <div className="flex items-center gap-1.5 text-xs text-subtle">
                      <MapPin size={12} weight="fill" />
                      Fælledparken
                    </div>
                    <div className="mt-1.5 font-display text-lg font-medium tracking-display text-ink">
                      {t("moment1Title")}
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {t("moment1Caption")}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-pill bg-peach-50 px-2 py-1 text-xs font-semibold text-peach-ink ring-1 ring-peach-100">
                        <Heart size={11} weight="fill" /> 3
                      </span>
                      <div className="flex -space-x-1.5">
                        <Avatar tone="mint" size="xs" ring>
                          M
                        </Avatar>
                        <Avatar tone="butter" size="xs" ring>
                          B
                        </Avatar>
                        <Avatar tone="sky" size="xs" ring>
                          F
                        </Avatar>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-6">
                <span
                  aria-hidden="true"
                  className="absolute -left-6 top-2 h-3 w-3 rounded-full bg-border"
                />
                <Eyebrow>{t("timelineYesterday")}</Eyebrow>
                <div className="mt-2 rounded-xl bg-surface p-4 ring-1 ring-hairline">
                  <div className="font-display text-lg font-medium tracking-display text-ink">
                    {t("moment2Title")}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {t("moment2Caption")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="absolute -bottom-6 left-6 hidden w-[280px] gap-3 rounded-2xl bg-surface p-4 shadow-lift ring-1 ring-hairline md:flex"
          >
            <Avatar tone="peach" size="md">
              M
            </Avatar>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
                Lille Liv · {t("reactionTime")}
              </div>
              <div className="mt-1 text-sm leading-snug text-ink">
                <span className="font-semibold">{t("reactionTitle")}</span>{" "}
                {t("reactionBody")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
