"use client";

import { triggerCelebrationConfetti } from "@/components/celebration-fx";
import { EVENT_PERSONAS } from "@/lib/ai/personas";
import type { CreateEventInput } from "@/lib/ai/schemas";
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIndicator,
  AlertTitle,
  Button,
  Calendar,
  Card,
  CardContent,
  CardHeader,
  DateField,
  DatePicker,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewEventPage() {
  const router = useRouter();

  const [vertical, setVertical] = useState<"wedding" | "birthday" | "community">("wedding");
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState(55000);
  const [guests, setGuests] = useState(120);
  const [date, setDate] = useState("2026-10-15");
  const [location, setLocation] = useState("Napa Valley, California");
  const [theme, setTheme] = useState("Sun-Drenched Vineyard & Organic Modern Elegance");
  const [notes, setNotes] = useState(
    "Outdoor ceremony among the vines followed by barrel room dinner and acoustic strings.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activePersona = EVENT_PERSONAS[vertical];

  function applyPreset(presetType: "wedding" | "birthday" | "community") {
    setErrorMessage(null);
    if (presetType === "wedding") {
      setVertical("wedding");
      setTitle("Meadowood Vineyard Autumn Wedding");
      setBudget(70000);
      setGuests(130);
      setDate("2026-10-24");
      setLocation("St. Helena, Napa Valley, CA");
      setTheme("Wine Country Warmth, Terracotta & Olive Foliage");
      setNotes(
        "Late afternoon golden-hour ceremony with artisanal farm-to-table dinner and live brass band.",
      );
    } else if (presetType === "birthday") {
      setVertical("birthday");
      setTitle("The Golden Decade 40th Birthday Speakeasy");
      setBudget(25000);
      setGuests(80);
      setDate("2026-11-20");
      setLocation("The Vault Lounge, New York City");
      setTheme("1920s Gilded Speakeasy & Bespoke Mixology");
      setNotes(
        "Secret bookcase entrance, craft cocktail passport for guests, and vintage soul trio.",
      );
    } else {
      setVertical("community");
      setTitle("Downtown Riverfront Arts & Culture Fair");
      setBudget(45000);
      setGuests(300);
      setDate("2026-09-26");
      setLocation("Riverside Civic Amphitheater");
      setTheme("Community Harmony & Local Artisan Showcase");
      setNotes(
        "Charity silent auction, youth choir performance, food truck promenade, and wheelchair accessibility.",
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(`Consulting ${activePersona.name} and formulating domain blueprint...`);

    const payload: CreateEventInput = {
      title: title || `${theme} ${vertical === "wedding" ? "Wedding" : "Celebration"}`,
      vertical,
      targetBudget: budget,
      guestCount: guests,
      eventDate: date,
      location,
      theme,
      notes,
    };

    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.eventId) {
        setStatusMessage("Blueprint generated successfully! Finalizing database records...");
        triggerCelebrationConfetti();
        setTimeout(() => {
          router.push(`/events/${data.eventId}`);
        }, 800);
      } else {
        setErrorMessage(
          data.error || "Failed to generate event blueprint. Please review your inputs.",
        );
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        "Error contacting the planning server. Please check your connection and retry.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/" aria-label="Back to dashboard">
          <Button variant="ghost" isIconOnly size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Plan a New Celebration with Aria
          </h1>
          <p className="text-xs text-muted">
            Provide your event vision. Our GenAI orchestrator will generate a complete budget
            allocation, minute-by-minute timeline, and vendor checklist.
          </p>
        </div>
      </div>

      {errorMessage && (
        <Alert status="danger" className="border border-danger/20">
          <AlertIndicator />
          <AlertContent>
            <AlertTitle>Validation Notice</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      {/* Instant Presets Bar */}
      <Card className="border border-border shadow-sm bg-surface p-2">
        <CardContent className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Quick-Start Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onPress={() => applyPreset("wedding")}>
              Napa Vineyard Wedding
            </Button>
            <Button size="sm" variant="secondary" onPress={() => applyPreset("birthday")}>
              40th Speakeasy Birthday
            </Button>
            <Button size="sm" variant="secondary" onPress={() => applyPreset("community")}>
              Civic Arts Gala
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Wizard Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Vertical & Persona */}
        <Card className="border border-border shadow-sm bg-surface">
          <CardHeader className="p-5 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
              Step 1: Event Vertical &amp; Dedicated AI Concierge
            </h2>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["wedding", "birthday", "community"] as const).map((v) => {
                const persona = EVENT_PERSONAS[v];
                const isSelected = vertical === v;

                return (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setVertical(v)}
                    className="text-left w-full cursor-pointer focus:outline-none"
                  >
                    <Card
                      className={`border transition-all h-full ${
                        isSelected
                          ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                          : "border-border bg-surface hover:border-accent/40"
                      }`}
                    >
                      <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div>
                          <div className="text-2xl mb-1">{persona.avatar}</div>
                          <div className="font-bold text-sm text-foreground capitalize">{v}</div>
                          <div className="text-[11px] text-accent font-medium">{persona.name}</div>
                        </div>
                        <p className="text-[11px] text-muted mt-2 leading-relaxed">
                          {persona.tone}
                        </p>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Event Core Parameters */}
        <Card className="border border-border shadow-sm bg-surface">
          <CardHeader className="p-5 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
              Step 2: Core Parameters &amp; Logistics
            </h2>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-4">
            <TextField isRequired className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-muted">Celebration Title</Label>
              <Input
                placeholder="e.g. Villa Cimbrone Destination Wedding"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </TextField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField isRequired className="flex flex-col gap-1">
                <Label className="text-xs font-semibold text-muted">Target Budget ($)</Label>
                <Input
                  type="number"
                  placeholder="55000"
                  value={budget.toString()}
                  onChange={(e) => setBudget(Number(e.target.value) || 0)}
                />
              </TextField>

              <TextField isRequired className="flex flex-col gap-1">
                <Label className="text-xs font-semibold text-muted">Guest Count</Label>
                <Input
                  type="number"
                  placeholder="120"
                  value={guests.toString()}
                  onChange={(e) => setGuests(Number(e.target.value) || 0)}
                />
              </TextField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                name="eventDate"
                aria-label="Celebration Date"
                className="flex flex-col gap-1 w-full"
                value={(() => {
                  try {
                    return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? parseDate(date) : null;
                  } catch {
                    return null;
                  }
                })()}
                onChange={(newDate) => {
                  if (newDate) {
                    setDate(newDate.toString());
                  }
                }}
              >
                <Label className="text-xs font-semibold text-muted">Celebration Date</Label>
                <DateField.Group
                  fullWidth
                  className="bg-surface-secondary border border-border rounded-xl"
                >
                  <DateField.Input>
                    {(segment) => <DateField.Segment segment={segment} />}
                  </DateField.Input>
                  <DateField.Suffix>
                    <DatePicker.Trigger>
                      <DatePicker.TriggerIndicator />
                    </DatePicker.Trigger>
                  </DateField.Suffix>
                </DateField.Group>
                <DatePicker.Popover className="bg-surface border border-border shadow-2xl rounded-2xl p-2 z-50">
                  <Calendar aria-label="Celebration Date">
                    <Calendar.Header>
                      <Calendar.Heading />
                      <Calendar.NavButton slot="previous" />
                      <Calendar.NavButton slot="next" />
                    </Calendar.Header>
                    <Calendar.Grid>
                      <Calendar.GridHeader>
                        {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                      </Calendar.GridHeader>
                      <Calendar.GridBody>{(d) => <Calendar.Cell date={d} />}</Calendar.GridBody>
                    </Calendar.Grid>
                  </Calendar>
                </DatePicker.Popover>
              </DatePicker>

              <TextField isRequired className="flex flex-col gap-1">
                <Label className="text-xs font-semibold text-muted">Location / Destination</Label>
                <Input
                  placeholder="e.g. Ravello, Amalfi Coast, Italy"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </TextField>
            </div>

            <TextField isRequired className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-muted">
                Theme &amp; Aesthetic Style
              </Label>
              <Input
                placeholder="e.g. Italian Riviera Elegance, Olive Foliage, Candlelit Twilight"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </TextField>

            <TextField className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-muted">
                Special Notes, Priorities &amp; Traditions
              </Label>
              <TextArea
                placeholder="e.g. Sunset vows essential; gluten-free tasting menu; late-night gelato bar; speeches kept under 15 minutes."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </TextField>
          </CardContent>
        </Card>

        {/* Submit Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
          {statusMessage ? (
            <div className="text-xs text-accent font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{statusMessage}</span>
            </div>
          ) : (
            <span className="text-xs text-muted">
              It will run budget distribution algorithms and sequence your run-of-show.
            </span>
          )}

          <Button
            type="submit"
            size="lg"
            variant="primary"
            className="w-full sm:w-auto font-semibold"
            isPending={isSubmitting}
          >
            <Sparkles className="w-4 h-4" />
            Generate Event Plan
          </Button>
        </div>
      </form>
    </div>
  );
}
