import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  /** Full wording when `label` is abbreviated (tooltip + accessible name). */
  title?: string;
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  label?: string;
  className?: string;
}

/**
 * Segmented control. Single-choice radiogroup framed by a 2px contour, its
 * cells separated by 1px filets, with the active option filled in ink.
 * Wraps each option in a `flex-1` cell so the layout fills the parent row
 * width.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: SegmentedProps<T>) {
  const cols = options.length;
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "grid gap-px rounded-none border-2 border-foreground bg-foreground p-0",
        cols === 2 && "grid-cols-2",
        cols === 3 && "grid-cols-3",
        cols === 4 && "grid-cols-4",
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          aria-label={opt.title}
          title={opt.title}
          onClick={() => onChange(opt.value)}
          className={cn(
            // Horizontal padding stays modest so narrow columns (7-day rows)
            // never clip their label.
            "inline-flex min-w-0 items-center justify-center gap-1.5 rounded-none px-1.5 py-1.5 font-mono text-[11px] font-bold tracking-wide uppercase transition-colors duration-150 ease-out sm:px-2",
            "outline-2 -outline-offset-2 outline-transparent focus-visible:outline-ring",
            value === opt.value
              ? "bg-ink text-accent-acid"
              : "bg-background text-foreground hover:bg-secondary",
          )}
        >
          {opt.icon}
          <span className="truncate">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
