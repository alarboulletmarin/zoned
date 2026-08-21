/**
 * InteractiveCard — the shared interaction shell for every card grid in the app.
 *
 * Zoned Brut: no blur, no bounce.
 *  - Hover reveals a *hard* offset shadow (`6px 6px 0 var(--shadow-hard)`) and
 *    lifts the card 2 px toward the top-left, on a fixed 150 ms `ease-out`
 *    transition. No spring, no scale, no overshoot — the card lands where it
 *    was aimed and stays there.
 *  - Under `prefers-reduced-motion` the lift is dropped entirely (`motion-safe:`
 *    gates it) and the shadow simply fades in over 120 ms.
 *  - Pure CSS: nothing mounts per pointer device, so touch and desktop share
 *    one code path.
 *
 * Polymorphic: pass `to` for a router link, `href` for an anchor, or neither
 * for a div. Keep your existing Tailwind on `className` (border, background,
 * `focus-visible:*`) — it is merged last, so a card that wants a different
 * offset or timing just declares it and wins.
 */

import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * `group group/card`: the unnamed group keeps consumers' existing
 * `group-hover:` utilities working when InteractiveCard replaces their Link;
 * `group/card` stays available for card-scoped hover styling.
 * `relative` is kept so absolutely-positioned children (favourite buttons,
 * badges) still anchor to the card.
 */
const CARD_INTERACTION = cn(
  "group group/card relative",
  "transition-[box-shadow,transform] duration-150 ease-out",
  "hover:shadow-[6px_6px_0_var(--shadow-hard)]",
  "motion-safe:hover:-translate-x-0.5 motion-safe:hover:-translate-y-0.5",
  "motion-reduce:duration-[120ms]"
);

interface InteractiveCardProps {
  /** @deprecated Ignored since the Zoned Brut pass — the hover shadow is a flat
   *  `var(--shadow-hard)`, not an accent-tinted glow. Kept so existing call
   *  sites keep compiling. */
  accent?: string;
  /** @deprecated Ignored since the Zoned Brut pass — there is no glow to opt
   *  out of. Kept so existing call sites keep compiling. */
  glow?: boolean;
  /** Render as a router `<Link to>`. */
  to?: string;
  /** Render as an `<a href>`. */
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler;
  "aria-label"?: string;
}

export function InteractiveCard({
  accent: _accent,
  glow: _glow,
  to,
  href,
  target,
  rel,
  className,
  children,
  ...rest
}: InteractiveCardProps) {
  const props = {
    className: cn(CARD_INTERACTION, className),
    ...rest,
  };

  if (to) {
    return (
      <Link to={to} {...props}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} target={target} rel={rel} {...props}>
        {children}
      </a>
    );
  }
  return <div {...props}>{children}</div>;
}
