import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { AppPreview } from "./_components/AppPreview";
import { FaqSection } from "./_components/FaqSection";
import { MarketingFooter } from "./_components/Footer";
import { FooterCta } from "./_components/FooterCta";
import { Grandparents } from "./_components/Grandparents";
import { Hero } from "./_components/Hero";
import { MarketingNav } from "./_components/MarketingNav";
import { Pillars } from "./_components/Pillars";
import { TrustStrip } from "./_components/TrustStrip";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("marketing");
  return {
    title: t("metaTitle"),
    description: t("metaDescription")
  };
}

export default function MarketingHomePage() {
  const t = useTranslations("nav");
  return (
    <>
      <a href="#main" className="skip-link">
        {t("skipToContent")}
      </a>
      <MarketingNav />
      <main id="main">
        <Hero />
        <TrustStrip />
        <Pillars />
        <AppPreview />
        <Grandparents />
        <FaqSection />
        <FooterCta />
      </main>
      <MarketingFooter />
    </>
  );
}
