import { Suspense } from "react";
import { ProfilePanel } from "@/components/profile/ProfilePanel";

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePanel />
    </Suspense>
  );
}
