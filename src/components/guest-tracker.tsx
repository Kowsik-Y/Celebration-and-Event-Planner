"use client";

import type { GuestRecord, RsvpStatus } from "@/db/schema";
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
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableContent,
  TableHeader,
  TableRow,
  TableScrollContainer,
  TextField,
} from "@heroui/react";
import { AlertCircle, Plus, Trash2, UserCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";

interface GuestTrackerProps {
  eventId: string;
  initialGuests: GuestRecord[];
  targetGuestCount: number;
  onRefresh: () => void;
}

export function GuestTracker({
  eventId,
  initialGuests,
  targetGuestCount,
  onRefresh,
}: GuestTrackerProps) {
  const [guests, setGuests] = useState<GuestRecord[]>(initialGuests);
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDietary, setNewDietary] = useState("None");
  const [newTable, setNewTable] = useState("Unassigned");
  const [newPlusOnes, setNewPlusOnes] = useState("0");

  const attendingCount = useMemo(
    () =>
      guests
        .filter((g) => g.rsvp_status === "attending")
        .reduce((sum, g) => sum + 1 + (g.plus_ones || 0), 0),
    [guests],
  );

  const pendingCount = useMemo(
    () => guests.filter((g) => g.rsvp_status === "pending").length,
    [guests],
  );

  const dietaryAlertCount = useMemo(
    () => guests.filter((g) => g.dietary_restrictions && g.dietary_restrictions !== "None").length,
    [guests],
  );

  async function handleStatusChange(guestId: string, status: RsvpStatus) {
    try {
      await fetch(`/api/events/${eventId}/guests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: guestId, rsvp_status: status }),
      });
      setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, rsvp_status: status } : g)));
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(guestId: string) {
    try {
      await fetch(`/api/events/${eventId}/guests?itemId=${guestId}`, { method: "DELETE" });
      setGuests((prev) => prev.filter((g) => g.id !== guestId));
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    const plusNum = Number.parseInt(newPlusOnes, 10) || 0;

    try {
      const res = await fetch(`/api/events/${eventId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          rsvp_status: "pending",
          dietary_restrictions: newDietary,
          table_number: newTable,
          plus_ones: plusNum,
        }),
      });

      if (res.ok) {
        onClose();
        setNewName("");
        setNewEmail("");
        setNewDietary("None");
        setNewTable("Unassigned");
        setNewPlusOnes("0");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border border-border bg-surface shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-surface-secondary text-muted">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted uppercase font-semibold">
                Planned Headcount
              </span>
              <div className="text-xl font-bold">{targetGuestCount} Guests</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-surface shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted uppercase font-semibold">
                Confirmed Attending
              </span>
              <div className="text-xl font-bold text-emerald-600">{attendingCount} Confirmed</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-surface shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted uppercase font-semibold">Pending RSVP</span>
              <div className="text-xl font-bold text-amber-600">{pendingCount} Awaiting</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-surface shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted uppercase font-semibold">Dietary Alerts</span>
              <div className="text-xl font-bold text-rose-600">
                {dietaryAlertCount} Special Meals
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guest Roster Table */}
      <Card className="border border-border shadow-sm bg-surface">
        <CardHeader className="p-4 flex flex-row justify-between items-center border-b border-border">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Guest Registry &amp; Dietary Log
            </h3>
            <p className="text-xs text-muted">
              Seating assignments, party headcounts, and catering allergens.
            </p>
          </div>
          <Button size="sm" variant="primary" onPress={onOpen}>
            <Plus className="w-4 h-4" />
            Add Guest
          </Button>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableScrollContainer>
              <TableContent aria-label="Guest Registry Table">
                <TableHeader>
                  <TableColumn id="name" isRowHeader>
                    GUEST NAME &amp; EMAIL
                  </TableColumn>
                  <TableColumn id="party">PARTY SIZE</TableColumn>
                  <TableColumn id="dietary">DIETARY RESTRICTIONS</TableColumn>
                  <TableColumn id="table">SEATING / TABLE</TableColumn>
                  <TableColumn id="rsvp">RSVP STATUS</TableColumn>
                  <TableColumn id="actions">ACTIONS</TableColumn>
                </TableHeader>
                <TableBody
                  renderEmptyState={() => (
                    <div className="p-4 text-center text-xs text-muted">
                      No guests entered in registry.
                    </div>
                  )}
                >
                  {guests.map((guest) => (
                    <TableRow key={guest.id} id={guest.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-foreground">
                            {guest.name}
                          </span>
                          <span className="text-[11px] text-muted">
                            {guest.email || "No email"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-foreground">
                          {1 + (guest.plus_ones || 0)}{" "}
                          {guest.plus_ones > 0 ? `(+${guest.plus_ones})` : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        {guest.dietary_restrictions && guest.dietary_restrictions !== "None" ? (
                          <Chip size="sm" color="warning" variant="soft" className="text-[11px]">
                            {guest.dietary_restrictions}
                          </Chip>
                        ) : (
                          <span className="text-xs text-muted">Standard</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium bg-surface-secondary border border-border px-2 py-0.5 rounded text-foreground">
                          {guest.table_number || "Unassigned"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          selectedKey={guest.rsvp_status}
                          onSelectionChange={(key) => {
                            if (key) handleStatusChange(guest.id, String(key) as RsvpStatus);
                          }}
                          aria-label={`RSVP status for ${guest.name}`}
                          className="w-28"
                        >
                          <SelectTrigger className="w-full bg-surface-secondary border border-border text-foreground text-xs rounded-xl px-2 py-1 flex items-center justify-between">
                            <SelectValue />
                            <SelectIndicator className="w-3 h-3 ml-1 opacity-70" />
                          </SelectTrigger>
                          <SelectPopover className="bg-surface border border-border shadow-xl rounded-xl p-1 z-50">
                            <ListBox className="outline-none space-y-0.5">
                              <ListBoxItem
                                id="attending"
                                textValue="Attending"
                                className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                              >
                                Attending
                              </ListBoxItem>
                              <ListBoxItem
                                id="pending"
                                textValue="Pending"
                                className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                              >
                                Pending
                              </ListBoxItem>
                              <ListBoxItem
                                id="declined"
                                textValue="Declined"
                                className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                              >
                                Declined
                              </ListBoxItem>
                            </ListBox>
                          </SelectPopover>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="danger-soft"
                          onPress={() => handleDelete(guest.id)}
                          aria-label="Delete guest"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableContent>
            </TableScrollContainer>
          </Table>
        </CardContent>
      </Card>

      {/* Add Guest HeroUI Modal */}
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalBackdrop>
          <ModalContainer>
            <ModalDialog className="bg-surface text-foreground border border-border p-2">
              <ModalHeader className="p-4 border-b border-border">
                <ModalHeading className="text-base font-bold text-foreground">
                  Add Guest to Registry
                </ModalHeading>
              </ModalHeader>
              <ModalBody className="p-4 space-y-3">
                <TextField className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">Guest Full Name</Label>
                  <Input
                    placeholder="e.g. Lord Julian Vance"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </TextField>
                <TextField className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">Email Address</Label>
                  <Input
                    placeholder="julian@vance.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </TextField>
                <div className="grid grid-cols-2 gap-2">
                  <TextField className="space-y-1">
                    <Label className="text-xs font-semibold text-muted">Plus Ones (+)</Label>
                    <Input
                      type="number"
                      value={newPlusOnes}
                      onChange={(e) => setNewPlusOnes(e.target.value)}
                    />
                  </TextField>
                  <TextField className="space-y-1">
                    <Label className="text-xs font-semibold text-muted">Table Assignment</Label>
                    <Input
                      placeholder="Table 1 or Terrace"
                      value={newTable}
                      onChange={(e) => setNewTable(e.target.value)}
                    />
                  </TextField>
                </div>
                <TextField className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">
                    Dietary Restrictions / Allergies
                  </Label>
                  <Input
                    placeholder="e.g. Gluten-Free, Vegan, Severe Peanut Allergy"
                    value={newDietary}
                    onChange={(e) => setNewDietary(e.target.value)}
                  />
                </TextField>
              </ModalBody>
              <ModalFooter className="p-4 border-t border-border flex justify-end gap-2">
                <Button variant="secondary" size="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onPress={handleAdd}>
                  Add Guest
                </Button>
              </ModalFooter>
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </Modal>
    </div>
  );
}
