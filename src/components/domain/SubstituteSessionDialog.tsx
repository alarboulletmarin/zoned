import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "@/components/icons";
import { loadDisciplineWorkouts } from "@/data/workouts";
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
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("view.substituteTitle")}</DialogTitle>
          <DialogDescription>
            {targetTss > 0
              ? t("view.substituteDescription", { tss: targetTss })
              : t("view.substituteDescriptionNoTss")}
          </DialogDescription>
        </DialogHeader>

        {/* Discipline tabs */}
        <div className="flex gap-2">
          <Button
            variant={discipline === "cycling" ? "default" : "outline"}
            size="sm"
            onClick={() => setDiscipline("cycling")}
          >
            {t("view.substituteCycling")}
          </Button>
          <Button
            variant={discipline === "swimming" ? "default" : "outline"}
            size="sm"
            onClick={() => setDiscipline("swimming")}
          >
            {t("view.substituteSwimming")}
          </Button>
        </div>

        {/* Candidate list */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0 mt-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : ranked.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("view.substituteNoMatches")}
            </p>
          ) : (
            ranked.map((candidate) => {
              const deviationPct = Math.round(candidate.matchDistance * 100);
              return (
                <Card
                  key={candidate.workout.id}
                  interactive
                  className="cursor-pointer"
                  onClick={() => onSelect(candidate.workout, discipline)}
                >
                  <CardContent className="p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {pickLang(candidate.workout, "name")}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {candidate.estimatedDurationMin} min ·{" "}
                        {t("view.substituteTssLabel", { tss: candidate.candidateTss })}
                      </p>
                    </div>
                    <Badge
                      variant={deviationPct <= 5 ? "default" : "outline"}
                      className="shrink-0 text-xs tabular-nums"
                    >
                      {deviationPct === 0
                        ? t("view.substituteMatchExact")
                        : t("view.substituteMatchDeviation", { deviation: deviationPct })}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
