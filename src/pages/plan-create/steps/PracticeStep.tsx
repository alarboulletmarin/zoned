import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Option, OptionStack } from "../Option";
import { PRACTICES, isPracticeLive, type Practice } from "@/types/practice";
import { practiceData } from "@/components/domain/practice-data";
import { useAppStats } from "@/hooks/useAppStats";
import type { StepContext, StepDef } from "../types";

/**
 * La première question : qu'est-ce que tu prépares ?
 *
 * C'est celle qui manquait. Sans elle le parcours montrait les sept distances
 * à plat — 5 km, 10 km, semi, marathon, trail court, trail, ultra côte à côte,
 * sans cadrage — et tout le traitement du trail tenait dans un booléen qui ne
 * gouvernait qu'une phrase d'aide.
 *
 * Une fois la pratique connue, l'étape distance en propose QUATRE au lieu de
 * sept pour la route, deux pour le trail, une pour l'ultra. Et les questions
 * de terrain n'apparaissent qu'à qui court dessus.
 *
 * Le triathlon est déclaré `announced` dans `PRACTICE_META` : il se choisit,
 * mais le parcours s'arrête ici et propose ce qui marche déjà. Ni plan
 * factice, ni champ en trompe-l'œil.
 */
function PracticeBody({ form, setForm, uid, t, questionId, commit }: StepContext) {
  const announced = form.practice && !isPracticeLive(form.practice);
  const stats = useAppStats();

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-10)" } as CSSProperties}>
      <OptionStack questionId={questionId}>
        {PRACTICES.map((practice) => (
          <Option
            key={practice}
            name={`${uid}-practice`}
            checked={form.practice === practice}
            title={t(`practice.${practice}.label`)}
            body={t(`practice.${practice}.body`)}
            data={practiceData(practice, stats.byPractice[practice], t)}
            onSelect={() => setForm((f) => ({ ...f, practice }))}
            /* Une pratique annoncée n'avance pas : il n'y a pas de suite, et
               l'écran déroule à la place ce qui existe déjà pour elle. */
            onCommit={isPracticeLive(practice) ? commit : undefined}
          />
        ))}
      </OptionStack>

      {/* Le triathlon : ce qui existe déjà, dit en toutes lettres. Les séances
          vélo et natation sont consultables et les tests FTP et CSS marchent ;
          ce sont les PLANS qui manquent. */}
      {announced && (
        <div
          className="zn-stack zn-wiz__announce"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">{t("practice.announceKicker")}</span>
          <p className="zn-body zn-measure">{t("practice.announceBody")}</p>
          <div className="zn-cluster" style={{ "--gap": "var(--sp-5)" } as CSSProperties}>
            <Button asChild variant="outline" size="sm">
              <Link to="/library?practice=triathlon">
                {t("practice.announceLibrary")}
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/calculators">{t("practice.announceNumbers")}</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export const practiceStep: StepDef = {
  id: "practice",
  titleKey: "practice.title",
  subtitleKey: "practice.subtitle",
  Body: PracticeBody,
  autoAdvance: true,
  /* Une pratique annoncée ne débloque pas la suite : il n'y a pas de suite. */
  isComplete: (form) => !!form.practice && isPracticeLive(form.practice as Practice),
};
