"use client";

import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors for runtime observability
    console.error("Next.js App Router boundary error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-secondary/20 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="max-w-md w-full bg-surface border border-border rounded-2xl shadow-xl p-8 space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-danger/15 text-danger flex items-center justify-center shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-danger bg-danger/10 px-2.5 py-1 rounded-full">
            Application Error
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Something Went Wrong
          </h1>
          <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto">
            An unexpected error occurred while rendering this celebration module. Our systems have
            logged this event.
          </p>

          {error.digest && (
            <div className="p-2 bg-surface-secondary border border-border rounded-lg text-[10px] font-mono text-muted overflow-x-auto">
              Digest ID: {error.digest}
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold shadow hover:opacity-90 transition-opacity cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-surface-secondary border border-border text-foreground text-xs font-medium hover:bg-surface transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
