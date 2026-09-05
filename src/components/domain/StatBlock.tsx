/**
 * StatBlock — one number, its mono label, and an optional footnote.
 *
 * The system's rule is "des chiffres, pas des adjectifs": every claim carries
 * its measure. This is the shape that measure takes.
 *
 * `tone` picks the surface: plain (on the page), card (outlined cream) or ink
 * (full inversion). There is no vermillon tone on purpose — a screen spends
 * its single accent fill on its primary action, so a stat that has to stand
 * out inverts to ink instead.
 */

import { cn } from "@/lib/utils";

type StatTone = "plain" | "card" | "ink";
type StatSize = "sm" | "md" | "lg";

interface StatBlockProps {
  /** The number, already formatted — including its unit or percent sign. */
  value: string;
  /** Mono uppercase micro-label. Four words maximum. */
  label: string;
  /** One short line under the label. */
  footnote?: string;
  tone?: StatTone;
  size?: StatSize;
  className?: string;
}

export function StatBlock({
  value,
  label,
  footnote,
  tone = "plain",
  size = "md",
  className,
}: StatBlockProps) {
  return (
    <div className={cn("zn-stat", className)} data-tone={tone} data-size={size}>
      <span className="zn-stat__value">{value}</span>
      <span className="zn-stat__label">{label}</span>
      {footnote ? <span className="zn-stat__foot">{footnote}</span> : null}
    </div>
  );
}
