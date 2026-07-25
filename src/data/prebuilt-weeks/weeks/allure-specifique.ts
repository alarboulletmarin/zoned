import type { PrebuiltWeek } from "../types";

/**
 * Allure spécifique — 5 sessions, two race-pace days (Tue/Thu), progressive
 * long run Saturday. Two full rest days. For the last weeks before a goal.
 */
export const allureSpecifique: PrebuiltWeek = {
  id: "allure-specifique",
  slug: "allure-specifique",
  name: "Allure spécifique",
  nameEn: "Race-Pace Week",
  description:
    "Deux séances à l'allure visée et une longue terminée plus vite qu'elle n'a commencé : la semaine qui apprend au corps le rythme du jour J.",
  descriptionEn:
    "Two sessions at goal pace and a long run finished faster than it started: the week that teaches the body race-day rhythm.",
  icon: "Target",
  difficulty: "intermediate",
  category: "peak",
  provenance: "Spécificité de l'entraînement — Daniels (Running Formula)",
  provenanceEn: "Training specificity — Daniels (Running Formula)",
  whyItWorks:
    "Plus la course approche, plus l'entraînement doit ressembler à la course. Répéter l'allure visée sur des blocs longs installe le geste, la respiration et la gestion de l'effort à ce rythme précis, et la sortie longue progressive apprend à finir vite sur des jambes déjà entamées. C'est la spécificité qui prime ici, pas le volume ni l'intensité maximale.",
  whyItWorksEn:
    "The closer the race, the more training should resemble the race. Repeating goal pace over long blocks embeds the stride, the breathing and the effort management at that exact rhythm, while the progressive long run teaches you to finish fast on tired legs. Specificity is what matters here, not volume or top-end intensity.",
  settings: {
    sessions: 5,
    targetVolumeH: 5,
    quality: "tempo",
    disciplines: [],
    levels: [],
    longRunDay: 5,
  },
  sessions: [
    {
      dayOfWeek: 0,
      workoutId: "END-001",
      sessionType: "endurance",
      isKeySession: false,
      estimatedDurationMin: 50,
      why: "Endurance fondamentale : la seule séance sans contrainte d'allure de la semaine.",
      whyEn: "Fundamental endurance: the week's only session with no pace constraint.",
    },
    {
      dayOfWeek: 1,
      workoutId: "RP-003",
      sessionType: "tempo",
      isKeySession: true,
      estimatedDurationMin: 70,
      why: "Allure semi-marathon : le bloc spécifique le plus long de la semaine, celui qui installe le rythme.",
      whyEn: "Half-marathon pace: the week's longest specific block, the one that sets the rhythm.",
    },
    {
      dayOfWeek: 3,
      workoutId: "TMP-008",
      sessionType: "tempo",
      isKeySession: true,
      estimatedDurationMin: 50,
      why: "Tempo marathon : deuxième rappel d'allure, plus court, avec un jour de repos avant et après.",
      whyEn: "Marathon tempo: a second, shorter pace reminder, with a rest day either side.",
    },
    {
      dayOfWeek: 5,
      workoutId: "SL-001",
      sessionType: "long_run",
      isKeySession: false,
      estimatedDurationMin: 100,
      why: "Sortie longue progressive : finir plus vite qu'on a commencé, exactement ce qu'on demandera le jour J.",
      whyEn: "Progressive long run: finish faster than you started, exactly what race day will ask for.",
    },
    {
      dayOfWeek: 6,
      workoutId: "REC-004",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 40,
      why: "Récupération nature au lendemain de la longue : jambes légères pour aborder la semaine suivante.",
      whyEn: "Nature recovery the day after the long run: light legs going into the next week.",
    },
  ],
};
