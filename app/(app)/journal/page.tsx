import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { JournalClient } from "@/components/journal/JournalClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("journal");
  return {
    title: `${t("title")} · Lille Liv`,
    description: t("subtitle")
  };
}

export default function JournalPage() {
  return (
    <Suspense fallback={null}>
      <JournalClient />
    </Suspense>
  );
}
