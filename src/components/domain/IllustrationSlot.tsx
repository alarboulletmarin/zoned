/**
 * IllustrationSlot, the hole reserved for a hand-drawn doodle.
 *
 * The design system generates no illustration: the doodles are drawn by hand
 * and dropped in later. Until then the slot stays a dashed ink outline over the
 * cream 45° hatch, with the production brief printed inside it in mono. That is
 * deliberate, an empty rectangle would read as a bug, a printed brief reads as
 * a page still at the press.
 *
 * Once a drawing lands, `art` takes the hole: the frame and the hatch go with
 * it, since a drawing needs no dashed rectangle to say "something belongs
 * here". The brief stays the fallback for every slot still waiting.
 *
 * A drawing is never given a height. Its files carry a viewBox cut at the sole
 * and no ground line: the slot sets the width, the viewBox sets the ratio, and
 * the bottom of the box IS the line the figure stands on. A height in px would
 * letterbox the drawing and float the sole somewhere inside the box.
 *
 * `ground="rule"` stands the slot on its parent's bottom border. **Plus aucun
 * appel ne l'utilise** depuis le 12 septembre 2026 : les deux qui la passaient
 * (le héros de l'accueil, le cockpit) mordaient un filet de section, et les
 * filets de section ont été retirés. La prop reste parce que sept sols
 * INTERNES à des composants existent encore (état vide, coquille de
 * chargement, menu mobile, planche des zones, 404) et qu'un futur appelant
 * peut légitimement s'y poser, voir docs/doodles.md.
 *
 * Both strings come from the caller so the component itself carries no copy:
 * `brief` is printed, `label` is the accessible name, and `label` names the
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
  /** Block size of the reserved hole, in px, exposed as `--slot-h`. The brief's
      hole is that tall. A drawing ignores it by default, it takes the slot's
      width (`--slot-w`, set in CSS by the caller) and its own viewBox ratio,
      unless the caller's CSS reads `--slot-h` back, as session.css does to
      size the hero's stride by height with the width from the viewBox. */
  height?: number;
  /** `"rule"`: the slot stands on its parent's bottom border. The parent lays
      it out on the cross end (`align-items: end`) and draws the rule as
      `border-block-end`; the slot pulls itself down by the rule's thickness so
      the sole bites the line instead of hovering a hairline above it. */
  ground?: "rule";
  className?: string;
}

export function IllustrationSlot({
  brief,
  label,
  art: Art,
  height = 340,
  ground,
  className,
}: IllustrationSlotProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "zn-slot",
        Art && "zn-slot--art",
        ground === "rule" && "zn-slot--ground",
        className,
      )}
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
