import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function TrustStrip() {
  const t = useTranslations("marketing.trust");
  const items = t.raw("items") as string[];
  return (
    <section
      aria-label={t("label")}
      className="border-y border-hairline bg-canvas"
    >
      <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-5 px-5 py-10 md:flex-row md:gap-10 md:px-10">
        <Eyebrow className="shrink-0 text-subtle">{t("label")}</Eyebrow>
        <ul className="flex flex-1 flex-wrap items-center justify-center gap-x-10 gap-y-3 md:justify-between">
          {items.map((name) => (
            <li
              key={name}
              className="font-display text-lg font-medium tracking-display text-subtle/80"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
