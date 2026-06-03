import type { PrebuiltWeek } from "../types";

/**
 * Semaine de récupération — 3 short easy sessions, no quality, no long run.
 * The deload that lets adaptation land.
 */
export const recuperation: PrebuiltWeek = {
  id: "semaine-recuperation",
  slug: "semaine-recuperation",
  name: "Semaine de récupération",
  nameEn: "Recovery Week",
  description:
    "Trois footings courts et faciles, aucune intensité. La semaine d'allègement qui transforme l'entraînement accumulé en progrès.",
  descriptionEn:
    "Three short, easy jogs, zero intensity. The deload week that turns accumulated training into actual progress.",
  icon: "Leaf",
  difficulty: "beginner",
  category: "recovery",
  provenance: "Périodisation — semaine de décharge (deload)",
  provenanceEn: "Periodization — deload week",
  whyItWorks:
    "La progression ne vient pas de l'entraînement seul mais de la récupération qui le suit. En coupant volume et intensité une semaine, on dissipe la fatigue accumulée et on laisse la supercompensation s'exprimer — on revient plus fort, pas plus fatigué.",
  whyItWorksEn:
    "Progress doesn't come from training alone but from the recovery that follows it. Cutting volume and intensity for a week dissipates accumulated fatigue and lets supercompensation express itself — you come back stronger, not more tired.",
  settings: {
    sessions: 3,
    targetVolumeH: 2,
    quality: "random",
    disciplines: [],
    levels: [],
    longRunDay: 5,
  },
  sessions: [
    {
      dayOfWeek: 1,
      workoutId: "REC-001",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 30,
      why: "Footing de récupération : allure conversationnelle, juste pour faire circuler le sang.",
      whyEn: "Recovery jog: conversational pace, just to get the blood moving.",
    },
    {
      dayOfWeek: 3,
      workoutId: "REC-005",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 30,
      why: "Régénération active au milieu de la semaine : entretien sans aucune charge.",
      whyEn: "Mid-week active regeneration: maintenance with no load at all.",
    },
    {
      dayOfWeek: 5,
      workoutId: "REC-004",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 40,
      why: "Récupération nature un peu plus longue : le plaisir de courir relâché, sans montre.",
      whyEn: "Slightly longer nature recovery: the joy of running relaxed, watch off.",
    },
  ],
};
