import { ArrowLeft, CalendarHeart, Compass, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-secondary/20 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="max-w-md w-full bg-surface border border-border rounded-2xl shadow-xl p-8 space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/15 text-accent flex items-center justify-center shadow-inner">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full">
            Error 404
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Celebration Page Not Found
          </h1>
          <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto">
            The event timeline, budget sheet, or planner page you are looking for does not exist or
            may have been relocated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold shadow hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Dashboard
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-surface-secondary border border-border text-foreground text-xs font-medium hover:bg-surface transition-colors"
          >
            <CalendarHeart className="w-3.5 h-3.5 text-accent" />
            Switch Account
          </Link>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <Search className="w-3 h-3 text-muted" />
          <span>GenAI Multi-Agent Celebration Architecture</span>
        </div>
      </div>
    </div>
  );
}
