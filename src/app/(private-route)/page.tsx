import { DashboardView } from "@/components/dashboard-view";
import { EventRepository } from "@/db/repository";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const events = EventRepository.getAllEvents();
  return <DashboardView events={events} />;
}
