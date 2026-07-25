import { Check } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface ChecklistEntry {
  /** Stable key, namespaced per section so lists never collide. */
  key: string;
  text: string;
  /** Optional leading clock, e.g. the warm-up schedule. */
  time?: string;
  /** Optional trailing chip, e.g. "2 × 30 s". */
  meta?: string;
  detail?: string;
}

/**
 * Tickable list. The J-1 checklist was the one block on this page that got
 * this right, so every actionable block now uses it.
 */
export function Checklist({
  entries,
  checked,
  onToggle,
  className,
}: {
  entries: ChecklistEntry[];
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
  className?: string;
}) {
  return (
    <ul className={cn("divide-y", className)}>
      {entries.map((entry) => {
        const isChecked = checked[entry.key] ?? false;
        return (
          <li key={entry.key}>
            <label className="flex cursor-pointer items-start gap-3 py-2.5">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(entry.key)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 grid size-[18px] shrink-0 place-items-center rounded border transition-colors",
                  "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1",
                  "[&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100",
                )}
              >
                <Check className="size-3" />
              </span>

              {entry.time && (
                <span
                  className={cn(
                    "w-11 shrink-0 font-mono text-sm tabular-nums",
                    isChecked ? "text-muted-foreground/50" : "text-muted-foreground",
                  )}
                >
                  {entry.time}
                </span>
              )}

              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm",
                    entry.detail && "font-medium",
                    isChecked && "text-muted-foreground line-through",
                  )}
                >
                  {entry.text}
                </span>
                {entry.detail && (
                  <span
                    className={cn(
                      "mt-0.5 block text-xs text-muted-foreground",
                      isChecked && "line-through",
                    )}
                  >
                    {entry.detail}
                  </span>
                )}
              </span>

              {entry.meta && (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
                  {entry.meta}
                </span>
              )}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
