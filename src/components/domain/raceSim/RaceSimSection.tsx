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
    <section id={id} className={cn("scroll-mt-24", className)}>
      <Card size="flush" className="overflow-hidden">
        <button
          type="button"
          onClick={() => onToggle(id)}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          className={cn(
            "flex w-full items-center gap-3 px-5 py-4 text-left transition-colors",
            "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          )}
        >
          <span className="text-muted-foreground shrink-0">{icon}</span>
          <h3 className="min-w-0 flex-1 text-sm font-semibold tracking-tight">
            {title}
          </h3>
          {meta && (
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {meta}
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
        {open && (
          <div id={`${id}-panel`} className="border-t px-5 py-4">
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
  return (
    <p
      className={cn(
        "text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
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
    <div className={cn("min-w-0", className)}>
      <FieldLabel>{label}</FieldLabel>
      <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
