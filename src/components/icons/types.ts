/**
 * Shared icon contract.
 *
 * Kept in its own module so that both the generated `index.tsx` and the
 * hand-written `brand.tsx` can depend on it without a circular import.
 */

export interface IconProps {
  className?: string;
  size?: number | string;
  /**
   * Switch to the solid variant of the glyph.
   *
   * Material Symbols ships a `-fill` counterpart for every icon we use, so
   * this is honoured across the whole set. The brand logos in `brand.tsx`
   * have a single form and ignore it.
   */
  filled?: boolean;
}
