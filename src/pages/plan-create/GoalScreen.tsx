import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, LayoutGrid, Link2 } from "@/components/icons";
import { usePickLang } from "@/lib/i18n-utils";
import { RECOMMENDED_PLAN_WEEKS } from "@/lib/planGenerator/constants";
import { matchingPrebuilts, type OpenPurpose, type PlanGoal } from "@/lib/planCreate";
import { RACE_DISTANCE_META, type RaceDistance } from "@/types/plan";
import {
  PRACTICES,
  distancesOfPractice,
  type Practice,
} from "@/types/practice";
import { PURPOSE_OPTIONS, RACE_DISTANCE_ICONS } from "./constants";
import { ScreenHead } from "./ScreenHead";

interface GoalScreenProps {
  goal: PlanGoal | null;
  presetPractice: Practice | null;
  onPick: (goal: PlanGoal) => void;
}

/** 2.1 Qu'est-ce que tu prépares ? Un appui choisit et passe à la suite. */
export function GoalScreen({ goal, presetPractice, onPick }: GoalScreenProps) {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const practices = PRACTICES.filter((p) => !presetPractice || p === presetPractice);
  const purposes = PURPOSE_OPTIONS.filter(
    (o): o is (typeof PURPOSE_OPTIONS)[number] & { value: OpenPurpose } => o.value !== "race",
  );

  const tileContext = (d: RaceDistance) =>
    d === "trail_short" || d === "trail"
      ? t("parcours.goal.upTo", { km: RACE_DISTANCE_META[d].distanceKm })
      : t("parcours.goal.weeksRange", RECOMMENDED_PLAN_WEEKS[d]);

  return (
    <>
      <ScreenHead title={t("parcours.goal.title")} />

      {practices.map((practice) => (
        <section key={practice} className="zn-pc__group" aria-labelledby={`zn-pc-g-${practice}`}>
          <h2 id={`zn-pc-g-${practice}`} className="zn-pc__group-title">
            {t(`parcours.goal.${practice}`)}
          </h2>
          <div className="zn-pc__tiles">
            {distancesOfPractice(practice).map((d) => {
              const Icon = RACE_DISTANCE_ICONS[d];
              const name = pick(RACE_DISTANCE_META[d], "label");
              const ready = matchingPrebuilts({ kind: "race", distance: d }).length;
              return (
                <button
                  key={d}
                  type="button"
                  className="zn-pc__tile"
                  aria-pressed={goal?.kind === "race" && goal.distance === d}
                  aria-label={
                    ready > 0
                      ? `${t("parcours.goal.readyA11y", { name, count: ready })}, ${tileContext(d)}`
                      : undefined
                  }
                  onClick={() => onPick({ kind: "race", distance: d })}
                >
                  <Icon size={20} />
                  <span className="zn-pc__tile-name">{name}</span>
                  <span className="zn-pc__tile-sub">{tileContext(d)}</span>
                  {ready > 0 && (
                    <span className="zn-pc__chip" aria-hidden="true">
                      {t("parcours.goal.ready", { count: ready })}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <section className="zn-pc__group" aria-labelledby="zn-pc-g-open">
        <h2 id="zn-pc-g-open" className="zn-pc__group-title">
          {t("parcours.goal.noRace")}
        </h2>
        <div className="zn-pc__rows">
          {purposes.map((o) => {
            const hint = t(`parcours.goal.purposeHint.${o.value}`);
            const ready = matchingPrebuilts({ kind: "open", purpose: o.value }).length > 0;
            return (
              <button
                key={o.value}
                type="button"
                className="zn-pc__row"
                aria-pressed={goal?.kind === "open" && goal.purpose === o.value}
                onClick={() => onPick({ kind: "open", purpose: o.value })}
              >
                <o.icon size={20} />
                <span className="zn-pc__row-text">
                  <span className="zn-pc__row-name">{t(`parcours.goal.purpose.${o.value}`)}</span>
                  <span className="zn-pc__tile-sub">
                    {ready ? t("parcours.goal.readyAvailable", { hint }) : hint}
                  </span>
                </span>
                <ArrowRight size={18} />
              </button>
            );
          })}
        </div>
      </section>

      <Link to="/plan/new/free" className="zn-pc__row zn-pc__row--blank">
        <LayoutGrid size={20} />
        <span className="zn-pc__row-text">
          <span className="zn-pc__row-name">{t("parcours.goal.blank")}</span>
          <span className="zn-pc__tile-sub">{t("parcours.goal.blankHint")}</span>
        </span>
        <ArrowRight size={18} />
      </Link>

      {/* The other door into this generator: an assistant writes the
          settings as a link (/plan/import). Said here because this is the
          page an assistant reads when asked for a Zoned plan. */}
      <Link to="/agents" className="zn-pc__row zn-pc__row--blank">
        <Link2 size={20} />
        <span className="zn-pc__row-text">
          <span className="zn-pc__row-name">{t("parcours.goal.assistant")}</span>
          <span className="zn-pc__tile-sub">{t("parcours.goal.assistantHint")}</span>
        </span>
        <ArrowRight size={18} />
      </Link>
    </>
  );
}
