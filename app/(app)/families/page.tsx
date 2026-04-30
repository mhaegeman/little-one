import { Suspense } from "react";
import { FamiliesPanel } from "@/components/families/FamiliesPanel";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata = {
  title: "Familier · Lille Liv"
};

export default function FamiliesPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      }
    >
      <FamiliesPanel />
    </Suspense>
  );
}
