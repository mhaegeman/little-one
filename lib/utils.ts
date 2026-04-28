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
