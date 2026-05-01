// OSM's tile usage policy forbids deployed apps from hitting the public
// servers, so production deployments MUST set NEXT_PUBLIC_MAP_STYLE_URL to
// a permitted provider (e.g. Stadia Maps). This raster fallback only exists
// so local dev keeps working without forcing every contributor to sign up
// for an API key.
const osmRasterFallback = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19
    }
  },
  layers: [{ id: "osm", type: "raster" as const, source: "osm" }]
};

export const mapStyle =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL || osmRasterFallback;
