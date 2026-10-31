import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { savePlan } from "@/lib/planStorage";
import { dateFromIso } from "@/lib/cockpit";
import {
  loadTodayComposition,
  mondayOf,
  placeWeek,
  saveTodayComposition,
} from "@/lib/todayComposition";
import { createEmptyWeekPlan } from "@/lib/weekToPlan";
import { toast } from "@/components/ui/toast";

/**
 * Composer une semaine : un geste, pas un écran.
 *
 * Cette page posait trois portes, à la main, générer, catalogue, avant la
 * moindre semaine. Les deux premières créaient LA MÊME semaine vide et ne
 * différaient que par le volet ouvert à l'arrivée ; la troisième est un
 * lien, que la liste des semaines porte déjà dans son état vide. Trois
 * portes pour une décision que le tableau de la semaine pose mieux, puisque
 * le générateur y est à un tap et que la grille vide invite à poser une
 * séance.
 *
 * La route reste : le cockpit, la feuille Composer et la palette y mènent,
 * et `state.placeOn` y voyage toujours. Elle crée la semaine, la pose, et
 * remplace son entrée d'historique par le tableau : un retour arrière ne
 * recrée rien.
 *
 * **La semaine arrive dans le cockpit dès qu'elle existe.** Elle est posée
 * sur le lundi demandé, sinon sur celui de la semaine en cours. Une semaine
 * invisible tant qu'on ne l'avait pas posée était la règle la plus dure à
 * prédire de l'app (`docs/aujourdhui.md`) ; la pose par défaut la rend
 * inutile à connaître, et le badge Cockpit de la semaine la déplace ou la
 * retire.
 */
export function WeekNewPage() {
  const { t } = useTranslation("library");
  const navigate = useNavigate();
  const location = useLocation();
  const placeOn = (location.state as { placeOn?: string } | null)?.placeOn;

  // Un seul passage, quoi qu'en fasse le mode strict : une seconde
  // exécution créerait une seconde semaine.
  const created = useRef(false);

  useEffect(() => {
    if (created.current) return;
    created.current = true;

    const plan = createEmptyWeekPlan(t("weekly.generate.defaultName"));
    const saved = savePlan(plan);
    if (!saved.ok) {
      toast.failure(t("weekly.toast.saveFailed"), saved);
      navigate("/weeks", { replace: true });
      return;
    }
    const monday = typeof placeOn === "string" ? dateFromIso(placeOn) : mondayOf(new Date());
    saveTodayComposition(placeWeek(loadTodayComposition(), plan.id, monday));
    navigate(`/weeks/${plan.id}`, { replace: true });
  }, [navigate, placeOn, t]);

  return (
    <>
      <SEOHead noindex title={t("weekly.new.title")} canonical="/weeks/new" />
      <div className="zn-pw" aria-busy="true">
        <p className="zn-mono zn-muted">{t("weekly.new.creating")}</p>
      </div>
    </>
  );
}
