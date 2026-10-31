import { differenceInDays, format, isBefore, parseISO, subDays } from "date-fns";

export interface CountdownMilestone {
  id: string;
  offsetDays: number;
  title: string;
  phase: string;
  description: string;
  responsibleParty: string;
  dueDate: string;
  daysRemaining: number;
  isOverdue: boolean;
  daysOverdue: number;
  isCompleted: boolean;
  status: "completed" | "overdue" | "upcoming";
}

/**
 * Standard back-scheduled milestone templates per vertical.
 * Counted backwards from the final event date.
 */
export const MILESTONE_TEMPLATES: Record<
  "wedding" | "birthday" | "community",
  Array<{
    offsetDays: number;
    title: string;
    phase: string;
    description: string;
    responsibleParty: string;
  }>
> = {
  wedding: [
    {
      offsetDays: 240,
      title: "Secure Primary Venue & Date Lock",
      phase: "Initial Logistics",
      description:
        "Sign venue agreement, verify rain backup plan, and confirm sound curfew (e.g. 23:00/01:00).",
      responsibleParty: "Couple & Planner",
    },
    {
      offsetDays: 180,
      title: "Book Lead Photographer & Cinematographer",
      phase: "Creative Team",
      description:
        "Contract duo photo/video team, schedule engagement shoot, and align golden hour timings.",
      responsibleParty: "Planner",
    },
    {
      offsetDays: 120,
      title: "Send Formal Invitations & Launch RSVP Registry",
      phase: "Guest Experience",
      description:
        "Mail artisanal letterpress invitations with dietary allergy check card and travel guide.",
      responsibleParty: "Couple",
    },
    {
      offsetDays: 90,
      title: "Private Menu & Wine Pairing Tasting",
      phase: "Catering",
      description:
        "Taste 3-course plated menu, select signature welcome cocktail, and confirm vegan/celiac options.",
      responsibleParty: "Couple & Caterer",
    },
    {
      offsetDays: 60,
      title: "Floral Mockup & Scenography Sign-off",
      phase: "Design & Decor",
      description:
        "Review tabletop floral centerpiece mockup, ambient lighting grid, and ceremony arch stability.",
      responsibleParty: "Floral Designer",
    },
    {
      offsetDays: 30,
      title: "Music Cues & 'Do-Not-Play' Playlist Submission",
      phase: "Entertainment",
      description:
        "Deliver processional, recessional, first dance tracks, and dance floor music list to band/DJ.",
      responsibleParty: "Couple & DJ",
    },
    {
      offsetDays: 14,
      title: "Lock Final Guest Headcount & Escort Seating",
      phase: "Hospitality",
      description:
        "Transmit final confirmed guest headcount to kitchen; generate color-coded dietary place cards.",
      responsibleParty: "Planner",
    },
    {
      offsetDays: 3,
      title: "Ceremony Rehearsal & Welcome Dinner",
      phase: "Execution",
      description:
        "Walk wedding party through ceremony pacing, mic checks, and hold intimate welcome dinner.",
      responsibleParty: "Logistics Director",
    },
    {
      offsetDays: 0,
      title: "Celebration Day-of Run-of-Show",
      phase: "Celebration",
      description:
        "Full minute-by-minute execution from morning glam squad to cold spark fountain departure.",
      responsibleParty: "All Vendors & Team",
    },
  ],
  birthday: [
    {
      offsetDays: 90,
      title: "Reserve Private Lounge / Speakeasy Venue",
      phase: "Venue & Atmosphere",
      description: "Lock rooftop or speakeasy buyout with sound system and dedicated bar staff.",
      responsibleParty: "Host",
    },
    {
      offsetDays: 60,
      title: "Engage Live Soul Band & Curate Mixology Flight",
      phase: "Entertainment & Bar",
      description:
        "Contract live musical act, hire headline DJ, and design 3 milestone-themed cocktails.",
      responsibleParty: "Host & Bartender",
    },
    {
      offsetDays: 30,
      title: "Send Digital Invitations & Confirm Photo Wall",
      phase: "Guests & Production",
      description:
        "Dispatch interactive calendar invites; commission custom neon signage and statement floral wall.",
      responsibleParty: "Organizer",
    },
    {
      offsetDays: 14,
      title: "Order Showstopper Cake & Champagne Tower",
      phase: "Culinary Highlights",
      description:
        "Finalize artisanal multi-tiered pastry reveal and arrange coupe champagne tower.",
      responsibleParty: "Caterer",
    },
    {
      offsetDays: 3,
      title: "Final Guest Count & Speeches Alignment",
      phase: "Final Checks",
      description: "Confirm VIP guest list with security desk; brief milestone toast speakers.",
      responsibleParty: "Host",
    },
    {
      offsetDays: 0,
      title: "Milestone Celebration Night",
      phase: "Celebration",
      description: "Execute cocktail hour, dinner stations, retrospective toast, and dance party.",
      responsibleParty: "All Vendors",
    },
  ],
  community: [
    {
      offsetDays: 120,
      title: "Secure Municipal Permits & ADA Compliance Verification",
      phase: "Permits & Safety",
      description:
        "File municipal event permit, ensure ADA wheelchair ramps, and reserve emergency medical staff.",
      responsibleParty: "Gala Director",
    },
    {
      offsetDays: 90,
      title: "Publish Sponsor Packages & Keynote Speaker Contracts",
      phase: "Partnerships",
      description:
        "Confirm tier-1 sponsors, stage layout, audio-visual technical team, and keynote speakers.",
      responsibleParty: "Committee",
    },
    {
      offsetDays: 60,
      title: "Launch Public Registration & Charity Auction Catalog",
      phase: "Ticketing & Media",
      description:
        "Open ticketing portal; catalog donated live auction packages and promotional releases.",
      responsibleParty: "Outreach Lead",
    },
    {
      offsetDays: 30,
      title: "Stage Rigging, Microphones & Livestream Testing",
      phase: "Technical Production",
      description:
        "Verify staging load capacities, wireless microphone frequencies, and HD livestream links.",
      responsibleParty: "AV Director",
    },
    {
      offsetDays: 7,
      title: "Volunteer Briefing & Security Walkthrough",
      phase: "Operations",
      description:
        "Conduct safety briefing with 30+ volunteers, badge checkpoints, and guest intake flow.",
      responsibleParty: "Safety Director",
    },
    {
      offsetDays: 0,
      title: "Civic Gala & Live Auction Kickoff",
      phase: "Celebration",
      description:
        "Deliver opening addresses, sponsor recognition dinner, live charity auction, and networking.",
      responsibleParty: "All Teams",
    },
  ],
};

/**
 * Computes back-scheduled countdown milestones based on the event target date.
 * Accurately determines overdue tasks if current date is past the required lead time.
 */
export function generateCountdownMilestones(
  eventDateStr: string,
  vertical: "wedding" | "birthday" | "community" = "wedding",
  completedIds: string[] = [],
  currentDate: Date = new Date(),
): CountdownMilestone[] {
  let eventDate: Date;
  try {
    eventDate = parseISO(eventDateStr);
  } catch {
    eventDate = new Date();
  }

  const templates = MILESTONE_TEMPLATES[vertical] || MILESTONE_TEMPLATES.wedding;

  return templates.map((tmpl, idx) => {
    const id = `milestone-${tmpl.offsetDays}-${idx}`;
    const dueDateObj = subDays(eventDate, tmpl.offsetDays);
    const dueDateFormatted = format(dueDateObj, "yyyy-MM-dd");
    const isCompleted = completedIds.includes(id);

    // Overdue check: target due date is in the past and task is incomplete
    const isPast = isBefore(dueDateObj, currentDate);
    const isOverdue = isPast && !isCompleted;
    const daysOverdue = isOverdue ? Math.max(1, differenceInDays(currentDate, dueDateObj)) : 0;
    const daysRemaining = differenceInDays(dueDateObj, currentDate);

    let status: CountdownMilestone["status"] = "upcoming";
    if (isCompleted) {
      status = "completed";
    } else if (isOverdue) {
      status = "overdue";
    }

    return {
      id,
      offsetDays: tmpl.offsetDays,
      title: tmpl.title,
      phase: tmpl.phase,
      description: tmpl.description,
      responsibleParty: tmpl.responsibleParty,
      dueDate: dueDateFormatted,
      daysRemaining,
      isOverdue,
      daysOverdue,
      isCompleted,
      status,
    };
  });
}
