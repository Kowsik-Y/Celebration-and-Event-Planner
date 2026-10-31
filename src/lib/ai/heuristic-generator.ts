import type { CreateEventInput, GeneratedEventBlueprint } from "./schemas";

/**
 * Mathematical domain heuristic generator.
 * Produces deterministic, zero-drift event blueprints conforming to
 * industry standards for weddings, birthdays, and community galas.
 *
 * Invariant: Sum of all items in budgetBreakdown EXACTLY equals targetBudget ($0 drift).
 * Invariant: Vendor checklist dynamically scales based on guestCount.
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
  // 8% mandatory contingency buffer
  const contingency = Math.round(budget * 0.08);
  const allocable = budget - contingency;

  // Proportions of allocable:
  const venue = Math.round(allocable * 0.26);
  const catering = Math.round(allocable * 0.24);
  const photo = Math.round(allocable * 0.14);
  const floral = Math.round(allocable * 0.12);
  const music = Math.round(allocable * 0.1);
  const attire = Math.round(allocable * 0.08);
  const coordination = Math.round(allocable * 0.04);
  const stationery =
    allocable - (venue + catering + photo + floral + music + attire + coordination);

  // Scalable vendor checklist based on guest count
  const vendors = [
    {
      category: "Venue",
      name: `Signature Wedding Villa & Grounds in ${location}`,
      contactEmail: "",
      contactPhone: "",
      price: venue,
      deadlineOffsetDays: 330,
      notes: "Lock date, verify rain plan tenting permits, and confirm 01:00 sound curfew",
    },
    {
      category: "Catering",
      name: `Artisanal Plated Dining ($${Math.round(catering / guests)}/guest)`,
      contactEmail: "",
      contactPhone: "",
      price: catering,
      deadlineOffsetDays: 240,
      notes: "Schedule private menu tasting; gather dietary allergy forms from all guests",
    },
    {
      category: "Photography",
      name: "Fine Art Duo (10-hr coverage, drone, 4K film)",
      contactEmail: "",
      contactPhone: "",
      price: photo,
      deadlineOffsetDays: 270,
      notes: "Confirm coverage hours, golden hour sunset timing, and second shooter contract",
    },
    {
      category: "Floral & Decor",
      name: "Botanical Floral Sculptor & Lighting",
      contactEmail: "",
      contactPhone: "",
      price: floral,
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
      name: "Lead Day-of Logistics Director",
      contactEmail: "",
      contactPhone: "",
      price: coordination,
      deadlineOffsetDays: 90,
      notes: "Review load-in schedule with all vendors and organize wedding rehearsal",
    },
  ];

  if (guests > 80) {
    vendors.push({
      category: "Guest Transport",
      name: "Executive Shuttles & Valet Dispatch",
      contactEmail: "",
      contactPhone: "",
      price: Math.round(budget * 0.03),
      deadlineOffsetDays: 60,
      notes: "Chartered transit between hotel blocks, ceremony chapel, and reception estate",
    });
  }

  if (guests > 150) {
    vendors.push({
      category: "Security & Safety",
      name: "Event Safety Officers & EMT First Aid Station",
      contactEmail: "",
      contactPhone: "",
      price: Math.round(budget * 0.02),
      deadlineOffsetDays: 45,
      notes: "Perimeter security, crowd flow oversight, and medical first-responder coverage",
    });
  }

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
        estimatedCost: venue,
        notes: "Exclusive access, dining pavilion, and bridal preparation suite",
      },
      {
        category: "Catering & Wine Service",
        name: `Plated Multi-Course Tasting ($${Math.round(catering / guests)}/guest)`,
        estimatedCost: catering,
        notes: "Cocktail canapés, 3-course dinner, premium wine pairings, and late-night snacks",
      },
      {
        category: "Photography & Cinematography",
        name: "Fine Art Duo (10-hr coverage, drone, 4K film)",
        estimatedCost: photo,
        notes: "Includes engagement session, full day coverage, and high-res highlight film",
      },
      {
        category: "Floral Design & Scenography",
        name: "Ceremony Arch, Tablescapes & Ambient Lighting",
        estimatedCost: floral,
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
        estimatedCost: attire,
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
        estimatedCost: stationery,
        notes: "Custom invitation suites, calligraphy place cards, and welcome signboards",
      },
      {
        category: "Emergency Contingency Reserve",
        name: "Protected 8% Contingency Reserve Fund",
        estimatedCost: contingency,
        notes:
          "Mandatory economic safeguard for last-minute headcount shifts or weather adjustments",
      },
    ],
    runOfShowTimeline: [
      {
        timeStart: "10:00",
        timeEnd: "13:30",
        phase: "Preparation",
        title: "Bridal Suite Hair, Makeup & Groom Squad Prep",
        description:
          "Glam squad styling, champagne toast, and detail photographer capturing invitation flatlays",
        responsibleParty: "Hair & Makeup Lead / Photographer",
        orderIndex: 1,
      },
      {
        timeStart: "13:30",
        timeEnd: "14:45",
        phase: "Photography",
        title: "Private 'First Look' & Romantic Couple Portraits",
        description:
          "Intimate couple reveal in villa gardens; wedding party photos captured before guest arrival",
        responsibleParty: "Lead Photographer",
        orderIndex: 2,
      },
      {
        timeStart: "15:00",
        timeEnd: "15:30",
        phase: "Arrival",
        title: "Guest Arrival, Welcome Refreshments & String Quartet",
        description:
          "Chilled prosecco and sparkling botanical water served as guests are seated to live strings",
        responsibleParty: "Banquet Lead & String Quartet",
        orderIndex: 3,
      },
      {
        timeStart: "15:30",
        timeEnd: "16:30",
        phase: "Ceremony",
        title: "Wedding Ceremony, Exchange of Vows & Rings",
        description:
          "Processional, personalized vows, ring exchange, and celebratory rose-petal recessional",
        responsibleParty: "Officiant & Logistics Director",
        orderIndex: 4,
      },
      {
        timeStart: "16:45",
        timeEnd: "18:15",
        phase: "Cocktails",
        title: "Sunset Cocktail Hour & Passed Canapés (Golden Hour)",
        description:
          "Golden hour sunset cocktails, acoustic jazz trio, and family group portraits in the olive grove",
        responsibleParty: "Caterer & Jazz Trio",
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
    vendorChecklist: vendors,
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
  const decor = Math.round(allocable * 0.14);
  const photo = Math.round(allocable * 0.1);
  const favors = allocable - (venueFood + entertainment + decor + photo);

  const venueShare = Math.round(venueFood * 0.5);
  const cateringShare = venueFood - venueShare;

  const vendors = [
    {
      category: "Venue",
      name: `Private Rooftop / Speakeasy in ${location}`,
      contactEmail: "",
      contactPhone: "",
      price: venueShare,
      deadlineOffsetDays: 90,
      notes: "Exclusive space buyout, audio/visual setup, and private bar team",
    },
    {
      category: "Catering & Bar",
      name: "Artisanal Grazing Stations & Mixology Bartenders",
      contactEmail: "",
      contactPhone: "",
      price: cateringShare,
      deadlineOffsetDays: 60,
      notes: "Curate 3 signature craft cocktails and savory tapas station",
    },
    {
      category: "Live Entertainment",
      name: "Soul/Funk Quartet & Headline DJ",
      contactEmail: "",
      contactPhone: "",
      price: entertainment,
      deadlineOffsetDays: 45,
      notes: "Cocktail hour live quartet transitioning into high-energy dance DJ",
    },
    {
      category: "Decor & Backdrops",
      name: "Custom Neon Typography & Floral Photo Wall",
      contactEmail: "",
      contactPhone: "",
      price: decor,
      deadlineOffsetDays: 30,
      notes: "Personalized milestone photo wall and ambient statement lighting",
    },
    {
      category: "Photography & Video",
      name: "Editorial Event Photographer + Reel Highlights",
      contactEmail: "",
      contactPhone: "",
      price: photo,
      deadlineOffsetDays: 30,
      notes: "Candidate candids, VIP red carpet step-and-repeat, and toast reel",
    },
  ];

  if (guests > 75) {
    vendors.push({
      category: "Event Production & Security",
      name: "Dedicated Event Host & Door Security",
      contactEmail: "",
      contactPhone: "",
      price: Math.round(budget * 0.04),
      deadlineOffsetDays: 21,
      notes: "Guest check-in registry, VIP wristbands, and flow control",
    });
  }

  return {
    title: title || `${theme} Milestone Celebration`,
    themeSummary: `A high-impact milestone birthday celebration in ${location} centered around "${theme}", planned for ${guests} guests.`,
    curatedColorPalette: ["#1A1A1A", "#D4AF37", "#8B0000", "#F5F5F5"],
    targetBudget: budget,
    guestCount: guests,
    contingencyReserve: contingency,
    budgetBreakdown: [
      {
        category: "Venue & Private Space",
        name: `Private Speakeasy / Rooftop Lounge in ${location}`,
        estimatedCost: venueShare,
        notes: "Exclusive buyout with ambient lighting and private bar service",
      },
      {
        category: "Catering & Signature Mixology",
        name: `Interactive Grazing Tables & Cocktails ($${Math.round(cateringShare / guests)}/guest)`,
        estimatedCost: cateringShare,
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
        name: "Custom Neon Sign & Statement Photo Wall",
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
        category: "Specialty Dessert & Keepsakes",
        name: "Custom Multi-Tiered Cake & Keepsake Barware",
        estimatedCost: favors,
        notes: "Showstopper birthday cake reveal with sparklers and engraved rock glasses",
      },
      {
        category: "Emergency Contingency Reserve",
        name: "Protected 8% Contingency Reserve Fund",
        estimatedCost: contingency,
        notes:
          "Reserve buffer for last-minute guest additions, extended bar tabs, or venue overtime",
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
        phase: "Tribute",
        title: "Milestone Retrospective Video & Heartfelt Toasts",
        description: "Short highlight film of milestone memories followed by champagne toast",
        responsibleParty: "Host & AV Tech",
        orderIndex: 3,
      },
      {
        timeStart: "22:00",
        timeEnd: "22:20",
        phase: "Highlight",
        title: "Showstopper Birthday Cake Reveal & Sparklers",
        description:
          "Artisanal birthday cake brought out to fanfare music and indoor cold sparklers",
        responsibleParty: "Pastry Chef & DJ",
        orderIndex: 4,
      },
      {
        timeStart: "22:20",
        timeEnd: "02:00",
        phase: "Party",
        title: "DJ Ignition, Dance Floor & Late Night Mixology",
        description:
          "High energy dance floor with DJ, glow accessories, and signature espresso martinis",
        responsibleParty: "DJ & Bartenders",
        orderIndex: 5,
      },
    ],
    vendorChecklist: vendors,
    personalizedIdeas: [
      {
        category: "Interactive Bar",
        title: "Era-by-Era Cocktail Tasting Flight",
        description:
          "Three signature drinks celebrating the honoree's 20s, 30s, and current golden chapter.",
        aestheticTags: ["Mixology", "Nostalgia", "Interactive"],
        aiRationale: "Transforms drinking into an engaging narrative storytelling experience.",
      },
      {
        category: "Visual Tribute",
        title: "Retro Film Projection on Exposed Brick",
        description:
          "Silent loops of vintage family footage projected onto venue walls with soft ambient uplighting.",
        aestheticTags: ["Cinematic", "Sentimental", "Atmospheric"],
        aiRationale:
          "Evokes nostalgia and sparks spontaneous guest reminiscing without halting the party.",
      },
      {
        category: "Interactive Keepsake",
        title: "Audio Guestbook Rotary Telephone",
        description:
          "A vintage rotary phone where guests leave audio voicemails and celebratory well wishes.",
        aestheticTags: ["Vintage Tech", "Keepsake", "Memorable"],
        aiRationale:
          "Captures the laughter and energy of the night as an indelible audio treasure.",
      },
    ],
    logisticsAdvice:
      "Julian's Advisory: In milestone birthdays, never halt the music completely for long speeches. Keep toasts strictly under 15 minutes total, clustered right before the cake cutting to maintain dance floor momentum.",
  };
}

function generateCommunityBlueprint(
  title: string,
  budget: number,
  guests: number,
  location: string,
  theme: string,
): GeneratedEventBlueprint {
  const contingency = Math.round(budget * 0.08);
  const allocable = budget - contingency;

  const venuePermits = Math.round(allocable * 0.28);
  const catering = Math.round(allocable * 0.26);
  const avStaging = Math.round(allocable * 0.2);
  const marketingPrinting = Math.round(allocable * 0.12);
  const securityStaffing = allocable - (venuePermits + catering + avStaging + marketingPrinting);

  const vendors = [
    {
      category: "Municipal & Venue",
      name: `Civic Hall / Convention Center in ${location}`,
      contactEmail: "",
      contactPhone: "",
      price: venuePermits,
      deadlineOffsetDays: 120,
      notes: "ADA accessibility verification, municipal noise permit, and insurance riders",
    },
    {
      category: "Banquet Catering",
      name: "High-Volume Banquet Caterer & Table Service",
      contactEmail: "",
      contactPhone: "",
      price: catering,
      deadlineOffsetDays: 90,
      notes: "Plated gala dinner or heavy passed stations with clear allergen color coding",
    },
    {
      category: "AV & Technical Production",
      name: "Full Staging, Line-Array Audio & Multi-Cam Livestream",
      contactEmail: "",
      contactPhone: "",
      price: avStaging,
      deadlineOffsetDays: 60,
      notes: "High-definition projection screens, wireless podium mics, and live streaming",
    },
    {
      category: "Printing & Signage",
      name: "Sponsor Banners, Auction Catalogs & Badges",
      contactEmail: "",
      contactPhone: "",
      price: marketingPrinting,
      deadlineOffsetDays: 30,
      notes: "Sponsor step-and-repeat, printed auction catalog booklets, and attendee badges",
    },
    {
      category: "Event Staffing & Safety",
      name: "Professional Ushers, Security & Registration Team",
      contactEmail: "",
      contactPhone: "",
      price: securityStaffing,
      deadlineOffsetDays: 21,
      notes: "Guest check-in tablets, bag inspection, and crowd flow directors",
    },
  ];

  if (guests > 120) {
    vendors.push({
      category: "Charity Auctioneer",
      name: "Licensed Benefit Auctioneer & Emcee",
      contactEmail: "",
      contactPhone: "",
      price: Math.round(budget * 0.05),
      deadlineOffsetDays: 45,
      notes: "Fast-paced professional auctioneer to maximize live bidding and donations",
    });
  }

  return {
    title: title || `${theme} Civic & Community Gala`,
    themeSummary: `A large-scale community and civic gala in ${location} celebrating "${theme}", calibrated for ${guests} attendees.`,
    curatedColorPalette: ["#0F2027", "#203A43", "#2C5364", "#F4A261", "#FFFFFF"],
    targetBudget: budget,
    guestCount: guests,
    contingencyReserve: contingency,
    budgetBreakdown: [
      {
        category: "Venue Hire & Municipal Permits",
        name: `Civic Center / Auditorium in ${location}`,
        estimatedCost: venuePermits,
        notes: "Public assembly permits, facility rental, stage, and ADA compliance clearance",
      },
      {
        category: "Banquet Catering & Refreshments",
        name: `Plated Gala Dinner & Beverage Service ($${Math.round(catering / guests)}/guest)`,
        estimatedCost: catering,
        notes: "Multi-course banquet meal accommodating halal, kosher, and gluten-free diets",
      },
      {
        category: "Audio/Visual Staging & Livestream",
        name: "Broadcast-Grade Audio, Lighting & Dual Projection",
        estimatedCost: avStaging,
        notes: "Podium microphones, stage spot lighting, line-array speakers, and stream feed",
      },
      {
        category: "Sponsor Branding & Collateral",
        name: "Step-and-Repeat, Programs & Digital Display",
        estimatedCost: marketingPrinting,
        notes: "High-resolution printed program books, sponsor logo wall, and directional signs",
      },
      {
        category: "Security, Ushers & Event Staff",
        name: "Licensed Safety Personnel & Volunteer Coordination",
        estimatedCost: securityStaffing,
        notes: "Front-of-house ushers, EMT on standby, and security personnel",
      },
      {
        category: "Emergency Contingency Reserve",
        name: "Protected 8% Contingency Reserve Fund",
        estimatedCost: contingency,
        notes:
          "Contingency reserve for technical overages, last-minute municipal fees, or AV add-ons",
      },
    ],
    runOfShowTimeline: [
      {
        timeStart: "17:30",
        timeEnd: "18:45",
        phase: "Check-in",
        title: "Registration, Sponsor Step-and-Repeat & Silent Auction",
        description:
          "Guests receive printed badges, pose at sponsor banner, and place silent auction bids",
        responsibleParty: "Registration Lead & Ushers",
        orderIndex: 1,
      },
      {
        timeStart: "19:00",
        timeEnd: "19:25",
        phase: "Opening",
        title: "Civic Welcome, National Anthem & Keynote Address",
        description: "Official welcome remarks by organizers and inspirational keynote speech",
        responsibleParty: "Gala Chair & Emcee",
        orderIndex: 2,
      },
      {
        timeStart: "19:25",
        timeEnd: "20:30",
        phase: "Dinner",
        title: "Banquet Dinner Service & Musical Intermezzo",
        description:
          "Plated banquet served to all guests accompanied by live youth orchestra performance",
        responsibleParty: "Banquet Captain & AV Lead",
        orderIndex: 3,
      },
      {
        timeStart: "20:30",
        timeEnd: "21:15",
        phase: "Auction",
        title: "Live Charity Auction & Community Award Ceremony",
        description:
          "High-energy benefit auction followed by civic recognition awards presentation",
        responsibleParty: "Benefit Auctioneer & Emcee",
        orderIndex: 4,
      },
      {
        timeStart: "21:15",
        timeEnd: "22:00",
        phase: "Closing",
        title: "Final Tally Reveal, Sponsor Thanks & Networking",
        description:
          "Announcement of fundraising total, closing remarks, and dessert networking reception",
        responsibleParty: "All Committee Members",
        orderIndex: 5,
      },
    ],
    vendorChecklist: vendors,
    personalizedIdeas: [
      {
        category: "Community Engagement",
        title: "Interactive Impact Pledge Wall",
        description:
          "Attendees pin written pledges or donation leaves onto an artistic community tree mural.",
        aestheticTags: ["Civic", "Interactive", "Inspiring"],
        aiRationale:
          "Provides tangible communal visualization of collective philanthropic contribution.",
      },
      {
        category: "Sponsor Recognition",
        title: "Dynamic Digital Sponsor Hall of Fame",
        description:
          "LED screens dynamically displaying sponsor impact metrics, matching donations, and acknowledgments.",
        aestheticTags: ["Modern", "High-Tech", "High-Value"],
        aiRationale:
          "Delivers measurable value to institutional sponsors and encourages real-time bidding.",
      },
      {
        category: "Inclusivity",
        title: "Live Multilingual Audio Captioning",
        description:
          "Attendees scan a QR code to read live multilingual transcriptions and audio feeds on their devices.",
        aestheticTags: ["Accessible", "Universal Design", "Empowering"],
        aiRationale:
          "Ensures complete ADA compliance and cultural accessibility for all attendees.",
      },
    ],
    logisticsAdvice:
      "Maya's Advisory: Civic events require filing municipal permits at least 60–90 days in advance. Always conduct an ADA accessibility walkthrough to verify wheelchair ramps, accessible restroom paths, and service animal accommodations.",
  };
}
