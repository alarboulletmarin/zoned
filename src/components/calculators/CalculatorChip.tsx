import { cn } from "@/lib/utils";

interface CalculatorChipProps extends Omit<React.ComponentProps<"button">, "onClick"> {
  active: boolean;
  onClick: () => void;
}

/**
 * Segmented toggle chip — mono, uppercase, hard-edged. Mirrors the duration
 * chips on HomePage's "Aujourd'hui" module (`bg-accent-acid text-ink` when
 * active, `border-foreground` outline otherwise) so calculator forms read
 * as the same product rather than inventing a second toggle style.
 */
export function CalculatorChip({ active, onClick, className, children, ...props }: CalculatorChipProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "font-mono text-[11px] tracking-[0.08em] uppercase px-3 py-2.5 sm:px-3.5 transition-colors border-2 [@media(pointer:coarse)]:min-h-11",
        active
          ? "border-transparent bg-accent-acid text-ink"
          : "border-foreground/70 bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Wraps a row of `CalculatorChip` with its mono label above. */
export function CalculatorChipGroup({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-2.5">
        {label}
      </p>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
}
