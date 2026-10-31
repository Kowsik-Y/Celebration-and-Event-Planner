import { EventRepository } from "@/db/repository";
import type { BudgetItemStatus } from "@/db/schema";
import { NextResponse } from "next/server";
import { z } from "zod";

const AddBudgetSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1),
  estimated_cost: z.number().nonnegative(),
  actual_cost: z.number().nonnegative().optional(),
  status: z.enum(["planned", "booked", "paid"]).optional(),
  notes: z.string().optional(),
});

const UpdateBudgetSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["planned", "booked", "paid"]),
  actual_cost: z.number().nonnegative().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params;
  try {
    const json = await request.json();
    const parsed = AddBudgetSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const bId = `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    EventRepository.addBudgetItem({
      id: bId,
      event_id: eventId,
      ...parsed.data,
    });

    return NextResponse.json({ success: true, id: bId });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const json = await request.json();
    const parsed = UpdateBudgetSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    EventRepository.updateBudgetItemStatus(
      parsed.data.id,
      parsed.data.status as BudgetItemStatus,
      parsed.data.actual_cost,
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

  EventRepository.deleteBudgetItem(itemId);
  return NextResponse.json({ success: true });
}
