/**
 * InteractiveCard — the shared shell for every card grid in the app.
 *
 * It used to be a motion component: a spring that lifted the card 3px and
 * scaled it to 1.02 on hover, a 0.97 squash on tap, and a radial-gradient glow
 * that followed the cursor, tinted by an `accent` prop.
 *
 * The redesign allows none of that. Nothing changes size on hover, nothing
 * changes elevation, and there are no gradients at all — the one shadow in the
 * system is a hard offset reserved for surfaces that genuinely float, which a
 * card in a list is not. What a card does on hover is change colour, and on
 * press it moves 1px down, like a stamp meeting paper.
 *
 * The whole signature is kept so no call site changes: `accent` and `glow` are
 * accepted and ignored. The `group group/card` markers are gone with the last
 * `group-hover:` utility that hung off them, and `relative` with them — the
 * grep for both across src comes back empty.
 *
 * Polymorphic: pass `to` for a router link, `href` for an anchor, or neither
 * for a div.
 */

import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface InteractiveCardProps {
  /** Ignored. The glow it tinted was a gradient, which the system forbids. */
  accent?: string;
  /** Ignored. See `accent`. */
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
  accent,
  glow,
  to,
  href,
  target,
  rel,
  className,
  children,
  ...rest
}: InteractiveCardProps) {
  void accent;
  void glow;

  const props = {
    className: cn("zn-card-hover", className),
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
