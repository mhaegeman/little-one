"use client";

import { useLocale, useMessages } from "next-intl";
import { resolveVenueCopy, type VenueCopy } from "@/lib/i18n/venueCopy";
import type { Venue } from "@/lib/types";

export function useVenueCopy(venue: Venue): VenueCopy {
  const locale = useLocale();
  const messages = useMessages();
  return resolveVenueCopy(venue, locale, messages);
}
