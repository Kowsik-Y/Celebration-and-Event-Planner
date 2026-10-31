import { EventRepository } from "@/db/repository";
import type { VendorStatus } from "@/db/schema";
import { NextResponse } from "next/server";
import { z } from "zod";

const AddVendorSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1),
  contact_email: z.string().optional(),
  contact_phone: z.string().optional(),
  status: z.enum(["researching", "contacted", "quoted", "hired", "declined"]).optional(),
  price: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  deadline_offset_days: z.number().int().optional(),
});

const UpdateVendorSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["researching", "contacted", "quoted", "hired", "declined"]),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params;
  try {
    const json = await request.json();
    const parsed = AddVendorSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const vId = `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    EventRepository.addVendorItem({
      id: vId,
      event_id: eventId,
      ...parsed.data,
    });

    return NextResponse.json({ success: true, id: vId });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const json = await request.json();
    const parsed = UpdateVendorSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    EventRepository.updateVendorStatus(parsed.data.id, parsed.data.status as VendorStatus);
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

  EventRepository.deleteVendorItem(itemId);
  return NextResponse.json({ success: true });
}
