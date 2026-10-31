"use client";

import { triggerCelebrationConfetti } from "@/components/celebration-fx";
import type { TimelineItemRecord } from "@/db/schema";
import { generateCountdownMilestones } from "@/lib/countdown";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContainer,
  ModalDialog,
  ModalFooter,
  ModalHeader,
  ModalHeading,
  Select,
  SelectIndicator,
  SelectPopover,
  SelectTrigger,
  SelectValue,
  TextField,
} from "@heroui/react";
import { Calendar, CheckCircle2, Clock, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";

interface TimelineViewProps {
  eventId: string;
  initialItems: TimelineItemRecord[];
  eventDate?: string;
  vertical?: "wedding" | "birthday" | "community";
  onRefresh: () => void;
}

export function TimelineView({
  eventId,
  initialItems,
  eventDate = "2026-10-31",
  vertical = "wedding",
  onRefresh,
}: TimelineViewProps) {
  const [activeTab, setActiveTab] = useState<"countdown" | "runofshow">("countdown");
  const [items, setItems] = useState<TimelineItemRecord[]>(initialItems);
  const [completedMilestoneIds, setCompletedMilestoneIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const [newStart, setNewStart] = useState("16:00");
  const [newEnd, setNewEnd] = useState("16:45");
  const [newPhase, setNewPhase] = useState("Ceremony");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newResp, setNewResp] = useState("Coordinator");

  const completedCount = items.filter((i) => i.is_completed === 1).length;

  // Generate dynamic back-scheduled milestones based on event date
  const countdownMilestones = generateCountdownMilestones(
    eventDate,
    vertical,
    completedMilestoneIds,
  );
  const overdueCount = countdownMilestones.filter((m) => m.isOverdue).length;

  const handleToggleCountdownMilestone = (id: string) => {
    setCompletedMilestoneIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  async function handleToggle(itemId: string, currentState: number) {
    const nextState = currentState === 1 ? 0 : 1;
    try {
      await fetch(`/api/events/${eventId}/timeline`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, is_completed: nextState === 1 }),
      });
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, is_completed: nextState } : i)),
      );
      if (nextState === 1 && completedCount + 1 === items.length) {
        triggerCelebrationConfetti();
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(itemId: string) {
    try {
      await fetch(`/api/events/${eventId}/timeline?itemId=${itemId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdd() {
    if (!newTitle.trim() || !newStart || !newEnd) return;

    try {
      const res = await fetch(`/api/events/${eventId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time_start: newStart,
          time_end: newEnd,
          phase: newPhase,
          title: newTitle,
          description: newDesc,
          responsible_party: newResp,
          order_index: items.length + 1,
        }),
      });

      if (res.ok) {
        onClose();
        setNewTitle("");
        setNewDesc("");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Sub-view Switcher: Countdown Milestones vs Day-of Run-of-Show */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 p-1 bg-surface-secondary border border-border rounded-xl">
          <Button
            size="sm"
            variant={activeTab === "countdown" ? "primary" : "ghost"}
            onPress={() => setActiveTab("countdown")}
            className="text-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Preparation Countdown</span>
            {overdueCount > 0 && (
              <Chip size="sm" variant="primary" color="danger" className="text-[10px] h-4 px-1">
                {overdueCount} Overdue
              </Chip>
            )}
          </Button>
          <Button
            size="sm"
            variant={activeTab === "runofshow" ? "primary" : "ghost"}
            onPress={() => setActiveTab("runofshow")}
            className="text-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Day-of Run of Show</span>
            <Chip size="sm" variant="soft" color="accent" className="text-[10px] h-4 px-1">
              {completedCount}/{items.length}
            </Chip>
          </Button>
        </div>

        {activeTab === "runofshow" && (
          <Button size="sm" variant="primary" onPress={onOpen}>
            <Plus className="w-4 h-4" />
            Add Schedule Block
          </Button>
        )}
      </div>

      {/* VIEW 1: BACK-SCHEDULED COUNTDOWN MILESTONES */}
      {activeTab === "countdown" && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg border border-border bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                Reverse-Calculated Planning Milestones
              </h3>
              <p className="text-xs text-muted">
                Calculated backwards from event date ({eventDate}). Identifies overdue tasks
                requiring immediate attention.
              </p>
            </div>
            {overdueCount > 0 ? (
              <Chip size="sm" variant="soft" color="danger" className="text-xs font-bold">
                {overdueCount} Tasks Overdue (Action Needed)
              </Chip>
            ) : (
              <Chip size="sm" variant="soft" color="success" className="text-xs font-bold">
                All Milestones On Track
              </Chip>
            )}
          </div>

          <div className="space-y-3">
            {countdownMilestones.map((m) => {
              return (
                <Card
                  key={m.id}
                  className={`border transition-all shadow-sm ${
                    m.isCompleted
                      ? "opacity-60 bg-surface-secondary border-border"
                      : m.isOverdue
                        ? "border-red-500/50 bg-red-500/5"
                        : "border-border bg-surface"
                  }`}
                >
                  <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleCountdownMilestone(m.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          m.isCompleted
                            ? "bg-success border-success text-success-foreground"
                            : "bg-surface border-border hover:border-accent"
                        }`}
                        aria-label={`Mark ${m.title} as ${m.isCompleted ? "incomplete" : "complete"}`}
                      >
                        {m.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              m.isCompleted ? "line-through text-muted" : "text-foreground"
                            }`}
                          >
                            {m.title}
                          </span>
                          <Chip size="sm" variant="soft" color="default" className="text-[10px]">
                            {m.phase}
                          </Chip>
                          {m.offsetDays > 0 ? (
                            <span className="text-[11px] font-mono text-muted">
                              T-{m.offsetDays} Days ({m.dueDate})
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono font-bold text-accent">
                              Day of Event ({m.dueDate})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted leading-relaxed">{m.description}</p>
                        <div className="flex items-center gap-2 text-[11px] text-muted">
                          <Users className="w-3 h-3" />
                          <span>Responsible: {m.responsibleParty}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                      {m.isCompleted ? (
                        <Chip
                          size="sm"
                          variant="soft"
                          color="success"
                          className="text-[10px] font-bold"
                        >
                          Done
                        </Chip>
                      ) : m.isOverdue ? (
                        <Chip
                          size="sm"
                          variant="primary"
                          color="danger"
                          className="text-[10px] font-bold"
                        >
                          Overdue ({m.daysOverdue}d late)
                        </Chip>
                      ) : (
                        <Chip size="sm" variant="soft" color="accent" className="text-[10px]">
                          Due in {m.daysRemaining}d
                        </Chip>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: DAY-OF RUN OF SHOW */}
      {activeTab === "runofshow" && (
        <div className="space-y-4">
          <div className="relative border-l-2 border-border ml-4 pl-6 space-y-6">
            {items.map((item) => {
              const isDone = item.is_completed === 1;

              return (
                <div key={item.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => handleToggle(item.id, item.is_completed)}
                    className={`absolute -left-9 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isDone
                        ? "bg-success border-success text-success-foreground"
                        : "bg-surface border-border hover:border-accent"
                    }`}
                    aria-label={`Mark milestone ${item.title} as ${isDone ? "incomplete" : "complete"}`}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <Card
                    className={`border transition-all shadow-sm ${
                      isDone
                        ? "opacity-60 bg-surface-secondary border-border"
                        : "border-border bg-surface hover:border-accent/40"
                    }`}
                  >
                    <CardHeader className="p-4 pb-1 flex justify-between items-start">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-surface-secondary border border-border px-2 py-0.5 rounded text-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted" />
                          {item.time_start} - {item.time_end}
                        </span>
                        <Chip
                          size="sm"
                          variant="soft"
                          color="accent"
                          className="capitalize text-[10px]"
                        >
                          {item.phase}
                        </Chip>
                      </div>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="danger-soft"
                        onPress={() => handleDelete(item.id)}
                        aria-label="Delete milestone"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </CardHeader>

                    <CardContent className="p-4 pt-1">
                      <h4
                        className={`text-sm font-semibold text-foreground ${
                          isDone ? "line-through text-muted" : ""
                        }`}
                      >
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-muted">
                        <Users className="w-3 h-3" />
                        <span>Lead: {item.responsible_party}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Timeline Block HeroUI Modal */}
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalBackdrop>
          <ModalContainer>
            <ModalDialog className="bg-surface text-foreground border border-border p-2">
              <ModalHeader className="p-4 border-b border-border">
                <ModalHeading className="text-base font-bold text-foreground">
                  Add Day-of Schedule Block
                </ModalHeading>
              </ModalHeader>
              <ModalBody className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <TextField className="space-y-1">
                    <Label className="text-xs font-semibold text-muted">Start Time (HH:MM)</Label>
                    <Input
                      placeholder="16:00"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                    />
                  </TextField>
                  <TextField className="space-y-1">
                    <Label className="text-xs font-semibold text-muted">End Time (HH:MM)</Label>
                    <Input
                      placeholder="16:45"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                    />
                  </TextField>
                </div>
                <Select
                  selectedKey={newPhase}
                  onSelectionChange={(key) => {
                    if (key) setNewPhase(String(key));
                  }}
                  aria-label="Phase"
                  className="w-full space-y-1"
                >
                  <Label className="text-xs font-semibold text-muted">Phase</Label>
                  <SelectTrigger className="w-full bg-surface-secondary border border-border text-foreground text-xs rounded-xl px-3 py-2 flex items-center justify-between">
                    <SelectValue />
                    <SelectIndicator className="w-3.5 h-3.5 ml-1 opacity-70" />
                  </SelectTrigger>
                  <SelectPopover>
                    <ListBox className="bg-surface border border-border rounded-xl p-1 shadow-lg text-xs">
                      <ListBoxItem id="Preparation" textValue="Preparation">
                        Preparation
                      </ListBoxItem>
                      <ListBoxItem id="Arrival" textValue="Arrival">
                        Arrival
                      </ListBoxItem>
                      <ListBoxItem id="Ceremony" textValue="Ceremony">
                        Ceremony
                      </ListBoxItem>
                      <ListBoxItem id="Cocktails" textValue="Cocktails">
                        Cocktails
                      </ListBoxItem>
                      <ListBoxItem id="Reception" textValue="Reception">
                        Reception
                      </ListBoxItem>
                      <ListBoxItem id="Dinner" textValue="Dinner">
                        Dinner
                      </ListBoxItem>
                      <ListBoxItem id="Celebration" textValue="Celebration">
                        Celebration
                      </ListBoxItem>
                      <ListBoxItem id="Afterparty" textValue="Afterparty">
                        Afterparty
                      </ListBoxItem>
                    </ListBox>
                  </SelectPopover>
                </Select>

                <TextField className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">Milestone Title</Label>
                  <Input
                    placeholder="e.g. Grand Entrance & Toasts"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </TextField>

                <TextField className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">Description (Optional)</Label>
                  <Input
                    placeholder="Brief notes or buffer reminders"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </TextField>

                <TextField className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">Responsible Party</Label>
                  <Input
                    placeholder="e.g. Emcee & Banquet Captain"
                    value={newResp}
                    onChange={(e) => setNewResp(e.target.value)}
                  />
                </TextField>
              </ModalBody>
              <ModalFooter className="p-4 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" size="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onPress={handleAdd}>
                  Save Schedule Block
                </Button>
              </ModalFooter>
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </Modal>
    </div>
  );
}
