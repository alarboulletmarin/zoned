import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Segmented } from "@/components/ui/segmented";
import { Spinner } from "@/components/ui/spinner";
import { getDisciplineWorkoutsCached, loadDisciplineWorkouts } from "@/data/workouts";
import type { Discipline, WorkoutTemplate } from "@/types";
import type { PlanSession } from "@/types/plan";
import {
  rankSubstitutionCandidates,
  estimatePlannedSessionTss,
  type SubstitutionCandidate,
} from "@/lib/planGenerator/substitute";
import { usePickLang } from "@/lib/i18n-utils";

type CrossDiscipline = Exclude<Discipline, "running">;

interface SubstituteSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plannedSession: PlanSession | null;
  onSelect: (workout: WorkoutTemplate, discipline: CrossDiscipline) => void;
}

/**
 * Cross-discipline substitution picker.
 *
 * Presents TSS-equivalent cycling and swimming workouts for a given planned
 * running session. Candidates are ranked via
 * {@link rankSubstitutionCandidates} (±20 % TSS tolerance, priority-score
 * tiebreak). A discipline tab lets the athlete pick which sport to swap to.
 */
export function SubstituteSessionDialog({
  open,
  onOpenChange,
  plannedSession,
  onSelect,
}: SubstituteSessionDialogProps) {
  const { t } = useTranslation("plan");
  const pickLang = usePickLang();
  const [discipline, setDiscipline] = useState<CrossDiscipline>("cycling");
  const [candidates, setCandidates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const cached = getDisciplineWorkoutsCached(discipline);
    if (cached) {
      // Already loaded once for this session: skip the loading flash.
      setCandidates(cached);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    loadDisciplineWorkouts(discipline)
      .then((workouts) => {
        setCandidates(workouts);
      })
      .finally(() => setIsLoading(false));
  }, [open, discipline]);

  const ranked: SubstitutionCandidate[] = useMemo(() => {
    if (!plannedSession) return [];
    return rankSubstitutionCandidates({
      plannedSession,
      targetDiscipline: discipline,
      candidates,
    });
  }, [plannedSession, discipline, candidates]);

  const targetTss = plannedSession ? estimatePlannedSessionTss(plannedSession) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="zn-pdialog--list">
        <DialogHeader>
          <DialogTitle>{t("view.substituteTitle")}</DialogTitle>
          <DialogDescription>
            {targetTss > 0
              ? t("view.substituteDescription", { tss: targetTss })
              : t("view.substituteDescriptionNoTss")}
          </DialogDescription>
        </DialogHeader>

        {plannedSession?.sessionType === "long_run" && (
          <Alert kind="warning" title={t("view.substituteLongRunWarningTitle")}>
            {t("view.substituteLongRunWarningBody")}
          </Alert>
        )}

        <div className="zn-ppick">
          <Segmented
            label={t("view.substituteTitle")}
            value={discipline}
            onChange={setDiscipline}
            options={[
              { value: "cycling", label: t("view.substituteCycling") },
              { value: "swimming", label: t("view.substituteSwimming") },
            ]}
          />

          {isLoading ? (
            <div className="zn-ppick__wait">
              <Spinner />
            </div>
          ) : ranked.length === 0 ? (
            <p className="zn-ppick__empty">{t("view.substituteNoMatches")}</p>
          ) : (
            <ul className="zn-ppick__list">
              {ranked.map((candidate) => {
                const deviationPct = Math.round(candidate.matchDistance * 100);
                return (
                  <li key={candidate.workout.id}>
                    <button
                      type="button"
                      className="zn-ppick__item"
                      onClick={() => onSelect(candidate.workout, discipline)}
                    >
                      <span className="zn-ppick__text">
                        <span className="zn-ppick__name">
                          {pickLang(candidate.workout, "name")}
                        </span>
                        <span className="zn-ppick__meta">
                          {candidate.estimatedDurationMin} min ·{" "}
                          {t("view.substituteTssLabel", { tss: candidate.candidateTss })}
                        </span>
                      </span>
                      <Badge variant={deviationPct <= 5 ? "default" : "outline"}>
                        {deviationPct === 0
                          ? t("view.substituteMatchExact")
                          : t("view.substituteMatchDeviation", { deviation: deviationPct })}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
