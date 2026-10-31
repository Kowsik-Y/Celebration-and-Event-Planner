import { EventRepository } from "@/db/repository";
import { EventContextManager } from "@/lib/ai/context-manager";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = EventRepository.getEventById(id);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const context = EventContextManager.getEventContext(id);
  const budgetItems = EventRepository.getBudgetItems(id);
  const timelineItems = EventRepository.getTimelineItems(id);
  const vendorItems = EventRepository.getVendorItems(id);
  const ideas = EventRepository.getIdeas(id);
  const guests = EventRepository.getGuests(id);

  return NextResponse.json({
    event,
    context,
    budgetItems,
    timelineItems,
    vendorItems,
    ideas,
    guests,
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  EventRepository.deleteEvent(id);
  return NextResponse.json({ success: true });
}
