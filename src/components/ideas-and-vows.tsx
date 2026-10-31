"use client";

import { triggerCelebrationConfetti } from "@/components/celebration-fx";
import type { IdeaRecord } from "@/db/schema";
import {
  Accordion,
  AccordionHeading,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Select,
  SelectIndicator,
  SelectPopover,
  SelectTrigger,
  SelectValue,
  TextArea,
  TextField,
} from "@heroui/react";
import { BookOpen, Copy, HeartHandshake, Lightbulb, Sparkles } from "lucide-react";
import { useState } from "react";

interface IdeasAndVowsProps {
  eventId: string;
  ideas: IdeaRecord[];
  eventTitle: string;
  vertical: string;
}

export function IdeasAndVowsStudio({ eventId, ideas, eventTitle, vertical }: IdeasAndVowsProps) {
  // Vow form states
  const [role, setRole] = useState(
    vertical === "wedding" ? "Partner / Spouse" : "Celebrant / Host",
  );
  const [tone, setTone] = useState("romantic");
  const [memories, setMemories] = useState("");
  const [promises, setPromises] = useState("");
  const [humor, setHumor] = useState("");
  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerateSpeech() {
    if (!memories.trim() || !promises.trim()) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/ai/vows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          form: {
            speakerRole: role,
            tone,
            keyMemories: memories,
            promisesOrWishes: promises,
            insideJokesOrAnecdotes: humor,
          },
        }),
      });

      const data = await res.json();
      if (data.draft) {
        setDraft(data.draft);
        triggerCelebrationConfetti();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy() {
    if (!draft) return;
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      {/* Personalized Ideas Gallery */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-accent" />
            Curated Aesthetic Concepts &amp; Thematic Experiences
          </h3>
          <p className="text-xs text-muted">
            Tailored sensory, culinary, and decorative ideas customized for &ldquo;
            {eventTitle}&rdquo;.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ideas.map((idea) => {
            const tags = idea.aesthetic_tags
              ? idea.aesthetic_tags.split(",").map((t) => t.trim())
              : [];

            return (
              <Card
                key={idea.id}
                className="border border-border shadow-sm bg-surface hover:border-accent/40 transition-colors"
              >
                <CardHeader className="p-4 pb-2 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-accent font-semibold uppercase tracking-wider">
                      {idea.category}
                    </span>
                    <h4 className="text-sm font-bold text-foreground mt-0.5">{idea.title}</h4>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-1 flex flex-col justify-between">
                  <p className="text-xs text-muted leading-relaxed">{idea.description}</p>

                  <div className="mt-4 pt-3 border-t border-border space-y-2">
                    {idea.ai_rationale && (
                      <div className="text-[11px] text-muted italic">
                        &ldquo;{idea.ai_rationale}&rdquo;
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <Chip
                          key={tag}
                          size="sm"
                          variant="soft"
                          color="accent"
                          className="text-[10px] h-5"
                        >
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Vow & Speech Studio */}
      <Card className="border border-border shadow-sm bg-surface">
        <CardHeader className="p-4 flex-row border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Aria&apos;s Vow &amp; Speech Writing Studio
              </h3>
              <p className="text-xs text-muted">
                Craft emotionally resonant, beautifully paced personal vows or celebration toasts.
              </p>
            </div>
          </div>
          <Chip size="sm" color="accent" variant="soft">
            <Sparkles className="w-3 h-3 inline mr-1" />
            AI Speechwriter
          </Chip>
        </CardHeader>

        <CardContent className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Controls */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <TextField value={role} onChange={setRole} className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">Your Role</Label>
                  <Input placeholder="e.g. Groom, Bride, Best Man" />
                </TextField>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">Desired Tone</Label>
                  <Select
                    selectedKey={tone}
                    onSelectionChange={(k) => k && setTone(String(k))}
                    aria-label="Desired Tone"
                  >
                    <SelectTrigger className="w-full bg-surface-secondary border border-border text-foreground text-xs rounded-xl px-3 py-2 flex items-center justify-between">
                      <SelectValue />
                      <SelectIndicator className="w-4 h-4 ml-1 opacity-70" />
                    </SelectTrigger>
                    <SelectPopover className="bg-surface border border-border shadow-xl rounded-xl p-1 z-50">
                      <ListBox className="outline-none space-y-0.5">
                        <ListBoxItem
                          id="romantic"
                          textValue="Romantic & Deep"
                          className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                        >
                          Romantic &amp; Deep
                        </ListBoxItem>
                        <ListBoxItem
                          id="poetic"
                          textValue="Poetic & Lyrical"
                          className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                        >
                          Poetic &amp; Lyrical
                        </ListBoxItem>
                        <ListBoxItem
                          id="humorous"
                          textValue="Playful & Humorous"
                          className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                        >
                          Playful &amp; Humorous
                        </ListBoxItem>
                        <ListBoxItem
                          id="sentimental"
                          textValue="Sentimental"
                          className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                        >
                          Sentimental
                        </ListBoxItem>
                        <ListBoxItem
                          id="celebratory"
                          textValue="High Energy"
                          className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                        >
                          High Energy
                        </ListBoxItem>
                      </ListBox>
                    </SelectPopover>
                  </Select>
                </div>
              </div>

              <TextField value={memories} onChange={setMemories} className="space-y-1">
                <Label className="text-xs font-semibold text-muted">Key Shared Memories</Label>
                <TextArea
                  placeholder="e.g. Getting lost in Florence during the rainstorm; late-night talks on the roof..."
                  rows={2}
                />
              </TextField>

              <TextField value={promises} onChange={setPromises} className="space-y-1">
                <Label className="text-xs font-semibold text-muted">
                  Lifelong Promises / Hopes
                </Label>
                <TextArea
                  placeholder="e.g. I promise to listen with an open heart, to share the espresso, and never let you face a trial alone..."
                  rows={2}
                />
              </TextField>

              <TextField value={humor} onChange={setHumor} className="space-y-1">
                <Label className="text-xs font-semibold text-muted">
                  Inside Joke or Quirky Habit (Optional)
                </Label>
                <Input placeholder="e.g. Always stealing the last bite of tiramisu" />
              </TextField>

              <Button
                variant="primary"
                className="w-full font-medium"
                onPress={handleGenerateSpeech}
                isPending={generating}
              >
                <Sparkles className="w-4 h-4" />
                Compose Custom Draft
              </Button>
            </div>

            {/* Generated Output */}
            <div className="flex flex-col justify-between bg-surface-secondary border border-border rounded-xl p-4">
              <div>
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-border">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Generated Vow &amp; Toast Draft
                  </span>
                  {draft && (
                    <Button size="sm" variant="secondary" onPress={handleCopy}>
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  )}
                </div>

                {draft ? (
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-line font-serif italic">
                    {draft}
                  </p>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-muted">
                    <HeartHandshake className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-xs">
                      Fill out your memories and promises, then click &ldquo;Compose Custom
                      Draft&rdquo; to generate your speech.
                    </p>
                  </div>
                )}
              </div>

              {draft && (
                <div className="mt-4 pt-2 border-t border-border text-[11px] text-muted flex justify-between">
                  <span>Estimated Speaking Time: ~2.5 minutes</span>
                  <span>Paced for natural delivery</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RAG Knowledge Explorer Accordion */}
      <Card className="border border-border shadow-sm bg-surface">
        <CardHeader className="p-4 border-b border-border flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Aria&apos;s Verified Domain Knowledge Base (RAG)
            </h4>
            <p className="text-xs text-muted">
              Industry standards and benchmarks references to validate your event plan.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <Accordion className="space-y-2">
            <AccordionItem
              id="1"
              className="border border-border rounded-xl overflow-hidden bg-surface"
            >
              <AccordionHeading>
                <AccordionTrigger className="w-full text-left p-3.5 font-bold text-xs flex justify-between items-center cursor-pointer hover:bg-surface-secondary transition-colors">
                  <div>
                    <div className="text-foreground">
                      Standard Wedding Budget Distribution Benchmark
                    </div>
                    <div className="text-[11px] text-muted font-normal mt-0.5">
                      Industry percentage guidelines and contingency rules
                    </div>
                  </div>
                </AccordionTrigger>
              </AccordionHeading>
              <AccordionPanel className="p-3.5 pt-0 text-xs text-muted space-y-1.5 leading-relaxed">
                <p>
                  <strong>Venue &amp; F&amp;B:</strong> 42% - 48% (Includes room hire, meals, open
                  bar, service charges).
                </p>
                <p>
                  <strong>Photography &amp; Cinematography:</strong> 10% - 14% (10 hours coverage,
                  second shooter, drone).
                </p>
                <p>
                  <strong>Floral &amp; Scenography:</strong> 9% - 12% (Ceremony arch, tablescapes,
                  ambient lighting).
                </p>
                <p>
                  <strong>Music &amp; Entertainment:</strong> 7% - 10% (Ceremony strings, cocktail
                  jazz, evening band).
                </p>
                <p>
                  <strong>Unallocated Contingency:</strong> 8% - 10% mandatory reserve for
                  unexpected overtime or weather shifts.
                </p>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem
              id="2"
              className="border border-border rounded-xl overflow-hidden bg-surface"
            >
              <AccordionHeading>
                <AccordionTrigger className="w-full text-left p-3.5 font-bold text-xs flex justify-between items-center cursor-pointer hover:bg-surface-secondary transition-colors">
                  <div>
                    <div className="text-foreground">Day-of Run of Show Sequencing Rules</div>
                    <div className="text-[11px] text-muted font-normal mt-0.5">
                      Golden-hour timing, transition buffers, and curfew protocols
                    </div>
                  </div>
                </AccordionTrigger>
              </AccordionHeading>
              <AccordionPanel className="p-3.5 pt-0 text-xs text-muted space-y-1.5 leading-relaxed">
                <p>
                  <strong>Golden Hour Photography:</strong> Schedule ceremony 2 to 2.5 hours prior
                  to sunset to ensure optimal light.
                </p>
                <p>
                  <strong>The Transition Buffer:</strong> Moving 100+ guests between spaces requires
                  a minimum 15-minute scheduled buffer.
                </p>
                <p>
                  <strong>Dinner Duration:</strong> A seated 3-course dinner requires 90 minutes
                  minimum. Speeches should be dispersed between courses.
                </p>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem
              id="3"
              className="border border-border rounded-xl overflow-hidden bg-surface"
            >
              <AccordionHeading>
                <AccordionTrigger className="w-full text-left p-3.5 font-bold text-xs flex justify-between items-center cursor-pointer hover:bg-surface-secondary transition-colors">
                  <div>
                    <div className="text-foreground">
                      Dietary &amp; Allergen Management Protocol
                    </div>
                    <div className="text-[11px] text-muted font-normal mt-0.5">
                      Cross-contamination protocols and server indicator cards
                    </div>
                  </div>
                </AccordionTrigger>
              </AccordionHeading>
              <AccordionPanel className="p-3.5 pt-0 text-xs text-muted space-y-1.5 leading-relaxed">
                <p>
                  <strong>Color-Coded Place Cards:</strong> Use subtle indicators on place cards for
                  banquet servers (e.g. green dot for vegan, gold for gluten-free).
                </p>
                <p>
                  <strong>Emergency Kit:</strong> Coordinator must maintain an emergency kit with
                  antihistamines, liquid bandages, and safety pins.
                </p>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
