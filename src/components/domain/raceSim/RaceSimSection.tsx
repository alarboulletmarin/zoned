import { ChevronDown } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Anchored, collapsible block of the race plan.
 *
 * The header carries a `meta` slot so a collapsed section still says something
 * useful ("28 min", "9 étapes") — a chevron alone gives the reader no reason to
 * open it, which is why collapsing every section by default used to be
 * pointless here.
 */
export function RaceSimSection({
  id,
  icon,
  title,
  meta,
  open,
  onToggle,
  children,
  className,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  meta?: React.ReactNode;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("zn-rs-section", className)}>
      <Card size="flush" className="zn-rs-section__card">
        <button
          type="button"
          onClick={() => onToggle(id)}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          className="zn-rs-section__toggle"
        >
          <span className="zn-rs-section__icon">{icon}</span>
          <h3 className="zn-rs-section__title">{title}</h3>
          {meta && <span className="zn-rs-section__meta">{meta}</span>}
          <ChevronDown size={16} className="zn-rs-section__chevron" />
        </button>
        {open && (
          <div id={`${id}-panel`} className="zn-rs-section__panel">
            {children}
          </div>
        )}
      </Card>
    </section>
  );
}

/** Small-caps label used above every figure inside the plan cards. */
export function FieldLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("zn-kicker", className)}>{children}</p>;
}

/** Label + figure pair. The figure is the thing the eye should land on. */
export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("zn-rs-stat", className)}>
      <FieldLabel>{label}</FieldLabel>
      <p className="zn-rs-stat__value">{value}</p>
      {hint && <p className="zn-rs-stat__hint">{hint}</p>}
    </div>
  );
}
