import type { CreateEventInput, GeneratedEventBlueprint } from "./schemas";

/**
 * Intelligent deterministic domain heuristic generator.
 * Produces realistic, mathematically sound event blueprints conforming to
 * industry standards for weddings, birthdays, and community galas.
 */
export function generateHeuristicBlueprint(input: CreateEventInput): GeneratedEventBlueprint {
  const { title, vertical, targetBudget, guestCount, location, theme } = input;

  if (vertical === "wedding") {
    return generateWeddingBlueprint(title, targetBudget, guestCount, location, theme);
  }
  if (vertical === "birthday") {
    return generateBirthdayBlueprint(title, targetBudget, guestCount, location, theme);
  }
  return generateCommunityBlueprint(title, targetBudget, guestCount, location, theme);
}

function generateWeddingBlueprint(
  title: string,
  budget: number,
  guests: number,
  location: string,
  theme: string,
): GeneratedEventBlueprint {
  const contingency = Math.round(budget * 0.08); // 8% contingency buffer
  const allocable = budget - contingency;

  // Fractions of allocable budget (summing to 100% of allocable):
  // Venue & Catering: 50% (46% of total)
  // Photography & Video: 13% (12% of total)
  // Floral & Decor: 11% (10% of total)
  // Music & Entertainment: 10% (9% of total)
  // Attire & Glam: 8% (7% of total)
  // Coordination & Staff: 5% (5% of total)
  // Stationery & Details: 3% (3% of total)

  const venueCatering = Math.round(allocable * 0.5);
  const photoVideo = Math.round(allocable * 0.13);
  const floralDecor = Math.round(allocable * 0.11);
  const music = Math.round(allocable * 0.1);
  const attireGlam = Math.round(allocable * 0.08);
  const coordination = Math.round(allocable * 0.05);
  const stationeryDetails =
    allocable - (venueCatering + photoVideo + floralDecor + music + attireGlam + coordination);

  return {
    title: title || `${theme} Wedding Celebration`,
    themeSummary: `A sophisticated, romantic wedding designed around "${theme}" in ${location}, calibrated for ${guests} guests.`,
    curatedColorPalette: ["#F4E8D7", "#C49A45", "#5C6B57", "#2D3748", "#FFFFFF"],
    targetBudget: budget,
    guestCount: guests,
    contingencyReserve: contingency,
    budgetBreakdown: [
      {
        category: "Venue & Reception Space",
        name: `Private Estate / Villa Hire in ${location}`,
        estimatedCost: Math.round(venueCatering * 0.55),
        notes: "Exclusive access, dining pavilion, and bridal preparation suite",
      },
      {
        category: "Catering & Wine Service",
        name: `Plated Multi-Course Tasting ($${Math.round((venueCatering * 0.45) / guests)}/guest)`,
        estimatedCost: Math.round(venueCatering * 0.45),
        notes: "Cocktail canapés, 3-course dinner, premium wine pairings, and late-night snacks",
      },
      {
        category: "Photography & Cinematography",
        name: "Fine Art Duo (10-hr coverage, drone, 4K film)",
        estimatedCost: photoVideo,
        notes: "Includes engagement session, full day coverage, and high-res highlight film",
      },
      {
        category: "Floral Design & Scenography",
        name: "Ceremony Arch, Tablescapes & Ambient Lighting",
        estimatedCost: floralDecor,
        notes: "Seasonal garden blooms, hanging floral installations, and warm fairy lights",
      },
      {
        category: "Music & Entertainment",
        name: "Acoustic Ceremony Strings + 6-Piece Dance Band",
        estimatedCost: music,
        notes: "Live string quartet for vows, smooth jazz for cocktails, energetic evening band",
      },
      {
        category: "Attire, Hair & Makeup",
        name: "Bridal Suite Styling & Groom Tailoring",
        estimatedCost: attireGlam,
        notes: "On-site hair and makeup artist squad plus custom formalwear fittings",
      },
      {
        category: "Planning & Coordination",
        name: "Lead Day-of Logistics Director & Assistants",
        estimatedCost: coordination,
        notes: "Timeline sequencing, vendor load-in management, and emergency response",
      },
      {
        category: "Stationery & Personal Touches",
        name: "Artisanal Letterpress Invitations & Keepsake Escort Cards",
        estimatedCost: stationeryDetails,
        notes: "Custom wax seals, calligraphed table menus, and welcome luggage tags",
      },
    ],
    runOfShowTimeline: [
      {
        timeStart: "10:00",
        timeEnd: "13:30",
        phase: "Preparation",
        title: "Glam & Bridal Suite Preparations",
        description: "Hair and makeup squad on-site; detail photos of rings, stationery, and dress",
        responsibleParty: "Beauty Team & Lead Photographer",
        orderIndex: 1,
      },
      {
        timeStart: "13:30",
        timeEnd: "14:45",
        phase: "Portraits",
        title: "First Look & Private Couple Portraits",
        description: "Intimate reveal before guests arrive, followed by wedding party group photos",
        responsibleParty: "Photographer & Coordinator",
        orderIndex: 2,
      },
      {
        timeStart: "15:30",
        timeEnd: "16:00",
        phase: "Arrival",
        title: "Guest Arrival & Welcome Refreshment",
        description: "Chilled Prosecco, sparkling botanical water, and live string quartet prelude",
        responsibleParty: "Catering Captain & Ushers",
        orderIndex: 3,
      },
      {
        timeStart: "16:00",
        timeEnd: "16:45",
        phase: "Ceremony",
        title: "Solemn Vow Exchange & Recessional",
        description: "Processional, personal vows, exchange of rings, and celebratory petal toss",
        responsibleParty: "Officiant & Couple",
        orderIndex: 4,
      },
      {
        timeStart: "16:45",
        timeEnd: "18:00",
        phase: "Cocktail",
        title: "Golden Hour Cocktail Reception & Canapés",
        description: "Passed hors d'oeuvres, signature cocktails, and golden-hour sunset portraits",
        responsibleParty: "Catering & Jazz Trio",
        orderIndex: 5,
      },
      {
        timeStart: "18:30",
        timeEnd: "20:30",
        phase: "Reception",
        title: "Grand Entrance, Seated Dinner & Heartfelt Toasts",
        description:
          "Plated multi-course dinner with speeches placed strategically between courses",
        responsibleParty: "Emcee & Banquet Captain",
        orderIndex: 6,
      },
      {
        timeStart: "20:30",
        timeEnd: "21:00",
        phase: "Celebration",
        title: "Cake Cutting, First Dance & Champagne Toast",
        description:
          "Artisanal cake cutting followed by the couple's first dance and parent dances",
        responsibleParty: "DJ / Band & Photographer",
        orderIndex: 7,
      },
      {
        timeStart: "21:00",
        timeEnd: "01:00",
        phase: "Afterparty",
        title: "High-Energy Dance Party & Late-Night Bites",
        description:
          "Dance floor ignition with live band, open bar, and savory midnight snack trays",
        responsibleParty: "Evening Band & Bartenders",
        orderIndex: 8,
      },
    ],
    vendorChecklist: [
      {
        category: "Venue",
        name: `Signature Wedding Venue in ${location}`,
        contactEmail: "",
        contactPhone: "",
        price: Math.round(venueCatering * 0.55),
        deadlineOffsetDays: 330,
        notes: "Lock date, verify rain plan tenting permits, and confirm 01:00 sound curfew",
      },
      {
        category: "Catering",
        name: "Artisanal Fine Dining & Wine Sommelier",
        contactEmail: "",
        contactPhone: "",
        price: Math.round(venueCatering * 0.45),
        deadlineOffsetDays: 240,
        notes: "Schedule private menu tasting; gather dietary allergy forms from all guests",
      },
      {
        category: "Photography",
        name: "Fine Art Film & Digital Photographer",
        contactEmail: "",
        contactPhone: "",
        price: photoVideo,
        deadlineOffsetDays: 270,
        notes: "Confirm coverage hours, golden hour sunset timing, and second shooter contract",
      },
      {
        category: "Floral & Decor",
        name: "Botanical Floral Sculptor",
        contactEmail: "",
        contactPhone: "",
        price: floralDecor,
        deadlineOffsetDays: 150,
        notes: "Approve tabletop centerpiece mockups and ceremony arch structural safety",
      },
      {
        category: "Music & Band",
        name: "Live Ceremony Strings & Evening Dance Ensemble",
        contactEmail: "",
        contactPhone: "",
        price: music,
        deadlineOffsetDays: 120,
        notes: "Submit ceremony walk-down songs and curated 'Do Not Play' list for party",
      },
      {
        category: "Coordination",
        name: "Day-of Logistics Director",
        contactEmail: "",
        contactPhone: "",
        price: coordination,
        deadlineOffsetDays: 90,
        notes: "Review load-in schedule with all vendors and organize wedding rehearsal",
      },
    ],
    personalizedIdeas: [
      {
        category: "Guest Welcome",
        title: "Sensory Welcome Lounge & Custom Scented Spritz",
        description:
          "Greet arriving guests with a botanical mist and personalized handwritten welcome notes highlighting local sights.",
        aestheticTags: ["Sensory", "Boutique", "Warmth"],
        aiRationale: "Sets an intimate, relaxed luxury tone before formal proceedings begin.",
      },
      {
        category: "Dinner Theater",
        title: "Candlelit Family-Style Antipasti Boards",
        description:
          "Kick off the meal with oversized wooden boards laden with local cheeses, figs, and cured meats to ignite table conversations.",
        aestheticTags: ["Convivial", "Rustic Luxury", "Culinary"],
        aiRationale: "Breaks dining awkwardness and encourages natural guest bonding immediately.",
      },
      {
        category: "Send-Off",
        title: "Cold-Spark Fountain Departure & Gelato Cart",
        description:
          "Conclude the celebration with cold spark fountains and a vintage gelato cart serving artisanal scoops as guests board shuttles.",
        aestheticTags: ["Spectacle", "Memorable", "Sweet Ending"],
        aiRationale:
          "Creates a stunning visual finale without the safety hazards of real fire sparklers.",
      },
    ],
    logisticsAdvice:
      "Aria's Advisory: In destination weddings, guest transportation is often the hidden bottleneck. Ensure chartered shuttles are reserved with staggered pick-up times, and always keep an unallocated 8% contingency fund for weather adjustments.",
  };
}

function generateBirthdayBlueprint(
  title: string,
  budget: number,
  guests: number,
  location: string,
  theme: string,
): GeneratedEventBlueprint {
  const contingency = Math.round(budget * 0.08);
  const allocable = budget - contingency;

  const venueFood = Math.round(allocable * 0.48);
  const entertainment = Math.round(allocable * 0.22);
  const decor = Math.round(allocable * 0.15);
  const photo = Math.round(allocable * 0.1);
  const favors = allocable - (venueFood + entertainment + decor + photo);

  return {
    title: title || `${theme} Milestone Celebration`,
    themeSummary: `A high-impact milestone birthday celebration in ${location} centered around "${theme}", planned for ${guests} guests.`,
    curatedColorPalette: ["#1A1A1A", "#D4AF37", "#8B0000", "#F5F5F5"],
    targetBudget: budget,
    guestCount: guests,
    contingencyReserve: contingency,
    budgetBreakdown: [
      {
        category: "Venue & Specialty Bar",
        name: `Private Speakeasy / Rooftop Lounge in ${location}`,
        estimatedCost: Math.round(venueFood * 0.5),
        notes: "Exclusive buyout with ambient lighting and private bar service",
      },
      {
        category: "Catering & Signature Mixology",
        name: "Interactive Grazing Tables & Curated Cocktails",
        estimatedCost: Math.round(venueFood * 0.5),
        notes: "Handcrafted signature cocktail flight named after honoree's life milestones",
      },
      {
        category: "Live Entertainment & DJ",
        name: "Soul/Funk Quartet transitioning into Prime DJ",
        estimatedCost: entertainment,
        notes: "Live musicians for cocktail hour, dynamic DJ for the late-night dance floor",
      },
      {
        category: "Immersive Decor & Backdrop",
        name: "Custom Neon Sign & Gilded Floral Wall",
        estimatedCost: decor,
        notes: "Photo-op statement wall with personalized retro typography",
      },
      {
        category: "Photography & Social Media Reel",
        name: "Editorial Event Photographer + Video Clips",
        estimatedCost: photo,
        notes: "Captures guest candids, red carpet arrivals, and the milestone toast",
      },
      {
        category: "Specialty Dessert & Favors",
        name: "Custom Multi-Tiered Cake & Keepsake Barware",
        estimatedCost: favors,
        notes: "Showstopper birthday cake reveal with sparklers and engraved rock glasses",
      },
    ],
    runOfShowTimeline: [
      {
        timeStart: "19:00",
        timeEnd: "20:15",
        phase: "Arrival",
        title: "VIP Cocktail Hour & Acoustic Jazz Lounge",
        description: "Welcome champagne tower, passed bites, and interactive photo booth",
        responsibleParty: "Bartenders & Photographer",
        orderIndex: 1,
      },
      {
        timeStart: "20:15",
        timeEnd: "21:30",
        phase: "Dining",
        title: "Chef's Grazing Stations & Social Dining",
        description: "Guests mingle freely around artisanal carving and gourmet tapas stations",
        responsibleParty: "Catering Staff",
        orderIndex: 2,
      },
      {
        timeStart: "21:30",
        timeEnd: "22:00",
        phase: "Milestone",
        title: "Retrospective Video Homage & Champagne Toast",
        description: "3-minute curated video roast/toast followed by celebratory words from VIPs",
        responsibleParty: "Emcee & Honoree",
        orderIndex: 3,
      },
      {
        timeStart: "22:00",
        timeEnd: "01:00",
        phase: "Party",
        title: "DJ Dance Ignition & Late-Night Dessert Bar",
        description: "Lights dim, bass rises, and dessert station opens with espresso martinis",
        responsibleParty: "DJ & Night Staff",
        orderIndex: 4,
      },
    ],
    vendorChecklist: [
      {
        category: "Venue",
        name: "Boutique Rooftop or Speakeasy",
        contactEmail: "",
        contactPhone: "",
        price: Math.round(venueFood * 0.5),
        deadlineOffsetDays: 120,
        notes: "Confirm sound permit and VIP security details",
      },
      {
        category: "Mixology & Catering",
        name: "Artisanal Cocktail Catering",
        contactEmail: "",
        contactPhone: "",
        price: Math.round(venueFood * 0.5),
        deadlineOffsetDays: 60,
        notes: "Finalize signature cocktail ingredients and glassware rentals",
      },
      {
        category: "Music",
        name: "Live Band & Club DJ",
        contactEmail: "",
        contactPhone: "",
        price: entertainment,
        deadlineOffsetDays: 45,
        notes: "Provide favorite eras playlist and milestone speech timing",
      },
    ],
    personalizedIdeas: [
      {
        category: "Cocktail Program",
        title: "Decade Cocktail Journey",
        description:
          "Offer 3 cocktails representing 3 influential decades or chapters of the celebrant's life.",
        aestheticTags: ["Cocktails", "Nostalgia", "Interactive"],
        aiRationale: "Provides a delightful storytelling hook for guests at the bar.",
      },
      {
        category: "Visual Theater",
        title: "Retro Vinyl Guestbook",
        description:
          "Guests sign gold-ink messages on vintage vinyl records that can later be framed.",
        aestheticTags: ["Music", "Vinyl", "Keepsake"],
        aiRationale: "More engaging and displayable than standard paper guestbooks.",
      },
    ],
    logisticsAdvice:
      "Julian's Advisory: Keep speech times under 12 minutes total to preserve the energy curve. Fluid cocktail-lounge seating keeps all 75 guests active and mingling.",
  };
}

function generateCommunityBlueprint(
  title: string,
  budget: number,
  guests: number,
  location: string,
  theme: string,
): GeneratedEventBlueprint {
  const contingency = Math.round(budget * 0.1);
  const allocable = budget - contingency;

  return {
    title: title || `${theme} Community Gala`,
    themeSummary: `A civic-oriented community fundraiser in ${location} celebrating "${theme}" for ${guests} attendees.`,
    curatedColorPalette: ["#003366", "#2B6CB0", "#E2E8F0", "#319795"],
    targetBudget: budget,
    guestCount: guests,
    contingencyReserve: contingency,
    budgetBreakdown: [
      {
        category: "Civic Hall & Facilities",
        name: `Municipal Center / Pavilion in ${location}`,
        estimatedCost: Math.round(allocable * 0.35),
        notes: "Rental permit, sanitation, security, and utility connections",
      },
      {
        category: "Community Hospitality",
        name: "Local Food Truck / Chef Collective Showcase",
        estimatedCost: Math.round(allocable * 0.32),
        notes: "Partnership with local independent food artisans ($ per meal ticket)",
      },
      {
        category: "Audio/Visual & Staging",
        name: "Public Address System, Staging & Lighting Rig",
        estimatedCost: Math.round(allocable * 0.15),
        notes: "Compliant audio gear, microphones, screens, and accessible stage ramp",
      },
      {
        category: "Permits, Insurance & Safety",
        name: "Municipal Event Permit & First Aid Station",
        estimatedCost: Math.round(allocable * 0.1),
        notes: "Fire marshal permit, public liability rider, and licensed EMT standby",
      },
      {
        category: "Signage & Wayfinding",
        name: "High-Contrast ADA Signage & Program Booklets",
        estimatedCost: Math.round(allocable * 0.08),
        notes: "Braille guides, directional banners, and QR-code mobile program",
      },
    ],
    runOfShowTimeline: [
      {
        timeStart: "16:00",
        timeEnd: "17:00",
        phase: "Check-in",
        title: "Community Welcome & Exhibition Walkthrough",
        description:
          "Registration check-in, donation paddle pickup, and local artisan booth viewing",
        responsibleParty: "Volunteer Lead",
        orderIndex: 1,
      },
      {
        timeStart: "17:00",
        timeEnd: "18:15",
        phase: "Keynote",
        title: "Civic Leaders Keynote & Youth Performance",
        description:
          "Opening addresses followed by a 20-minute municipal youth orchestra performance",
        responsibleParty: "Stage Manager",
        orderIndex: 2,
      },
      {
        timeStart: "18:15",
        timeEnd: "19:30",
        phase: "Fundraising",
        title: "Live Charity Auction & Grant Announcements",
        description: "Dynamic auctioneer conducts live bids with digital scoreboard updates",
        responsibleParty: "Auctioneer & Emcee",
        orderIndex: 3,
      },
      {
        timeStart: "19:30",
        timeEnd: "21:00",
        phase: "Celebration",
        title: "Community Feast & Local Band Finale",
        description: "Catered meal, awards distribution, and celebratory community dancing",
        responsibleParty: "Hospitality Lead",
        orderIndex: 4,
      },
    ],
    vendorChecklist: [
      {
        category: "Venue & Permits",
        name: "Municipal Parks & Recreation Department",
        contactEmail: "",
        contactPhone: "",
        price: Math.round(allocable * 0.35),
        deadlineOffsetDays: 90,
        notes: "Ensure amplified sound permit and insurance certificate are filed",
      },
      {
        category: "Staging & Sound",
        name: "Civic Sound & Rigging Co.",
        contactEmail: "",
        contactPhone: "",
        price: Math.round(allocable * 0.15),
        deadlineOffsetDays: 60,
        notes: "Confirm ADA wheelchair ramp access for the main stage",
      },
    ],
    personalizedIdeas: [
      {
        category: "Community Engagement",
        title: "Interactive Collective Mosaic Mural",
        description:
          "Each attendee places a painted ceramic tile into a 10-foot civic mural to be permanently mounted in the community hall.",
        aestheticTags: ["Civic", "Inclusive", "Artisanal"],
        aiRationale: "Provides a lasting communal footprint that outlives the single evening.",
      },
    ],
    logisticsAdvice:
      "Maya's Advisory: Ensure ADA-compliant parking and ramp access are clearly signposted. Volunteer shifts must be strictly capped at 3 hours to maintain high morale and safety.",
  };
}
