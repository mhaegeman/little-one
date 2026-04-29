import { clsx, type ClassValue } from "clsx";
import { differenceInMonths, format, intervalToDuration, parseISO } from "date-fns";
import { da, enGB } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDanishDate(date: string | Date, pattern = "d. MMMM yyyy") {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, pattern, { locale: da });
}

// Locale-aware variant. Used by surfaces that need to match the user's
// chosen language. Falls back to Danish for any non-en locale.
export function formatLocalizedDate(
  date: string | Date,
  locale: string,
  pattern = "d. MMMM yyyy"
) {
  const value = typeof date === "string" ? parseISO(date) : date;
  const dateFnsLocale = locale === "en" ? enGB : da;
  // Default Danish pattern looks awkward in English; pick a friendlier one.
  const effective =
    locale === "en" && pattern === "d. MMMM yyyy" ? "d MMM yyyy" : pattern;
  return format(value, effective, { locale: dateFnsLocale });
}

export function ageInMonths(dateOfBirth: string) {
  return Math.max(0, differenceInMonths(new Date(), parseISO(dateOfBirth)));
}

export function formatChildAge(dateOfBirth: string, locale = "da") {
  const duration = intervalToDuration({
    start: parseISO(dateOfBirth),
    end: new Date()
  });
  const years = duration.years ?? 0;
  const months = duration.months ?? 0;

  if (locale === "en") {
    if (years === 0) return `${months} mo.`;
    if (months === 0) return `${years} yr`;
    return `${years} yr ${months} mo.`;
  }

  if (years === 0) return `${months} mdr.`;
  if (months === 0) return `${years} år`;
  return `${years} år og ${months} mdr.`;
}

export function monthRangeLabel(min: number, max: number, locale = "da") {
  if (locale === "en") {
    const minLabel = min < 12 ? `${min} mo.` : `${Math.floor(min / 12)} yr`;
    const maxLabel = max < 12 ? `${max} mo.` : `${Math.floor(max / 12)} yr`;
    return `${minLabel}–${maxLabel}`;
  }
  const minLabel = min < 12 ? `${min} mdr.` : `${Math.floor(min / 12)} år`;
  const maxLabel = max < 12 ? `${max} mdr.` : `${Math.floor(max / 12)} år`;
  return `${minLabel}-${maxLabel}`;
}

export function googleMapsUrl(lat: number, lng: number, name: string) {
  const query = encodeURIComponent(`${name} ${lat},${lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  if (km < 10) {
    return `${km.toFixed(1).replace(".", ",")} km`;
  }
  return `${Math.round(km)} km`;
}
