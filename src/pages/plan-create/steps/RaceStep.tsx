import { Fragment, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Option, OptionStack } from "../Option";
import { PURPOSE_OPTIONS, RACE_DISTANCE_ICONS } from "../constants";
import { RACE_DISTANCE_META } from "@/types/plan";
import {
  PRACTICES,
  distancesOfPractice,
  isPracticeLive,
  practiceFromRaceDistance,
} from "@/types/practice";
import type { FormState, PlanPurpose, StepContext, StepDef } from "../types";

/**
 * La première question, et la seule avant d'entrer dans le vif : qu'est-ce
 * que tu prépares ?
 *
 * Elle en remplace trois. Le parcours demandait la pratique (route, trail,
 * ultra, triathlon, dont deux marquées bientôt : la moitié des cartes de la
 * première question étaient des impasses), puis le pourquoi (une course, une
 * base, une reprise, un début), puis la distance. Trois écrans pour arriver à
 * "un 10 km", et deux couloirs avant eux, `/plan/new` et `/plan/new/mode`,
 * qui posaient la pratique une première fois puis le mode de fabrication.
 *
 * Ici les six courses servies sont posées à plat, regroupées par pratique
 * parce que c'est ainsi qu'on les cherche, et la pratique se DÉDUIT de la
 * course (`practiceFromRaceDistance`), comme le fait déjà tout le reste de
 * l'app. Les trois plans sans course visée sont en dessous, sous leur propre
 * en-tête. Les pratiques annoncées ne sont plus des cartes qu'on choisit
 * pour découvrir qu'elles ne mènent nulle part : une ligne le dit, en bas.
 *
 * Les deux autres façons d'avoir un plan, un plan déjà écrit ou un
 * calendrier vide, sont deux liens sous les réponses. Elles n'ont pas
 * besoin d'un écran à elles : ce sont des sorties, pas des questions.
 */

/** Les réglages qu'un plan sans course visée prend d'office. */
const PURPOSE_DEFAULTS: Record<
  Exclude<PlanPurpose, "race">,
  Partial<Pick<FormState, "daysPerWeek" | "totalWeeksOverride" | "trainingGoal">>
> = {
  beginner_start: { daysPerWeek: 3, totalWeeksOverride: 8, trainingGoal: "finish" },
  return_from_injury: { daysPerWeek: 3, totalWeeksOverride: 10, trainingGoal: "finish" },
  base_building: { totalWeeksOverride: 12, trainingGoal: "time" },
};

function RaceBody({ form, setForm, uid, t, pick, questionId, commit, derived }: StepContext) {
  /* `?practice=trail` depuis une carte de pratique : on ne montre que ses
     courses, la question reste la même. */
  const practices = PRACTICES.filter(isPracticeLive).filter(
    (practice) => !derived.presetPractice || practice === derived.presetPractice,
  );
  const announced = PRACTICES.filter((practice) => !isPracticeLive(practice));
  const purposes = PURPOSE_OPTIONS.filter(
    (opt): opt is (typeof PURPOSE_OPTIONS)[number] & { value: Exclude<PlanPurpose, "race"> } =>
      opt.value !== "race",
  );

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-10)" } as CSSProperties}>
      <OptionStack questionId={questionId}>
        {practices.map((practice) => (
          <Fragment key={practice}>
            <span className="zn-kicker zn-kicker--inline zn-wiz__group">
              {t(`practice.${practice}.label`)}
            </span>
            {distancesOfPractice(practice).map((dist) => {
              const meta = RACE_DISTANCE_META[dist];
              return (
                <Option
                  key={dist}
                  name={`${uid}-race`}
                  glyph={RACE_DISTANCE_ICONS[dist]}
                  checked={form.planPurpose === "race" && form.raceDistance === dist}
                  title={pick(meta, "label")}
                  data={`${meta.distanceKm} km`}
                  onSelect={() =>
                    setForm((f) => ({
                      ...f,
                      planPurpose: "race",
                      practice: practiceFromRaceDistance(dist),
                      raceDistance: dist,
                    }))
                  }
                  onCommit={commit}
                />
              );
            })}
          </Fragment>
        ))}

        <span className="zn-kicker zn-kicker--inline zn-wiz__group">{t("race.noRace")}</span>
        {purposes.map((opt) => (
          <Option
            key={opt.value}
            name={`${uid}-race`}
            glyph={opt.icon}
            checked={form.planPurpose === opt.value}
            title={t(opt.labelKey)}
            body={t(opt.descKey)}
            onSelect={() =>
              setForm((f) => ({
                ...f,
                planPurpose: opt.value,
                raceDistance: null,
                practice: f.practice ?? derived.presetPractice ?? "road",
                ...PURPOSE_DEFAULTS[opt.value],
              }))
            }
            onCommit={commit}
          />
        ))}
      </OptionStack>

      <p className="zn-body zn-body--sm zn-muted zn-wiz__modes">
        {t("race.otherWays")}{" "}
        <Link to="/plan/new/prebuilt">{t("race.prebuiltLink")}</Link>
        {" · "}
        <Link to="/plan/new/free">{t("race.freeLink")}</Link>
      </p>

      {announced.length > 0 && (
        <p className="zn-caption zn-faint zn-measure">
          {t("race.announce")}{" "}
          <Link to={`/library?practice=${announced[0]}`}>{t("practice.announceLibrary")}</Link>
        </p>
      )}
    </div>
  );
}

export const raceStep: StepDef = {
  id: "race",
  titleKey: "race.title",
  subtitleKey: "race.subtitle",
  Body: RaceBody,
  autoAdvance: true,
  isComplete: (form) =>
    form.planPurpose === "race" ? !!form.raceDistance : !!form.practice,
};
