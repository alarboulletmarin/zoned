/**
 * Section, the single way to introduce a block of page content.
 *
 * Before this existed, every page hand-rolled its own header and three
 * conventions coexisted on one page: eyebrow alone, eyebrow + title, title
 * alone. Worse, a collapsible section passed its title to the wrapper *and*
 * re-rendered it inside a Card, printing the same words twice.
 *
 * The rule this component enforces: a section owns exactly one heading.
 * Whatever it wraps must not repeat that heading. The optional eyebrow is a
 * category label, not a second title, use it when the section belongs to a
 * group, and leave it out otherwise.
 */

import type { CSSProperties } from "react";
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
  /** Heading level. Defaults to h2, the page owns the single h1. */
  as?: "h2" | "h3";
  id?: string;
  className?: string;
  headerClassName?: string;
  children: React.ReactNode;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="zn-kicker">
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
  const heading = (
    <div className={cn("zn-stack zn-fill", headerClassName)} style={{ "--gap": "var(--sp-3)" } as CSSProperties}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <EditorialTitle as={as} size="md">
        {title}
      </EditorialTitle>
      {description && (
        <p className="zn-body zn-body--sm zn-muted zn-measure">{description}</p>
      )}
    </div>
  );

  if (collapsible) {
    return (
      <details id={id} open={defaultOpen} className={cn("zn-disclosure", className)}>
        <summary className="zn-disclosure__summary">
          {heading}
          <ChevronDown className="zn-disclosure__chevron" />
        </summary>
        <div className="zn-disclosure__panel">{children}</div>
      </details>
    );
  }

  return (
    <section id={id} className={className}>
      <div className="zn-cluster zn-cluster--split zn-section__head">
        {heading}
        {actions && <div className="zn-fixed">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export default Section;
