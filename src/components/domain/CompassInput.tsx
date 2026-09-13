import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CompassInputProps {
  value: number;
  onChange: (deg: number) => void;
  cardinalLabel: string;
  size?: number;
  className?: string;
  ariaLabel?: string;
}

const CARDINALS: Array<{ deg: number; label: string }> = [
  { deg: 0, label: "N" },
  { deg: 90, label: "E" },
  { deg: 180, label: "S" },
  { deg: 270, label: "W" },
];

export function CompassInput({
  value,
  onChange,
  cardinalLabel,
  size = 168,
  className,
  ariaLabel,
}: CompassInputProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const rad = Math.atan2(dx, -dy);
      const deg = ((rad * 180) / Math.PI + 360) % 360;
      onChange(Math.round(deg));
    },
    [onChange],
  );

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => updateFromPointer(e.clientX, e.clientY);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, updateFromPointer]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 15 : 5;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange((value + step) % 360);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange((value - step + 360) % 360);
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(0);
    }
  };

  const radius = size / 2;
  const tickInner = radius - 8;
  const tickOuter = radius - 2;

  return (
    <div className={cn("zn-compass", className)}>
      <div
        ref={containerRef}
        role="slider"
        aria-label={ariaLabel ?? "Direction"}
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={value}
        aria-valuetext={`${cardinalLabel} · ${value}°`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          e.preventDefault();
          (e.target as Element).setPointerCapture?.(e.pointerId);
          setDragging(true);
          updateFromPointer(e.clientX, e.clientY);
        }}
        className={cn("zn-compass__dial", dragging && "zn-compass__dial--dragging")}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          {Array.from({ length: 24 }, (_, i) => {
            const deg = i * 15;
            const isCardinal = deg % 90 === 0;
            const inner = isCardinal ? tickInner - 4 : tickInner;
            const rad = ((deg - 90) * Math.PI) / 180;
            const x1 = radius + Math.cos(rad) * inner;
            const y1 = radius + Math.sin(rad) * inner;
            const x2 = radius + Math.cos(rad) * tickOuter;
            const y2 = radius + Math.sin(rad) * tickOuter;
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={cn(
                  "zn-compass__tick",
                  isCardinal && "zn-compass__tick--cardinal",
                )}
              />
            );
          })}
        </svg>

        {CARDINALS.map(({ deg, label }) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          const r = radius - 22;
          const x = radius + Math.cos(rad) * r;
          const y = radius + Math.sin(rad) * r;
          return (
            <span
              key={label}
              className={cn(
                "zn-compass__cardinal",
                deg === 0 && "zn-compass__cardinal--n",
              )}
              style={{ left: x, top: y }}
            >
              {label}
            </span>
          );
        })}

        <div
          className="zn-compass__needle"
          style={{
            width: 4,
            height: radius - 18,
            transform: `translate(-50%, -100%) rotate(${value}deg)`,
            transformOrigin: "50% 100%",
          }}
        >
          <div className="zn-compass__needle-shaft" />
          <div className="zn-compass__needle-point" />
        </div>

        <div className="zn-compass__hub" />
      </div>

      <div className="zn-compass__value">
        <span className="zn-compass__value-cardinal">{cardinalLabel}</span>
        <span> · {value}°</span>
      </div>
    </div>
  );
}

export default CompassInput;
