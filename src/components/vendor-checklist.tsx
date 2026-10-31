"use client";

import type { VendorItemRecord, VendorStatus } from "@/db/schema";
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
import { Mail, Phone, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface VendorChecklistProps {
  eventId: string;
  initialItems: VendorItemRecord[];
  onRefresh: () => void;
}

export function VendorChecklist({ eventId, initialItems, onRefresh }: VendorChecklistProps) {
  const [items, setItems] = useState<VendorItemRecord[]>(initialItems);
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const [newCategory, setNewCategory] = useState("Catering");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newOffset, setNewOffset] = useState("90");
  const [newNotes, setNewNotes] = useState("");

  const hiredCount = items.filter((v) => v.status === "hired").length;

  async function handleStatusChange(vendorId: string, status: VendorStatus) {
    try {
      await fetch(`/api/events/${eventId}/vendors`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: vendorId, status }),
      });
      setItems((prev) => prev.map((v) => (v.id === vendorId ? { ...v, status } : v)));
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(vendorId: string) {
    try {
      await fetch(`/api/events/${eventId}/vendors?itemId=${vendorId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((v) => v.id !== vendorId));
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdd() {
    if (!newName.trim() || !newCategory) return;
    const priceNum = Number.parseFloat(newPrice) || 0;
    const offsetNum = Number.parseInt(newOffset, 10) || 60;

    try {
      const res = await fetch(`/api/events/${eventId}/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCategory,
          name: newName,
          contact_email: newEmail,
          contact_phone: newPhone,
          status: "researching",
          price: priceNum,
          notes: newNotes,
          deadline_offset_days: offsetNum,
        }),
      });

      if (res.ok) {
        onClose();
        setNewName("");
        setNewEmail("");
        setNewPhone("");
        setNewPrice("");
        setNewNotes("");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Card className="border border-border shadow-sm bg-surface">
      <CardHeader className="p-4 flex-row flex justify-between items-center border-b border-border">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            Vendor Directory &amp; Procurement Status
            <Chip size="sm" color="success" variant="soft">
              {hiredCount} / {items.length} Hired
            </Chip>
          </h3>
          <p className="text-xs text-muted">
            Lifecycle tracking from discovery to contract execution.
          </p>
        </div>
        <Button size="sm" variant="primary" onPress={onOpen}>
          <Plus className="w-4 h-4" />
          Add Vendor
        </Button>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableScrollContainer>
            <TableContent aria-label="Vendor Management Table">
              <TableHeader>
                <TableColumn id="vendor" isRowHeader>
                  CATEGORY &amp; VENDOR
                </TableColumn>
                <TableColumn id="contact">CONTACT INFO</TableColumn>
                <TableColumn id="price">CONTRACT PRICE</TableColumn>
                <TableColumn id="deadline">DEADLINE</TableColumn>
                <TableColumn id="stage">PIPELINE STAGE</TableColumn>
                <TableColumn id="actions">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                renderEmptyState={() => (
                  <div className="p-4 text-center text-xs text-muted">No vendors listed yet.</div>
                )}
              >
                {items.map((vendor) => (
                  <TableRow key={vendor.id} id={vendor.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">{vendor.name}</span>
                        <span className="text-[11px] text-muted">{vendor.category}</span>
                        {vendor.notes && (
                          <span className="text-[10px] text-muted italic mt-0.5 max-w-xs truncate">
                            {vendor.notes}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs text-muted">
                        {vendor.contact_email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-muted" />
                            <span>{vendor.contact_email}</span>
                          </div>
                        )}
                        {vendor.contact_phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-muted" />
                            <span>{vendor.contact_phone}</span>
                          </div>
                        )}
                        {!vendor.contact_email && !vendor.contact_phone && (
                          <span className="text-muted">None on file</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-foreground">
                        ${vendor.price > 0 ? vendor.price.toLocaleString() : "TBD"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono text-muted">
                        T-{vendor.deadline_offset_days}d
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        selectedKey={vendor.status}
                        onSelectionChange={(key) => {
                          if (key) handleStatusChange(vendor.id, String(key) as VendorStatus);
                        }}
                        aria-label={`Status for ${vendor.name}`}
                        className="w-32"
                      >
                        <SelectTrigger className="w-full bg-surface-secondary border border-border text-foreground text-xs rounded-xl px-2 py-1 flex items-center justify-between">
                          <SelectValue />
                          <SelectIndicator className="w-3 h-3 ml-1 opacity-70" />
                        </SelectTrigger>
                        <SelectPopover className="bg-surface border border-border shadow-xl rounded-xl p-1 z-50">
                          <ListBox className="outline-none space-y-0.5">
                            <ListBoxItem
                              id="researching"
                              textValue="Researching"
                              className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                            >
                              Researching
                            </ListBoxItem>
                            <ListBoxItem
                              id="contacted"
                              textValue="Contacted"
                              className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                            >
                              Contacted
                            </ListBoxItem>
                            <ListBoxItem
                              id="quoted"
                              textValue="Quoted"
                              className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                            >
                              Quoted
                            </ListBoxItem>
                            <ListBoxItem
                              id="hired"
                              textValue="Hired"
                              className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                            >
                              Hired
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
                        onPress={() => handleDelete(vendor.id)}
                        aria-label="Delete vendor"
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

      {/* Add Vendor HeroUI Modal */}
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalBackdrop>
          <ModalContainer>
            <ModalDialog className="bg-surface text-foreground border border-border p-2">
              <ModalHeader className="p-4 border-b border-border">
                <ModalHeading className="text-base font-bold text-foreground">
                  Add Vendor to Roster
                </ModalHeading>
              </ModalHeader>
              <ModalBody className="p-4 space-y-3">
                <Select
                  selectedKey={newCategory}
                  onSelectionChange={(key) => {
                    if (key) setNewCategory(String(key));
                  }}
                  aria-label="Service Category"
                  className="w-full space-y-1"
                >
                  <Label className="text-xs font-semibold text-muted">Service Category</Label>
                  <SelectTrigger className="w-full bg-surface-secondary border border-border text-foreground text-xs rounded-xl px-3 py-2 flex items-center justify-between">
                    <SelectValue />
                    <SelectIndicator className="w-3.5 h-3.5 ml-1 opacity-70" />
                  </SelectTrigger>
                  <SelectPopover className="bg-surface border border-border shadow-xl rounded-xl p-1 z-50">
                    <ListBox className="outline-none space-y-0.5">
                      <ListBoxItem
                        id="Venue"
                        textValue="Venue"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Venue
                      </ListBoxItem>
                      <ListBoxItem
                        id="Catering"
                        textValue="Catering"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Catering
                      </ListBoxItem>
                      <ListBoxItem
                        id="Photography"
                        textValue="Photography"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Photography
                      </ListBoxItem>
                      <ListBoxItem
                        id="Floral"
                        textValue="Floral"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Floral
                      </ListBoxItem>
                      <ListBoxItem
                        id="Music / Band"
                        textValue="Music / Band"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Music / Band
                      </ListBoxItem>
                      <ListBoxItem
                        id="Coordination"
                        textValue="Coordination"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Coordination
                      </ListBoxItem>
                      <ListBoxItem
                        id="Rentals"
                        textValue="Rentals"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Rentals
                      </ListBoxItem>
                      <ListBoxItem
                        id="Attire / Glam"
                        textValue="Attire / Glam"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Attire / Glam
                      </ListBoxItem>
                    </ListBox>
                  </SelectPopover>
                </Select>

                <TextField className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">Company / Vendor Name</Label>
                  <Input
                    placeholder="Company / Vendor Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </TextField>

                <div className="grid grid-cols-2 gap-2">
                  <TextField className="space-y-1">
                    <Label className="text-xs font-semibold text-muted">Email</Label>
                    <Input
                      placeholder="Email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </TextField>
                  <TextField className="space-y-1">
                    <Label className="text-xs font-semibold text-muted">Phone</Label>
                    <Input
                      placeholder="Phone"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                    />
                  </TextField>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <TextField className="space-y-1">
                    <Label className="text-xs font-semibold text-muted">Quoted Price ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                    />
                  </TextField>
                  <TextField className="space-y-1">
                    <Label className="text-xs font-semibold text-muted">
                      Deadline (Days Before)
                    </Label>
                    <Input
                      type="number"
                      placeholder="60"
                      value={newOffset}
                      onChange={(e) => setNewOffset(e.target.value)}
                    />
                  </TextField>
                </div>

                <TextField className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">Contract Notes / Scope</Label>
                  <Input
                    placeholder="Contract notes, milestone terms, scope"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </TextField>
              </ModalBody>
              <ModalFooter className="p-4 border-t border-border flex justify-end gap-2">
                <Button variant="secondary" size="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onPress={handleAdd}>
                  Save Vendor
                </Button>
              </ModalFooter>
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </Modal>
    </Card>
  );
}
