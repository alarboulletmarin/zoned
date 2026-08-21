import { cn } from "@/lib/utils";

/**
 * Big mono headline result ("Ta VMA" / "16,5" / "km/h") shared by every
 * calculator's primary output. `label` sits in accent green above the
 * number, matching the design source's `--accent-text` treatment.
 */
export function CalculatorResultHeadline({
  label,
  value,
  unit,
  className,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-primary-text">{label}</p>
      <p className="font-mono text-6xl sm:text-7xl leading-[0.95] tabular-nums mt-2">{value}</p>
      {unit && (
        <p className="font-mono text-xs tracking-[0.1em] uppercase text-muted-foreground mt-1">{unit}</p>
      )}
    </div>
  );
}

/** Small secondary stat next to the headline result (e.g. "vVMA", "allure 10 km"). */
export function CalculatorResultStat({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("font-mono", className)}>
      <p className="text-2xl sm:text-[26px] tabular-nums">{value}</p>
      <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
