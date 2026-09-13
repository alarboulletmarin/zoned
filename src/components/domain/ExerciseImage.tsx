/**
 * ExerciseImage - Reusable component showing exercise start/end positions
 *
 * Displays two images side-by-side (position A -> position B) for strength exercises.
 * Handles missing images gracefully with a placeholder icon.
 * Clicking on images opens a full-screen zoom modal.
 *
 * Paint: `src/styles/components/strength.css` (.zn-eximg / .zn-exzoom).
 */

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Dumbbell, ArrowRight, X } from "@/components/icons";

interface ExerciseImageProps {
  imageSlug?: string;
  exerciseName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** The empty frame. Its height comes from the --zn-eximg-h the wrapper sets. */
function Placeholder({ name, showLabel = false }: { name: string; showLabel?: boolean }) {
  const { t } = useTranslation("strength");

  return (
    <div className="zn-eximg__ph">
      <div className="zn-eximg__slot" aria-label={name}>
        <Dumbbell size={22} />
      </div>
      {showLabel && (
        <span className="zn-eximg__caption">{t("detail.imageUnavailable")}</span>
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
  const { t } = useTranslation(["strength", "common"]);
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
      className="zn-exzoom"
      data-visible={visible}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={exerciseName}
    >
      <div
        className="zn-exzoom__panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="zn-dialog__close"
          aria-label={t("common:actions.close")}
        >
          <X size={16} />
        </button>

        {/* Exercise name */}
        <h3 className="zn-exzoom__title">{exerciseName}</h3>

        {/* Large images - horizontal on desktop, vertical on mobile */}
        <div className="zn-exzoom__pair">
          <img
            src={srcA}
            alt={`${exerciseName} · ${t("strength:detail.positionStart")}`}
          />
          <ArrowRight size={22} />
          <img
            src={srcB}
            alt={`${exerciseName} · ${t("strength:detail.positionEnd")}`}
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
  const { t } = useTranslation("strength");
  const [errorA, setErrorA] = useState(false);
  const [errorB, setErrorB] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleErrorA = useCallback(() => setErrorA(true), []);
  const handleErrorB = useCallback(() => setErrorB(true), []);

  const hasImages = !!imageSlug;
  const showPlaceholder = !hasImages || (errorA && errorB);

  const startLabel = t("detail.positionStart");
  const endLabel = t("detail.positionEnd");

  if (showPlaceholder) {
    return (
      <div className={cn("zn-eximg", className)} data-size={size}>
        <Placeholder name={exerciseName} showLabel={!hasImages} />
      </div>
    );
  }

  const srcA = `/exercises/${imageSlug}-0.jpg`;
  const srcB = `/exercises/${imageSlug}-1.jpg`;

  return (
    <>
      <div
        className={cn("zn-eximg", className)}
        data-size={size}
        data-zoomable="true"
        onClick={() => setIsZoomed(true)}
        role="button"
        tabIndex={0}
        aria-label={t("detail.zoomImages", { name: exerciseName })}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsZoomed(true);
          }
        }}
      >
        {/* Position A (start) */}
        {errorA ? (
          <Placeholder name={`${exerciseName} · ${startLabel}`} />
        ) : (
          <img
            src={srcA}
            alt={`${exerciseName} · ${startLabel}`}
            loading="lazy"
            onError={handleErrorA}
            className="zn-eximg__frame"
          />
        )}

        {/* Arrow between positions */}
        <ArrowRight size={14} className="zn-eximg__arrow" />

        {/* Position B (end) */}
        {errorB ? (
          <Placeholder name={`${exerciseName} · ${endLabel}`} />
        ) : (
          <img
            src={srcB}
            alt={`${exerciseName} · ${endLabel}`}
            loading="lazy"
            onError={handleErrorB}
            className="zn-eximg__frame"
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
