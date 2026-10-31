import { EventRepository } from "@/db/repository";
import { NextResponse } from "next/server";
import { z } from "zod";

const AddTimelineSchema = z.object({
  time_start: z.string().min(1),
  time_end: z.string().min(1),
  phase: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  responsible_party: z.string().optional(),
  order_index: z.number().int().optional(),
});

const ToggleTimelineSchema = z.object({
  id: z.string().min(1),
  is_completed: z.boolean(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params;
  try {
    const json = await request.json();
    const parsed = AddTimelineSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const tId = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    EventRepository.addTimelineItem({
      id: tId,
      event_id: eventId,
      ...parsed.data,
    });

    return NextResponse.json({ success: true, id: tId });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const json = await request.json();
    const parsed = ToggleTimelineSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    EventRepository.toggleTimelineItem(parsed.data.id, parsed.data.is_completed);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) {
    return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
  }

  EventRepository.deleteTimelineItem(itemId);
  return NextResponse.json({ success: true });
}
