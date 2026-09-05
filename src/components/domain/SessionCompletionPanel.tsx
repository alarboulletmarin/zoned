import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { rpeColor } from "@/lib/sessionColors";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { PlanSession } from "@/types/plan";
import type { SessionCompletionData } from "@/lib/planStorage";

interface SessionCompletionPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: PlanSession | null;
  weekNumber: number;
  sessionName: string;
  onSave: (data: SessionCompletionData) => void;
  anchorElement?: HTMLElement | null;
}

type Choice = "completed" | "modified" | "skipped";

function getDefaultRpe(sessionType: PlanSession["sessionType"] | undefined): number {
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
      return 5;
  }
}

// ── Shared form body ────────────────────────────────────────────────

interface CompletionFormProps {
  choice: Choice;
  setChoice: (c: Choice) => void;
  durationMin: string;
  setDurationMin: (v: string) => void;
  distanceKm: string;
  setDistanceKm: (v: string) => void;
  rpe: number;
  setRpe: (v: number) => void;
  note: string;
  setNote: (v: string) => void;
  weekNumber: number;
  sessionName: string;
  onCancel: () => void;
  onSubmit: () => void;
  compact?: boolean;
}

function CompletionForm({
  choice,
  setChoice,
  durationMin,
  setDurationMin,
  distanceKm,
  setDistanceKm,
  rpe,
  setRpe,
  note,
  setNote,
  weekNumber,
  sessionName,
  onCancel,
  onSubmit,
  compact,
}: CompletionFormProps) {
  const { t } = useTranslation("plan");

  return (
    <div className="zn-pcomplete" data-compact={compact || undefined}>
      {/* Title + description */}
      <div className="zn-pcomplete__head">
        <p className="zn-pcomplete__title">
          {t("sessionCompletion.sheetTitle")}
        </p>
        <p className="zn-pcomplete__sub">
          {t("calendar.weekPrefix")}{weekNumber}
          {" · "}
          {sessionName}
        </p>
      </div>

      <div className="zn-pcomplete__body">
        {/* Choice radio */}
        <div
          role="radiogroup"
          aria-label={t("sessionCompletion.sheetTitle")}
          className="zn-pcomplete__choices"
        >
          {(
            [
              { value: "completed", label: t("sessionCompletion.asPlanned"), hint: t("sessionCompletion.asPlannedHint") },
              { value: "modified", label: t("sessionCompletion.modified"), hint: t("sessionCompletion.modifiedHint") },
              { value: "skipped", label: t("sessionCompletion.skipped"), hint: t("sessionCompletion.skippedHint") },
            ] as const
          ).map((option) => {
            const selected = choice === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setChoice(option.value)}
                className="zn-pcomplete__choice"
              >
                <span className="zn-pcomplete__radio" aria-hidden="true" />
                <span className="zn-pcomplete__label">
                  <span className="zn-pcomplete__name">{option.label}</span>
                  <span className="zn-pcomplete__hint">{option.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Modified form */}
        {choice === "modified" && (
          <div className="zn-pcomplete__actual">
            <label>
              <span className="zn-kicker zn-kicker--inline zn-plabel">
                {t("sessionCompletion.actualDuration")}
              </span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                className="zn-pfield"
              />
            </label>
            <label>
              <span className="zn-kicker zn-kicker--inline zn-plabel">
                {t("sessionCompletion.actualDistance")}
              </span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="zn-pfield"
              />
            </label>
          </div>
        )}

        {/* RPE -- shown for completed & modified */}
        {choice !== "skipped" && (
          <div className="zn-prpe">
            <div className="zn-prpe__head">
              <span className="zn-kicker zn-kicker--inline">
                {t("sessionCompletion.rpeLabel")}
              </span>
              <span className="zn-prpe__value">{rpe}/10</span>
            </div>
            <div
              className="zn-prpe__scale"
              role="slider"
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={rpe}
              aria-label="RPE"
            >
              {Array.from({ length: 10 }, (_, i) => {
                const value = i + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRpe(value)}
                    className="zn-prpe__step"
                    data-selected={rpe === value}
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
          </div>
        )}

        {/* Note */}
        <label className="zn-stack" style={{ "--gap": "var(--sp-3)" } as CSSProperties}>
          <span className="zn-kicker zn-kicker--inline">
            {t("sessionCompletion.noteLabel")}
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 280))}
            rows={compact ? 1 : 2}
            placeholder={t("sessionCompletion.notePlaceholder")}
            className="zn-pfield"
          />
        </label>
      </div>

      <div className="zn-pcomplete__foot">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          {t("view.cancel")}
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
        >
          {t("sessionCompletion.save")}
        </Button>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────

export function SessionCompletionPanel({
  open,
  onOpenChange,
  session,
  weekNumber,
  sessionName,
  onSave,
  anchorElement,
}: SessionCompletionPanelProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  const initialChoice: Choice = useMemo(() => {
    if (!session) return "completed";
    if (session.status === "modified") return "modified";
    if (session.status === "skipped") return "skipped";
    return "completed";
  }, [session]);

  const [choice, setChoice] = useState<Choice>(initialChoice);
  const [durationMin, setDurationMin] = useState<string>("");
  const [distanceKm, setDistanceKm] = useState<string>("");
  const [rpe, setRpe] = useState<number>(5);
  const [note, setNote] = useState<string>("");

  // Reset state every time the panel is opened for a (potentially different) session
  useEffect(() => {
    if (!open || !session) return;
    setChoice(initialChoice);
    setDurationMin(
      session.actualDurationMin != null
        ? String(session.actualDurationMin)
        : String(session.estimatedDurationMin ?? ""),
    );
    setDistanceKm(
      session.actualDistanceKm != null
        ? String(session.actualDistanceKm)
        : session.targetDistanceKm != null
          ? String(session.targetDistanceKm)
          : "",
    );
    setRpe(session.rpe ?? getDefaultRpe(session.sessionType));
    setNote(session.userNote ?? "");
  }, [open, session, initialChoice]);

  const anchorRef = useMemo(() => {
    if (!anchorElement) return undefined;
    return { current: anchorElement };
  }, [anchorElement]);

  if (!session) return null;

  const handleSubmit = () => {
    const nowIso = new Date().toISOString();

    if (choice === "skipped") {
      onSave({
        status: "skipped",
        completedAt: undefined,
        actualDurationMin: undefined,
        actualDistanceKm: undefined,
        rpe: undefined,
        userNote: note,
      });
      return;
    }

    if (choice === "completed") {
      onSave({
        status: "completed",
        completedAt: nowIso,
        actualDurationMin: undefined,
        actualDistanceKm: undefined,
        rpe,
        userNote: note,
      });
      return;
    }

    // choice === "modified"
    const parsedDuration = Number.parseFloat(durationMin.replace(",", "."));
    const parsedDistance = Number.parseFloat(distanceKm.replace(",", "."));
    onSave({
      status: "modified",
      completedAt: nowIso,
      actualDurationMin: Number.isFinite(parsedDuration) && parsedDuration >= 0 ? parsedDuration : undefined,
      actualDistanceKm: Number.isFinite(parsedDistance) && parsedDistance >= 0 ? parsedDistance : undefined,
      rpe,
      userNote: note,
    });
  };

  const formProps = {
    choice,
    setChoice,
    durationMin,
    setDurationMin,
    distanceKm,
    setDistanceKm,
    rpe,
    setRpe,
    note,
    setNote,
    weekNumber,
    sessionName,
    onCancel: () => onOpenChange(false),
    onSubmit: handleSubmit,
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom">
          <CompletionForm {...formProps} />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop/tablet: Popover anchored to the checkbox
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor virtualRef={anchorRef} />
      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="zn-pcomplete-pop"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <CompletionForm {...formProps} compact />
      </PopoverContent>
    </Popover>
  );
}
