/**
 * DoorCard — one of the few big choices a screen offers.
 *
 * The whole card is the link: the outline is the target, and the vermillon
 * line at the foot is the promise. It is a real <Link>, not a card with a
 * button inside, so keyboard focus, middle-click and "open in new tab" all
 * behave the way a navigation should.
 */

import type { FunctionComponent, SVGProps } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@/components/icons";
import { cn } from "@/lib/utils";

interface DoorCardProps {
  /** Mono uppercase micro-label above the title. Four words maximum. */
  kicker: string;
  title: string;
  body: string;
  /** The call to action printed at the foot, before the arrow. */
  cta: string;
  /** Router path this door opens. */
  to: string;
  /**
   * The doodle this door wears, imported with `?react`. Optional: a door
   * without one keeps the type-only card it has always been, which is what
   * the doors outside the home page still are.
   *
   * It is muet for a screen reader — the kicker and the title already name
   * the destination, and a figure walking says nothing a link label does not.
   */
  art?: FunctionComponent<SVGProps<SVGElement>>;
  className?: string;
}

export function DoorCard({
  kicker,
  title,
  body,
  cta,
  to,
  art: Art,
  className,
}: DoorCardProps) {
  return (
    <Link to={to} className={cn("zn-door", Art && "zn-door--art", className)}>
      {Art && (
        <Art className="zn-door__art" aria-hidden="true" focusable="false" />
      )}
      <span className="zn-kicker">{kicker}</span>
      <span className="zn-door__title">{title}</span>
      <span className="zn-door__body">{body}</span>
      <span className="zn-door__cta">
        {cta}
        <ArrowRight />
      </span>
    </Link>
  );
}
