import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FAQ } from "./FAQ";

type FaqItem = { q: string; a: string };

export function FaqSection() {
  const t = useTranslations("marketing.faq");
  const items = t.raw("items") as FaqItem[];
  return (
    <section
      id="faq"
      className="bg-canvas px-5 py-20 md:px-10 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[860px]">
        <div className="text-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-display text-ink md:text-5xl">
            {t("title")}
          </h2>
        </div>
        <div className="mt-12">
          <FAQ items={items} />
        </div>
      </div>
    </section>
  );
}
