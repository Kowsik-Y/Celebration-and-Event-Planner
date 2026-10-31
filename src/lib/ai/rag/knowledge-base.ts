import { getDb } from "@/db";

export interface KnowledgeDocument {
  id: string;
  category: "budget" | "timeline" | "vendors" | "etiquette" | "logistics" | "permits";
  topic: string;
  title: string;
  content: string;
  tags: string[];
}

export const EMBEDDED_KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: "kb-budget-wedding",
    category: "budget",
    topic: "Wedding Budget Allocation Model",
    title: "Standard Professional Wedding Budget Distribution Benchmark",
    content: `
      In professional luxury & destination wedding planning, total budgets are allocated according to strict risk-mitigated ratios:
      - Venue & Catering (F&B): 42% - 48% (Includes room hire, meal courses, open bar, cocktail bites, service charges).
      - Photography & Cinematography: 10% - 14% (Minimum 8 to 10 hours of coverage, second shooter, drone aerials).
      - Floral, Lighting & Scenography: 9% - 12% (Ceremony arch, tabletop centerpieces, fairy/bistro ambient lighting).
      - Music & Entertainment: 7% - 10% (Ceremony acoustic soloist/strings, cocktail jazz duo, 5-to-8 piece reception dance band/DJ).
      - Attire, Hair & Makeup: 6% - 8% (Gown, tuxedos, veil, trials, on-day bridal party glam team).
      - Stationery & Favors: 2% - 3% (Save-the-dates, wax seal invitations, escort cards, customized local gift bags).
      - On-Day Coordination & Logistics: 5% - 7% (Lead planner, assistant coordinators, timeline dispatchers).
      - Unallocated Contingency Fund: 8% - 10% (Mandatory buffer for weather tenting, overtime fees, unexpected extra guest chairs).
      Rule of Thumb: Never allocate 100% of the target budget to upfront contracts; always reserve at least 8% for the final 30 days.
    `,
    tags: ["budget", "wedding", "allocation", "contingency", "percentages"],
  },
  {
    id: "kb-timeline-runofshow",
    category: "timeline",
    topic: "Day-of Run of Show Sequencing Rules",
    title: "Aria's Master Wedding Timeline Sequencing & Buffer Protocol",
    content: `
      Golden rules for flawless wedding day schedules:
      1. Golden Hour Photography: Ceremony timing must be anchored strictly 2 hours to 2.5 hours prior to official sunset. This guarantees 45 minutes for vows/recessional and 60 minutes of golden light for romantic portraits.
      2. The Transition Buffer Principle: Never schedule back-to-back zero-minute transitions. Moving 100+ guests from garden ceremony to cocktail terrace requires a minimum 15-minute buffer.
      3. First Look Advantage: Scheduling the first look and wedding party portraits 2.5 hours prior to the ceremony preserves 100% of the cocktail hour for the couple to mingle with guests.
      4. Dinner Duration: A seated 3-course dinner requires 90 minutes. A 4-course or multi-wine pairing dinner requires 120 minutes. Inserting speeches between courses (rather than in a single long block) keeps guest energy peak and prevents meal cooling.
      5. Sound Curfews: Outdoor amplified sound in most European and North American historic estates must transition indoors or lower to ambient levels strictly by 23:00 (11:00 PM).
    `,
    tags: ["timeline", "run-of-show", "golden-hour", "buffers", "curfew", "speeches"],
  },
  {
    id: "kb-vendors-contracts",
    category: "vendors",
    topic: "Vendor Management & Milestone Checklists",
    title: "High-Stakes Vendor Contract Milestones & Duty of Care",
    content: `
      Vendor hiring sequence and critical timeline milestones:
      - T-12 to T-10 Months: Secure Venue and Lead Photographer/Videographer (top talent books 1 year in advance).
      - T-8 Months: Secure Caterer, Floral Designer, and Evening Band/DJ.
      - T-6 Months: Finalize attire, guest accommodation blocks, and launch digital RSVP portal.
      - T-3 Months: Menu and cake tasting; finalize floral centerpiece mockups.
      - T-1 Month: Collect final RSVPs; verify all dietary intolerances (gluten, dairy, severe nut anaphylaxis).
      - T-14 Days: Submit final headcount to caterer, lock table layout, and issue final minute-by-minute run of show to all vendors.
      Contract Essentials:
      - Vendor Meals: Contracts for photographer, videographer, band, and coordinator must guarantee hot seated vendor meals during guest dinner.
      - Load-in Windows: Florists and rental companies require a minimum 3 to 4 hours of uninterrupted venue access prior to guest arrival.
    `,
    tags: ["vendors", "contracts", "milestones", "headcount", "vendor-meals", "load-in"],
  },
  {
    id: "kb-birthday-milestones",
    category: "budget",
    topic: "Milestone Birthday Planning Principles",
    title: "Milestone Birthday (30th, 40th, 50th) Event Architecture",
    content: `
      Milestone birthdays prioritize high-impact experiential hospitality over formal ceremony:
      - Budget Distribution: 45% Specialty Venue & Curated Mixology/Catering, 20% Live Entertainment/DJ/Immersive Performers, 15% Scenic Decor & Photo-Ops, 10% Custom Desserts/Champagne Tower, 10% Photography.
      - Key Highlight: The Retrospective Moment — scheduled 1.5 hours into the event where a 5-minute curated video/speech homage occurs accompanied by a signature toast.
      - Guest Flow: Keep seating 60% lounge/cocktail style and 40% seated to maintain fluid socializing and active dance floor momentum.
    `,
    tags: ["birthday", "milestone", "speakeasy", "cocktail", "lounge"],
  },
  {
    id: "kb-community-galas",
    category: "permits",
    topic: "Community & Civic Event Logistics",
    title: "Community Fundraiser & Public Event Compliance Guidelines",
    content: `
      Community events have unique civic, municipal, and philanthropic constraints:
      - Municipal Permits: Park permits, amplified sound variances, street closure approvals, and temporary fire department inspection approvals must be submitted 60-90 days in advance.
      - Accessibility (ADA Compliance): Wheelchair accessible pathways, clear auditory sightlines, unisex ADA restrooms, and companion seating are mandatory.
      - Philanthropic Auction Logistics: Charity auctions require pre-registered mobile bidding or bidder paddle distribution at check-in, with credit card pre-authorization to maximize donor conversion.
      - Volunteer Management: Shift schedules must never exceed 3.5 hours per volunteer without a 30-minute relief rotation.
    `,
    tags: ["community", "charity", "gala", "permits", "ada", "auction"],
  },
  {
    id: "kb-dietary-etiquette",
    category: "etiquette",
    topic: "Dietary & Allergen Management Protocol",
    title: "High-Reliability Dietary & VIP Guest Care Protocol",
    content: `
      Preventing catering catastrophes and allergen emergencies:
      1. Mandatory Pre-Registration: Collect specific medical dietary needs (anaphylactic allergies vs lifestyle preferences) at the RSVP stage.
      2. Color-Coded Place Cards: Provide the banquet captain with discreet visual cues on place cards (e.g., subtle silver dot for gluten-free, emerald dot for vegan, navy dot for nut allergy).
      3. Kitchen Separation: For severe airborne or contact nut/shellfish allergies, obtain written confirmation from catering for isolated kitchen prep zones.
      4. Emergency Response Kit: The event coordinator's emergency kit must contain antihistamines, liquid bandages, sewing kits, stain removers, safety pins, and emergency contacts for the nearest hospital.
    `,
    tags: ["dietary", "allergens", "safety", "vip", "etiquette", "hospitality"],
  },
];

export function seedKnowledgeBase(): void {
  const db = getDb();
  const existing = db.prepare("SELECT COUNT(*) as count FROM knowledge_documents").get() as {
    count: number;
  };
  if (existing && existing.count > 0) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO knowledge_documents (id, category, topic, title, content, tags)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (const doc of EMBEDDED_KNOWLEDGE_BASE) {
      insert.run(
        doc.id,
        doc.category,
        doc.topic,
        doc.title,
        doc.content.trim(),
        JSON.stringify(doc.tags),
      );
    }
  });

  tx();
}
