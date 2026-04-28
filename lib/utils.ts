import { clsx, type ClassValue } from "clsx";
import { differenceInMonths, format, intervalToDuration, parseISO } from "date-fns";
import { da } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDanishDate(date: string | Date, pattern = "d. MMMM yyyy") {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, pattern, { locale: da });
}

export function ageInMonths(dateOfBirth: string) {
  return Math.max(0, differenceInMonths(new Date(), parseISO(dateOfBirth)));
}

export function formatChildAge(dateOfBirth: string) {
  const duration = intervalToDuration({
    start: parseISO(dateOfBirth),
    end: new Date()
  });
  const years = duration.years ?? 0;
  const months = duration.months ?? 0;

  if (years === 0) {
    return `${months} mdr.`;
  }

  if (months === 0) {
    return `${years} år`;
  }

  return `${years} år og ${months} mdr.`;
}

export function monthRangeLabel(min: number, max: number) {
  const minLabel = min < 12 ? `${min} mdr.` : `${Math.floor(min / 12)} år`;
  const maxLabel = max < 12 ? `${max} mdr.` : `${Math.floor(max / 12)} år`;
  return `${minLabel}-${maxLabel}`;
}

export function googleMapsUrl(lat: number, lng: number, name: string) {
  const query = encodeURIComponent(`${name} ${lat},${lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
