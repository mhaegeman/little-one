import { Suspense } from "react";
import { FamilyDetailPanel } from "@/components/families/FamilyDetailPanel";
import { Skeleton } from "@/components/ui/Skeleton";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "Familieprofil · Lille Liv"
};

export default async function FamilyDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
          <div className="mx-auto max-w-3xl space-y-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      }
    >
      <FamilyDetailPanel familyId={id} />
    </Suspense>
  );
}
