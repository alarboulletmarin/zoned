import type { PrebuiltWeek } from "../types";

/**
 * Semaine pic — 6 sessions, two quality days (Tue/Thu), the heaviest week of a
 * block, placed right before the taper. Long run Saturday, one full rest day.
 */
export const semainePic: PrebuiltWeek = {
  id: "semaine-pic",
  slug: "semaine-pic",
  name: "Semaine pic",
  nameEn: "Peak Week",
  description:
    "La semaine la plus chargée du cycle : deux séances de qualité et la sortie longue la plus ample, juste avant de commencer à alléger.",
  descriptionEn:
    "The heaviest week of the cycle: two quality sessions and the longest run, right before you start easing off.",
  icon: "TrendingUp",
  difficulty: "intermediate",
  category: "peak",
  provenance: "Surcharge progressive puis affûtage — Pfitzinger & Douglas",
  provenanceEn: "Progressive overload then taper — Pfitzinger & Douglas",
  whyItWorks:
    "Le pic concentre la charge la plus élevée du bloc pendant que la fraîcheur est encore suffisante pour l'absorber. Deux séances de qualité espacées de deux jours entretiennent le seuil et l'allure spécifique, et la sortie longue la plus ample verrouille l'endurance. C'est la dernière semaine où l'on accumule : ensuite le volume chute et seule l'intensité reste.",
  whyItWorksEn:
    "The peak concentrates the block's highest load while freshness can still absorb it. Two quality sessions two days apart maintain threshold and race pace, and the longest run locks in endurance. It is the last week you accumulate: after this volume drops and only intensity remains.",
  settings: {
    sessions: 6,
    targetVolumeH: 6,
    quality: "threshold",
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
      estimatedDurationMin: 55,
      why: "Endurance fondamentale : ouvre la semaine en facile pour arriver frais sur la première qualité.",
      whyEn: "Fundamental endurance: opens the week easy so you reach the first quality session fresh.",
    },
    {
      dayOfWeek: 1,
      workoutId: "RP-002",
      sessionType: "threshold",
      isKeySession: true,
      estimatedDurationMin: 70,
      why: "Allure 10K : la séance spécifique du pic, celle qui ancre l'allure de course dans les jambes.",
      whyEn: "10K pace: the peak's specific session, the one that drills race pace into the legs.",
    },
    {
      dayOfWeek: 2,
      workoutId: "REC-005",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 30,
      why: "Régénération active : jour tampon obligatoire entre les deux qualités de la semaine.",
      whyEn: "Active regeneration: the mandatory buffer day between the week's two quality sessions.",
    },
    {
      dayOfWeek: 3,
      workoutId: "TMP-001",
      sessionType: "tempo",
      isKeySession: true,
      estimatedDurationMin: 55,
      why: "Tempo classique : deuxième qualité, au seuil cette fois, pour travailler l'autre versant de la performance.",
      whyEn: "Classic tempo: the second quality, at threshold this time, working the other side of performance.",
    },
    {
      dayOfWeek: 4,
      workoutId: "REC-001",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 35,
      why: "Footing de récupération : on vide les jambes avant la sortie longue du lendemain.",
      whyEn: "Recovery jog: flushes the legs before the next day's long run.",
    },
    {
      dayOfWeek: 5,
      workoutId: "SL-001",
      sessionType: "long_run",
      isKeySession: false,
      estimatedDurationMin: 100,
      why: "Sortie longue progressive : la plus ample du bloc, terminée un peu plus vite qu'elle n'a commencé.",
      whyEn: "Progressive long run: the block's longest, finished a little faster than it started.",
    },
  ],
};
