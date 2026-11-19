import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, Plus, ArrowRight, Trash2, Upload, FlaskConical } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { SEOHead } from "@/components/seo";
import { HubNav, navSection } from "@/components/layout";
import { PlanCard } from "@/components/domain/PlanCard";
import { PlanHistory } from "@/components/domain/PlanHistory";
import { usePlans } from "@/hooks/usePlans";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { duplicatePlan, importPlan, savePlan } from "@/lib/planStorage";
import { toast } from "@/components/ui/toast";
import { getWorkoutById, getWorkoutByIdSync } from "@/data/workouts";
import type { TrainingPlan } from "@/types/plan";
import type { AnyWorkoutTemplate } from "@/types";
import { isPlanEnded } from "@/lib/planUtils";
import { buildPlanCardModel } from "@/lib/planCardModel";
import { activityKindOf, isActivitySession } from "@/lib/activitySession";
import { isLooseSession } from "@/lib/sessionPrecision";
import { pickLang, usePickLang } from "@/lib/i18n-utils";

/**
 * /plans : les plans en cours, une carte chacun, puis l'historique compact.
 *
 * Le seul aplat vermillon de l'écran est Créer un plan. Les cartes n'en
 * portent aucun, la frise non plus. Voir docs/plans.md pour les décisions.
 */

/** Le nom qu'affiche le plan, celui que la page du plan affiche aussi. */
function planDisplayName(plan: TrainingPlan, pick: ReturnType<typeof usePickLang>): string {
  if (plan.config.planName) return plan.config.planName;
  return plan.config.planMode === "free" ? plan.name : pick(plan, "name");
}

/** Les gabarits dont la carte a besoin : ceux des prochaines séances et des séances souples. */
function templateIdsOf(plans: TrainingPlan[]): string[] {
  const ids = new Set<string>();
  for (const plan of plans) {
    for (const week of plan.weeks) {
      for (const s of week.sessions) {
        if (!s.workoutId || s.workoutId.startsWith("__")) continue;
        if (isLooseSession(s) || !s.status || s.status === "planned") ids.add(s.workoutId);
      }
    }
  }
  return [...ids];
}

export function PlansPage() {
  const { t } = useTranslation("plan");
  const { t: tc } = useTranslation("common");
  const pick = usePickLang();
  const navigate = useNavigate();
  const wide = useMediaQuery("(min-width: 1024px)");
  const { plans, isLoading, remove, reload } = usePlans();
  const [deleteTarget, setDeleteTarget] = useState<TrainingPlan | null>(null);
  const [templates, setTemplates] = useState<Record<string, AnyWorkoutTemplate>>({});

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const newId = importPlan(text);
        if (newId) {
          reload();
          toast.success(t("plansPage.importSuccess"));
          navigate(`/plan/${newId}`);
        } else {
          toast.error(t("plansPage.importInvalid"));
        }
      } catch (err) {
        toast.failure(t("plansPage.importReadError"), err);
      }
    };
    input.click();
  }, [t, reload, navigate]);

  // Newest first. Standalone weeks live under /weeks, so they are left out.
  const { activePlans, endedPlans } = useMemo(() => {
    const sorted = [...plans]
      .filter((p) => !p.config.isSingleWeek)
      .sort(
        (a, b) =>
          new Date(b.config.createdAt).getTime() - new Date(a.config.createdAt).getTime(),
      );
    return {
      activePlans: sorted.filter((p) => !isPlanEnded(p)),
      endedPlans: sorted.filter((p) => isPlanEnded(p)),
    };
  }, [plans]);
  const planCount = activePlans.length + endedPlans.length;

  // Les gabarits arrivent du catalogue, paresseux : en attendant, une séance
  // souple compte sa durée posée et la prochaine séance son nom générique.
  useEffect(() => {
    const ids = templateIdsOf(activePlans).filter((id) => !templates[id]);
    if (ids.length === 0) return;
    let cancelled = false;
    Promise.all(ids.map((id) => getWorkoutById(id).then((w) => [id, w] as const)))
      .then((pairs) => {
        if (cancelled) return;
        const next: Record<string, AnyWorkoutTemplate> = {};
        for (const [id, w] of pairs) if (w) next[id] = w;
        setTemplates((prev) => ({ ...prev, ...next }));
      })
      .catch(() => {
        // Silence voulu : sans catalogue la carte reste juste, une séance
        // souple compte sa durée posée (déjà le milieu de sa fourchette) et
        // la prochaine séance prend son nom générique. Rien n'a échoué que
        // la personne ait demandé.
      });
    return () => {
      cancelled = true;
    };
  }, [activePlans, templates]);

  const entries = useMemo(() => {
    const today = new Date();
    const workoutOf = (id: string) => templates[id] ?? getWorkoutByIdSync(id);
    const build = (plan: TrainingPlan) => ({
      plan,
      name: planDisplayName(plan, pick),
      model: buildPlanCardModel(plan, today, workoutOf),
    });
    return { active: activePlans.map(build), ended: endedPlans.map(build) };
  }, [activePlans, endedPlans, templates, pick]);

  const nextName = useCallback(
    (workoutId: string): string | null => {
      if (workoutId === "__intermediate_race__") return t("plansPage.nextIntermediate");
      if (isActivitySession(workoutId)) {
        const kind = activityKindOf(workoutId);
        return kind ? t(`activity.${kind.kind}`) : null;
      }
      const w = templates[workoutId] ?? getWorkoutByIdSync(workoutId);
      return w ? pickLang(w, "name") : null;
    },
    [templates, t],
  );

  const handleDuplicate = useCallback(
    (plan: TrainingPlan) => {
      const name = `${planDisplayName(plan, pick)} ${t("plansPage.copySuffix")}`;
      const newId = duplicatePlan(plan.id, name);
      if (!newId) {
        toast.failure(t("plansPage.duplicateFailed"));
        return;
      }
      reload();
      toast.success(t("plansPage.duplicated", { name }));
    },
    [pick, reload, t],
  );

  const handleRename = useCallback(
    (plan: TrainingPlan, name: string) => {
      const saved = savePlan({ ...plan, config: { ...plan.config, planName: name } });
      if (!saved.ok) {
        toast.failure(tc("errors.planSaveFailed"), saved);
        return;
      }
      reload();
    },
    [reload, tc],
  );

  const actions = {
    onDuplicate: handleDuplicate,
    onRename: handleRename,
    onDelete: setDeleteTarget,
  };

  return (
    <>
      <SEOHead noindex={true} title={t("plansPage.title")} canonical="/plans" />
      <div className="zn-plans">
        <section className="zn-plans__head">
          <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}>
            {planCount > 0 && (
              <span className="zn-kicker">
                {t("plansPage.headCount", { count: planCount })} ·{" "}
                {t("plansPage.headActive", { count: activePlans.length })}
              </span>
            )}
            <h1 className="zn-display" data-level="2">
              {t("plansPage.title")}
            </h1>
            {/* Une étagère vide se présente : où l'on est, à quoi sert la
                page. Dès qu'un plan existe, les plans parlent d'eux-mêmes. */}
            {planCount === 0 && !isLoading && (
              <>
                <HubNav section={navSection("plan")} omit={["/plan/new"]} />
                <p className="zn-body zn-body--lead zn-plans__lede">{t("plansPage.subtitle")}</p>
              </>
            )}
          </div>

          <div className="zn-plans__actions">
            {/* L'import reste en tête même à zéro plan : c'est la voie de
                quelqu'un qui arrive avec un fichier. Il est discret, la
                création est le seul aplat de l'écran. */}
            <Button variant="ghost" onClick={handleImport}>
              <Upload />
              {t("plansPage.import")}
            </Button>
            {/* Sur une étagère vide, la création est dans l'état vide, avec
                l'explication ; la répéter ici ferait deux boutons du même nom. */}
            {planCount > 0 && (
              <Button asChild>
                <Link to="/plan/new">
                  <Plus />
                  {t("create")}
                </Link>
              </Button>
            )}
          </div>
        </section>

        {isLoading ? (
          <div className="zn-plans__band zn-plans__wait">
            <Spinner size={22} />
          </div>
        ) : planCount > 0 ? (
          <>
            {entries.active.length > 0 && (
              <section className="zn-plans__band" aria-labelledby="zn-plans-active">
                <div className="zn-stack" style={{ "--gap": "var(--sp-8)" } as React.CSSProperties}>
                  <h2 id="zn-plans-active" className="zn-kicker">
                    {t("plansPage.activeSection", { count: entries.active.length })}
                  </h2>
                  <div className="zn-plans__grid" data-wide={wide || undefined}>
                    {entries.active.map(({ plan, name, model }) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        name={name}
                        model={model}
                        nextName={model.next ? nextName(model.next.workoutId) : null}
                        wide={wide}
                        {...actions}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {entries.ended.length > 0 && (
              <div className="zn-plans__band">
                <PlanHistory entries={entries.ended} table={wide} {...actions} />
              </div>
            )}
          </>
        ) : (
          <section className="zn-plans__band">
            <EmptyState
              variant="not-started"
              icon={Calendar}
              title={t("plansPage.buildArc")}
              description={t("plansPage.buildArcDesc")}
              action={
                <Button asChild>
                  <Link to="/plan/new">
                    {t("plansPage.createFirst")}
                    <ArrowRight />
                  </Link>
                </Button>
              }
              hint={
                // La science vient APRÈS le seul bouton qui compte : posée
                // avant, elle le repoussait sous le pli.
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/plans/methodology">
                    <FlaskConical />
                    {t("plansPage.science")}
                  </Link>
                </Button>
              }
            />
          </section>
        )}
      </div>

      {/* Deleting a plan cannot be undone, so it stays behind a dialog. */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("plansPage.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? t("plansPage.deleteConfirm", { name: planDisplayName(deleteTarget, pick) })
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("plansPage.cancelButton")}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  remove(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              <Trash2 />
              {t("plansPage.deleteButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
