/**
 * PhaseCard, one phase of a session (warmup, main set, cooldown).
 *
 * Running and strength sessions used to render this header independently,
 * down to the same duplicated class string. They share it now.
 *
 * Heading level: the page owns the h1, the enclosing Section owns the h2,
 * so a phase label is an h3. It is deliberately *not* mono-uppercase, that
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
    <section
      className={cn("zn-stack zn-phase", className)}
      style={{ "--gap": "var(--sp-3)" } as React.CSSProperties}
    >
      <div className="zn-row zn-row--baseline zn-row--split zn-phase__head">
        <div className="zn-fill">
          <h3 className="zn-phase__label">{label}</h3>
          {summary && <p className="zn-phase__summary">{summary}</p>}
        </div>
        {meta && <span className="zn-phase__meta">{meta}</span>}
      </div>
      <div
        className="zn-stack"
        style={{ "--gap": "var(--sp-3)" } as React.CSSProperties}
      >
        {children}
      </div>
    </section>
  );
}

export default PhaseCard;
