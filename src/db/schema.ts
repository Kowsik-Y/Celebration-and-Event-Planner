export type EventVertical = "wedding" | "birthday" | "community";

export type BudgetItemStatus = "planned" | "booked" | "paid";

export type VendorStatus = "researching" | "contacted" | "quoted" | "hired" | "declined";

export type RsvpStatus = "attending" | "declined" | "pending";

export type UserRole = "planner" | "couple" | "host" | "admin";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  salt: string;
  role: UserRole;
  avatar_url: string;
  created_at: string;
}

export type SafeUser = Omit<UserRecord, "password_hash" | "salt">;

export interface EventRecord {
  id: string;
  user_id?: string;
  title: string;
  vertical: EventVertical;
  target_budget: number;
  total_spent: number;
  guest_count: number;
  event_date: string;
  location: string;
  theme: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetItemRecord {
  id: string;
  event_id: string;
  category: string;
  name: string;
  estimated_cost: number;
  actual_cost: number;
  status: BudgetItemStatus;
  notes: string;
  created_at: string;
}

export interface TimelineItemRecord {
  id: string;
  event_id: string;
  time_start: string;
  time_end: string;
  phase: string;
  title: string;
  description: string;
  responsible_party: string;
  is_completed: number; // 0 or 1
  order_index: number;
}

export interface VendorItemRecord {
  id: string;
  event_id: string;
  category: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  status: VendorStatus;
  price: number;
  notes: string;
  deadline_offset_days: number;
}

export interface IdeaRecord {
  id: string;
  event_id: string;
  category: string;
  title: string;
  description: string;
  aesthetic_tags: string; // JSON string or comma-separated
  ai_rationale: string;
}

export interface GuestRecord {
  id: string;
  event_id: string;
  name: string;
  email: string;
  rsvp_status: RsvpStatus;
  dietary_restrictions: string;
  table_number: string;
  plus_ones: number;
}

export interface EventMemoryRecord {
  id: string;
  event_id: string;
  role: "user" | "assistant" | "system";
  message: string;
  intent: string;
  context_snapshot: string; // JSON
  created_at: string;
}

export interface KnowledgeDocRecord {
  id: string;
  category: string;
  topic: string;
  title: string;
  content: string;
  tags: string;
}
