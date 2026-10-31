"use client";

import type {
  BudgetItemRecord,
  EventRecord,
  GuestRecord,
  IdeaRecord,
  TimelineItemRecord,
  VendorItemRecord,
} from "@/db/schema";
import { downloadFile, generateEventJson, generateEventMarkdown } from "@/lib/export";
import type { ReadinessScoreResult } from "@/lib/readiness";
import {
  Button,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContainer,
  ModalDialog,
  ModalFooter,
  ModalHeader,
  ModalHeading,
} from "@heroui/react";
import { Download, FileCode, FileText, Printer } from "lucide-react";

interface PlanExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventRecord;
  readiness?: ReadinessScoreResult;
  budgetItems: BudgetItemRecord[];
  timelineItems: TimelineItemRecord[];
  vendorItems: VendorItemRecord[];
  guests: GuestRecord[];
  ideas: IdeaRecord[];
}

export function PlanExportModal({
  isOpen,
  onClose,
  event,
  readiness,
  budgetItems,
  timelineItems,
  vendorItems,
  guests,
  ideas,
}: PlanExportModalProps) {
  const exportData = {
    event,
    readiness,
    budgetItems,
    timelineItems,
    vendorItems,
    guests,
    ideas,
    exportedAt: new Date().toISOString(),
  };

  const handleDownloadMarkdown = () => {
    const md = generateEventMarkdown(exportData);
    const filename = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-brief.md`;
    downloadFile(filename, md, "text/markdown;charset=utf-8;");
  };

  const handleDownloadJson = () => {
    const json = generateEventJson(exportData);
    const filename = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-data.json`;
    downloadFile(filename, json, "application/json;charset=utf-8;");
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalBackdrop />
      <ModalContainer>
        <ModalDialog className="sm:max-w-md bg-surface border border-border">
          <ModalHeader className="border-b border-border p-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <ModalHeading className="text-base font-bold text-foreground">
                  Export Celebration Plan
                </ModalHeading>
                <p className="text-xs text-muted">Download or print client-ready documentation</p>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="p-4 space-y-3">
            <button
              type="button"
              className="w-full text-left p-3.5 rounded-xl border border-border hover:border-foreground/30 bg-surface/50 cursor-pointer transition-colors flex items-center justify-between"
              onClick={handleDownloadMarkdown}
              aria-label="Download Markdown Executive Brief"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Markdown Brief (.md)</h4>
                  <p className="text-xs text-muted">
                    Clean executive briefing with tables &amp; checklists
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-muted" />
            </button>

            <button
              type="button"
              className="w-full text-left p-3.5 rounded-xl border border-border hover:border-foreground/30 bg-surface/50 cursor-pointer transition-colors flex items-center justify-between"
              onClick={handleDownloadJson}
              aria-label="Download Structured JSON Dataset"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Structured JSON (.json)</h4>
                  <p className="text-xs text-muted">
                    Complete machine-readable event state and metadata
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-muted" />
            </button>

            <button
              type="button"
              className="w-full text-left p-3.5 rounded-xl border border-border hover:border-foreground/30 bg-surface/50 cursor-pointer transition-colors flex items-center justify-between"
              onClick={handlePrint}
              aria-label="Print or Save as PDF"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Print / Save to PDF</h4>
                  <p className="text-xs text-muted">
                    High-contrast printer-friendly document layout
                  </p>
                </div>
              </div>
              <Printer className="w-4 h-4 text-muted" />
            </button>
          </ModalBody>

          <ModalFooter className="border-t border-border p-3 flex justify-end">
            <Button variant="ghost" size="sm" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </Modal>
  );
}
