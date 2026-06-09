/**
 * Editorial atoms — shared building blocks for the landing-page redesign,
 * propagated to other pages so the typography, motion and density read
 * consistently across the whole app.
 *
 * Everything here respects `prefers-reduced-motion` via framer-motion's
 * `useReducedMotion()` hook — if the user opts out, the components render
 * as plain DOM without animation.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// ────────────────────────────────────────────────────────────────────────────
// EditorialTitle
// ────────────────────────────────────────────────────────────────────────────

/** Italic, sans-serif, semibold heading used at the top of every section.
 *  Fades up once when scrolled into view (or renders flat under
 *  prefers-reduced-motion). */
export function EditorialTitle({
  children,
  size = "lg",
  className = "",
  as = "h2",
}: {
  children: React.ReactNode;
  size?: "lg" | "xl" | "md";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const reduced = useReducedMotion();
  // Mobile-first: smaller heads on phones so the hero doesn't eat the first
  // screen (#106). Tablet/desktop (md:) sizes are unchanged.
  const sizeCls =
    size === "xl"
      ? "text-[40px] md:text-6xl"
      : size === "md"
        ? "text-xl sm:text-2xl md:text-3xl"
        : "text-[26px] sm:text-3xl md:text-4xl";
  const baseCls = `font-sans font-semibold italic leading-[1.05] tracking-tight ${sizeCls} ${className}`;

  const motionProps = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const },
      };

  if (as === "h1") {
    return (
      <motion.h1 className={baseCls} {...motionProps}>
        {children}
      </motion.h1>
    );
  }
  if (as === "h3") {
    return (
      <motion.h3 className={baseCls} {...motionProps}>
        {children}
      </motion.h3>
    );
  }
  return (
    <motion.h2 className={baseCls} {...motionProps}>
      {children}
    </motion.h2>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Stagger reveal (grid)
// ────────────────────────────────────────────────────────────────────────────

/** Wrap a grid/list whose children should fade-up in cascade as the block
 *  scrolls into view. Direct children must be `<StaggerItem>`. */
export function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Single fade-up child of a `StaggerGrid`. Renders flat under
 *  prefers-reduced-motion so layout never depends on the animation. */
export function StaggerItem({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0, 0, 0.2, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// FadeUp — single-element scroll reveal helper
// ────────────────────────────────────────────────────────────────────────────

/** Drop-in replacement for a `<div>` that fades up once it enters the
 *  viewport. Used for paragraphs, ledes, single cards. */
export function FadeUp({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "p" | "section";
}) {
  const reduced = useReducedMotion();
  const props = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.45, ease: [0, 0, 0.2, 1] as const, delay },
      };
  const Comp =
    as === "p" ? motion.p : as === "section" ? motion.section : motion.div;
  return (
    <Comp className={className} {...props}>
      {children}
    </Comp>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// useCountUp — animate an integer from 0 to `target`
// ────────────────────────────────────────────────────────────────────────────

/** Animate an integer counter up to `target` on mount. Skips the
 *  animation entirely when the user prefers reduced motion. */
export function useCountUp(target: number, durationMs = 900): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    if (target <= 0) {
      setValue(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, reduced]);
  return value;
}

// ────────────────────────────────────────────────────────────────────────────
// Divider
// ────────────────────────────────────────────────────────────────────────────

/** Thin horizontal rule used to separate landing-style sections. */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <hr className={`border-0 border-t border-foreground/15 ${className}`} />
  );
}

// ────────────────────────────────────────────────────────────────────────────
// DetailAccordion — progressive-disclosure section using <details>
// ────────────────────────────────────────────────────────────────────────────

import { ChevronDown } from "@/components/icons";

/** Native <details>/<summary> wrapper with the same look as the FAQ block
 *  on the home page: open state gets a soft bg-accent/40 wash, the chevron
 *  flips and turns primary, and the heading itself is an EditorialTitle.
 *  Keeps the SEO-friendly semantics (no JS state machine, content stays
 *  in the DOM at all times). */
export function DetailAccordion({
  title,
  caption,
  defaultOpen = false,
  children,
}: {
  title: React.ReactNode;
  /** Optional mono-uppercase eyebrow shown above the title. */
  caption?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group border-b border-foreground/15 [&[open]>summary>svg]:rotate-180 [&[open]>summary>svg]:text-primary"
    >
      <summary className="flex items-center gap-4 py-5 cursor-pointer list-none hover:bg-accent/30 transition-colors px-3 -mx-3 rounded-sm">
        <div className="flex-1 min-w-0">
          {caption && (
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-1">
              {caption}
            </p>
          )}
          <h3 className="font-sans font-semibold italic text-xl md:text-2xl leading-tight tracking-tight">
            {title}
          </h3>
        </div>
        <ChevronDown className="size-5 text-foreground/40 transition-all shrink-0" />
      </summary>
      <div className="pb-6 pt-2 px-1">{children}</div>
    </details>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Shared class strings
// ────────────────────────────────────────────────────────────────────────────

/** Apply to a card/Link element to give it the standard editorial hover
 *  treatment: subtle lift + soft shadow + border darken. Pair with the
 *  card's own background and border classes. */
export const editorialCardHover =
  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-foreground/40";
