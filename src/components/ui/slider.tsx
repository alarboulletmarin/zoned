import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  thumbLabel,
  thumbValueText,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  /**
   * Accessible name for the thumb. Radix puts `role="slider"` on the thumb, not
   * on the root, so an `aria-label` passed alongside the other root props never
   * reaches the control a screen reader announces.
   */
  thumbLabel?: string;
  /** Human reading of the current value — "15 min" rather than "900". */
  thumbValueText?: string;
}) {
  /**
   * Five call sites hand the name in as a root `aria-label` — the exact trap
   * the comment above describes — and their thumbs announce as unnamed
   * sliders. Falling back here names them without touching a call site.
   */
  const _thumbLabel = thumbLabel ?? props["aria-label"];

  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn("zn-slider", className)}
      {...props}
    >
      <SliderPrimitive.Track data-slot="slider-track" className="zn-slider__track">
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="zn-slider__range"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          aria-label={_thumbLabel}
          aria-valuetext={thumbValueText}
          className="zn-slider__thumb"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
