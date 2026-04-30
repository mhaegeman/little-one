import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getCurrentUser } from "@/lib/auth/currentUser";

export default async function MarketingLayout({
  children
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <div className="bg-canvas text-ink">
      <SiteHeader mode="marketing" user={user} />
      {children}
    </div>
  );
}
