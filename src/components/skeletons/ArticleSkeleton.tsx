import { type CSSProperties } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Long-form article placeholder, title, byline meta, hero block,
 * intro paragraph, two body paragraphs. Tight enough to fit the
 * narrow reading width but tall enough to occupy the fold while the
 * Markdown renderer hydrates.
 *
 * Sized against ArticlePage: the reading measure, the display-2 title (which
 * drops from 68px to 38px at 640px, so the title blocks drop with it), the
 * mono byline and `.zn-prose`'s 19px-on-1.7 lines, 18px apart.
 *
 * The lines inside one block are flush, because they are the wrapped lines of
 * a single paragraph, or of a single title, and wrapped lines sit a
 * line-height apart, not a stack step apart. Spacing them like separate
 * paragraphs, which the Tailwind version did, over-reserved 16px per
 * paragraph.
 *
 * The hero is the one block with no counterpart on the page today,
 * ArticlePage renders no image, so it keeps the height it already reserved
 * rather than inventing one.
 */
export function ArticleSkeleton() {
  return (
    <div
      className="zn-stack zn-measure zn-article-skel"
      style={{ "--gap": "var(--sp-9)" } as CSSProperties}
      aria-hidden
    >
      {/* Breadcrumbs / back link */}
      <Skeleton className="zn-article-skel__crumb" />

      {/* Title */}
      <div className="zn-stack" style={{ "--gap": "0px" } as CSSProperties}>
        <Skeleton className="zn-article-skel__title zn-article-skel__title--long" />
        <Skeleton className="zn-article-skel__title zn-article-skel__title--short" />
      </div>

      {/* Meta row */}
      <div className="zn-row">
        <Skeleton className="zn-article-skel__meta zn-article-skel__meta--mid" />
        <Skeleton className="zn-article-skel__meta zn-article-skel__meta--short" />
        <Skeleton className="zn-article-skel__meta zn-article-skel__meta--long" />
      </div>

      {/* Hero block */}
      <Skeleton className="zn-article-skel__hero" variant="zone-shimmer" />

      {/* Intro */}
      <div className="zn-stack" style={{ "--gap": "0px" } as CSSProperties}>
        <Skeleton className="zn-article-skel__line" />
        <Skeleton className="zn-article-skel__line zn-article-skel__line--long" />
        <Skeleton className="zn-article-skel__line zn-article-skel__line--short" />
      </div>

      {/* Section heading */}
      <Skeleton className="zn-article-skel__h2" />

      {/* Body paragraphs */}
      <div className="zn-stack" style={{ "--gap": "0px" } as CSSProperties}>
        <Skeleton className="zn-article-skel__line" />
        <Skeleton className="zn-article-skel__line zn-article-skel__line--mid" />
        <Skeleton className="zn-article-skel__line" />
        <Skeleton className="zn-article-skel__line zn-article-skel__line--short" />
      </div>
      <div className="zn-stack" style={{ "--gap": "0px" } as CSSProperties}>
        <Skeleton className="zn-article-skel__line" />
        <Skeleton className="zn-article-skel__line zn-article-skel__line--short" />
      </div>
    </div>
  );
}
