/**
 * InteractiveCard — the shared motion shell for every card grid in the app.
 *
 * Mobile-first by design (≈95 % of traffic is touch):
 *  - Tap feedback (`whileTap`) is the *primary* interaction and runs on every
 *    device, so a tap always feels physical.
 *  - The cursor-following spotlight glow and the spring lift are *progressive
 *    enhancement* — they only mount on hover-capable, fine-pointer devices, so
 *    touch devices never pay for pointer maths they can't use.
 *  - Under `prefers-reduced-motion` it renders as a plain element with no
 *    transforms or glow, matching the rest of the editorial atoms.
 *
 * Polymorphic: pass `to` for a router link, `href` for an anchor, or neither
 * for a div. Keep your existing Tailwind on `className` (gradient, border,
 * `rounded-*`, `focus-visible:*`); just drop the old `hover:-translate-y-*` /
 * `transition-all` lift — the spring owns that now. The glow is tinted by
 * `accent` (any CSS colour; zone cards pass `var(--zone-N)`).
 */

import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

// Refined, not bouncy — a controlled spring that settles quickly.
const SPRING = { type: "spring", stiffness: 380, damping: 30 } as const;

interface InteractiveCardProps {
  /** CSS colour used to tint the cursor-following glow. Defaults to the brand
   *  primary; zone cards pass `var(--zone-N)`. */
  accent?: string;
  /** Opt out of the desktop spotlight glow (lift + tap stay). */
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
  accent = "var(--primary)",
  glow = true,
  to,
  href,
  target,
  rel,
  className,
  children,
  ...rest
}: InteractiveCardProps) {
  const reduced = useReducedMotion();
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(240px circle at ${mx}px ${my}px, ${accent}, transparent 70%)`;

  const enableHover = canHover && !reduced;
  const enableTap = !reduced;

  const handlePointerMove = enableHover
    ? (e: React.PointerEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - rect.left);
        my.set(e.clientY - rect.top);
      }
    : undefined;

  // `group group/card`: the unnamed group keeps consumers' existing
  // `group-hover:` utilities working when InteractiveCard replaces their Link;
  // `group/card` drives the glow opacity independently.
  const motionProps = {
    className: cn("group group/card relative", className),
    onPointerMove: handlePointerMove,
    whileHover: enableHover ? { y: -3, scale: 1.02 } : undefined,
    whileTap: enableTap ? { scale: 0.97 } : undefined,
    transition: SPRING,
    ...rest,
  };

  const overlay =
    enableHover && glow ? (
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/card:opacity-[0.16]"
        style={{ background }}
      />
    ) : null;

  if (to) {
    return (
      <MotionLink to={to} {...motionProps}>
        {overlay}
        {children}
      </MotionLink>
    );
  }
  if (href) {
    return (
      <motion.a href={href} target={target} rel={rel} {...motionProps}>
        {overlay}
        {children}
      </motion.a>
    );
  }
  return (
    <motion.div {...motionProps}>
      {overlay}
      {children}
    </motion.div>
  );
}
