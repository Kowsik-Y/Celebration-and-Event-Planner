import { z } from "zod";

export const EventVerticalSchema = z.enum(["wedding", "birthday", "community"]);

export const BudgetItemSchema = z.object({
  category: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Item name is required"),
  estimatedCost: z.number().nonnegative("Estimated cost must be positive"),
  notes: z.string().default(""),
});

export const TimelineItemSchema = z.object({
  timeStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM format"),
  timeEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM format"),
  phase: z.string().min(1, "Phase is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""),
  responsibleParty: z.string().default("Coordinator"),
  orderIndex: z.number().int().default(1),
});

export const VendorItemSchema = z.object({
  category: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Vendor name is required"),
  contactEmail: z.string().optional().default(""),
  contactPhone: z.string().optional().default(""),
  price: z.number().nonnegative().default(0),
  deadlineOffsetDays: z.number().int().default(90),
  notes: z.string().optional().default(""),
});

export const IdeaItemSchema = z.object({
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  aestheticTags: z.array(z.string()).default([]),
  aiRationale: z.string().default(""),
});

export const GeneratedEventBlueprintSchema = z.object({
  title: z.string(),
  themeSummary: z.string(),
  curatedColorPalette: z.array(z.string()),
  targetBudget: z.number().positive(),
  guestCount: z.number().int().positive(),
  contingencyReserve: z.number().positive(),
  budgetBreakdown: z.array(BudgetItemSchema),
  runOfShowTimeline: z.array(TimelineItemSchema),
  vendorChecklist: z.array(VendorItemSchema),
  personalizedIdeas: z.array(IdeaItemSchema),
  logisticsAdvice: z.string(),
});

export type GeneratedEventBlueprint = z.infer<typeof GeneratedEventBlueprintSchema>;

export const CreateEventInputSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  vertical: EventVerticalSchema,
  targetBudget: z.number().min(500, "Minimum budget is $500"),
  guestCount: z.number().int().min(1, "Must have at least 1 guest"),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  location: z.string().min(2, "Location is required"),
  theme: z.string().min(2, "Theme or style description is required"),
  notes: z.string().optional().default(""),
});

export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;

export const VowSpeechGenerationSchema = z.object({
  speakerRole: z.string().min(1),
  tone: z.enum(["romantic", "humorous", "poetic", "sentimental", "celebratory"]),
  keyMemories: z.string().min(3),
  promisesOrWishes: z.string().min(3),
  insideJokesOrAnecdotes: z.string().optional().default(""),
});

export const ChatMessageInputSchema = z.object({
  eventId: z.string().min(1),
  message: z.string().min(1, "Message cannot be empty"),
});
