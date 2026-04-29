import { Suspense } from "react";
import { JournalClient } from "@/components/journal/JournalClient";

export default function JournalPage() {
  return (
    <Suspense fallback={null}>
      <JournalClient />
    </Suspense>
  );
}
