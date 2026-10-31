import type {
  BudgetItemRecord,
  EventRecord,
  GuestRecord,
  TimelineItemRecord,
  VendorItemRecord,
} from "@/db/schema";
import { differenceInDays, parseISO } from "date-fns";

export interface ReadinessFactor {
  category: "budget" | "timeline" | "vendors" | "guests" | "theme";
  name: string;
  score: number;
  maxScore: number;
  passed: boolean;
  recommendation?: string;
}

export interface ReadinessScoreResult {
  score: number;
  tier: "Needs Immediate Attention" | "In Progress" | "Well Planned" | "Celebration Ready";
  color: "danger" | "warning" | "accent" | "success";
  factors: ReadinessFactor[];
  reasons: string[];
  recommendations: string[];
}

/**
 * Deterministic, explainable 0–100 Celebration Readiness Score.
 * Evaluates budget safety, countdown timeline health, vendor confirmation,
 * guest RSVP tracking, and aesthetic theme clarity with explicit actionable reasons.
 */
export function calculateReadinessScore(params: {
  event: EventRecord;
  budgetItems?: BudgetItemRecord[];
  timelineItems?: TimelineItemRecord[];
  vendorItems?: VendorItemRecord[];
  guests?: GuestRecord[];
  currentDate?: Date;
}): ReadinessScoreResult {
  const {
    event,
    budgetItems = [],
    timelineItems = [],
    vendorItems = [],
    guests = [],
    currentDate = new Date(),
  } = params;

  const factors: ReadinessFactor[] = [];
  const reasons: string[] = [];
  const recommendations: string[] = [];

  // 1. Budget Health (20 pts)
  let budgetScore = 0;
  if (event.target_budget > 0) {
    budgetScore += 10;
  } else {
    reasons.push("Target budget has not been established ($0 allocated).");
    recommendations.push("Set a target budget ceiling to unlock automated cost distribution.");
  }

  const totalSpent = budgetItems.reduce((acc, b) => acc + (b.actual_cost || 0), 0);
  if (event.target_budget > 0 && totalSpent <= event.target_budget) {
    budgetScore += 5;
  } else if (totalSpent > event.target_budget) {
    reasons.push(
      `Budget exceeded: committed $${totalSpent.toLocaleString()} exceeds $${event.target_budget.toLocaleString()} target.`,
    );
    recommendations.push(
      "Reallocate category funds or reduce variable catering items to restore balance.",
    );
  }

  const contingencyItem = budgetItems.find(
    (b) =>
      b.category.toLowerCase().includes("contingency") ||
      b.name.toLowerCase().includes("contingency"),
  );
  if (contingencyItem || budgetItems.length > 0) {
    budgetScore += 5;
  } else {
    reasons.push("Emergency contingency reserve is unallocated.");
    recommendations.push(
      "Preserve 8% of total budget as an emergency buffer for unexpected expenses.",
    );
  }

  factors.push({
    category: "budget",
    name: "Budget Calibration & Reserve",
    score: budgetScore,
    maxScore: 20,
    passed: budgetScore >= 15,
    recommendation: budgetScore < 15 ? recommendations[recommendations.length - 1] : undefined,
  });

  // 2. Timeline & Overdue Milestones (25 pts)
  let timelineScore = 0;
  let targetDate: Date;
  try {
    targetDate = parseISO(event.event_date);
  } catch {
    targetDate = new Date();
  }
  const daysUntilEvent = differenceInDays(targetDate, currentDate);

  if (timelineItems.length > 0) {
    timelineScore += 10;
  } else {
    reasons.push("No schedule milestones or day-of run of show items created.");
    recommendations.push("Generate or add key timeline milestones for the celebration.");
  }

  // Check for completed or overdue items
  const completedTimeline = timelineItems.filter((t) => t.is_completed === 1).length;
  if (timelineItems.length > 0) {
    const completionRate = completedTimeline / timelineItems.length;
    timelineScore += Math.round(completionRate * 15);
  } else if (daysUntilEvent > 60) {
    timelineScore += 10; // Lead time grace period
  }

  factors.push({
    category: "timeline",
    name: "Milestone Sequencing & Timing",
    score: timelineScore,
    maxScore: 25,
    passed: timelineScore >= 18,
    recommendation:
      timelineScore < 18
        ? "Review schedule milestones and complete pending checkpoints."
        : undefined,
  });

  // 3. Vendor Procurement Pipeline (20 pts)
  let vendorScore = 0;
  if (vendorItems.length > 0) {
    vendorScore += 8;
    const hiredOrContracted = vendorItems.filter(
      (v) => v.status === "hired" || v.status === "quoted",
    ).length;
    const hiredRatio = hiredOrContracted / vendorItems.length;
    vendorScore += Math.round(hiredRatio * 12);

    if (hiredOrContracted === 0) {
      reasons.push("No vendor contracts have been executed yet.");
      recommendations.push(
        "Advance key vendors (venue, catering, photography) from research to contracted status.",
      );
    }
  } else {
    reasons.push("Vendor checklist is empty.");
    recommendations.push("Populate vendor checklist to secure essential event services.");
  }

  factors.push({
    category: "vendors",
    name: "Vendor Procurement & Contracts",
    score: vendorScore,
    maxScore: 20,
    passed: vendorScore >= 14,
    recommendation:
      vendorScore < 14 ? "Finalize vendor agreements to eliminate booking uncertainty." : undefined,
  });

  // 4. Guest List & RSVP Tracking (20 pts)
  let guestScore = 0;
  if (event.guest_count > 0) {
    guestScore += 8;
  }

  if (guests.length > 0) {
    guestScore += 6;
    const confirmedGuests = guests.filter((g) => g.rsvp_status === "attending").length;
    if (confirmedGuests > 0) {
      guestScore += 6;
    }
  } else {
    // If guest list tracker not filled, scale by default capacity planning
    guestScore += 4;
    reasons.push("Individual guest RSVP registry has not been populated.");
    recommendations.push("Send invitations and record dietary preferences for catering safety.");
  }

  factors.push({
    category: "guests",
    name: "Guest Attendance & Catering Registry",
    score: guestScore,
    maxScore: 20,
    passed: guestScore >= 14,
    recommendation:
      guestScore < 14 ? "Track guest confirmations and record dietary allergens." : undefined,
  });

  // 5. Aesthetic & Theme Definition (15 pts)
  let themeScore = 0;
  if (event.theme && event.theme.trim().length >= 3) {
    themeScore += 5;
  } else {
    reasons.push("Event theme or stylistic vision is missing.");
  }

  if (event.location && event.location.trim().length >= 2) {
    themeScore += 5;
  } else {
    reasons.push("Event venue location is unspecified.");
  }

  if (event.notes && event.notes.trim().length >= 10) {
    themeScore += 5;
  } else {
    reasons.push("Custom creative advice or vows are unconfigured.");
  }

  factors.push({
    category: "theme",
    name: "Aesthetic Vision & Logistics Advice",
    score: themeScore,
    maxScore: 15,
    passed: themeScore >= 10,
    recommendation:
      themeScore < 10 ? "Detail theme colors and logistics notes for vendor clarity." : undefined,
  });

  // Sum total score bounded [0, 100]
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      factors.reduce((sum, f) => sum + f.score, 0),
    ),
  );

  let tier: ReadinessScoreResult["tier"] = "Celebration Ready";
  let color: ReadinessScoreResult["color"] = "success";

  if (totalScore < 40) {
    tier = "Needs Immediate Attention";
    color = "danger";
  } else if (totalScore < 70) {
    tier = "In Progress";
    color = "warning";
  } else if (totalScore < 90) {
    tier = "Well Planned";
    color = "accent";
  }

  return {
    score: totalScore,
    tier,
    color,
    factors,
    reasons,
    recommendations,
  };
}
