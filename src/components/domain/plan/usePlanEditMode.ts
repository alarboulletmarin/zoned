import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/toast";
import { getPlan, savePlan, withUndoSnapshot } from "@/lib/planStorage";
import type { TrainingPlan } from "@/types/plan";

/**
 * Le mode Modifier d'un plan (`?mode=edit`), comme un brouillon.
 *
 * Les gestes du mode écrivent par les fonctions de stockage existantes,
 * celles que la page utilisait déjà (déplacer, retirer, dupliquer, ajouter,
 * remplacer). Ce qui en fait un brouillon :
 *
 * - un INSTANTANÉ du plan est pris à l'entrée du mode ;
 * - Annuler le remet tel quel (`savePlan`) ;
 * - Enregistrer remet l'instantané, puis réécrit l'état modifié d'un seul
 *   tenant par `withUndoSnapshot` : un seul changement annulable, Plan
 *   modifié, que le bandeau du dernier changement sait défaire ;
 * - quitter le mode par le retour du navigateur avec des changements non
 *   enregistrés demande confirmation, dans une boîte Zoned ;
 * - fermer l'onglet avec des changements demande la confirmation du
 *   navigateur, la seule qui existe à ce moment-là.
 */
export function usePlanEditMode(
  planId: string | undefined,
  editing: boolean,
  setEditing: (on: boolean, push?: boolean) => void,
  reload: () => void,
) {
  const { t, i18n } = useTranslation("plan");
  const snapshot = useRef<TrainingPlan | null>(null);
  const [dirty, setDirty] = useState(false);
  const [leaving, setLeaving] = useState(false);
  /** Une sortie voulue par nos boutons, pas par le retour du navigateur. */
  const intentional = useRef(false);
  /** L'état d'avant le dernier geste, pour l'Annuler d'un toast. */
  const lastStep = useRef<TrainingPlan | null>(null);

  // L'instantané se prend en entrant, que l'entrée vienne du crayon ou de l'URL.
  useEffect(() => {
    if (!editing || !planId || snapshot.current) return;
    const current = getPlan(planId);
    snapshot.current = current ? structuredClone(current) : null;
    setDirty(false);
  }, [editing, planId]);

  // Sortie du mode sans passer par nos boutons (retour du navigateur).
  useEffect(() => {
    if (editing || !snapshot.current) return;
    if (intentional.current) {
      intentional.current = false;
      snapshot.current = null;
      lastStep.current = null;
      setDirty(false);
      return;
    }
    if (dirty) {
      setEditing(true);
      setLeaving(true);
      return;
    }
    snapshot.current = null;
  }, [editing, dirty, setEditing]);

  useEffect(() => {
    if (!editing || !dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [editing, dirty]);

  /** À appeler juste avant un geste du brouillon. */
  const before = useCallback(() => {
    if (!planId) return;
    const current = getPlan(planId);
    lastStep.current = current ? structuredClone(current) : null;
  }, [planId]);

  /** À appeler quand un geste du brouillon a réussi. */
  const changed = useCallback(() => setDirty(true), []);

  /** Défait le dernier geste du brouillon (l'Annuler d'un toast). */
  const undoStep = useCallback((): boolean => {
    const previous = lastStep.current;
    if (!previous) return false;
    lastStep.current = null;
    const saved = savePlan(previous);
    if (!saved.ok) {
      toast.failure(t("errors.planSaveFailed"), saved);
      return false;
    }
    reload();
    return true;
  }, [reload, t]);

  const enter = useCallback(() => {
    intentional.current = false;
    setEditing(true, true);
  }, [setEditing]);

  const exit = useCallback(() => {
    intentional.current = true;
    setEditing(false);
  }, [setEditing]);

  const cancel = useCallback(() => {
    const original = snapshot.current;
    if (original && dirty) {
      const saved = savePlan(original);
      if (!saved.ok) {
        toast.failure(t("errors.planSaveFailed"), saved);
        return;
      }
      reload();
      toast.info(t("page.edit.discarded"));
    }
    setLeaving(false);
    exit();
  }, [dirty, exit, reload, t]);

  const save = useCallback(() => {
    const original = snapshot.current;
    if (!planId || !original || !dirty) {
      exit();
      return;
    }
    const edited = getPlan(planId);
    if (!edited) return;
    const restored = savePlan(original);
    const ok =
      restored.ok &&
      withUndoSnapshot(
        planId,
        "edit",
        t("page.edit.changeLabel", { lng: "fr" }),
        t("page.edit.changeLabel", { lng: "en" }),
        (plan) => {
          plan.weeks = edited.weeks;
          plan.config = edited.config;
          plan.totalWeeks = edited.totalWeeks;
          plan.phases = edited.phases;
          return [];
        },
      );
    if (!ok) {
      // L'état modifié reste le brouillon : on le remet, rien n'est perdu.
      savePlan(edited);
      toast.failure(t("page.edit.saveFailed"));
      return;
    }
    reload();
    toast.success(t("page.edit.saved"));
    exit();
  }, [planId, dirty, exit, reload, t]);

  return {
    dirty,
    leaving,
    stay: () => setLeaving(false),
    enter,
    cancel,
    save,
    before,
    changed,
    undoStep,
    language: i18n.language,
  };
}
