"use client";

import type { ReadinessScoreResult } from "@/lib/readiness";
import { Button, Card, CardContent, CardHeader, Chip } from "@heroui/react";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Gauge } from "lucide-react";
import { useState } from "react";

interface ReadinessGaugeProps {
  readiness: ReadinessScoreResult;
}

export function ReadinessGauge({ readiness }: ReadinessGaugeProps) {
  const [expanded, setExpanded] = useState(false);

  // SVG circular gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readiness.score / 100) * circumference;

  const strokeColor =
    readiness.score >= 90
      ? "#10B981" // emerald
      : readiness.score >= 70
        ? "#F59E0B" // amber
        : readiness.score >= 40
          ? "#EC4899" // rose
          : "#EF4444"; // red

  return (
    <section aria-label="Celebration Readiness Score">
      <Card className="border border-border shadow-sm bg-surface overflow-hidden">
        <CardHeader className="p-4 pb-2 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <Gauge className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Celebration Readiness Score</h2>
              <p className="text-[11px] text-muted">
                Deterministic 0–100 logistics and budget audit
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip
              size="sm"
              variant="soft"
              color={readiness.color}
              className="text-[11px] font-bold"
            >
              {readiness.tier}
            </Chip>
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={() => setExpanded((prev) => !prev)}
              aria-label={expanded ? "Collapse readiness breakdown" : "Expand readiness breakdown"}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Circular SVG Gauge */}
            <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-muted/20"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={strokeColor}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-foreground tracking-tight">
                  {readiness.score}
                </span>
                <span className="text-[10px] uppercase font-bold text-muted">/ 100</span>
              </div>
            </div>

            {/* Quick Pillar Status Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-grow w-full">
              {readiness.factors.map((f) => (
                <div
                  key={f.name}
                  className="p-2.5 rounded-lg border border-border/60 bg-surface/50 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground truncate">{f.name}</span>
                    {f.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>Score</span>
                    <span className="font-bold text-foreground">
                      {f.score} / {f.maxScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Deduction Reasons */}
          {readiness.reasons.length > 0 && (
            <div
              className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1.5"
              role="alert"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Priority Action Items ({readiness.reasons.length})</span>
              </div>
              <ul className="text-xs text-muted space-y-1 pl-4 list-disc">
                {readiness.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Breakdown Collapse */}
          {expanded && (
            <div className="pt-2 border-t border-border/60 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                Pillar Breakdown &amp; Improvement Recommendations
              </h3>
              <div className="space-y-2">
                {readiness.factors.map((f) => (
                  <div
                    key={f.name}
                    className="p-3 rounded-lg border border-border/40 bg-surface/30 flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{f.name}</span>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={f.passed ? "success" : "warning"}
                          className="text-[10px] h-5"
                        >
                          {f.passed ? "Healthy" : "Attention Required"}
                        </Chip>
                      </div>
                      {f.recommendation && (
                        <p className="text-[11px] text-muted">{f.recommendation}</p>
                      )}
                    </div>
                    <div className="text-xs font-extrabold text-foreground sm:text-right">
                      {f.score} / {f.maxScore} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
