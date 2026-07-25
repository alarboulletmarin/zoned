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
 * iOS-style segmented control. Single-choice radiogroup with the active
 * option lifted by background + shadow. Wraps each option in a `flex-1`
 * cell so the layout fills the parent row width.
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
        "grid gap-1 rounded-lg bg-muted p-1",
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
            "inline-flex min-w-0 items-center justify-center gap-1.5 rounded-md px-1.5 py-1.5 text-sm font-medium transition-all sm:px-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.icon}
          <span className="truncate">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
