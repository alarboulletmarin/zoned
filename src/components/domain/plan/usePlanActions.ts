import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/toast";
import {
  deletePlan,
  deleteSessionFromPlan,
  duplicatePlan,
  duplicateSession,
  getPlan,
  moveSession,
  pushSessionToPlan,
  savePlan,
  undoLastChange,
  updatePlanSession,
  updateSessionCompletion,
  updateUnavailabilities,
  withUndoSnapshot,
  type SessionCompletionData,
} from "@/lib/planStorage";
import { computeAdaptation, type AdaptationPreview } from "@/lib/planGenerator/adapt";
import { autoReschedule } from "@/lib/planGenerator/reschedule";
import { applyAuditFix } from "@/lib/planGenerator/auditFix";
import type { PlanFinding } from "@/lib/planGenerator/audit";
import { applyWeekValidationDecision, getUnresolvedSessions, getWeekResolutionSummary, type UnresolvedSessionPreview } from "@/lib/weekValidation";
import { getPlanMonday, dateToWeekAndDay } from "@/lib/planDates";
import type { AutoChange, PlanSession, TrainingPlan, Unavailability } from "@/types/plan";
import type { AnyWorkoutTemplate } from "@/types";
import { activityKindOf, defaultActivityDraft, makeActivitySession } from "@/lib/activitySession";
import { loadCommutePattern } from "@/lib/athleteProfile";
import { sessionFromWorkout } from "@/lib/weekToPlan";
import { applyPlanVma } from "@/lib/planGenerator/sessionBuilder";
import { getRunnerProfileOrMigrate, updateBaseData } from "@/lib/runnerProfile";

export interface WeekValidationPrompt {
  weekNumber: number;
  unresolved: number;
  unresolvedSessions: UnresolvedSessionPreview[];
}

/**
 * Les gestes de la page d'un plan, ceux qu'elle avait déjà, regroupés hors
 * du rendu : déplacer, retirer, dupliquer, ajouter, remplacer, clore une
 * séance, valider une semaine, réorganiser autour des indisponibilités,
 * appliquer une adaptation, corriger un constat d'audit, supprimer le plan.
 *
 * Chacun écrit par les fonctions de `planStorage`, recharge le plan et dit
 * son échec par un toast : aucune règle nouvelle n'est écrite ici.
 */
export function usePlanActions(plan: TrainingPlan | null, reload: () => void) {
  const { t } = useTranslation(["plan", "common"]);
  const planId = plan?.id ?? null;

  const [adaptationPreview, setAdaptationPreview] = useState<AdaptationPreview | null>(null);
  const [reschedulePreview, setReschedulePreview] = useState<{ changes: AutoChange[]; updatedPlan: TrainingPlan } | null>(null);
  const [weekValidation, setWeekValidation] = useState<WeekValidationPrompt | null>(null);

  /* Les jours marqués indisponibles, "semaine-jour". */
  const blockedDays = useMemo(() => {
    const set = new Set<string>();
    if (!plan) return set;
    const unavails = plan.config.unavailabilities ?? [];
    if (unavails.length === 0) return set;
    const monday = getPlanMonday(plan);
    for (const u of unavails) {
      const [y, m, d] = u.date.split("-").map(Number);
      const result = dateToWeekAndDay(monday, new Date(y, m - 1, d));
      if (result) set.add(`${result.weekNumber}-${result.dayOfWeek}`);
    }
    return set;
  }, [plan]);

  const isBlocked = useCallback(
    (week: number, day: number) => blockedDays.has(`${week}-${day}`),
    [blockedDays],
  );

  // ── Les séances ─────────────────────────────────────────────────────

  const moveTo = useCallback(
    (fromWeek: number, fromIndex: number, toWeek: number, toDay: number, before?: number): boolean => {
      if (!planId) return false;
      if (isBlocked(toWeek, toDay)) {
        toast.error(t("reschedule.blockedDrop"));
        return false;
      }
      const ok = moveSession(planId, fromWeek, fromIndex, toWeek, toDay, before);
      if (ok) reload();
      else toast.failure(t("view.sessionMoveFailed"));
      return ok;
    },
    [planId, isBlocked, reload, t],
  );

  const removeSession = useCallback(
    (week: number, index: number): boolean => {
      if (!planId) return false;
      const ok = deleteSessionFromPlan(planId, week, index);
      if (ok) reload();
      else toast.failure(t("view.sessionDeleteFailed"));
      return ok;
    },
    [planId, reload, t],
  );

  const duplicate = useCallback(
    (week: number, index: number): boolean => {
      if (!planId) return false;
      const ok = duplicateSession(planId, week, index) !== null;
      if (ok) reload();
      else toast.failure(t("errors.planSaveFailed"));
      return ok;
    },
    [planId, reload, t],
  );

  const addWorkout = useCallback(
    (workoutId: string, week: number, day: number, workout?: AnyWorkoutTemplate): boolean => {
      if (!planId) return false;
      if (isBlocked(week, day)) {
        toast.error(t("reschedule.blockedDrop"));
        return false;
      }

      const activity = activityKindOf(workoutId);
      const pattern = activity?.kind === "commute" ? loadCommutePattern() : null;
      const session = activity
        ? makeActivitySession(activity.kind, day, defaultActivityDraft(activity.kind, pattern), pattern)
        : workout && sessionFromWorkout(day, workout);
      if (!session || pushSessionToPlan(planId, week, session) === null) {
        toast.failure(t("view.workoutAddFailed"), session ? undefined : "notFound");
        return false;
      }
      reload();
      return true;
    },
    [planId, isBlocked, reload, t],
  );

  const updateVma = useCallback((vma: number, today: string) => {
    if (!planId) return false;
    const latest = getPlan(planId);
    if (!latest || latest.config.vma !== undefined) return false;

    getRunnerProfileOrMigrate();
    const profile = updateBaseData({ vma });
    if (!profile.ok) {
      toast.failure(t("view.estimatedPacesProfileFailed"), profile);
      return false;
    }

    const updated = applyPlanVma(latest, vma, today);
    if (latest._lastUndoableChange) {
      // Annuler une modification antérieure conserve les nouvelles allures.
      updated._lastUndoableChange = {
        ...latest._lastUndoableChange,
        before: applyPlanVma(latest._lastUndoableChange.before, vma, today),
      };
    }
    const saved = savePlan(updated);
    if (!saved.ok) {
      toast.failure(t("view.estimatedPacesPlanFailed"), saved);
      return false;
    }
    reload();
    toast.success(t("view.estimatedPacesSaved"));
    return true;
  }, [planId, reload, t]);

  /** Remplace le gabarit d'une séance, en gardant son jour. */
  const replaceWorkout = useCallback(
    (
      week: number,
      index: number,
      workoutId: string,
      overrides?: Parameters<typeof updatePlanSession>[4],
    ): boolean => {
      if (!planId) return false;
      const ok = updatePlanSession(planId, week, index, workoutId, overrides);
      if (ok) reload();
      else toast.failure(t("view.sessionUpdateFailed"));
      return ok;
    },
    [planId, reload, t],
  );

  /** Une session réécrite d'un bloc (la durée et l'effort d'une activité). */
  const saveSession = useCallback(
    (week: number, index: number, next: PlanSession): boolean => {
      if (!planId) return false;
      const fresh = getPlan(planId);
      const target = fresh?.weeks.find((w) => w.weekNumber === week);
      if (!fresh || !target?.sessions[index]) return false;
      target.sessions[index] = next;
      const saved = savePlan(fresh);
      if (!saved.ok) {
        toast.failure(t("view.sessionUpdateFailed"), saved);
        return false;
      }
      reload();
      return true;
    },
    [planId, reload, t],
  );

  // ── La clôture et l'adaptation ──────────────────────────────────────

  const runAdaptationIfReady = useCallback(
    (weekNumber: number, showToast: boolean) => {
      if (!planId) return;
      const fresh = getPlan(planId);
      const week = fresh?.weeks.find((w) => w.weekNumber === weekNumber);
      if (!fresh || !week) return;
      const allResolved = week.sessions.every(
        (s) => s.status === "completed" || s.status === "modified" || s.status === "skipped",
      );
      if (!allResolved) return;
      const preview = computeAdaptation(fresh, weekNumber);
      if (preview.adapted) setAdaptationPreview(preview);
      else if (showToast) toast.success(t("view.weekValidated", { week: weekNumber }));
    },
    [planId, t],
  );

  const saveCompletion = useCallback(
    (week: number, index: number, data: SessionCompletionData): boolean => {
      if (!planId) return false;
      const saved = updateSessionCompletion(planId, week, index, data);
      if (!saved.ok) {
        toast.failure(t("errors.planSaveFailed"), saved);
        return false;
      }
      reload();
      runAdaptationIfReady(week, false);
      return true;
    },
    [planId, reload, runAdaptationIfReady, t],
  );

  const validateWeek = useCallback(
    (weekNumber: number) => {
      const week = plan?.weeks.find((w) => w.weekNumber === weekNumber);
      if (!week) return;
      const summary = getWeekResolutionSummary(week);
      if (summary.unresolved > 0) {
        setWeekValidation({ weekNumber, unresolved: summary.unresolved, unresolvedSessions: getUnresolvedSessions(week) });
        return;
      }
      runAdaptationIfReady(weekNumber, true);
    },
    [plan, runAdaptationIfReady],
  );

  const decideWeekValidation = useCallback(
    (decision: "mark_skipped" | "keep_unresolved") => {
      if (!planId || !plan || !weekValidation) return;
      const week = plan.weeks.find((w) => w.weekNumber === weekValidation.weekNumber);
      if (!week) return;
      const result = applyWeekValidationDecision(week, decision);
      for (const index of result.changedSessionIndexes) {
        updateSessionCompletion(planId, weekValidation.weekNumber, index, { status: "skipped" });
      }
      setWeekValidation(null);
      reload();
      if (decision === "mark_skipped") {
        runAdaptationIfReady(week.weekNumber, true);
        return;
      }
      toast.info(
        t("completion.keptForLater", {
          count: result.updatedSessions.filter((s) => !s.status || s.status === "planned").length,
        }),
      );
    },
    [planId, plan, weekValidation, reload, runAdaptationIfReady, t],
  );

  const undoToast = useCallback(
    (doneKey: string, undoKey: string, undoneKey: string) => {
      if (!planId) return;
      toast.success(t(doneKey), {
        action: {
          label: t(undoKey),
          onClick: () => {
            if (undoLastChange(planId)) {
              reload();
              toast.info(t(undoneKey));
            }
          },
        },
      });
    },
    [planId, reload, t],
  );

  const applyAdaptation = useCallback(() => {
    if (!planId || !adaptationPreview) return;
    const ok = withUndoSnapshot(
      planId,
      "adaptation",
      adaptationPreview.summary,
      adaptationPreview.summaryEn,
      (mutable) => {
        for (const draft of adaptationPreview.updatedPlan.weeks) {
          const target = mutable.weeks.find((w) => w.weekNumber === draft.weekNumber);
          if (!target) continue;
          target.volumePercent = draft.volumePercent;
          target.targetKm = draft.targetKm;
          target.isRecoveryWeek = draft.isRecoveryWeek;
          target._originalVolumePercent = draft._originalVolumePercent;
          target._originalTargetKm = draft._originalTargetKm;
          target._originalIsRecovery = draft._originalIsRecovery;
        }
        return adaptationPreview.changes;
      },
    );
    if (!ok) {
      toast.failure(t("errors.planSaveFailed"));
      return;
    }
    reload();
    setAdaptationPreview(null);
    undoToast("adaptation.applied", "adaptation.undo", "adaptation.undone");
  }, [planId, adaptationPreview, reload, undoToast, t]);

  // ── Indisponibilités et réorganisation ──────────────────────────────

  const saveUnavailabilities = useCallback(
    (items: Unavailability[]): boolean => {
      if (!planId) return false;
      if (!updateUnavailabilities(planId, items)) {
        toast.failure(t("errors.planSaveFailed"));
        return false;
      }
      reload();
      return true;
    },
    [planId, reload, t],
  );

  const previewReschedule = useCallback(
    (currentWeek: number) => {
      if (!plan) return;
      const result = autoReschedule(plan, currentWeek > 0 ? currentWeek : 1);
      setReschedulePreview({ changes: result.changes, updatedPlan: result.updatedPlan });
    },
    [plan],
  );

  const applyReschedule = useCallback(() => {
    if (!planId || !reschedulePreview) return;
    const n = reschedulePreview.changes.length;
    const ok = withUndoSnapshot(
      planId,
      "reschedule",
      `${n} séance(s) marquée(s) comme sautée(s) (indisponibilité)`,
      `${n} session(s) marked as skipped (unavailability)`,
      (mutable) => {
        mutable.weeks = reschedulePreview.updatedPlan.weeks;
        mutable.config = reschedulePreview.updatedPlan.config;
        return reschedulePreview.changes;
      },
    );
    if (!ok) {
      toast.failure(t("errors.planSaveFailed"));
      return;
    }
    reload();
    setReschedulePreview(null);
    undoToast("reschedule.applied", "reschedule.undo", "reschedule.undone");
  }, [planId, reschedulePreview, reload, undoToast, t]);

  // ── Le plan lui-même ────────────────────────────────────────────────

  const fixFinding = useCallback(
    (finding: PlanFinding) => {
      if (!plan) return;
      const fixed = applyAuditFix(plan, finding);
      if (!fixed) {
        toast.failure(t("audit.fixFailed"));
        return;
      }
      const saved = savePlan(fixed);
      if (!saved.ok) {
        toast.failure(t("audit.fixFailed"), saved);
        return;
      }
      reload();
    },
    [plan, reload, t],
  );

  const saveDates = useCallback(
    (startDate: string): boolean => {
      if (!plan) return false;
      const next = structuredClone(plan);
      if (startDate) {
        const [y, m, d] = startDate.split("-").map(Number);
        const end = new Date(y, m - 1, d + plan.totalWeeks * 7);
        next.config.startDate = startDate;
        next.config.endDate = end.toISOString().split("T")[0];
      } else {
        delete next.config.startDate;
        delete next.config.endDate;
      }
      const saved = savePlan(next);
      if (!saved.ok) {
        toast.failure(t("errors.planSaveFailed"), saved);
        return false;
      }
      reload();
      return true;
    },
    [plan, reload, t],
  );

  const rename = useCallback(
    (name: string): boolean => {
      if (!plan) return false;
      const saved = savePlan({ ...plan, config: { ...plan.config, planName: name } });
      if (!saved.ok) {
        toast.failure(t("errors.planSaveFailed"), saved);
        return false;
      }
      reload();
      return true;
    },
    [plan, reload, t],
  );

  const duplicatePlanAs = useCallback(
    (name: string): string | null => {
      if (!planId) return null;
      const newId = duplicatePlan(planId, name);
      if (!newId) toast.failure(t("plansPage.duplicateFailed"));
      return newId;
    },
    [planId, t],
  );

  const remove = useCallback(() => {
    if (planId) deletePlan(planId);
  }, [planId]);

  return {
    isBlocked,
    moveTo,
    removeSession,
    duplicate,
    addWorkout,
    updateVma,
    replaceWorkout,
    saveSession,
    saveCompletion,
    validateWeek,
    weekValidation,
    setWeekValidation,
    decideWeekValidation,
    adaptationPreview,
    setAdaptationPreview,
    applyAdaptation,
    saveUnavailabilities,
    reschedulePreview,
    setReschedulePreview,
    previewReschedule,
    applyReschedule,
    fixFinding,
    saveDates,
    rename,
    duplicatePlanAs,
    remove,
  };
}
