import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { MapEditTool } from "@/components/admin/MapEditTool";
import { isAdminUser } from "@/lib/auth/admin";
import { venues } from "@/lib/data/venues";
import { createClient } from "@/lib/db/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("adminMapTool");
  return {
    title: `${t("metaTitle")} · Lille Liv`,
    robots: { index: false, follow: false }
  };
}

export default async function MapToolPage() {
  const supabase = await createClient();
  if (!supabase) {
    notFound();
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?next=${encodeURIComponent("/admin/map-tool")}`);
  }

  if (!isAdminUser(user)) {
    notFound();
  }

  // Save-to-file is dev-only — production builds get the read/copy-only flow.
  const saveEnabled = process.env.NODE_ENV !== "production";
  return <MapEditTool venues={venues} saveEnabled={saveEnabled} />;
}
