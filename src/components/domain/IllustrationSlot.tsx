/**
 * IllustrationSlot — the hole reserved for a hand-drawn doodle.
 *
 * The design system generates no illustration: the doodles are drawn by hand
 * and dropped in later. Until then the slot stays a dashed ink outline over the
 * cream 45° hatch, with the production brief printed inside it in mono. That is
 * deliberate — an empty rectangle would read as a bug, a printed brief reads as
 * a page still at the press.
 *
 * Once a drawing lands, `art` takes the hole: the frame and the hatch go with
 * it, since a drawing needs no dashed rectangle to say "something belongs
 * here". The brief stays the fallback for every slot still waiting.
 *
 * Both strings come from the caller so the component itself carries no copy:
 * `brief` is printed, `label` is the accessible name — and `label` names the
 * slot whether or not a drawing is in it.
 */

import type { CSSProperties, FunctionComponent, SVGProps } from "react";
import { cn } from "@/lib/utils";

interface IllustrationSlotProps {
  /** The production brief, printed inside the hole in mono uppercase. */
  brief: string;
  /** Accessible name for the reserved slot. */
  label: string;
  /** The landed drawing, imported with `?react`. Falls back to `brief`. */
  art?: FunctionComponent<SVGProps<SVGElement>>;
  /** Block size in pixels. */
  height?: number;
  className?: string;
}

export function IllustrationSlot({
  brief,
  label,
  art: Art,
  height = 340,
  className,
}: IllustrationSlotProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("zn-slot", Art && "zn-slot--art", className)}
      style={{ "--slot-h": `${height}px` } as CSSProperties}
    >
      {Art ? (
        <Art className="zn-slot__art" />
      ) : (
        <span className="zn-slot__brief">{brief}</span>
      )}
    </div>
  );
}
