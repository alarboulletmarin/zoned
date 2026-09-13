import * as React from "react";

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
 * Segmented control. Single-choice radiogroup with the selected option
 * inverted to ink. The group is one tab stop: the arrow keys move the
 * selection, as a radiogroup is required to.
 *
 * The paint lives in `src/styles/components/segmented.css`, selecting on the
 * `aria-checked` the radios already carry.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: SegmentedProps<T>) {
  const groupRef = React.useRef<HTMLDivElement>(null);
  const selected = options.findIndex((opt) => opt.value === value);
  // Nothing selected yet: the first option holds the tab stop so the group
  // never falls out of the tab order.
  const tabStop = selected === -1 ? 0 : selected;

  const move = (index: number) => {
    const next = options[index];
    if (!next) return;
    onChange(next.value);
    groupRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
      [index]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const count = options.length;
    if (count === 0) return;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        move((tabStop - 1 + count) % count);
        break;
      case "ArrowRight":
      case "ArrowDown":
        move((tabStop + 1) % count);
        break;
      case "Home":
        move(0);
        break;
      case "End":
        move(count - 1);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn("zn-segmented", className)}
    >
      {options.map((opt, index) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          aria-label={opt.title}
          title={opt.title}
          tabIndex={index === tabStop ? 0 : -1}
          onClick={() => onChange(opt.value)}
          className="zn-segmented__item"
        >
          {opt.icon}
          <span className="zn-segmented__label">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
