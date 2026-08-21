import { cn } from "@/lib/utils";

interface CalculatorTimeFieldProps {
  value: string;
  onChange: (value: string) => void;
  max: number;
  placeholder: string;
  unitLabel: string;
  ariaLabel: string;
  className?: string;
}

/**
 * A single h/m/s digit input in the big mono style used for chrono entry
 * across calculator forms (bottom border only, no box) — the numeric
 * clamping logic (`handleNumericInput`) stays with each page since it
 * differs slightly per field (hours capped at 9 vs. 23, etc.).
 */
export function CalculatorTimeField({
  value,
  onChange,
  max,
  placeholder,
  unitLabel,
  ariaLabel,
  className,
}: CalculatorTimeFieldProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="w-14 sm:w-16 border-0 border-b-[3px] border-foreground bg-transparent px-1 py-2 text-center font-mono text-2xl sm:text-3xl tabular-nums focus-visible:outline-none focus-visible:border-b-primary"
      />
      <span className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        {unitLabel}
      </span>
    </div>
  );
}
