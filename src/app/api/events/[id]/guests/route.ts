import { EventRepository } from "@/db/repository";
import type { RsvpStatus } from "@/db/schema";
import { NextResponse } from "next/server";
import { z } from "zod";

const AddGuestSchema = z.object({
  name: z.string().min(1),
  email: z.string().optional(),
  rsvp_status: z.enum(["attending", "declined", "pending"]).optional(),
  dietary_restrictions: z.string().optional(),
  table_number: z.string().optional(),
  plus_ones: z.number().int().nonnegative().optional(),
});

const UpdateGuestSchema = z.object({
  id: z.string().min(1),
  rsvp_status: z.enum(["attending", "declined", "pending"]),
  dietary_restrictions: z.string().optional(),
  table_number: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params;
  try {
    const json = await request.json();
    const parsed = AddGuestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const gId = `g-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    EventRepository.addGuest({
      id: gId,
      event_id: eventId,
      ...parsed.data,
    });

    return NextResponse.json({ success: true, id: gId });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const json = await request.json();
    const parsed = UpdateGuestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    EventRepository.updateGuestRsvp(
      parsed.data.id,
      parsed.data.rsvp_status as RsvpStatus,
      parsed.data.dietary_restrictions,
      parsed.data.table_number,
    );

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

  EventRepository.deleteGuest(itemId);
  return NextResponse.json({ success: true });
}
