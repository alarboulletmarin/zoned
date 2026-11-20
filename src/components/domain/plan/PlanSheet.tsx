import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Segmented } from "@/components/ui/segmented";
import { PlanTimeline } from "@/components/domain/PlanTimeline";
import { PlanStatsSection } from "@/components/domain/PlanStatsSection";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import type { PlanCardModel } from "@/lib/planCardModel";
import { planWeekRange } from "@/lib/weekReview";
import type { TrainingPlan } from "@/types/plan";
import { usePlanFormats } from "./planFormat";

type Segment = "weeks" | "numbers";

interface PlanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: TrainingPlan;
  model: PlanCardModel;
  selectedWeek: number;
  currentWeek: number;
  side: "bottom" | "right";
  onSelectWeek: (weekNumber: number) => void;
  onLogActivity: () => void;
}

/**
 * La feuille Le plan, derrière le bouton calendrier : tout ce qui ne tient
 * pas dans une semaine. Deux segments :
 *
 * - Semaines : la frise du plan (`PlanTimeline`, variante large), puis la
 *   liste des semaines, chacune avec sa phase, ses dates et son fait sur son
 *   prévu. Un appui choisit la semaine et ferme la feuille. À l'ouverture,
 *   le focus va sur la semaine choisie, pas sur la première.
 * - Chiffres : `PlanStatsSection`, l'ancien onglet Statistiques, tel quel.
 */
export function PlanSheet({
  open,
  onOpenChange,
  plan,
  model,
  selectedWeek,
  currentWeek,
  side,
  onSelectWeek,
  onLogActivity,
}: PlanSheetProps) {
  const { t } = useTranslation("plan");
  const f = usePlanFormats();
  const [segment, setSegment] = useState<Segment>("weeks");
  const selectedRef = useRef<HTMLButtonElement>(null);

  // La semaine choisie est rendue visible dans la liste qui défile, sans
  // faire sauter la feuille. Le focus y est posé par `initialFocus`.
  useEffect(() => {
    if (!open || segment !== "weeks") return;
    const id = window.requestAnimationFrame(() => {
      selectedRef.current?.scrollIntoView({ block: "nearest" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, segment]);

  useEffect(() => {
    if (!open) setSegment("weeks");
  }, [open]);

  const raceDate = plan.config.raceDate?.split("T")[0];
  const subtitle = raceDate
    ? t("page.sheet.subtitleRace", { count: plan.totalWeeks, date: f.dayDate(raceDate) })
    : t("page.sheet.subtitle", { count: plan.totalWeeks, date: f.dayDate(model.span.end) });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className="zn-plansheet" initialFocus={selectedRef}>
        <div className="zn-plansheet__head">
          <SheetTitle className="zn-plansheet__title">{t("page.sheet.title")}</SheetTitle>
          <SheetDescription className="zn-plansheet__sub">
            {subtitle}
            {plan.raceTimePrediction && (
              <>
                {" · "}
                {t("page.sheet.prediction", { time: plan.raceTimePrediction })}
              </>
            )}
          </SheetDescription>
        </div>

        <Segmented<Segment>
          value={segment}
          onChange={setSegment}
          label={t("page.sheet.view")}
          options={[
            { value: "weeks", label: t("page.sheet.weeks") },
            { value: "numbers", label: t("page.sheet.numbers") },
          ]}
        />

        {segment === "weeks" ? (
          <>
            <PlanTimeline model={model} variant="wide" />
            <ol className="zn-plansheet__weeks">
              {model.weeks.map((w) => {
                const range = planWeekRange(plan, w.number);
                const dates = f.range(range.from, range.to);
                const phase = f.phase(w.phase);
                const current = w.number === selectedWeek;
                return (
                  <li key={w.number}>
                    <button
                      type="button"
                      ref={current ? selectedRef : undefined}
                      aria-current={current ? "true" : undefined}
                      data-now={w.number === currentWeek || undefined}
                      aria-label={t("page.sheet.weekItem", {
                        n: w.number,
                        phase,
                        dates,
                        done: formatDurationMinutes(w.doneMin),
                        planned: formatDurationMinutes(w.plannedMin),
                      })}
                      onClick={() => onSelectWeek(w.number)}
                    >
                      <span className="zn-plansheet__wn">{t("page.sheet.weekShort", { n: w.number })}</span>
                      <span className="zn-plansheet__wp">
                        {phase}
                        <small>{dates}</small>
                      </span>
                      <span className="zn-plansheet__wv">
                        {formatDurationMinutes(w.doneMin)}{" "}
                        <span className="zn-plansheet__of">/ {formatDurationMinutes(w.plannedMin)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </>
        ) : (
          <PlanStatsSection plan={plan} currentWeek={currentWeek} collapsible={false} onLogActivity={onLogActivity} />
        )}
      </SheetContent>
    </Sheet>
  );
}
