"use client";

import { CircleNotch, MapPin, NavigationArrow, X } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
    <div className="rounded-lg bg-surface p-3 ring-1 ring-hairline">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted">Sortér efter afstand</span>
        {userLocation ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="focus-ring inline-flex items-center gap-1 rounded-pill bg-sunken px-2 py-0.5 text-2xs font-semibold text-muted hover:text-peach-ink"
          >
            <X size={10} weight="bold" aria-hidden="true" />
            Ryd
          </button>
        ) : null}
      </div>

      {userLocation ? (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-mint-50 px-2 py-0.5 text-2xs font-semibold text-mint-ink">
          <MapPin size={11} weight="fill" aria-hidden="true" />
          {userLocation.label}
        </p>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        size="md"
        className="mt-3 w-full justify-center"
        onClick={useDeviceLocation}
        disabled={status === "geo"}
      >
        {status === "geo" ? (
          <CircleNotch size={14} weight="bold" className="animate-spin" aria-hidden="true" />
        ) : (
          <NavigationArrow size={14} weight="fill" aria-hidden="true" />
        )}
        Brug min lokation
      </Button>

      <form onSubmit={searchAddress} className="mt-2 flex gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Eller skriv en adresse…"
          leadingIcon={<MapPin size={13} weight="fill" aria-hidden="true" />}
          className="flex-1"
        />
        <Button
          type="submit"
          variant="ghost"
          size="md"
          disabled={status === "search" || query.trim().length === 0}
        >
          {status === "search" ? (
            <CircleNotch size={14} weight="bold" className="animate-spin" aria-hidden="true" />
          ) : (
            "Søg"
          )}
        </Button>
      </form>

      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
