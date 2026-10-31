import { DashboardView } from "@/components/dashboard-view";
import { EventRepository } from "@/db/repository";
import { verifySessionToken } from "@/lib/auth/security";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("celebrate_session")?.value;
  const session = token ? verifySessionToken(token) : null;

  const events = EventRepository.getEventsByUser(session?.userId, session?.role);
  return <DashboardView initialEvents={events} />;
}
