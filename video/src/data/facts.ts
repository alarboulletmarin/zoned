/**
 * Every figure the films show, produced by `bun run sync` from the app's own
 * data and engines. Never edit facts.json by hand — it is generated.
 *
 * Anything with words in it is generated twice, French in the base field and
 * English in an `…En` twin. `factsFor(lang)` collapses that into one view where
 * `name`, `message`, `system` and friends already hold the right language, so no
 * component ever has to know a twin exists.
 *
 * The raw exports below are kept for the language-independent parts — week
 * volumes, split paces, block trees, counts — which several visuals read at
 * module scope to derive their scales.
 */
import { useLang, type Lang } from "../lang";
import facts from "./facts.json";

export const FACTS = facts;
export const STATS = facts.stats;
export const PLAN = facts.plan;
export const WORKOUT = facts.workout;
export const RACE = facts.race;
export const SCIENCE = facts.science;
export const POLARISED = facts.polarised;
export const ADJUST = facts.adjust;
export const AUDIT = facts.audit;

const resolve = (lang: Lang) => {
  const en = lang === "en";

  return {
    stats: STATS,
    plan: { ...PLAN, distance: en ? PLAN.distanceEn : PLAN.distance },
    workout: {
      ...WORKOUT,
      name: en ? WORKOUT.nameEn : WORKOUT.name,
      summary: en ? WORKOUT.summaryEn : WORKOUT.summary,
    },
    workoutNames: en ? FACTS.workoutNames.en : FACTS.workoutNames.fr,
    polarised: POLARISED,
    audit: AUDIT.map((f) => ({
      code: f.code,
      severity: f.severity,
      message: en ? f.messageEn : f.message,
    })),
    adjust: { ...ADJUST, workout: en ? ADJUST.workoutEn : ADJUST.workout },
    science: {
      ...SCIENCE,
      cards: SCIENCE.cards.map((c) => ({
        name: c.name,
        year: c.year,
        system: en ? c.systemEn : c.system,
      })),
    },
    race: { ...RACE, distanceLabel: en ? RACE.distanceLabelEn : RACE.distanceLabel },
  };
};

export type FactsView = ReturnType<typeof resolve>;

/**
 * Both views are built once at module load rather than per render: the renderer
 * calls every component once per frame, and rebuilding the audit and science
 * arrays 30 times a second for a string swap is waste with no upside.
 */
const VIEWS: Record<Lang, FactsView> = { fr: resolve("fr"), en: resolve("en") };

/** For module scope and for scripts — anywhere there is no React context. */
export const factsFor = (lang: Lang) => VIEWS[lang];

/** For components: the facts already in the language being rendered. */
export const useFacts = () => VIEWS[useLang()];
