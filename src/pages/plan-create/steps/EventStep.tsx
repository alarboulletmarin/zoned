import type { CSSProperties } from "react";
import { ChevronDown } from "@/components/icons";
import { DateBody } from "./DateStep";
import { RaceNameBody } from "./RaceNameStep";
import { TerrainBody } from "./TerrainStep";
import { IntermediateGoalsBody } from "./IntermediateGoalsStep";
import type { StepContext, StepDef } from "../types";

/**
 * La course : sa date, son nom, son terrain, et les courses de préparation.
 *
 * Quatre écrans tenaient ce qui est UNE question, "parle-moi de ta course".
 * La date, qui décide de la longueur du plan ; le nom, facultatif et seul
 * sur sa page ; le terrain et le dénivelé, pour le trail ; puis les courses
 * intermédiaires, un écran entier de cinq cartes vides pour une question que
 * la plupart des gens n'ont pas. Ici, la date ouvre, le nom suit, le terrain
 * n'apparaît qu'à qui court dessus, et les courses de prépa vivent dans un
 * repli fermé : celui qui en a s'en sert, les autres ne le voient même pas
 * dépliée.
 *
 * Les corps sont ceux des anciennes étapes, inchangés : seul l'assemblage
 * est neuf, ce qui rend le diff lisible et garde les identifiants de champ.
 */
function EventBody(ctx: StepContext) {
  const { form, t } = ctx;
  const isTrail = form.practice === "trail" || form.practice === "ultra";

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
      <DateBody {...ctx} />
      <RaceNameBody {...ctx} />
      {isTrail && <TerrainBody {...ctx} />}

      {/* Ouvert d'office quand un brouillon en a déjà : un repli fermé sur
          quelque chose de saisi cacherait une erreur de validation. */}
      <details className="zn-disclosure" open={form.intermediateGoals.length > 0 || undefined}>
        <summary className="zn-disclosure__summary">
          <span className="zn-stack zn-fill" style={{ "--gap": "var(--sp-3)" } as CSSProperties}>
            <span className="zn-title" data-level="4">{t("event.prepTitle")}</span>
            <span className="zn-body zn-body--sm zn-muted">{t("event.prepBody")}</span>
          </span>
          <ChevronDown className="zn-disclosure__chevron" />
        </summary>
        <div className="zn-disclosure__panel">
          <IntermediateGoalsBody {...ctx} />
        </div>
      </details>
    </div>
  );
}

export const eventStep: StepDef = {
  id: "event",
  titleKey: "event.title",
  subtitleKey: "event.subtitle",
  subtitleParams: (_form, derived) => ({ min: derived.minWeeksForDistance }),
  Body: EventBody,
  isComplete: (form, derived) =>
    derived.dateValid &&
    (form.intermediateGoals.length === 0 || derived.intermediateGoalValidation.valid),
  nextLabelKey: "nav.continue",
};
