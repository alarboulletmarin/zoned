import Art from "@/assets/doodles/run-cycle.svg?react";

/**
 * RunCycle — the figure that runs in place, six poses of 110ms each.
 *
 * The only animated doodle in the app, and it says one thing: that a wait is
 * real and that it is ADVANCING. That is the second half of the rule in
 * src/styles/design/motion.css, not an exception to it — anywhere other than
 * a wait it would be an ornament, and ornament stays forbidden
 * (docs/doodles.md, « La coquille court »).
 *
 * The size is given as a WIDTH and the viewBox supplies the ratio: a fixed
 * height letterboxes the drawing and floats the sole off the rule. It travels
 * through a custom property rather than an inline style, because an inline
 * style cannot be overridden by a media query.
 *
 * The parent draws the ground — a rule, the bottom edge of a card — and the
 * figure bites it by --rule-bite; the bottom of the frame IS the contact line.
 */
export function RunCycle({ width = 176 }: { width?: number }) {
  return (
    <span
      className="zn-run-cycle"
      style={{ "--rc-w": `${width}px` } as React.CSSProperties}
    >
      <Art className="rc" aria-hidden="true" focusable="false" />
    </span>
  );
}
