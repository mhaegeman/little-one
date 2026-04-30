import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ProfilePanel } from "@/components/profile/ProfilePanel";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profilePage");
  return {
    title: `${t("metaTitle")} · Lille Liv`
  };
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePanel />
    </Suspense>
  );
}
