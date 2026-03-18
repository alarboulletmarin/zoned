// src/components/domain/GlossaryLinkedText.tsx
// Renders text with glossary terms and article references auto-linked
// as interactive popover triggers (same UX on desktop and mobile, like Wikipedia).

import { useState, useRef, useMemo, type ReactNode } from "react";
import { useGlossaryMatcher } from "@/contexts/GlossaryMatcherContext";
import { findContentMatches, type MatchableContent } from "@/lib/content-matcher";
import { ContentPreview } from "@/components/domain/ContentPreview";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/useIsMobile";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GlossaryLinkedTextProps {
  text: string;
  className?: string;
  as?: "span" | "p";
}

// ---------------------------------------------------------------------------
// Link styles
// ---------------------------------------------------------------------------

const GLOSSARY_LINK_CLASS =
  "underline decoration-dotted underline-offset-2 decoration-primary/40 text-inherit hover:text-primary hover:decoration-primary transition-colors cursor-pointer";

const ARTICLE_LINK_CLASS =
  "underline decoration-dotted underline-offset-2 decoration-blue-400/40 text-inherit hover:text-blue-600 dark:hover:text-blue-400 hover:decoration-blue-500 transition-colors cursor-pointer";

function getLinkHref(content: MatchableContent): string {
  return content.type === "glossary"
    ? `/glossary/${content.data.id}`
    : `/learn/${content.data.slug}`;
}

function getLinkClass(content: MatchableContent): string {
  return content.type === "glossary" ? GLOSSARY_LINK_CLASS : ARTICLE_LINK_CLASS;
}

// ---------------------------------------------------------------------------
// Content link with popover (unified for desktop & mobile)
// ---------------------------------------------------------------------------

function ContentLink({
  content,
  matchedText,
}: {
  content: MatchableContent;
  matchedText: string;
}) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Desktop: open on hover with delay
  const scheduleOpen = () => {
    clearTimeout(closeTimeoutRef.current);
    openTimeoutRef.current = setTimeout(() => setOpen(true), 300);
  };

  const scheduleClose = () => {
    clearTimeout(openTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 200);
  };

  const cancelClose = () => {
    clearTimeout(closeTimeoutRef.current);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <a
          href={getLinkHref(content)}
          className={getLinkClass(content)}
          // Desktop: hover to open
          onMouseEnter={!isMobile ? scheduleOpen : undefined}
          onMouseLeave={!isMobile ? scheduleClose : undefined}
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) return;
            e.preventDefault();
            // Mobile: tap to toggle
            if (isMobile) {
              setOpen((prev) => !prev);
            }
          }}
        >
          {matchedText}
        </a>
      </PopoverTrigger>
      <PopoverContent
        side={isMobile ? "bottom" : "top"}
        align="center"
        className="w-72 p-3"
        // Desktop: keep open while hovering content
        onMouseEnter={!isMobile ? cancelClose : undefined}
        onMouseLeave={!isMobile ? scheduleClose : undefined}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ContentPreview
          type={content.type}
          data={content.data as never}
          onNavigate={() => setOpen(false)}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function GlossaryLinkedText({
  text,
  className,
  as: Tag = "span",
}: GlossaryLinkedTextProps) {
  const matcher = useGlossaryMatcher();

  const nodes: ReactNode[] = useMemo(() => {
    if (!matcher) return [text];

    const matches = findContentMatches(text, matcher);
    if (matches.length === 0) return [text];

    const parts: ReactNode[] = [];
    let cursor = 0;

    for (const match of matches) {
      if (match.start > cursor) {
        parts.push(text.slice(cursor, match.start));
      }

      const id =
        match.content.type === "glossary"
          ? match.content.data.id
          : match.content.data.slug;

      parts.push(
        <ContentLink
          key={`${match.content.type}-${id}-${match.start}`}
          content={match.content}
          matchedText={match.matchedText}
        />,
      );

      cursor = match.end;
    }

    if (cursor < text.length) {
      parts.push(text.slice(cursor));
    }

    return parts;
  }, [text, matcher]);

  return <Tag className={className}>{nodes}</Tag>;
}

export default GlossaryLinkedText;
