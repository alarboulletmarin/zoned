/**
 * Editorial atoms — the shared heading, rhythm and reveal helpers used across
 * the app (56 files import from here).
 *
 * These used to be the landing page's motion kit: the title faded up as you
 * scrolled to it, grids cascaded their children in, single blocks rose into
 * place and counters ticked from zero. The redesign's rule is that motion
 * reports where something came from or that a wait is real — nothing moves to
 * decorate, and a heading sliding in as you reach it is decoration.
 *
 * So the components stay, with their signatures untouched, and render plain
 * DOM. Keeping the API is what lets 56 call sites go unedited; removing the
 * animation is what removed `framer-motion` from the app entirely.
 *
 * The type also changed families: `EditorialTitle` was Space Grotesk semibold
 * ITALIC, which was the app's old display face. The redesign's display is
 * Bricolage Grotesque, upright, and it is set through the `.zn-display` /
 * `.zn-title` roles in `src/styles/components/_type.css`.
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export { InteractiveCard } from "./InteractiveCard";

// ────────────────────────────────────────────────────────────────────────────
// EditorialTitle
// ────────────────────────────────────────────────────────────────────────────

/**
 * The heading at the top of a section.
 *
 * `size` picks a step of the display scale rather than a pixel size, so the
 * mobile reduction comes from the token layer instead of a breakpoint here:
 *   xl — the screen title, 46px (30px on a phone)
 *   lg — a section title, 38px
 *   md — a sub-section, 26px
 */
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
  const cls =
    size === "xl"
      ? cn("zn-display", className)
      : cn("zn-title", className);
  const level = size === "xl" ? "3" : size === "md" ? "3" : "1";
  const Tag = as;

  return (
    <Tag className={cls} data-level={level}>
      {children}
    </Tag>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Stagger reveal (grid)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Wraps a grid or list. The cascade it used to run is gone; the wrapper stays
 * so its 20-odd call sites keep their layout class and their DOM shape.
 */
export function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

/** A child of `StaggerGrid`. Renders its children directly. */
export function StaggerItem({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// ────────────────────────────────────────────────────────────────────────────
// FadeUp
// ────────────────────────────────────────────────────────────────────────────

/**
 * Was a scroll-triggered fade. Now a plain element of the requested tag —
 * `delay` is accepted and ignored so no call site has to change.
 */
export function FadeUp({
  children,
  className,
  delay,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "p" | "section";
}) {
  void delay;
  const Comp = as;
  return <Comp className={className}>{children}</Comp>;
}

// ────────────────────────────────────────────────────────────────────────────
// useCountUp
// ────────────────────────────────────────────────────────────────────────────

/**
 * Returns `target`.
 *
 * It used to animate an integer up from zero over 900ms. A number counting
 * itself up is the clearest case of movement that decorates: it delays the one
 * thing the reader came for. The hook stays so its call sites keep working,
 * and `durationMs` is accepted and ignored.
 *
 * The `useState`/`useEffect` pair is kept rather than returning the argument
 * directly, because `target` arrives asynchronously on several of these
 * screens and a plain return would not re-render on the value it settles on.
 */
export function useCountUp(target: number, durationMs = 900): number {
  void durationMs;
  const [value, setValue] = useState(target);
  useEffect(() => {
    setValue(target);
  }, [target]);
  return value;
}

// ────────────────────────────────────────────────────────────────────────────
// Divider
// ────────────────────────────────────────────────────────────────────────────

/** The ink rule that separates two blocks. */
export function Divider({ className = "" }: { className?: string }) {
  return <hr className={cn("zn-divider", className)} />;
}

// ────────────────────────────────────────────────────────────────────────────
// Shared class strings
// ────────────────────────────────────────────────────────────────────────────

/**
 * The hover treatment for a card that is itself a link or a button.
 *
 * It used to lift the card and drop a soft shadow under it. The system allows
 * neither: nothing changes size or elevation on hover, and a list card never
 * carries a shadow — the one shadow in the system is a hard offset reserved for
 * surfaces that genuinely float. A hovered card changes colour, and that is all.
 */
export const editorialCardHover = "zn-card-hover";
