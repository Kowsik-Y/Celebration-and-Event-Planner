import fs from "node:fs";
import path from "node:path";
import { hashPassword } from "@/lib/auth/security";
import Database from "better-sqlite3";

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "events.sqlite");

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  initializeSchema(db);
  seedInitialData(db);

  dbInstance = db;
  return dbInstance;
}

function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('planner', 'couple', 'host', 'admin')),
      avatar_url TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      user_id TEXT DEFAULT 'usr_planner_elena',
      title TEXT NOT NULL,
      vertical TEXT NOT NULL CHECK(vertical IN ('wedding', 'birthday', 'community')),
      target_budget REAL NOT NULL DEFAULT 0,
      total_spent REAL NOT NULL DEFAULT 0,
      guest_count INTEGER NOT NULL DEFAULT 0,
      event_date TEXT NOT NULL,
      location TEXT NOT NULL,
      theme TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budget_items (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      estimated_cost REAL NOT NULL DEFAULT 0,
      actual_cost REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('planned', 'booked', 'paid')),
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS timeline_items (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      time_start TEXT NOT NULL,
      time_end TEXT NOT NULL,
      phase TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      responsible_party TEXT NOT NULL DEFAULT '',
      is_completed INTEGER NOT NULL DEFAULT 0,
      order_index INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS vendor_items (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      contact_email TEXT NOT NULL DEFAULT '',
      contact_phone TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK(status IN ('researching', 'contacted', 'quoted', 'hired', 'declined')),
      price REAL NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      deadline_offset_days INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ideas (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      aesthetic_tags TEXT NOT NULL DEFAULT '',
      ai_rationale TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      rsvp_status TEXT NOT NULL CHECK(rsvp_status IN ('attending', 'declined', 'pending')),
      dietary_restrictions TEXT NOT NULL DEFAULT '',
      table_number TEXT NOT NULL DEFAULT 'Unassigned',
      plus_ones INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS event_memories (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      message TEXT NOT NULL,
      intent TEXT NOT NULL DEFAULT 'general',
      context_snapshot TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS knowledge_documents (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      topic TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_budget_event ON budget_items(event_id);
    CREATE INDEX IF NOT EXISTS idx_timeline_event ON timeline_items(event_id, order_index);
    CREATE INDEX IF NOT EXISTS idx_vendor_event ON vendor_items(event_id);
    CREATE INDEX IF NOT EXISTS idx_guests_event ON guests(event_id);
    CREATE INDEX IF NOT EXISTS idx_memories_event ON event_memories(event_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  try {
    const columns = db.pragma("table_info(events)") as Array<{ name: string }>;
    const hasUserId = columns.some((col) => col.name === "user_id");
    if (!hasUserId) {
      db.exec("ALTER TABLE events ADD COLUMN user_id TEXT DEFAULT 'usr_planner_elena'");
    }
  } catch (_e) {
    // Column might already exist
  }
}

function seedDemoUsers(db: Database.Database): void {
  const existingUser = db.prepare("SELECT id FROM users LIMIT 1").get();
  if (existingUser) {
    return;
  }

  const now = new Date().toISOString();
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, salt, role, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const demoUsers = [
    {
      id: "usr_planner_elena",
      name: "Elena Rostova",
      email: "planner@celebrate.ai",
      password: "Planner123!",
      role: "planner",
      avatar_url:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr_couple_sofia",
      name: "Sofia & Matteo Rossi",
      email: "couple@celebrate.ai",
      password: "Wedding123!",
      role: "couple",
      avatar_url:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr_host_marcus",
      name: "Marcus Vance",
      email: "host@celebrate.ai",
      password: "Community123!",
      role: "host",
      avatar_url:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr_admin_alexander",
      name: "Alexander Cruz",
      email: "admin@celebrate.ai",
      password: "Admin123!",
      role: "admin",
      avatar_url:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  ];

  for (const u of demoUsers) {
    const { hash, salt } = hashPassword(u.password);
    insertUser.run(u.id, u.name, u.email, hash, salt, u.role, u.avatar_url, now);
  }
}

function seedInitialData(db: Database.Database): void {
  seedDemoUsers(db);
  const existingEvent = db.prepare("SELECT id FROM events LIMIT 1").get();
  if (existingEvent) {
    return;
  }

  const now = new Date().toISOString();
  const weddingId = "evt-wedding-amalfi";

  // Insert Flagship Wedding Event
  db.prepare(`
    INSERT INTO events (id, title, vertical, target_budget, total_spent, guest_count, event_date, location, theme, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    weddingId,
    "Villa Cimbrone Destination Wedding",
    "wedding",
    65000,
    38450,
    110,
    "2026-09-18",
    "Ravello, Amalfi Coast, Italy",
    "Italian Riviera Elegance & Olive Groves",
    "Sunset cliffside ceremony with candlelight dinner and live jazz trio.",
    now,
    now,
  );

  // Seed Budget Items
  const insertBudget = db.prepare(`
    INSERT INTO budget_items (id, event_id, category, name, estimated_cost, actual_cost, status, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const budgetItems = [
    [
      "b-1",
      weddingId,
      "Venue & Lodging",
      "Villa Cimbrone Gardens & Suite",
      26000,
      26000,
      "paid",
      "Deposit and reservation confirmed",
    ],
    [
      "b-2",
      weddingId,
      "Catering & Wine",
      "Five-course Mediterranean tasting & Prosecco",
      16500,
      7500,
      "booked",
      "Tasting completed; 50% deposit paid",
    ],
    [
      "b-3",
      weddingId,
      "Photography & Video",
      "Cinematic duo (10hr coverage + drone)",
      6800,
      3400,
      "booked",
      "Contract signed",
    ],
    [
      "b-4",
      weddingId,
      "Floral & Decor",
      "Arches of white garden roses & olive branches",
      5200,
      1550,
      "booked",
      "Florist mockups approved",
    ],
    [
      "b-5",
      weddingId,
      "Entertainment & Music",
      "Acoustic strings ceremony + 5-piece evening band",
      4500,
      0,
      "planned",
      "Auditioning finalists",
    ],
    [
      "b-6",
      weddingId,
      "Attire & Beauty",
      "Custom tailoring & bridal beauty squad",
      3200,
      0,
      "planned",
      "Fittings scheduled",
    ],
    [
      "b-7",
      weddingId,
      "Contingency & Coordination",
      "On-site emergency fund & logistics coordinator",
      2800,
      0,
      "planned",
      "Buffer for weather transitions",
    ],
  ];

  for (const item of budgetItems) {
    insertBudget.run(...item, now);
  }

  // Seed Day-of Run of Show Timeline
  const insertTimeline = db.prepare(`
    INSERT INTO timeline_items (id, event_id, time_start, time_end, phase, title, description, responsible_party, is_completed, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const timelineItems = [
    [
      "t-1",
      weddingId,
      "10:00",
      "13:00",
      "prep",
      "Bridal & Groom Suite Preparations",
      "Hair, makeup, champagne toast, and stationery detail photos",
      "Beauty Squad & Lead Photographer",
      0,
      1,
    ],
    [
      "t-2",
      weddingId,
      "13:30",
      "14:45",
      "prep",
      "First Look & Panoramic Portraits",
      "Terrace of Infinity cliffside private reveal",
      "Photographer & Coordinator",
      0,
      2,
    ],
    [
      "t-3",
      weddingId,
      "15:30",
      "16:00",
      "ceremony",
      "Guest Arrival & Welcome Spritz",
      "Acoustic cello & violin playing classical arrangements",
      "Ushers & Villa Staff",
      0,
      3,
    ],
    [
      "t-4",
      weddingId,
      "16:00",
      "16:45",
      "ceremony",
      "Vow Exchange Ceremony",
      "Personal vows, ring exchange, and ceremonial olive tree blessing",
      "Officiant & Couple",
      0,
      4,
    ],
    [
      "t-5",
      weddingId,
      "16:45",
      "18:00",
      "cocktail",
      "Golden Hour Aperitivo & Canapés",
      "Artisanal cheeses, Neapolitan bites, sunset photo transitions",
      "Catering Team",
      0,
      5,
    ],
    [
      "t-6",
      weddingId,
      "18:30",
      "20:30",
      "reception",
      "Seated Gala Dinner & Toasts",
      "Four-course dinner, maid of honor & best man speeches",
      "Maître D & Emcee",
      0,
      6,
    ],
    [
      "t-7",
      weddingId,
      "20:30",
      "21:00",
      "reception",
      "Millefoglie Cake Cutting & First Dance",
      "Show cooking pastry display accompanied by cold spark fountains",
      "Pâtissier & DJ",
      0,
      7,
    ],
    [
      "t-8",
      weddingId,
      "21:00",
      "01:00",
      "afterparty",
      "Live Band & Late Night Dance Party",
      "Gelato cart and espresso bar active until close",
      "Band & Bar Staff",
      0,
      8,
    ],
  ];

  for (const item of timelineItems) {
    insertTimeline.run(...item);
  }

  // Seed Vendor Items
  const insertVendor = db.prepare(`
    INSERT INTO vendor_items (id, event_id, category, name, contact_email, contact_phone, status, price, notes, deadline_offset_days)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const vendorItems = [
    [
      "v-1",
      weddingId,
      "Venue",
      "Villa Cimbrone Events Office",
      "events@villacimbrone.com",
      "+39 089 857459",
      "hired",
      26000,
      "Includes exclusive use of garden and terrace.",
      360,
    ],
    [
      "v-2",
      weddingId,
      "Catering",
      "Costiera Banqueting",
      "chef@costierabanqueting.it",
      "+39 089 872110",
      "hired",
      16500,
      "Gluten-free and vegan alternatives confirmed.",
      210,
    ],
    [
      "v-3",
      weddingId,
      "Photography",
      "Marco & Sofia Fine Art Film",
      "info@marcosofiafilm.com",
      "+39 340 1234567",
      "hired",
      6800,
      "Includes 800 hand-graded high-res stills + 4K film.",
      270,
    ],
    [
      "v-4",
      weddingId,
      "Floral",
      "Amalfi Botanical Artisans",
      "blooms@amalfibotanica.com",
      "+39 349 7654321",
      "hired",
      5200,
      "Arch install begins at 11:00 on event day.",
      120,
    ],
    [
      "v-5",
      weddingId,
      "Music / Band",
      "The Vesuvio Swing Ensemble",
      "booking@vesuvioswing.com",
      "+39 333 9988776",
      "contacted",
      4500,
      "Awaiting revised setlist contract.",
      90,
    ],
    [
      "v-6",
      weddingId,
      "Rentals",
      "Napoli Luxury Tableware",
      "rentals@napolilux.it",
      "+39 081 5543210",
      "quoted",
      2400,
      "Antique gold cutlery & linen chargers.",
      60,
    ],
  ];

  for (const item of vendorItems) {
    insertVendor.run(...item);
  }

  // Seed Personalized Ideas
  const insertIdea = db.prepare(`
    INSERT INTO ideas (id, event_id, category, title, description, aesthetic_tags, ai_rationale)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const ideas = [
    [
      "i-1",
      weddingId,
      "Guest Experience",
      "Limoncello Escort Tile Wall",
      "Hand-painted Vietri ceramic tiles doubled as escort cards with miniature bottles of organic Amalfi limoncello for each attendee.",
      "Ceramic, Coastal, Keepsake, Tuscan Yellow",
      "Combines local artisanal heritage with practical seating direction, giving guests an immediate keepsake.",
    ],
    [
      "i-2",
      weddingId,
      "Sensory Decor",
      "Sun-Dappled Olive & Lemon Canopy",
      "Suspended fresh lemon foliage intermingled with fairy lights above the long banquet tables to create an intimate aromatic canopy.",
      "Aromatic, Warm Glow, Botanical, Ambient",
      "Enhances the Mediterranean sensory experience while lowering tabletop floral clutter.",
    ],
    [
      "i-3",
      weddingId,
      "Culinary Ritual",
      "Live Millefoglie Assembly",
      "Head chef constructs a giant fresh berry and chantilly cream millefoglie cake in front of guests during the toast.",
      "Interactive, Culinary Theater, Crisp Pastry",
      "Creates unforgettable high-energy celebration theater and eliminates stale pre-sliced sheet cake.",
    ],
  ];

  for (const item of ideas) {
    insertIdea.run(...item);
  }

  // Seed Guests
  const insertGuest = db.prepare(`
    INSERT INTO guests (id, event_id, name, email, rsvp_status, dietary_restrictions, table_number, plus_ones)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const guests = [
    ["g-1", weddingId, "Elena Vance", "elena@vance.com", "attending", "None", "Table 1 (Honor)", 1],
    [
      "g-2",
      weddingId,
      "Marcus Thorne",
      "marcus@thorne.io",
      "attending",
      "Gluten-Free",
      "Table 1 (Honor)",
      0,
    ],
    [
      "g-3",
      weddingId,
      "Dr. Aris Thorne",
      "aris@med.org",
      "attending",
      "Shellfish Allergy",
      "Table 2 (Terrace)",
      1,
    ],
    [
      "g-4",
      weddingId,
      "Camila Rostova",
      "camila@rostova.art",
      "attending",
      "Vegan",
      "Table 3 (Olive Grove)",
      1,
    ],
    [
      "g-5",
      weddingId,
      "Julian Sterling",
      "julian@sterling.com",
      "pending",
      "None",
      "Unassigned",
      0,
    ],
    [
      "g-6",
      weddingId,
      "Lady Genevieve",
      "genevieve@heritage.uk",
      "declined",
      "None",
      "Unassigned",
      0,
    ],
  ];

  for (const item of guests) {
    insertGuest.run(...item);
  }

  // Seed Birthday Event Template
  const bdayId = "evt-bday-50th";
  db.prepare(`
    INSERT INTO events (id, title, vertical, target_budget, total_spent, guest_count, event_date, location, theme, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    bdayId,
    "Golden Jubilee 50th Milestone Gala",
    "birthday",
    22000,
    14200,
    75,
    "2026-11-14",
    "The Glasshouse Conservatory, Chicago",
    "Gilded Art Deco & Speakeasy Jazz",
    "Black-tie milestone celebration with retrospective photo gallery and custom mixology bar.",
    now,
    now,
  );

  // Seed Community Gala Template
  const commId = "evt-comm-tech-arts";
  db.prepare(`
    INSERT INTO events (id, title, vertical, target_budget, total_spent, guest_count, event_date, location, theme, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    commId,
    "Civic Arts & Culture Fundraiser Gala",
    "community",
    48000,
    21000,
    250,
    "2026-10-10",
    "Metropolitan Civic Center",
    "Urban Renaissance & Community Harmony",
    "Charity auction, municipal youth orchestra performance, and local chef showcase.",
    now,
    now,
  );
}
