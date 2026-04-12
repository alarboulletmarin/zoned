import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlanSession } from "@/types/plan";
import type { SessionCompletionData } from "@/lib/planStorage";

interface SessionCompletionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: PlanSession | null;
  weekNumber: number;
  sessionName: string;
  onSave: (data: SessionCompletionData) => void;
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

function getRpeColor(value: number): string {
  if (value <= 2) return "var(--zone-1)";
  if (value <= 4) return "var(--zone-2)";
  if (value <= 6) return "var(--zone-3)";
  if (value <= 8) return "var(--zone-4)";
  if (value === 9) return "var(--zone-5)";
  return "var(--zone-6)";
}

export function SessionCompletionSheet({
  open,
  onOpenChange,
  session,
  weekNumber,
  sessionName,
  onSave,
}: SessionCompletionSheetProps) {
  const { t } = useTranslation("plan");

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

  // Reset state every time the sheet is opened for a (potentially different) session
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
        // Keep any existing actuals only if user hadn't overridden — we clear them on "as planned"
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto rounded-t-xl"
      >
        <SheetHeader>
          <SheetTitle>{t("sessionCompletion.sheetTitle")}</SheetTitle>
          <SheetDescription className="truncate">
            <span className="font-medium">{t("calendar.weekPrefix")}{weekNumber}</span>
            {" · "}
            {sessionName}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-2 space-y-4">
          {/* Choice radio */}
          <div
            role="radiogroup"
            aria-label={t("sessionCompletion.sheetTitle")}
            className="grid gap-2"
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
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-primary" : "border-muted-foreground/40",
                    )}
                  >
                    {selected && <span className="size-2 rounded-full bg-primary" />}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="block text-xs text-muted-foreground">{option.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Modified form */}
          {choice === "modified" && (
            <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted/30 p-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-muted-foreground">
                    {t("sessionCompletion.actualDuration")}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={1}
                    value={durationMin}
                    onChange={(e) => setDurationMin(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-muted-foreground">
                    {t("sessionCompletion.actualDistance")}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.1}
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>
            </div>
          )}

          {/* RPE — shown for completed & modified */}
          {choice !== "skipped" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("sessionCompletion.rpeLabel")}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: getRpeColor(rpe) }}
                >
                  {rpe}/10
                </span>
              </div>
              <div
                className="relative flex h-8 overflow-hidden rounded-lg"
                role="slider"
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={rpe}
                aria-label="RPE"
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const value = i + 1;
                  const isSelected = rpe === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRpe(value)}
                      className={cn(
                        "relative flex-1 border-r border-background/20 text-[11px] font-bold text-white/70 transition-all last:border-r-0",
                        isSelected && "scale-y-110 text-white",
                      )}
                      style={{
                        backgroundColor: getRpeColor(value),
                        opacity: isSelected ? 1 : value <= rpe ? 0.75 : 0.3,
                      }}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Note */}
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              {t("sessionCompletion.noteLabel")}
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 280))}
              rows={2}
              placeholder={t("sessionCompletion.notePlaceholder")}
              className="w-full resize-none rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        </div>

        <div className="flex gap-2 border-t border-border bg-background p-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            {t("view.cancel")}
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleSubmit}
          >
            {t("sessionCompletion.save")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
