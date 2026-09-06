/**
 * DoorCard — one of the few big choices a screen offers.
 *
 * The whole card is the link: the outline is the target, and the vermillon
 * line at the foot is the promise. It is a real <Link>, not a card with a
 * button inside, so keyboard focus, middle-click and "open in new tab" all
 * behave the way a navigation should.
 */

import { Link } from "react-router-dom";
import { ArrowRight } from "@/components/icons";
import { cn } from "@/lib/utils";

/* A door is type only. It carried a doodle for a while; at the 64-88px a card
   corner allows, the stroke read as one more pictogram, so the figures moved
   to the mobile menu, where the door you are in stands at 200px on a rule.
   Every door of the app is bare, on purpose — do not bring the prop back. */
interface DoorCardProps {
  /** Mono uppercase micro-label above the title. Four words maximum. */
  kicker: string;
  title: string;
  body: string;
  /** The call to action printed at the foot, before the arrow. */
  cta: string;
  /** Router path this door opens. */
  to: string;
  className?: string;
}

export function DoorCard({
  kicker,
  title,
  body,
  cta,
  to,
  className,
}: DoorCardProps) {
  return (
    <Link to={to} className={cn("zn-door", className)}>
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
