import { EventRepository } from "@/db/repository";
import { verifySessionToken } from "@/lib/auth/security";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("celebrate_session")?.value;
    const session = token ? verifySessionToken(token) : null;

    const events = EventRepository.getEventsByUser(session?.userId, session?.role);
    return NextResponse.json({ events });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
