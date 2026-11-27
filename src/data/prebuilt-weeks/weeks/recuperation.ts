import type { PrebuiltWeek } from "../types";

/**
 * Semaine de récupération, 3 short easy sessions, no quality, no long run.
 * The deload that lets adaptation land.
 */
export const recuperation: PrebuiltWeek = {
  id: "semaine-recuperation",
  slug: "semaine-recuperation",
  name: "Semaine de récupération",
  nameEn: "Recovery Week",
  nameIt: "Settimana di scarico",
  description:
    "Trois footings courts et faciles, aucune intensité. La semaine d'allègement qui transforme l'entraînement accumulé en progrès.",
  descriptionEn:
    "Three short, easy jogs, zero intensity. The deload week that turns accumulated training into actual progress.",
  descriptionIt:
    "Tre corse brevi e facili, zero intensità. La settimana di scarico che trasforma l'allenamento accumulato in vero progresso.",
  icon: "Leaf",
  difficulty: "beginner",
  category: "recovery",
  provenance: "Périodisation, semaine de décharge (deload)",
  provenanceEn: "Periodization, deload week",
  provenanceIt: "Periodizzazione, settimana di scarico (deload)",
  whyItWorks:
    "La progression ne vient pas de l'entraînement seul mais de la récupération qui le suit. En coupant volume et intensité une semaine, on dissipe la fatigue accumulée et on laisse la supercompensation s'exprimer, on revient plus fort, pas plus fatigué.",
  whyItWorksEn:
    "Progress doesn't come from training alone but from the recovery that follows it. Cutting volume and intensity for a week dissipates accumulated fatigue and lets supercompensation express itself, you come back stronger, not more tired.",
  whyItWorksIt:
    "Il progresso non nasce dal solo allenamento ma dal recupero che lo segue. Ridurre volume e intensità per una settimana dissipa la fatica accumulata e lascia esprimere la supercompensazione: si torna più forti, non più stanchi.",
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
      estimatedDurationMin: 35,
      why: "Footing de récupération : allure conversationnelle, juste pour faire circuler le sang.",
      whyEn: "Recovery jog: conversational pace, just to get the blood moving.",
      whyIt: "Corsa di recupero: ritmo da conversazione, giusto per far circolare il sangue.",
    },
    {
      dayOfWeek: 3,
      workoutId: "REC-005",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 35,
      why: "Régénération active au milieu de la semaine : entretien sans aucune charge.",
      whyEn: "Mid-week active regeneration: maintenance with no load at all.",
      whyIt: "Rigenerazione attiva a metà settimana: mantenimento senza alcun carico.",
    },
    {
      dayOfWeek: 5,
      workoutId: "REC-004",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 45,
      why: "Récupération nature un peu plus longue : le plaisir de courir relâché, sans montre.",
      whyEn: "Slightly longer nature recovery: the joy of running relaxed, watch off.",
      whyIt: "Recupero nella natura leggermente più lungo: il piacere di correre sciolti, senza guardare l'orologio.",
    },
  ],
};
