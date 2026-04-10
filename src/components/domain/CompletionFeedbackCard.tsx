import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { SessionType } from "@/types";

interface CompletionFeedbackCardProps {
  sessionType: SessionType;
  sessionName: string;
  weekNumber: number;
  /** @deprecated Use useTranslation internally instead */
  isEn?: boolean;
  onSave: (rpe: number) => void;
  onSkip: () => void;
}

/** Maps session type to a translation key for celebration message */
function getCelebrationKey(sessionType: SessionType): string {
  switch (sessionType) {
    case "endurance":
    case "long_run":
      return "feedback.enduranceRun";
    case "tempo":
    case "threshold":
      return "feedback.tempoWork";
    case "vo2max":
    case "speed":
      return "feedback.intenseSession";
    case "recovery":
      return "feedback.recoverySession";
    default:
      return "feedback.sessionCompleted";
  }
}

/** Returns a default RPE pre-selection (1-10) based on session type */
function getDefaultRpe(sessionType: SessionType): number {
  switch (sessionType) {
    case "recovery":
      return 2;
    case "endurance":
    case "long_run":
      return 4;
    case "tempo":
    case "fartlek":
    case "hills":
    case "race_specific":
      return 6;
    case "threshold":
      return 7;
    case "vo2max":
    case "speed":
      return 9;
    default:
      return 4;
  }
}

const RPE_LABEL_KEYS: { range: [number, number]; key: string }[] = [
  { range: [1, 2], key: "feedback.rpeVeryEasy" },
  { range: [3, 4], key: "feedback.rpeEasy" },
  { range: [5, 6], key: "feedback.rpeModerate" },
  { range: [7, 8], key: "feedback.rpeHard" },
  { range: [9, 9], key: "feedback.rpeVeryHard" },
  { range: [10, 10], key: "feedback.rpeMaximal" },
];

function getRpeLabelKey(value: number): string {
  const entry = RPE_LABEL_KEYS.find((l) => value >= l.range[0] && value <= l.range[1]);
  return entry ? entry.key : "";
}

function getRpeColor(value: number): string {
  if (value <= 2) return "var(--zone-1)";
  if (value <= 4) return "var(--zone-2)";
  if (value <= 6) return "var(--zone-3)";
  if (value <= 8) return "var(--zone-4)";
  if (value === 9) return "var(--zone-5)";
  return "var(--zone-6)";
}

export function CompletionFeedbackCard({
  sessionType,
  sessionName,
  weekNumber,
  onSave,
  onSkip,
}: CompletionFeedbackCardProps) {
  const { t } = useTranslation("common");
  const [selectedRpe, setSelectedRpe] = useState<number>(getDefaultRpe(sessionType));
  const [isFadingOut, setIsFadingOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const celebration = t(getCelebrationKey(sessionType));

  const handleAutoClose = useCallback(() => {
    setIsFadingOut(true);
    setTimeout(() => {
      onSkip();
    }, 300);
  }, [onSkip]);

  // Auto-close after 5 seconds of no interaction
  useEffect(() => {
    timerRef.current = setTimeout(handleAutoClose, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleAutoClose]);

  // Reset timer on any interaction
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleAutoClose, 5000);
  }, [handleAutoClose]);

  const handleRpeClick = (rpe: number) => {
    resetTimer();
    setSelectedRpe(rpe);
  };

  const handleSave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onSave(selectedRpe);
  };

  const handleSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsFadingOut(true);
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-card border rounded-xl p-4 shadow-lg",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        isFadingOut && "animate-out fade-out slide-out-to-bottom-2 duration-300"
      )}
      onMouseEnter={resetTimer}
      onTouchStart={resetTimer}
    >
      {/* Celebration line */}
      <div className="text-center mb-3">
        <p className="text-base font-semibold">{celebration}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          <span className="font-normal">S{weekNumber}</span>
          {" \u00b7 "}
          {sessionName}
        </p>
      </div>

      {/* RPE label */}
      <p className="text-xs text-muted-foreground text-center mb-2">
        {t("feedback.howDidItFeel")}
      </p>

      {/* RPE gradient bar */}
      <div className="space-y-2 max-w-md mx-auto">
        {/* Tappable segmented bar */}
        <div className="relative flex h-8 rounded-lg overflow-hidden cursor-pointer" role="slider" aria-valuemin={1} aria-valuemax={10} aria-valuenow={selectedRpe} aria-label="RPE">
          {Array.from({ length: 10 }, (_, i) => {
            const value = i + 1;
            const isSelected = selectedRpe === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleRpeClick(value)}
                className={cn(
                  "flex-1 relative flex items-center justify-center text-[11px] font-bold transition-all border-r border-background/20 last:border-r-0",
                  isSelected ? "text-white scale-y-110 z-10" : "text-white/60 hover:text-white/90"
                )}
                style={{
                  backgroundColor: getRpeColor(value),
                  opacity: isSelected ? 1 : value <= selectedRpe ? 0.7 : 0.3,
                }}
              >
                {value}
                {isSelected && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>
        {/* Label */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground/60">{t("feedback.easy")}</span>
          <span className="font-medium" style={{ color: getRpeColor(selectedRpe) }}>
            {selectedRpe}/10 — {t(getRpeLabelKey(selectedRpe))}
          </span>
          <span className="text-muted-foreground/60">Max</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={handleSkip}
          className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
        >
          {t("feedback.skip")}
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {t("feedback.save")}
        </button>
      </div>
    </div>
  );
}
