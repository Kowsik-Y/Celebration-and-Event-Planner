"use client";

import {
  Button,
  Chip,
  Input,
  ScrollShadow,
  Sheet,
  SheetBackdrop,
  SheetBody,
  SheetCloseTrigger,
  SheetContent,
  SheetDialog,
  SheetFooter,
  SheetHeader,
  SheetHeading,
} from "@heroui/react";
import {
  AlertCircle,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  Layers,
  Send,
  Sparkles,
  User,
  Wrench,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { MarkdownRenderer } from "./markdown-renderer";

export type VerboseEventType =
  | "thought"
  | "agent_delegation"
  | "tool_call"
  | "tool_result"
  | "rag_citation"
  | "sub_agent_output"
  | "token"
  | "done"
  | "error";

export interface VerboseTrace {
  type: VerboseEventType;
  agent?: string;
  toolName?: string;
  data?: unknown;
  message?: string;
  timestamp: string;
}

interface Message {
  role: "user" | "assistant";
  text: string;
  traces?: VerboseTrace[];
  durationMs?: number;
  references?: string[];
}

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  personaName: string;
  personaTitle: string;
  starterSuggestions: string[];
}

/**
 * Antigravity IDE-style Inline Collapsible Execution Trace Component
 */
function InlineVerboseTrace({
  traces,
  isLive,
  durationMs,
}: {
  traces: VerboseTrace[];
  isLive?: boolean;
  durationMs?: number;
}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(Boolean(isLive));
  const [expandedStepIdx, setExpandedStepIdx] = useState<number | null>(null);

  // Filter out chunk tokens and done markers
  const actionableTraces = traces.filter((t) => t.type !== "token" && t.type !== "done");

  if (actionableTraces.length === 0 && !isLive) {
    return null;
  }

  // Format execution duration
  let durationLabel = `${actionableTraces.length} steps`;
  if (durationMs) {
    if (durationMs < 1000) {
      durationLabel = `${(durationMs / 1000).toFixed(1)}s`;
    } else {
      const seconds = Math.round(durationMs / 1000);
      durationLabel =
        seconds >= 60 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : `${seconds}s`;
    }
  }

  return (
    <div className="mb-3 rounded-xl border border-border/70 bg-surface/60 overflow-hidden text-xs font-sans transition-all shadow-xs">
      {/* Top summary row: e.g. "Worked for 2s ▾" or "Thinking... ▾" */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-muted hover:text-foreground hover:bg-surface-secondary/50 transition-colors cursor-pointer select-none"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          {isLive ? (
            <Sparkles className="w-3.5 h-3.5 text-accent animate-spin" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-accent/80" />
          )}
          <span className="font-medium text-foreground">
            {isLive ? "Working on request..." : `Worked for ${durationLabel}`}
          </span>
          <span className="text-[11px] text-muted font-mono">
            ({actionableTraces.length} action{actionableTraces.length === 1 ? "" : "s"})
          </span>
        </div>

        <div className="flex items-center gap-1 text-muted text-[11px]">
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {/* Collapsible detail steps (Antigravity IDE look & feel) */}
      {isExpanded && (
        <div className="px-3 pb-2.5 pt-1 border-t border-border/40 space-y-1 bg-surface-secondary/20">
          {/* Action category subtitle */}
          <div className="text-[11px] text-muted flex items-center gap-1.5 py-1">
            <span className="font-medium text-foreground/80">
              Explored context, ran tools &amp; verified RAG
            </span>
            <ChevronDown className="w-3 h-3 text-muted/60" />
          </div>

          <div className="space-y-1">
            {actionableTraces.map((trace, idx) => {
              const isStepOpen = expandedStepIdx === idx;
              return (
                <div
                  key={`trace-step-${trace.type}-${idx}`}
                  className="rounded-md border border-transparent hover:border-border/50 hover:bg-surface/80 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedStepIdx(isStepOpen ? null : idx)}
                    className="w-full text-left px-2 py-1 flex items-center justify-between gap-2 cursor-pointer font-mono text-[11px]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {trace.type === "tool_call" && (
                        <Wrench className="w-3 h-3 text-warning shrink-0" />
                      )}
                      {trace.type === "tool_result" && (
                        <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                      )}
                      {trace.type === "agent_delegation" && (
                        <Layers className="w-3 h-3 text-accent shrink-0" />
                      )}
                      {trace.type === "rag_citation" && (
                        <BookOpen className="w-3 h-3 text-sky-400 shrink-0" />
                      )}
                      {trace.type === "thought" && (
                        <BrainCircuit className="w-3 h-3 text-accent shrink-0" />
                      )}
                      {trace.type === "error" && (
                        <AlertCircle className="w-3 h-3 text-danger shrink-0" />
                      )}

                      <span className="truncate text-muted hover:text-foreground">
                        {trace.type === "tool_call" && `Ran ${trace.toolName || "tool"} `}
                        {trace.type === "tool_result" && `Output from ${trace.toolName || "tool"} `}
                        {trace.type === "agent_delegation" &&
                          `Delegated to @${trace.agent || "sub-agent"} `}
                        {trace.type === "rag_citation" && "Retrieved RAG domain knowledge "}
                        {trace.type === "thought" &&
                          `Analyzed: ${
                            trace.message
                              ? trace.message.length > 45
                                ? `${trace.message.slice(0, 43)}...`
                                : trace.message
                              : "context parameters"
                          }`}
                        {trace.type === "error" && `Error: ${trace.message || "Failed"}`}
                      </span>
                    </div>

                    <span className="text-muted/60 text-[10px] shrink-0 font-sans">
                      {isStepOpen ? "▾" : "›"}
                    </span>
                  </button>

                  {/* Step detail drawer */}
                  {isStepOpen && (
                    <div className="mx-2 mb-2 p-2 rounded bg-surface border border-border/70 text-[10px] font-mono overflow-x-auto space-y-1">
                      {trace.message && (
                        <p className="text-muted font-sans text-xs whitespace-pre-wrap leading-relaxed">
                          {trace.message}
                        </p>
                      )}
                      {trace.data != null && (
                        <pre className="text-accent/90">{JSON.stringify(trace.data, null, 2)}</pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isLive && (
            <div className="flex items-center gap-2 text-[11px] text-muted py-1 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              <span>Orchestrating agent actions...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AiChatDrawer({
  isOpen,
  onClose,
  eventId,
  personaName,
  personaTitle,
  starterSuggestions,
}: AiChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `Hello! I am ${personaName}, powered by Google ADK & Genkit Multi-Agent Orchestration. I am connected with specialized sub-agents (Budget, Timeline, Vendor) and verified RAG domain benchmarks. How can I assist you right now?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTraces, setActiveTraces] = useState<VerboseTrace[]>([]);
  const [streamingText, setStreamingText] = useState("");

  const currentTracesRef = useRef<VerboseTrace[]>([]);
  const accumulatedTextRef = useRef<string>("");
  const startTimeRef = useRef<number>(Date.now());

  function handleVerboseEvent(trace: VerboseTrace) {
    if (trace.type === "token" && trace.message) {
      accumulatedTextRef.current += trace.message;
      setStreamingText(accumulatedTextRef.current);
    } else if (trace.type === "done") {
      setLoading(false);
      const elapsed = Date.now() - startTimeRef.current;
      const finalTraces = [...currentTracesRef.current];
      const finalText = accumulatedTextRef.current.trim();

      if (finalText) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: finalText,
            traces: finalTraces,
            durationMs: elapsed,
          },
        ]);
      }
      accumulatedTextRef.current = "";
      setStreamingText("");
      setActiveTraces([]);
      currentTracesRef.current = [];
    } else {
      currentTracesRef.current.push(trace);
      setActiveTraces((prev) => [...prev, trace]);
    }
  }

  async function handleSend(textToSend?: string) {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);
    setActiveTraces([]);
    currentTracesRef.current = [];
    accumulatedTextRef.current = "";
    startTimeRef.current = Date.now();
    setStreamingText("");

    // Directly use Server-Sent Events (SSE) streaming for all environments
    try {
      const res = await fetch("/api/ai/live-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, message: text }),
      });

      if (!res.body) {
        throw new Error("No stream available");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6);
            try {
              const trace: VerboseTrace = JSON.parse(jsonStr);
              handleVerboseEvent(trace);
            } catch (err) {
              console.error("SSE parse error:", err);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I encountered a minor network error. Please try again!",
        },
      ]);
    }
  }

  return (
    <Sheet
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      onClose={onClose}
      placement="right"
    >
      <SheetBackdrop variant="blur">
        <SheetContent className="w-[min(38rem,96vw)] max-w-2xl h-full">
          <SheetDialog className="h-full flex flex-col bg-surface border-l border-border">
            <SheetCloseTrigger className="top-4 right-4" aria-label="Close concierge" />

            {/* Header: Persona info with ADK live streaming status chip */}
            <SheetHeader className="p-4 flex flex-col gap-2 border-b border-border pb-3 pr-12">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <SheetHeading className="text-base font-bold text-foreground flex items-center gap-2">
                    {personaName} Concierge
                    <Chip size="sm" color="accent" variant="soft" className="h-5 text-[10px]">
                      <Zap className="w-2.5 h-2.5 inline mr-1" />
                      ADK Live Stream (SSE)
                    </Chip>
                  </SheetHeading>
                  <p className="text-xs text-muted">
                    {personaTitle} &bull; Google ADK Multi-Agent &amp; Genkit RAG
                  </p>
                </div>
              </div>
            </SheetHeader>

            {/* Main Chat Stream with Inline Verbose Traces (No Separate Tab) */}
            <SheetBody className="p-4 flex-1 flex flex-col justify-between overflow-hidden">
              <ScrollShadow className="flex-1 space-y-4 pr-2">
                {messages.map((m, i) => (
                  <div
                    key={`msg-${m.role}-${i}`}
                    className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-1">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-accent text-accent-foreground rounded-br-xs"
                          : "bg-surface-secondary border border-border text-foreground rounded-bl-xs"
                      }`}
                    >
                      {/* Inline Antigravity IDE Verbose Trace Box */}
                      {m.traces && m.traces.length > 0 && (
                        <InlineVerboseTrace
                          traces={m.traces}
                          durationMs={m.durationMs}
                          isLive={false}
                        />
                      )}

                      {m.role === "assistant" ? (
                        <MarkdownRenderer content={m.text} />
                      ) : (
                        <p className="whitespace-pre-line">{m.text}</p>
                      )}

                      {m.references && m.references.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-border text-[11px] text-muted flex flex-wrap items-center gap-1.5">
                          <BookOpen className="w-3 h-3 text-accent" />
                          <span>RAG Verified:</span>
                          {m.references.map((ref) => (
                            <span
                              key={ref}
                              className="bg-surface border border-border px-1.5 py-0.5 rounded text-[10px]"
                            >
                              {ref}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {m.role === "user" && (
                      <div className="w-7 h-7 rounded-full bg-surface-secondary border border-border flex items-center justify-center shrink-0 mt-1">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Active Streaming turn with Live Inline Traces */}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    </div>

                    <div className="max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed bg-surface-secondary border border-border text-foreground rounded-bl-xs w-full">
                      {/* Live Antigravity IDE Trace view */}
                      <InlineVerboseTrace traces={activeTraces} isLive={true} />

                      {streamingText ? (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <MarkdownRenderer content={streamingText} />
                          <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-1 align-middle" />
                        </div>
                      ) : activeTraces.length === 0 ? (
                        <div className="flex gap-2 items-center text-xs text-muted py-1">
                          <Cpu className="w-3.5 h-3.5 animate-spin text-accent" />
                          <span>
                            Google ADK Multi-Agent is executing tools &amp; RAG retrieval...
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </ScrollShadow>

              {/* Quick suggestions */}
              <div className="pt-3 border-t border-border mt-2">
                <p className="text-[11px] text-muted font-medium mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-accent" /> Suggested Inquiries:
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {starterSuggestions.slice(0, 2).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => handleSend(s)}
                      className="text-[11px] text-left bg-surface-secondary hover:bg-surface text-foreground px-2 py-1 rounded-md transition-colors border border-border cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </SheetBody>

            {/* Footer Prompt Input */}
            <SheetFooter className="p-3 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 w-full"
              >
                <Input
                  placeholder={`Ask ${personaName} via Google ADK Multi-Agent...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 text-sm py-2"
                />
                <Button
                  isIconOnly
                  size="sm"
                  variant="primary"
                  type="submit"
                  isPending={loading}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </SheetFooter>
          </SheetDialog>
        </SheetContent>
      </SheetBackdrop>
    </Sheet>
  );
}
