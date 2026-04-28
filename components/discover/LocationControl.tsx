"use client";

import { Loader2, MapPin, Navigation, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export type UserLocation = {
  lat: number;
  lng: number;
  label: string;
};

type LocationControlProps = {
  userLocation: UserLocation | null;
  onChange: (location: UserLocation | null) => void;
};

export function LocationControl({ userLocation, onChange }: LocationControlProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "geo" | "search">("idle");
  const [error, setError] = useState<string | null>(null);

  function useDeviceLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Lokationstjenester er ikke tilgængelige i denne browser.");
      return;
    }
    setError(null);
    setStatus("geo");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus("idle");
        onChange({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Min lokation"
        });
      },
      (err) => {
        setStatus("idle");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Lokation er afvist. Skriv en adresse i stedet."
            : "Kunne ikke hente din lokation."
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  }

  async function searchAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setError(null);
    setStatus("search");
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", value.includes("danmark") ? value : `${value}, Danmark`);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");
      url.searchParams.set("addressdetails", "0");
      const response = await fetch(url.toString(), {
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        throw new Error("Geocoding failed");
      }
      const results = (await response.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;
      if (results.length === 0) {
        setError("Vi fandt ingen adresse. Prøv et andet søgeord.");
        setStatus("idle");
        return;
      }
      const [first] = results;
      const label = first.display_name.split(",").slice(0, 2).join(", ");
      onChange({ lat: Number(first.lat), lng: Number(first.lon), label });
      setQuery("");
      setStatus("idle");
    } catch {
      setError("Adressesøgning fejlede. Prøv igen.");
      setStatus("idle");
    }
  }

  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-oat">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-rust">
          <Navigation size={16} aria-hidden="true" />
          <span className="text-sm font-bold text-ink/72">Sortér efter afstand</span>
        </div>
        {userLocation ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="focus-ring inline-flex items-center gap-1 rounded-full bg-linen px-2 py-1 text-xs font-bold text-ink/72 hover:text-rust"
          >
            <X size={12} aria-hidden="true" />
            Ryd
          </button>
        ) : null}
      </div>

      {userLocation ? (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-moss/10 px-2.5 py-1 text-xs font-bold text-mossDark">
          <MapPin size={12} aria-hidden="true" />
          {userLocation.label}
        </p>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        className="mt-3 w-full justify-center"
        onClick={useDeviceLocation}
        disabled={status === "geo"}
      >
        {status === "geo" ? (
          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
        ) : (
          <Navigation size={15} aria-hidden="true" />
        )}
        Brug min lokation
      </Button>

      <form onSubmit={searchAddress} className="mt-2 flex gap-2">
        <span className="flex h-10 flex-1 items-center gap-2 rounded-xl bg-linen px-2.5 ring-1 ring-oat">
          <MapPin size={14} className="text-ink/45" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Eller skriv en adresse..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </span>
        <Button
          type="submit"
          variant="ghost"
          className="h-10 px-3"
          disabled={status === "search" || query.trim().length === 0}
        >
          {status === "search" ? (
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            "Søg"
          )}
        </Button>
      </form>

      {error ? <p className="mt-2 text-xs font-medium text-rust">{error}</p> : null}
    </div>
  );
}
