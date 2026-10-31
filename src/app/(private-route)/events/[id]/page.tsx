"use client";

import { AiChatDrawer } from "@/components/ai-chat-drawer";
import { BudgetBreakdown } from "@/components/budget-breakdown";
import { GuestTracker } from "@/components/guest-tracker";
import { IdeasAndVowsStudio } from "@/components/ideas-and-vows";
import { TimelineView } from "@/components/timeline-view";
import { VendorChecklist } from "@/components/vendor-checklist";
import type {
  BudgetItemRecord,
  EventRecord,
  GuestRecord,
  IdeaRecord,
  TimelineItemRecord,
  VendorItemRecord,
} from "@/db/schema";
import { EVENT_PERSONAS } from "@/lib/ai/personas";
import { Button, Card, CardContent, Chip, Tab, TabList, TabPanel, Tabs } from "@heroui/react";
import { differenceInDays, parseISO } from "date-fns";
import {
  ArrowLeft,
  Bot,
  Calendar,
  DollarSign,
  Heart,
  Lightbulb,
  MapPin,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function EventCommandCenterPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItemRecord[]>([]);
  const [timelineItems, setTimelineItems] = useState<TimelineItemRecord[]>([]);
  const [vendorItems, setVendorItems] = useState<VendorItemRecord[]>([]);
  const [ideas, setIdeas] = useState<IdeaRecord[]>([]);
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  const loadEventData = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (!res.ok) {
        router.push("/");
        return;
      }
      const data = await res.json();
      setEvent(data.event);
      setBudgetItems(data.budgetItems || []);
      setTimelineItems(data.timelineItems || []);
      setVendorItems(data.vendorItems || []);
      setIdeas(data.ideas || []);
      setGuests(data.guests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [eventId, router]);

  useEffect(() => {
    loadEventData();
  }, [loadEventData]);

  async function handleDeleteEvent() {
    if (!confirm("Are you sure you want to delete this celebration? This action is permanent.")) {
      return;
    }
    try {
      await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  }

  if (loading || !event) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Sparkles className="w-8 h-8 animate-pulse text-rose-500" />
        <span className="text-xs text-muted">Loading celebration command center...</span>
      </div>
    );
  }

  const persona = EVENT_PERSONAS[event.vertical] || EVENT_PERSONAS.wedding;

  let daysRemaining = 0;
  try {
    const targetDate = parseISO(event.event_date);
    daysRemaining = differenceInDays(targetDate, new Date());
  } catch (_e) {
    daysRemaining = 0;
  }

  return (
    <div className="space-y-6">
      {/* Back & Command Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/" aria-label="Back to dashboard">
              <Button variant="ghost" isIconOnly size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Chip
              size="sm"
              variant="soft"
              color={
                event.vertical === "wedding"
                  ? "danger"
                  : event.vertical === "birthday"
                    ? "warning"
                    : "accent"
              }
              className="capitalize text-[10px] font-bold"
            >
              {event.vertical} Command Center
            </Chip>
            {daysRemaining > 0 ? (
              <Chip size="sm" variant="soft" color="default" className="text-[10px]">
                {daysRemaining} Days to Event
              </Chip>
            ) : (
              <Chip size="sm" variant="soft" color="success" className="text-[10px]">
                Event Active
              </Chip>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {event.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {event.event_date}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {event.guest_count} Planned Guests
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" className="shadow-md" onPress={() => setIsAiDrawerOpen(true)}>
            <Bot className="w-4 h-4" />
            Ask {persona.name} (AI Concierge)
          </Button>
          <Button
            isIconOnly
            variant="danger-soft"
            onPress={handleDeleteEvent}
            aria-label="Delete Event"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Theme & Advisory Banner */}
      <Card className="border border-border shadow-sm bg-surface">
        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] text-accent font-bold uppercase tracking-wider">
              Curated Aesthetic &amp; Theme
            </span>
            <p className="text-sm font-semibold text-foreground">{event.theme}</p>
          </div>
          <div className="text-xs text-muted max-w-md italic">
            &ldquo;{event.notes.split("\n")[0] || "Customized celebration blueprint active."}&rdquo;
          </div>
        </CardContent>
      </Card>

      {/* HeroUI v3 Tabs for the 5 Modules */}
      <Tabs defaultSelectedKey="budget" aria-label="Event Management Tabs">
        <TabList className="flex gap-6 border-b border-border pb-0">
          <Tab
            id="budget"
            className="cursor-pointer py-2.5 px-1 text-sm font-medium flex items-center gap-2 data-[selected=true]:text-rose-600 data-[selected=true]:border-b-2 data-[selected=true]:border-rose-600"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Budget Studio</span>
          </Tab>
          <Tab
            id="timeline"
            className="cursor-pointer py-2.5 px-1 text-sm font-medium flex items-center gap-2 data-[selected=true]:text-rose-600 data-[selected=true]:border-b-2 data-[selected=true]:border-rose-600"
          >
            <Calendar className="w-4 h-4 text-rose-600" />
            <span>Day-of Run of Show</span>
          </Tab>
          <Tab
            id="vendors"
            className="cursor-pointer py-2.5 px-1 text-sm font-medium flex items-center gap-2 data-[selected=true]:text-rose-600 data-[selected=true]:border-b-2 data-[selected=true]:border-rose-600"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Vendor HQ</span>
          </Tab>
          <Tab
            id="guests"
            className="cursor-pointer py-2.5 px-1 text-sm font-medium flex items-center gap-2 data-[selected=true]:text-rose-600 data-[selected=true]:border-b-2 data-[selected=true]:border-rose-600"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Guest &amp; Dietary</span>
          </Tab>
          <Tab
            id="ideas"
            className="cursor-pointer py-2.5 px-1 text-sm font-medium flex items-center gap-2 data-[selected=true]:text-rose-600 data-[selected=true]:border-b-2 data-[selected=true]:border-rose-600"
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Ideas &amp; Vow Studio</span>
          </Tab>
        </TabList>

        <TabPanel id="budget">
          <div className="pt-4">
            <BudgetBreakdown
              eventId={event.id}
              targetBudget={event.target_budget}
              initialItems={budgetItems}
              onRefresh={loadEventData}
            />
          </div>
        </TabPanel>

        <TabPanel id="timeline">
          <div className="pt-4">
            <TimelineView
              eventId={event.id}
              initialItems={timelineItems}
              onRefresh={loadEventData}
            />
          </div>
        </TabPanel>

        <TabPanel id="vendors">
          <div className="pt-4">
            <VendorChecklist
              eventId={event.id}
              initialItems={vendorItems}
              onRefresh={loadEventData}
            />
          </div>
        </TabPanel>

        <TabPanel id="guests">
          <div className="pt-4">
            <GuestTracker
              eventId={event.id}
              initialGuests={guests}
              targetGuestCount={event.guest_count}
              onRefresh={loadEventData}
            />
          </div>
        </TabPanel>

        <TabPanel id="ideas">
          <div className="pt-4">
            <IdeasAndVowsStudio
              eventId={event.id}
              ideas={ideas}
              eventTitle={event.title}
              vertical={event.vertical}
            />
          </div>
        </TabPanel>
      </Tabs>

      {/* AI Drawer */}
      <AiChatDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        eventId={event.id}
        personaName={persona.name}
        personaTitle={persona.title}
        starterSuggestions={persona.starterSuggestions}
      />
    </div>
  );
}
