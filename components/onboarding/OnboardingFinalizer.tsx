"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChildProfileForm } from "@/components/onboarding/ChildProfileForm";
import { markOnboardingComplete } from "@/lib/family";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  next: string;
  locale: "da" | "en";
};

const COPY = {
  da: {
    skip: "Spring over for nu",
    skipping: "Vent…",
    error: "Kunne ikke gemme. Prøv igen."
  },
  en: {
    skip: "Skip for now",
    skipping: "One moment…",
    error: "Couldn't save. Please try again."
  }
} as const;

/**
 * Wraps the child profile form so that, once the user finishes onboarding
 * (either by creating a child or skipping), we stamp
 * family_profiles.onboarding_completed_at and forward them to their requested
 * destination. Without this, the /auth/callback gate would loop them back
 * through /onboarding on every sign-in.
 */
export function OnboardingFinalizer({ userId, next, locale }: Props) {
  const router = useRouter();
  const copy = COPY[locale];
  const [skipping, setSkipping] = useState(false);
  const [error, setError] = useState("");

  async function finalize() {
    const supabase = createClient();
    if (!supabase) {
      router.push(next);
      return;
    }
    try {
      await markOnboardingComplete(supabase, userId);
    } catch {
      // Non-fatal: we still let the user proceed, and the next sign-in will
      // simply route them back here. Log to the console for debugging.
    }
    router.push(next);
  }

  async function skip() {
    setSkipping(true);
    setError("");
    try {
      await finalize();
    } catch {
      setError(copy.error);
      setSkipping(false);
    }
  }

  return (
    <div className="space-y-3">
      <ChildProfileForm onCreated={finalize} />
      <div className="flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={skip} disabled={skipping}>
          {skipping ? copy.skipping : copy.skip}
        </Button>
      </div>
      {error ? (
        <p className="rounded-lg bg-warm-50 p-2.5 text-sm font-semibold text-danger ring-1 ring-warm-100">
          {error}
        </p>
      ) : null}
    </div>
  );
}
