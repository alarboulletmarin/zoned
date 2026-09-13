import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Two handles need two names, or a screen reader announces the same control
 * twice over. "minimum" and "maximum" are spelled identically in French and in
 * English, so the pair costs no i18n key.
 */
function boundLabel(name: string | undefined, edge: "minimum" | "maximum") {
  return name ? `${name} ${edge}` : edge;
}

type SliderProps = {
  /** Always an array, even for a single handle, the shape all 13 call sites pass. */
  value: number[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: number[]) => void;
  /** Fired when the value is committed, a released drag, an arrow key, not on every step. */
  onValueCommit?: (value: number[]) => void;
  /** Accessible name for the handle. */
  thumbLabel?: string;
  /** Human reading of the current value, "15 min" rather than "900". */
  thumbValueText?: string;
  "aria-label"?: string;
  id?: string;
};

/**
 * One `<input type="range">` per handle. The native control already answers
 * arrows, Home, End and PageUp/PageDown, exposes `role="slider"` and takes
 * focus, none of that is reimplemented here. The rail and the retained span
 * are a decorative layer underneath; the inputs paint only their thumbs.
 *
 * Two handles are two stacked inputs rather than one control with two grips,
 * so each handle keeps that native keyboard contract for itself. Crossing is
 * prevented by clamping in the `onChange` handler, never by swallowing the event,
 * a swallowed key is a key that appears broken.
 */
function Slider({
  className,
  value,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  onValueChange,
  onValueCommit,
  thumbLabel,
  thumbValueText,
  id,
  "aria-label": ariaLabel,
}: SliderProps) {
  /**
   * Five call sites hand the name in as `aria-label` rather than `thumbLabel`.
   * Falling back here names them without touching a call site.
   */
  const label = thumbLabel ?? ariaLabel;

  const isRange = value.length > 1;
  const [low, high] = isRange ? [value[0], value[1]] : [min, value[0]];

  const span = max - min || 1;
  const pct = (v: number) =>
    `${Math.min(100, Math.max(0, ((v - min) / span) * 100))}%`;

  /**
   * `change` is the platform's own end-of-gesture signal for a range input:
   * once when a drag is released, once per arrow key, and never for a Tab that
   * only moved the focus in. It has to be bound by hand, because React's
   * `onChange` is the `input` event, and it has to be `change` rather than
   * `pointerup`, because a touch drag ends in `pointercancel`: Chrome hands
   * the slide to the compositor and no `pointerup` is ever delivered. Missing
   * it left a phone-dragged value applied but never committed.
   *
   * The prop is already current by then: the drag has been reporting through
   * onValueChange all along, and `change` lands after the last of them.
   */
  const latest = React.useRef({ value, onValueCommit });
  latest.current = { value, onValueCommit };

  const bindCommit = React.useCallback((el: HTMLInputElement | null) => {
    if (!el) return;
    const onCommit = () => latest.current.onValueCommit?.(latest.current.value);
    el.addEventListener("change", onCommit);
    return () => el.removeEventListener("change", onCommit);
  }, []);

  const shared = {
    ref: bindCommit,
    type: "range" as const,
    className: "zn-slider__input",
    min,
    max,
    step,
    disabled,
    "aria-valuetext": thumbValueText,
  };

  return (
    <div
      data-slot="slider"
      data-range={isRange || undefined}
      data-disabled={disabled || undefined}
      className={cn("zn-slider", className)}
      style={
        {
          "--zn-slider-from": pct(low),
          "--zn-slider-to": pct(high),
        } as React.CSSProperties
      }
    >
      <span className="zn-slider__track" aria-hidden="true">
        <span className="zn-slider__range" />
      </span>

      {isRange ? (
        <>
          <input
            {...shared}
            id={id}
            value={low}
            aria-label={boundLabel(label, "minimum")}
            /* Both handles at the top of the travel would leave the low one
               buried under the high one and impossible to drag back down. */
            style={low > (min + max) / 2 ? { zIndex: 2 } : undefined}
            onChange={(event) =>
              onValueChange?.([
                Math.min(event.currentTarget.valueAsNumber, high),
                high,
              ])
            }
          />
          <input
            {...shared}
            value={high}
            aria-label={boundLabel(label, "maximum")}
            onChange={(event) =>
              onValueChange?.([
                low,
                Math.max(event.currentTarget.valueAsNumber, low),
              ])
            }
          />
        </>
      ) : (
        <input
          {...shared}
          id={id}
          value={high}
          aria-label={label}
          onChange={(event) =>
            onValueChange?.([event.currentTarget.valueAsNumber])
          }
        />
      )}
    </div>
  );
}

export { Slider };
