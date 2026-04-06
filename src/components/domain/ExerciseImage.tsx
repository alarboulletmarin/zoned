/**
 * ExerciseImage - Reusable component showing exercise start/end positions
 *
 * Displays two images side-by-side (position A -> position B) for strength exercises.
 * Handles missing images gracefully with a placeholder icon.
 * Clicking on images opens a full-screen zoom modal.
 */

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Dumbbell, ArrowRight, X } from "@/components/icons";

interface ExerciseImageProps {
  imageSlug?: string;
  exerciseName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-16",
  md: "h-24",
  lg: "h-32",
} as const;

function Placeholder({ size, name, showLabel = false }: { size: "sm" | "md" | "lg"; name: string; showLabel?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "flex items-center justify-center rounded-md bg-muted/60 border border-border/40 aspect-[4/3]",
          SIZE_CLASSES[size],
        )}
        aria-label={name}
      >
        <Dumbbell className="size-6 text-muted-foreground/40" />
      </div>
      {showLabel && (
        <span className="text-[10px] text-muted-foreground/60 italic">Illustration non disponible</span>
      )}
    </div>
  );
}

function ZoomModal({
  exerciseName,
  srcA,
  srcB,
  onClose,
}: {
  exerciseName: string;
  srcA: string;
  srcB: string;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  // Animate in on mount
  useEffect(() => {
    // Trigger fade-in on next frame so the transition runs
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
      )}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={exerciseName}
    >
      <div
        className="relative max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="size-6" />
        </button>

        {/* Exercise name */}
        <h3 className="text-white text-center mb-4 font-medium text-lg">
          {exerciseName}
        </h3>

        {/* Large images - horizontal on desktop, vertical on mobile */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <img
            src={srcA}
            alt={`${exerciseName} - start position`}
            className="max-h-[60vh] max-w-full sm:max-w-md rounded-lg object-contain"
          />
          <ArrowRight className="size-6 text-white/60 shrink-0 rotate-90 sm:rotate-0" />
          <img
            src={srcB}
            alt={`${exerciseName} - end position`}
            className="max-h-[60vh] max-w-full sm:max-w-md rounded-lg object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export function ExerciseImage({
  imageSlug,
  exerciseName,
  size = "md",
  className,
}: ExerciseImageProps) {
  const [errorA, setErrorA] = useState(false);
  const [errorB, setErrorB] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleErrorA = useCallback(() => setErrorA(true), []);
  const handleErrorB = useCallback(() => setErrorB(true), []);

  const hasImages = !!imageSlug;
  const showPlaceholder = !hasImages || (errorA && errorB);

  if (showPlaceholder) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Placeholder size={size} name={exerciseName} showLabel={!hasImages} />
      </div>
    );
  }

  const srcA = `/exercises/${imageSlug}-0.jpg`;
  const srcB = `/exercises/${imageSlug}-1.jpg`;

  return (
    <>
      <div
        className={cn("flex items-center gap-1.5 cursor-pointer group", className)}
        onClick={() => setIsZoomed(true)}
        role="button"
        tabIndex={0}
        aria-label={`Zoom on ${exerciseName} images`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsZoomed(true);
          }
        }}
      >
        {/* Position A (start) */}
        {errorA ? (
          <Placeholder size={size} name={`${exerciseName} - start`} />
        ) : (
          <img
            src={srcA}
            alt={`${exerciseName} - start position`}
            loading="lazy"
            onError={handleErrorA}
            className={cn(
              "rounded-md border border-border/40 shadow-sm object-cover aspect-[4/3] bg-muted/30 transition-shadow group-hover:shadow-md group-hover:border-border/70",
              SIZE_CLASSES[size],
            )}
          />
        )}

        {/* Arrow between positions */}
        <ArrowRight className="size-3.5 text-muted-foreground/50 shrink-0" />

        {/* Position B (end) */}
        {errorB ? (
          <Placeholder size={size} name={`${exerciseName} - end`} />
        ) : (
          <img
            src={srcB}
            alt={`${exerciseName} - end position`}
            loading="lazy"
            onError={handleErrorB}
            className={cn(
              "rounded-md border border-border/40 shadow-sm object-cover aspect-[4/3] bg-muted/30 transition-shadow group-hover:shadow-md group-hover:border-border/70",
              SIZE_CLASSES[size],
            )}
          />
        )}
      </div>

      {/* Zoom modal rendered as portal at body level */}
      {isZoomed &&
        createPortal(
          <ZoomModal
            exerciseName={exerciseName}
            srcA={srcA}
            srcB={srcB}
            onClose={() => setIsZoomed(false)}
          />,
          document.body,
        )}
    </>
  );
}
