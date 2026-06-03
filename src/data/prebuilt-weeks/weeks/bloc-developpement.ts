import type { PrebuiltWeek } from "../types";

/**
 * Bloc développement (seuil) — 6 sessions, two threshold days spaced (Tue/Thu),
 * easy days between, long run Saturday. Higher load, still ~80/20.
 */
export const blocDeveloppement: PrebuiltWeek = {
  id: "bloc-developpement-seuil",
  slug: "bloc-developpement-seuil",
  name: "Bloc développement — seuil",
  nameEn: "Build Block — Threshold",
  description:
    "Deux séances de seuil espacées, encadrées de facile, avec sortie longue. La semaine qui élève le plafond aérobie quand la base est posée.",
  descriptionEn:
    "Two threshold sessions spaced out, framed by easy running, with a long run. The week that raises the aerobic ceiling once the base is set.",
  icon: "TrendingUp",
  difficulty: "intermediate",
  category: "build",
  provenance: "Travail au seuil — Jack Daniels (Running Formula)",
  provenanceEn: "Threshold work — Jack Daniels (Running Formula)",
  whyItWorks:
    "Deux séances au seuil dans la semaine, séparées par au moins 48 h de facile, augmentent la vitesse à laquelle le lactate commence à s'accumuler — un déterminant majeur de la performance en endurance. L'alternance dur / facile respecte la supercompensation : chaque stimulus est suivi d'une récupération réelle avant le suivant.",
  whyItWorksEn:
    "Two threshold sessions a week, separated by at least 48 h of easy running, raise the speed at which lactate starts to accumulate — a key endurance determinant. The hard/easy alternation respects supercompensation: each stimulus is followed by real recovery before the next.",
  settings: {
    sessions: 6,
    targetVolumeH: 7,
    quality: "threshold",
    disciplines: [],
    levels: [],
    longRunDay: 5,
  },
  sessions: [
    {
      dayOfWeek: 0,
      workoutId: "END-008",
      sessionType: "endurance",
      isKeySession: false,
      estimatedDurationMin: 45,
      why: "Endurance régénératrice : démarre la semaine en facile, prépare les jambes au premier seuil.",
      whyEn: "Regenerative endurance: starts the week easy, primes the legs for the first threshold.",
    },
    {
      dayOfWeek: 1,
      workoutId: "THR-001",
      sessionType: "threshold",
      isKeySession: true,
      estimatedDurationMin: 55,
      why: "Premier seuil continu : tenir l'allure seuil pour reculer le point d'accumulation du lactate.",
      whyEn: "First continuous threshold: holding threshold pace to push back the lactate-accumulation point.",
    },
    {
      dayOfWeek: 2,
      workoutId: "REC-005",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 30,
      why: "Récupération active entre les deux séances dures : recharge sans annuler le stimulus.",
      whyEn: "Active recovery between the two hard days: recharges without erasing the stimulus.",
    },
    {
      dayOfWeek: 3,
      workoutId: "THR-004",
      sessionType: "threshold",
      isKeySession: true,
      estimatedDurationMin: 65,
      why: "Second seuil en 2×15 min : volume au seuil plus élevé, 48 h après le premier pour récupérer.",
      whyEn: "Second threshold as 2×15 min: more time at threshold, 48 h after the first to recover.",
    },
    {
      dayOfWeek: 5,
      workoutId: "SL-003",
      sessionType: "long_run",
      isKeySession: false,
      estimatedDurationMin: 90,
      why: "Sortie longue endurance pure le samedi : volume aérobie en facile, loin des deux seuils.",
      whyEn: "Pure-endurance long run on Saturday: easy aerobic volume, far from both thresholds.",
    },
    {
      dayOfWeek: 6,
      workoutId: "REC-016",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 45,
      why: "Footing régénération en nature : clôt le bloc, dénoue les jambes après la longue.",
      whyEn: "Nature regeneration jog: closes the block, loosens the legs after the long run.",
    },
  ],
};
