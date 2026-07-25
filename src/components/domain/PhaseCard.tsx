/**
 * PhaseCard — one phase of a session (warmup, main set, cooldown).
 *
 * Running and strength sessions used to render this header independently,
 * down to the same duplicated class string. They share it now.
 *
 * Heading level: the page owns the h1, the enclosing Section owns the h2,
 * so a phase label is an h3. It is deliberately *not* mono-uppercase — that
 * treatment belongs to Section eyebrows, and reusing it here was one of the
 * three competing header styles on the session page.
 */

import { cn } from "@/lib/utils";

interface PhaseCardProps {
  /** Warmup / Main set / Cooldown. */
  label: string;
  /** One-line shorthand of the phase, e.g. "2 x (12 x 30s / 30s)". */
  summary?: string | null;
  /** Total duration of the phase, right-aligned against the label. */
  meta?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function PhaseCard({ label, summary, meta, className, children }: PhaseCardProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight">{label}</h3>
          {summary && (
            <p className="text-xs text-muted-foreground tracking-tight mt-0.5">{summary}</p>
          )}
        </div>
        {meta && (
          <span className="font-mono text-xs text-muted-foreground tabular-nums shrink-0">
            {meta}
          </span>
        )}
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

export default PhaseCard;
