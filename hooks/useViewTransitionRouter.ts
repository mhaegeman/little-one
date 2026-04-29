"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

type Doc = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

/**
 * Wraps next/navigation's router.push in a view transition when the browser
 * supports the View Transitions API. Falls back to a plain push otherwise.
 *
 * Honors prefers-reduced-motion (skip transition).
 */
export function useViewTransitionRouter() {
  const router = useRouter();

  return useCallback(
    (href: string) => {
      const doc = typeof document !== "undefined" ? (document as Doc) : null;
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      if (!doc?.startViewTransition || reduced) {
        router.push(href);
        return;
      }

      doc.startViewTransition(() => {
        router.push(href);
      });
    },
    [router]
  );
}
