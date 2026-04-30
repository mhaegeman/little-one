import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { DiscoverView } from "@/components/discover/DiscoverView";
import { Skeleton } from "@/components/ui/Skeleton";
import { events, venues } from "@/lib/data/venues";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("discover");
  return {
    title: `${t("title")} · Lille Liv`,
    description: t("subtitle")
  };
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px] space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-12 w-full" />
            <div className="grid gap-3 lg:grid-cols-2">
              <Skeleton className="h-[60vh] w-full" />
              <Skeleton className="h-[60vh] w-full" />
            </div>
          </div>
        </div>
      }
    >
      <DiscoverView venues={venues} events={events} />
    </Suspense>
  );
}
