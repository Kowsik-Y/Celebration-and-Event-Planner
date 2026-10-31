"use client";

import type { EventRecord } from "@/db/schema";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Chip,
  ProgressBar,
} from "@heroui/react";
import { ArrowRight, BookOpen, Calendar, Coins, MapPin, Plus, Users } from "lucide-react";
import Link from "next/link";

interface DashboardViewProps {
  events: EventRecord[];
}

export function DashboardView({ events }: DashboardViewProps) {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-neutral-900 via-neutral-900 to-rose-950 text-white p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium">
            <span>AI Planning Assistant with Context Memory &amp; RAG Knowledge</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Flawless Celebrations Built on{" "}
            <span className="bg-linear-to-r from-amber-200 via-rose-300 to-amber-400 bg-clip-text text-transparent">
              Ruthless Logistics.
            </span>
          </h1>

          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            Meet <strong>Aria</strong>, your AI concierge and logistics director. Powered by HeroUI
            v3 and Google ADK Multi-Agent Orchestration.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/events/new">
              <Button
                size="lg"
                className="bg-linear-to-r from-rose-600 to-amber-600 text-white font-semibold shadow-lg shadow-rose-600/30"
              >
                <Plus className="w-5 h-5" />
                Plan New Event with Aria
              </Button>
            </Link>
            <Link href="/events/evt-wedding-amalfi">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Explore Amalfi Wedding Demo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border shadow-sm p-2 bg-surface">
          <CardContent className="gap-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Calibrated Budget Economics</h2>
            <p className="text-xs text-muted leading-relaxed">
              Standard 8-10% contingency protection and percentage allocation models for F&amp;B,
              venue, photo/video, and scenography.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm p-2 bg-surface">
          <CardContent className="gap-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Run of Show Sequencer</h2>
            <p className="text-xs text-muted leading-relaxed">
              Minute-by-minute day-of schedules with golden-hour sunset alignment, guest transition
              buffers, and noise curfews.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm p-2 bg-surface">
          <CardContent className="gap-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Google ADK &amp; Genkit RAG</h2>
            <p className="text-xs text-muted leading-relaxed">
              Multi-Agent collaboration with dedicated Budget and Timeline Specialists plus
              real-time WebSocket verbose execution streaming.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Events Directory */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Your Active Event Command Centers
            </h2>
            <p className="text-xs text-muted">
              Select an event to access its budget studio, run of show, vendor pipeline, and guest
              tracker.
            </p>
          </div>
          <Link href="/events/new">
            <Button size="sm" variant="secondary">
              <Plus className="w-4 h-4" />
              New Event
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((evt) => {
            const percentSpent = Math.min(
              100,
              Math.round((evt.total_spent / evt.target_budget) * 100),
            );

            return (
              <Card
                key={evt.id}
                className="border border-border shadow-sm bg-surface hover:border-accent/40 hover:shadow-md transition-all text-left flex flex-col justify-between"
              >
                <CardHeader className="p-5 pb-2 flex justify-between items-start">
                  <div>
                    <Chip
                      size="sm"
                      variant="soft"
                      color={
                        evt.vertical === "wedding"
                          ? "danger"
                          : evt.vertical === "birthday"
                            ? "warning"
                            : "accent"
                      }
                      className="capitalize font-semibold text-[10px] mb-2"
                    >
                      {evt.vertical}
                    </Chip>
                    <h3 className="text-base font-bold text-foreground line-clamp-1">
                      {evt.title}
                    </h3>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-1 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-muted" />
                      <span>{evt.event_date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-muted" />
                      <span>{evt.guest_count} Guests</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">Spent / Target</span>
                      <span className="font-semibold text-foreground">
                        ${evt.total_spent.toLocaleString()} / ${evt.target_budget.toLocaleString()}
                      </span>
                    </div>
                    <ProgressBar value={percentSpent} aria-label="Spent progress" />
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0">
                  <Link
                    href={`/events/${evt.id}`}
                    className="flex justify-between items-center w-full text-xs text-accent font-semibold hover:underline"
                  >
                    <span>Open Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
