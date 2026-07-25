/**
 * Section — the single way to introduce a block of page content.
 *
 * Before this existed, every page hand-rolled its own header and three
 * conventions coexisted on one page: eyebrow alone, eyebrow + title, title
 * alone. Worse, a collapsible section passed its title to the wrapper *and*
 * re-rendered it inside a Card, printing the same words twice.
 *
 * The rule this component enforces: a section owns exactly one heading.
 * Whatever it wraps must not repeat that heading. The optional eyebrow is a
 * category label, not a second title — use it when the section belongs to a
 * group, and leave it out otherwise.
 */

import { useReducedMotion } from "framer-motion";
import { ChevronDown } from "@/components/icons";
import { cn } from "@/lib/utils";
import { EditorialTitle } from "./index";

export interface SectionProps {
  /** The section's only heading. */
  title: React.ReactNode;
  /** Optional mono-uppercase category label above the title. */
  eyebrow?: string;
  /** Optional lead-in shown under the title. */
  description?: React.ReactNode;
  /** Renders as <details>, keeping content in the DOM for SEO. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  /** Trailing content in the header row, e.g. a "see all" link. */
  actions?: React.ReactNode;
  /** Heading level. Defaults to h2 — the page owns the single h1. */
  as?: "h2" | "h3";
  id?: string;
  className?: string;
  headerClassName?: string;
  children: React.ReactNode;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
      {children}
    </p>
  );
}

export function Section({
  title,
  eyebrow,
  description,
  collapsible = false,
  defaultOpen = false,
  actions,
  as = "h2",
  id,
  className,
  headerClassName,
  children,
}: SectionProps) {
  const reduced = useReducedMotion();

  const heading = (
    <div className={cn("min-w-0 space-y-1.5", headerClassName)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <EditorialTitle as={as} size="md">
        {title}
      </EditorialTitle>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[65ch]">
          {description}
        </p>
      )}
    </div>
  );

  if (collapsible) {
    return (
      <details
        id={id}
        open={defaultOpen}
        className={cn(
          "group border-b border-foreground/15",
          "[&[open]>summary>svg]:rotate-180 [&[open]>summary>svg]:text-primary",
          className
        )}
      >
        {/* min-h-11 keeps the tap target at 44px even when the title is short. */}
        <summary
          className={cn(
            "flex items-center gap-4 py-4 sm:py-5 min-h-11 cursor-pointer list-none",
            "px-3 -mx-3 rounded-sm hover:bg-accent/30 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <div className="flex-1 min-w-0">{heading}</div>
          <ChevronDown
            className={cn(
              "size-5 text-foreground/40 shrink-0",
              !reduced && "transition-all"
            )}
          />
        </summary>
        <div className="pb-6 pt-2 px-1">{children}</div>
      </details>
    );
  }

  return (
    <section id={id} className={className}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 mb-4">
        {heading}
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export default Section;
