import {
  Check,
  Compass,
  NotePencil,
  UsersThree
} from "@phosphor-icons/react/dist/ssr";
import type { Icon as IconType } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Tone = "mint" | "peach" | "butter";

const items: {
  key: "discover" | "journal" | "share";
  tone: Tone;
  Icon: IconType;
}[] = [
  { key: "discover", tone: "mint", Icon: Compass },
  { key: "journal", tone: "peach", Icon: NotePencil },
  { key: "share", tone: "butter", Icon: UsersThree }
];

const toneStyles: Record<
  Tone,
  { card: string; iconBg: string; iconText: string; ink: string }
> = {
  mint: {
    card: "bg-mint-50 ring-mint-100",
    iconBg: "bg-mint-200",
    iconText: "text-mint-ink",
    ink: "text-mint-ink"
  },
  peach: {
    card: "bg-peach-50 ring-peach-100",
    iconBg: "bg-peach-200",
    iconText: "text-peach-ink",
    ink: "text-peach-ink"
  },
  butter: {
    card: "bg-butter-50 ring-butter-100",
    iconBg: "bg-butter-200",
    iconText: "text-butter-ink",
    ink: "text-butter-ink"
  }
};

export function Pillars() {
  const t = useTranslations("marketing.pillars");
  return (
    <section
      id="pillars"
      className="bg-canvas px-5 py-20 md:px-10 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-display text-ink md:text-5xl">
            {t("title")}{" "}
            <span className="italic text-mint-ink">{t("titleItalic")}</span>.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3">
          {items.map(({ key, tone, Icon }) => {
            const styles = toneStyles[tone];
            return (
              <article
                key={key}
                className={`flex min-h-[320px] flex-col gap-4 rounded-2xl p-7 ring-1 ${styles.card}`}
              >
                <div
                  className={`grid h-14 w-14 place-items-center rounded-xl ${styles.iconBg} ${styles.iconText}`}
                >
                  <Icon size={26} weight="duotone" />
                </div>
                <h3
                  className={`font-display text-3xl font-medium tracking-display ${styles.ink}`}
                >
                  {t(`items.${key}.title`)}
                </h3>
                <p className="flex-1 text-base text-ink/85">
                  {t(`items.${key}.body`)}
                </p>
                <div
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${styles.ink} opacity-80`}
                >
                  <Check size={14} weight="bold" />
                  {t(`items.${key}.footer`)}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
