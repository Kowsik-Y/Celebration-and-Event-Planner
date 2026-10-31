import { EventRepository } from "@/db/repository";
import { generateEventPlan } from "@/lib/ai/client";
import { CreateEventInputSchema } from "@/lib/ai/schemas";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsedInput = CreateEventInputSchema.safeParse(json);

    if (!parsedInput.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsedInput.error.format() },
        { status: 400 },
      );
    }

    const input = parsedInput.data;
    const { blueprint, source } = await generateEventPlan(input);

    // Persist new event in SQLite
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    EventRepository.createEvent({
      id: eventId,
      title: blueprint.title || input.title,
      vertical: input.vertical,
      target_budget: blueprint.targetBudget || input.targetBudget,
      total_spent: 0,
      guest_count: blueprint.guestCount || input.guestCount,
      event_date: input.eventDate,
      location: input.location,
      theme: input.theme,
      notes: `${blueprint.themeSummary}\n\n${blueprint.logisticsAdvice}`,
    });

    // Save budget items
    for (const b of blueprint.budgetBreakdown) {
      const bId = `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      EventRepository.addBudgetItem({
        id: bId,
        event_id: eventId,
        category: b.category,
        name: b.name,
        estimated_cost: b.estimatedCost,
        actual_cost: 0,
        status: "planned",
        notes: b.notes,
      });
    }

    // Save timeline items
    for (const t of blueprint.runOfShowTimeline) {
      const tId = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      EventRepository.addTimelineItem({
        id: tId,
        event_id: eventId,
        time_start: t.timeStart,
        time_end: t.timeEnd,
        phase: t.phase,
        title: t.title,
        description: t.description,
        responsible_party: t.responsibleParty,
        order_index: t.orderIndex,
      });
    }

    // Save vendor items
    for (const v of blueprint.vendorChecklist) {
      const vId = `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      EventRepository.addVendorItem({
        id: vId,
        event_id: eventId,
        category: v.category,
        name: v.name,
        status: "researching",
        price: v.price,
        notes: v.notes,
        deadline_offset_days: v.deadlineOffsetDays,
      });
    }

    // Save personalized ideas
    for (const i of blueprint.personalizedIdeas) {
      const iId = `i-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      EventRepository.addIdea({
        id: iId,
        event_id: eventId,
        category: i.category,
        title: i.title,
        description: i.description,
        aesthetic_tags: i.aestheticTags.join(", "),
        ai_rationale: i.aiRationale,
      });
    }

    return NextResponse.json({
      success: true,
      eventId,
      source,
      blueprint,
    });
  } catch (error) {
    console.error("Error generating event plan:", error);
    return NextResponse.json(
      { error: "Failed to generate event plan", message: String(error) },
      { status: 500 },
    );
  }
}
