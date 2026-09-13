import type { CSSProperties } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { rpeColor } from "@/lib/sessionColors";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
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
      className="zn-pfeedback"
      data-leaving={isFadingOut || undefined}
      onMouseEnter={resetTimer}
      onTouchStart={resetTimer}
    >
      {/* Celebration line */}
      <div className="zn-pfeedback__head">
        <p className="zn-pfeedback__title">{celebration}</p>
        <p className="zn-pfeedback__sub">
          S{weekNumber}
          {" · "}
          {sessionName}
        </p>
      </div>

      {/* RPE ramp */}
      <div className="zn-prpe">
        <div className="zn-prpe__head">
          <span className="zn-kicker zn-kicker--inline">
            {t("feedback.howDidItFeel")}
          </span>
          <span className="zn-prpe__value">{selectedRpe}/10</span>
        </div>

        <div
          className="zn-prpe__scale"
          role="slider"
          aria-valuemin={1}
          aria-valuemax={10}
          aria-valuenow={selectedRpe}
          aria-label="RPE"
        >
          {Array.from({ length: 10 }, (_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleRpeClick(value)}
                className="zn-prpe__step"
                data-selected={selectedRpe === value}
              >
                <span className="zn-prpe__track">
                  <span
                    className="zn-prpe__fill"
                    style={{
                      "--zn-rpe-h": `${value * 10}%`,
                      "--zn-rpe-fill": rpeColor(value),
                    } as CSSProperties}
                  />
                </span>
                <span className="zn-prpe__num">{value}</span>
              </button>
            );
          })}
        </div>

        <div className="zn-prpe__foot">
          <span>{t("feedback.easy")}</span>
          <span className="zn-prpe__reading">
            {t(getRpeLabelKey(selectedRpe))}
          </span>
          <span>{t("feedback.rpeMaximal")}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="zn-pfeedback__actions">
        <Button type="button" variant="outline" size="sm" onClick={handleSkip}>
          {t("feedback.skip")}
        </Button>
        <Button type="button" size="sm" onClick={handleSave}>
          {t("feedback.save")}
        </Button>
      </div>
    </div>
  );
}
