"use client";

import { triggerCelebrationConfetti } from "@/components/celebration-fx";
import type { TimelineItemRecord } from "@/db/schema";
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
import { CheckCircle2, Clock, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";

interface TimelineViewProps {
  eventId: string;
  initialItems: TimelineItemRecord[];
  onRefresh: () => void;
}

export function TimelineView({ eventId, initialItems, onRefresh }: TimelineViewProps) {
  const [items, setItems] = useState<TimelineItemRecord[]>(initialItems);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            Day-of Run of Show Sequencer
            <Chip size="sm" color="accent" variant="soft">
              {completedCount} / {items.length} Completed
            </Chip>
          </h3>
          <p className="text-xs text-muted">
            Chronological minute-by-minute execution schedule with automated buffer tracking.
          </p>
        </div>
        <Button size="sm" variant="primary" onPress={onOpen}>
          <Plus className="w-4 h-4" />
          Add Schedule Block
        </Button>
      </div>

      {/* Timeline Stream */}
      <div className="relative border-l-2 border-border ml-4 pl-6 space-y-6">
        {items.map((item) => {
          const isDone = item.is_completed === 1;

          return (
            <div key={item.id} className="relative group">
              {/* Dot Icon Indicator */}
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
                    <p className="text-xs text-muted mt-1 leading-relaxed">{item.description}</p>
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
                  <SelectPopover className="bg-surface border border-border shadow-xl rounded-xl p-1 z-50">
                    <ListBox className="outline-none space-y-0.5">
                      <ListBoxItem
                        id="Preparation"
                        textValue="Preparation"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Preparation
                      </ListBoxItem>
                      <ListBoxItem
                        id="Portraits"
                        textValue="Portraits"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Portraits
                      </ListBoxItem>
                      <ListBoxItem
                        id="Ceremony"
                        textValue="Ceremony"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Ceremony
                      </ListBoxItem>
                      <ListBoxItem
                        id="Cocktail"
                        textValue="Cocktail"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Cocktail
                      </ListBoxItem>
                      <ListBoxItem
                        id="Reception"
                        textValue="Reception"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Reception
                      </ListBoxItem>
                      <ListBoxItem
                        id="Afterparty"
                        textValue="Afterparty"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Afterparty
                      </ListBoxItem>
                    </ListBox>
                  </SelectPopover>
                </Select>
                <TextField className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">Block Title</Label>
                  <Input
                    placeholder="e.g. Grand Entrance &amp; Welcome Toast"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </TextField>
                <TextField className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">
                    Description &amp; Instructions
                  </Label>
                  <Input
                    placeholder="Cue bridal party, start background music, dim chandeliers"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </TextField>
                <TextField className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">Responsible Party</Label>
                  <Input
                    placeholder="e.g. Lead Coordinator, DJ, Maitre D'"
                    value={newResp}
                    onChange={(e) => setNewResp(e.target.value)}
                  />
                </TextField>
              </ModalBody>
              <ModalFooter className="p-4 border-t border-border flex justify-end gap-2">
                <Button variant="secondary" size="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onPress={handleAdd}>
                  Add to Schedule
                </Button>
              </ModalFooter>
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </Modal>
    </div>
  );
}
