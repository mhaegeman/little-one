import { MapEditTool } from "@/components/admin/MapEditTool";
import { venues } from "@/lib/data/venues";

export const metadata = {
  title: "Map editor · Lille Liv",
  robots: { index: false, follow: false }
};

export default function MapToolPage() {
  // Save-to-file is dev-only — production builds get the read/copy-only flow.
  const saveEnabled = process.env.NODE_ENV !== "production";
  return <MapEditTool venues={venues} saveEnabled={saveEnabled} />;
}
