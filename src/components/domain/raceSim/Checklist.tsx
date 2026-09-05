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
 *
 * Ticked/unticked is read off the checkbox in CSS rather than re-derived into
 * class names — the input is the state.
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
    <ul className={cn("zn-rs-check", className)}>
      {entries.map((entry) => (
        <li key={entry.key} className="zn-rs-check__item">
          <label className="zn-rs-check__row">
            <input
              type="checkbox"
              checked={checked[entry.key] ?? false}
              onChange={() => onToggle(entry.key)}
              className="zn-rs-check__input sr-only"
            />
            <span aria-hidden className="zn-rs-check__box">
              <Check size={12} />
            </span>

            {entry.time && (
              <span className="zn-rs-check__time">{entry.time}</span>
            )}

            <span className="zn-rs-check__body">
              <span className="zn-rs-check__label">{entry.text}</span>
              {entry.detail && (
                <span className="zn-rs-check__detail">{entry.detail}</span>
              )}
            </span>

            {entry.meta && (
              <span className="zn-rs-check__meta">{entry.meta}</span>
            )}
          </label>
        </li>
      ))}
    </ul>
  );
}
