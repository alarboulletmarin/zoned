import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

function Slider({
  className,
  rangeClassName,
  thumbClassName,
  defaultValue,
  value,
  min = 0,
  max = 100,
  thumbLabel,
  thumbLabels,
  thumbValueText,
  thumbValueTexts,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** Extra classes on the filled part of the track — e.g. a zone colour. */
  rangeClassName?: string;
  /** Extra classes on every thumb. */
  thumbClassName?: string;
  /**
   * Accessible name for the thumb. Radix puts `role="slider"` on the thumb, not
   * on the root, so an `aria-label` passed alongside the other root props never
   * reaches the control a screen reader announces.
   */
  thumbLabel?: string;
  /** Per-thumb accessible names, for range sliders where the two ends differ. */
  thumbLabels?: string[];
  /** Human reading of the current value — "15 min" rather than "900". */
  thumbValueText?: string;
  /** Per-thumb human readings, same shape as `thumbLabels`. */
  thumbValueTexts?: string[];
}) {
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
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-filet relative grow overflow-hidden rounded-none data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-0.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-foreground absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
            rangeClassName
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          aria-label={thumbLabels?.[index] ?? thumbLabel}
          aria-valuetext={thumbValueTexts?.[index] ?? thumbValueText}
          className={cn(
            "border-foreground bg-accent-acid block size-5 shrink-0 rounded-none border-2 transition-[box-shadow] duration-150 ease-out hover:shadow-[3px_3px_0_var(--shadow-hard)] outline-2 outline-offset-2 outline-transparent focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50",
            thumbClassName
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
