"use client";

import type { BudgetItemRecord, BudgetItemStatus } from "@/db/schema";
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
  ProgressBar,
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
import { AlertTriangle, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface BudgetBreakdownProps {
  eventId: string;
  targetBudget: number;
  initialItems: BudgetItemRecord[];
  onRefresh: () => void;
}

const COLORS = ["#cf9f67", "#c85a6e", "#319795", "#4299e1", "#805ad5", "#ed8936", "#718096"];

export function BudgetBreakdown({
  eventId,
  targetBudget,
  initialItems,
  onRefresh,
}: BudgetBreakdownProps) {
  const [items, setItems] = useState<BudgetItemRecord[]>(initialItems);
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const [newCategory, setNewCategory] = useState("Catering");
  const [newName, setNewName] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const totalSpent = useMemo(
    () => items.reduce((sum, item) => sum + (item.actual_cost || 0), 0),
    [items],
  );
  const remainingBudget = Math.max(0, targetBudget - totalSpent);
  const percentSpent = Math.min(100, Math.round((totalSpent / targetBudget) * 100));

  // Category breakdown for chart
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      const val = item.actual_cost > 0 ? item.actual_cost : item.estimated_cost;
      map.set(item.category, (map.get(item.category) || 0) + val);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [items]);

  async function handleStatusChange(itemId: string, newStatus: BudgetItemStatus) {
    const target = items.find((i) => i.id === itemId);
    if (!target) return;

    const actual =
      newStatus === "paid" && target.actual_cost === 0 ? target.estimated_cost : target.actual_cost;

    try {
      await fetch(`/api/events/${eventId}/budget`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, status: newStatus, actual_cost: actual }),
      });
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, status: newStatus, actual_cost: actual } : i)),
      );
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(itemId: string) {
    try {
      await fetch(`/api/events/${eventId}/budget?itemId=${itemId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddItem() {
    if (!newName.trim() || !newCost) return;
    const cost = Number.parseFloat(newCost);
    if (Number.isNaN(cost) || cost <= 0) return;

    try {
      const res = await fetch(`/api/events/${eventId}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCategory,
          name: newName,
          estimated_cost: cost,
          notes: newNotes,
        }),
      });
      if (res.ok) {
        onClose();
        setNewName("");
        setNewCost("");
        setNewNotes("");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border shadow-sm bg-surface">
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-xs text-muted font-medium uppercase tracking-wider">
              Target Budget
            </span>
            <div className="text-2xl font-bold mt-1 text-foreground">
              ${targetBudget.toLocaleString()}
            </div>
            <span className="text-[11px] text-muted mt-1">Calibrated ceiling</span>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm bg-surface">
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-xs text-muted font-medium uppercase tracking-wider">
              Total Committed / Paid
            </span>
            <div className="text-2xl font-bold mt-1 text-accent">
              ${totalSpent.toLocaleString()}
            </div>
            <div className="mt-1">
              <ProgressBar
                value={percentSpent}
                color={percentSpent > 90 ? "danger" : "accent"}
                aria-label="Budget consumption"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm bg-surface">
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-xs text-muted font-medium uppercase tracking-wider">
              Remaining Reserve
            </span>
            <div className="text-2xl font-bold mt-1 text-success">
              ${remainingBudget.toLocaleString()}
            </div>
            <span className="text-[11px] text-muted mt-1">{percentSpent}% budget allocated</span>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm bg-surface">
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-xs text-muted font-medium uppercase tracking-wider">
              Contingency Status
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {remainingBudget >= targetBudget * 0.08 ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-success shrink-0" />
                  <span className="text-sm font-semibold text-success">Protected (&gt;8%)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                  <span className="text-sm font-semibold text-warning">Low Buffer (&lt;8%)</span>
                </>
              )}
            </div>
            <span className="text-[11px] text-muted mt-1">
              Emergency buffer: ${Math.round(targetBudget * 0.08).toLocaleString()}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Visual Distribution Chart & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border border-border shadow-sm bg-surface">
          <CardHeader className="pb-0 px-4 pt-4 flex justify-between items-center">
            <h3 className="text-sm font-bold text-foreground">Allocation Distribution</h3>
            <Chip size="sm" variant="soft" color="accent">
              {items.length} Line Items
            </Chip>
          </CardHeader>
          <CardContent className="p-4 h-60">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`$${Number(val ?? 0).toLocaleString()}`, "Amount"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted">
                No budget data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Items Table */}
        <Card className="lg:col-span-2 border border-border shadow-sm bg-surface">
          <CardHeader className="p-4 flex-row flex justify-between items-center border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground">Line Item Ledger</h3>
              <p className="text-xs text-muted">Track planned vs paid contract values</p>
            </div>
            <Button size="sm" variant="secondary" onPress={onOpen}>
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableScrollContainer>
                <TableContent aria-label="Budget Line Items Table">
                  <TableHeader>
                    <TableColumn id="item" isRowHeader>
                      CATEGORY &amp; ITEM
                    </TableColumn>
                    <TableColumn id="estimated">ESTIMATED</TableColumn>
                    <TableColumn id="actual">ACTUAL PAID</TableColumn>
                    <TableColumn id="status">STATUS</TableColumn>
                    <TableColumn id="actions">ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody
                    renderEmptyState={() => (
                      <div className="p-4 text-center text-xs text-muted">
                        No budget items entered.
                      </div>
                    )}
                  >
                    {items.map((item) => (
                      <TableRow key={item.id} id={item.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-foreground">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-muted">{item.category}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium">
                            ${item.estimated_cost.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-danger">
                            ${(item.actual_cost || 0).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select
                            selectedKey={item.status}
                            onSelectionChange={(key) => {
                              if (key) handleStatusChange(item.id, String(key) as BudgetItemStatus);
                            }}
                            aria-label={`Status for ${item.name}`}
                            className="w-28"
                          >
                            <SelectTrigger className="w-full bg-surface-secondary border border-border text-foreground text-xs rounded-xl px-2 py-1 flex items-center justify-between">
                              <SelectValue />
                              <SelectIndicator className="w-3 h-3 ml-1 opacity-70" />
                            </SelectTrigger>
                            <SelectPopover className="bg-surface border border-border shadow-xl rounded-xl p-1 z-50">
                              <ListBox className="outline-none space-y-0.5">
                                <ListBoxItem
                                  id="planned"
                                  textValue="Planned"
                                  className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                                >
                                  Planned
                                </ListBoxItem>
                                <ListBoxItem
                                  id="booked"
                                  textValue="Booked"
                                  className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                                >
                                  Booked
                                </ListBoxItem>
                                <ListBoxItem
                                  id="paid"
                                  textValue="Paid"
                                  className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                                >
                                  Paid
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
                            onPress={() => handleDelete(item.id)}
                            aria-label="Delete budget item"
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
      </div>

      {/* Add Item HeroUI Modal */}
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalBackdrop>
          <ModalContainer>
            <ModalDialog className="bg-surface text-foreground border border-border p-2">
              <ModalHeader className="p-4 border-b border-border">
                <ModalHeading className="text-base font-bold text-foreground">
                  Add Budget Line Item
                </ModalHeading>
              </ModalHeader>
              <ModalBody className="p-4 space-y-3">
                <Select
                  selectedKey={newCategory}
                  onSelectionChange={(key) => {
                    if (key) setNewCategory(String(key));
                  }}
                  aria-label="Category"
                  className="w-full space-y-1"
                >
                  <Label className="text-xs font-semibold text-muted">Category</Label>
                  <SelectTrigger className="w-full bg-surface-secondary border border-border text-foreground text-xs rounded-xl px-3 py-2 flex items-center justify-between">
                    <SelectValue />
                    <SelectIndicator className="w-3.5 h-3.5 ml-1 opacity-70" />
                  </SelectTrigger>
                  <SelectPopover className="bg-surface border border-border shadow-xl rounded-xl p-1 z-50">
                    <ListBox className="outline-none space-y-0.5">
                      <ListBoxItem
                        id="Venue & Space"
                        textValue="Venue & Space"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Venue &amp; Space
                      </ListBoxItem>
                      <ListBoxItem
                        id="Catering & Bar"
                        textValue="Catering & Bar"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Catering &amp; Bar
                      </ListBoxItem>
                      <ListBoxItem
                        id="Photo & Video"
                        textValue="Photo & Video"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Photo &amp; Video
                      </ListBoxItem>
                      <ListBoxItem
                        id="Floral & Decor"
                        textValue="Floral & Decor"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Floral &amp; Decor
                      </ListBoxItem>
                      <ListBoxItem
                        id="Music & Entertainment"
                        textValue="Music & Entertainment"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Music &amp; Entertainment
                      </ListBoxItem>
                      <ListBoxItem
                        id="Attire & Beauty"
                        textValue="Attire & Beauty"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Attire &amp; Beauty
                      </ListBoxItem>
                      <ListBoxItem
                        id="Coordination & Staff"
                        textValue="Coordination & Staff"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Coordination &amp; Staff
                      </ListBoxItem>
                      <ListBoxItem
                        id="Contingency Reserve"
                        textValue="Contingency Reserve"
                        className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground outline-none"
                      >
                        Contingency Reserve
                      </ListBoxItem>
                    </ListBox>
                  </SelectPopover>
                </Select>

                <TextField className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">Item Name</Label>
                  <Input
                    placeholder="e.g. Garden Pavilion Hire"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </TextField>

                <TextField className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">Estimated Cost ($)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                  />
                </TextField>

                <TextField className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">Notes / Scope</Label>
                  <Input
                    placeholder="Vendor quote terms or contract specs"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </TextField>
              </ModalBody>
              <ModalFooter className="p-4 border-t border-border flex justify-end gap-2">
                <Button variant="secondary" size="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onPress={handleAddItem}>
                  Add Item
                </Button>
              </ModalFooter>
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </Modal>
    </div>
  );
}
