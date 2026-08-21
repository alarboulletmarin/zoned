import { cn } from "@/lib/utils";

/**
 * Flat, hard-bordered panel used for every input/result block on a
 * calculator page — replaces the pre-migration `rounded-xl border
 * border-border/50 bg-gradient-to-br ...` treatment with the Brut language
 * already established by `Card` (rounded-none, 2px foreground border), kept
 * as a standalone primitive here because calculator layouts need plain
 * `<div>` panels (result strips, sidebars) that aren't semantically cards.
 */
export function CalculatorPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("border-2 border-foreground bg-card p-5 sm:p-6", className)}
      {...props}
    />
  );
}

/** Mono uppercase caption used to label a panel or a field group. */
export function CalculatorLabel({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
