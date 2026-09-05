/**
 * The brand signature.
 *
 * The redesign has no drawn logo and does not invent one: the mark is the name
 * set in Bricolage Grotesque 800 at -0.04em, followed by a vermillon full stop.
 * The pulse line in `src/assets/logo.svg` is kept for the share cards, where a
 * picture has to survive being rendered to PNG with `skipFonts`, and as the
 * favicon — but the app's own chrome wears the wordmark.
 *
 * The name is not translated and is not an i18n key: it is a proper noun.
 */
export function Wordmark({
  size,
  className,
}: {
  /** Cap height in px. Defaults to the 26px the design system uses in the header. */
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={className ? `zn-wordmark ${className}` : "zn-wordmark"}
      style={size ? { fontSize: `${size}px` } : undefined}
    >
      zoned<span className="zn-wordmark__dot">.</span>
    </span>
  );
}
