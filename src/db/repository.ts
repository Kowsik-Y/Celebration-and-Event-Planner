import { getDb } from "./index";
import type {
  BudgetItemRecord,
  BudgetItemStatus,
  EventRecord,
  GuestRecord,
  IdeaRecord,
  RsvpStatus,
  SafeUser,
  TimelineItemRecord,
  UserRecord,
  UserRole,
  VendorItemRecord,
  VendorStatus,
} from "./schema";

export class EventRepository {
  static getAllEvents(): EventRecord[] {
    const db = getDb();
    return db.prepare("SELECT * FROM events ORDER BY created_at DESC").all() as EventRecord[];
  }

  static getEventById(id: string): EventRecord | null {
    const db = getDb();
    const event = db.prepare("SELECT * FROM events WHERE id = ?").get(id);
    return (event as EventRecord) || null;
  }

  static createEvent(data: {
    id: string;
    title: string;
    vertical: "wedding" | "birthday" | "community";
    target_budget: number;
    total_spent?: number;
    guest_count: number;
    event_date: string;
    location: string;
    theme: string;
    notes?: string;
  }): EventRecord {
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO events (id, title, vertical, target_budget, total_spent, guest_count, event_date, location, theme, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.id,
      data.title,
      data.vertical,
      data.target_budget,
      data.total_spent || 0,
      data.guest_count,
      data.event_date,
      data.location,
      data.theme,
      data.notes || "",
      now,
      now,
    );
    const created = EventRepository.getEventById(data.id);
    if (!created) {
      throw new Error(`Failed to create event with id ${data.id}`);
    }
    return created;
  }

  static deleteEvent(id: string): void {
    const db = getDb();
    db.prepare("DELETE FROM events WHERE id = ?").run(id);
  }

  // Budget Items
  static getBudgetItems(eventId: string): BudgetItemRecord[] {
    const db = getDb();
    return db
      .prepare("SELECT * FROM budget_items WHERE event_id = ? ORDER BY category ASC")
      .all(eventId) as BudgetItemRecord[];
  }

  static addBudgetItem(data: {
    id: string;
    event_id: string;
    category: string;
    name: string;
    estimated_cost: number;
    actual_cost?: number;
    status?: BudgetItemStatus;
    notes?: string;
  }): void {
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO budget_items (id, event_id, category, name, estimated_cost, actual_cost, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.id,
      data.event_id,
      data.category,
      data.name,
      data.estimated_cost,
      data.actual_cost || 0,
      data.status || "planned",
      data.notes || "",
      now,
    );
    EventRepository.recalculateEventSpent(data.event_id);
  }

  static updateBudgetItemStatus(id: string, status: BudgetItemStatus, actualCost?: number): void {
    const db = getDb();
    if (actualCost !== undefined) {
      db.prepare("UPDATE budget_items SET status = ?, actual_cost = ? WHERE id = ?").run(
        status,
        actualCost,
        id,
      );
    } else {
      db.prepare("UPDATE budget_items SET status = ? WHERE id = ?").run(status, id);
    }
    const item = db.prepare("SELECT event_id FROM budget_items WHERE id = ?").get(id) as
      | { event_id: string }
      | undefined;
    if (item) {
      EventRepository.recalculateEventSpent(item.event_id);
    }
  }

  static deleteBudgetItem(id: string): void {
    const db = getDb();
    const item = db.prepare("SELECT event_id FROM budget_items WHERE id = ?").get(id) as
      | { event_id: string }
      | undefined;
    db.prepare("DELETE FROM budget_items WHERE id = ?").run(id);
    if (item) {
      EventRepository.recalculateEventSpent(item.event_id);
    }
  }

  static recalculateEventSpent(eventId: string): void {
    const db = getDb();
    const sum = db
      .prepare(`
      SELECT SUM(actual_cost) as total
      FROM budget_items
      WHERE event_id = ?
    `)
      .get(eventId) as { total: number | null };

    const total = sum.total || 0;
    db.prepare("UPDATE events SET total_spent = ?, updated_at = ? WHERE id = ?").run(
      total,
      new Date().toISOString(),
      eventId,
    );
  }

  // Timeline Items
  static getTimelineItems(eventId: string): TimelineItemRecord[] {
    const db = getDb();
    return db
      .prepare(
        "SELECT * FROM timeline_items WHERE event_id = ? ORDER BY order_index ASC, time_start ASC",
      )
      .all(eventId) as TimelineItemRecord[];
  }

  static addTimelineItem(data: {
    id: string;
    event_id: string;
    time_start: string;
    time_end: string;
    phase: string;
    title: string;
    description?: string;
    responsible_party?: string;
    order_index?: number;
  }): void {
    const db = getDb();
    db.prepare(`
      INSERT INTO timeline_items (id, event_id, time_start, time_end, phase, title, description, responsible_party, is_completed, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      data.id,
      data.event_id,
      data.time_start,
      data.time_end,
      data.phase,
      data.title,
      data.description || "",
      data.responsible_party || "Coordinator",
      data.order_index || 99,
    );
  }

  static toggleTimelineItem(id: string, isCompleted: boolean): void {
    const db = getDb();
    db.prepare("UPDATE timeline_items SET is_completed = ? WHERE id = ?").run(
      isCompleted ? 1 : 0,
      id,
    );
  }

  static deleteTimelineItem(id: string): void {
    const db = getDb();
    db.prepare("DELETE FROM timeline_items WHERE id = ?").run(id);
  }

  // Vendor Items
  static getVendorItems(eventId: string): VendorItemRecord[] {
    const db = getDb();
    return db
      .prepare("SELECT * FROM vendor_items WHERE event_id = ? ORDER BY deadline_offset_days DESC")
      .all(eventId) as VendorItemRecord[];
  }

  static addVendorItem(data: {
    id: string;
    event_id: string;
    category: string;
    name: string;
    contact_email?: string;
    contact_phone?: string;
    status?: VendorStatus;
    price?: number;
    notes?: string;
    deadline_offset_days?: number;
  }): void {
    const db = getDb();
    db.prepare(`
      INSERT INTO vendor_items (id, event_id, category, name, contact_email, contact_phone, status, price, notes, deadline_offset_days)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.id,
      data.event_id,
      data.category,
      data.name,
      data.contact_email || "",
      data.contact_phone || "",
      data.status || "researching",
      data.price || 0,
      data.notes || "",
      data.deadline_offset_days || 90,
    );
  }

  static updateVendorStatus(id: string, status: VendorStatus): void {
    const db = getDb();
    db.prepare("UPDATE vendor_items SET status = ? WHERE id = ?").run(status, id);
  }

  static deleteVendorItem(id: string): void {
    const db = getDb();
    db.prepare("DELETE FROM vendor_items WHERE id = ?").run(id);
  }

  // Ideas & Moodboard
  static getIdeas(eventId: string): IdeaRecord[] {
    const db = getDb();
    return db.prepare("SELECT * FROM ideas WHERE event_id = ?").all(eventId) as IdeaRecord[];
  }

  static addIdea(data: {
    id: string;
    event_id: string;
    category: string;
    title: string;
    description: string;
    aesthetic_tags?: string;
    ai_rationale?: string;
  }): void {
    const db = getDb();
    db.prepare(`
      INSERT INTO ideas (id, event_id, category, title, description, aesthetic_tags, ai_rationale)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.id,
      data.event_id,
      data.category,
      data.title,
      data.description,
      data.aesthetic_tags || "",
      data.ai_rationale || "",
    );
  }

  // Guests
  static getGuests(eventId: string): GuestRecord[] {
    const db = getDb();
    return db
      .prepare("SELECT * FROM guests WHERE event_id = ? ORDER BY name ASC")
      .all(eventId) as GuestRecord[];
  }

  static addGuest(data: {
    id: string;
    event_id: string;
    name: string;
    email?: string;
    rsvp_status?: RsvpStatus;
    dietary_restrictions?: string;
    table_number?: string;
    plus_ones?: number;
  }): void {
    const db = getDb();
    db.prepare(`
      INSERT INTO guests (id, event_id, name, email, rsvp_status, dietary_restrictions, table_number, plus_ones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.id,
      data.event_id,
      data.name,
      data.email || "",
      data.rsvp_status || "pending",
      data.dietary_restrictions || "None",
      data.table_number || "Unassigned",
      data.plus_ones || 0,
    );
  }

  static updateGuestRsvp(id: string, status: RsvpStatus, dietary?: string, table?: string): void {
    const db = getDb();
    db.prepare(`
      UPDATE guests
      SET rsvp_status = ?,
          dietary_restrictions = COALESCE(?, dietary_restrictions),
          table_number = COALESCE(?, table_number)
      WHERE id = ?
    `).run(status, dietary ?? null, table ?? null, id);
  }

  static deleteGuest(id: string): void {
    const db = getDb();
    db.prepare("DELETE FROM guests WHERE id = ?").run(id);
  }
}

export class UserRepository {
  static sanitizeUser(user: UserRecord): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    };
  }

  static getUserByEmail(email: string): UserRecord | null {
    const db = getDb();
    const normalized = email.trim().toLowerCase();
    const user = db.prepare("SELECT * FROM users WHERE LOWER(email) = ?").get(normalized);
    return (user as UserRecord) || null;
  }

  static getUserById(id: string): UserRecord | null {
    const db = getDb();
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    return (user as UserRecord) || null;
  }

  static getUserByRole(role: UserRole): UserRecord | null {
    const db = getDb();
    const user = db.prepare("SELECT * FROM users WHERE role = ? LIMIT 1").get(role);
    return (user as UserRecord) || null;
  }

  static getAllDemoUsers(): SafeUser[] {
    const db = getDb();
    const users = db
      .prepare("SELECT id, name, email, role, avatar_url, created_at FROM users")
      .all() as SafeUser[];
    return users;
  }
}
