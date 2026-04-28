import { DiscoverView } from "@/components/discover/DiscoverView";
import { events, venues } from "@/lib/data/venues";

export default function DiscoverPage() {
  return <DiscoverView venues={venues} events={events} />;
}
