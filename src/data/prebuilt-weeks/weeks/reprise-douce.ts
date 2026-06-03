import type { PrebuiltWeek } from "../types";

/**
 * Reprise douce / return — 4 very easy sessions, no quality, conservative.
 * For coming back from a break or injury without spiking load.
 */
export const repriseDouce: PrebuiltWeek = {
  id: "reprise-douce",
  slug: "reprise-douce",
  name: "Reprise douce",
  nameEn: "Gentle Return",
  description:
    "Quatre sorties très faciles, courtes et progressives, sans la moindre intensité. La semaine de retour après une coupure ou une blessure.",
  descriptionEn:
    "Four very easy, short and progressive runs, with no intensity at all. The comeback week after a break or an injury.",
  icon: "HeartPulse",
  difficulty: "beginner",
  category: "recovery",
  provenance: "Retour progressif à la charge — prudence tissulaire",
  provenanceEn: "Gradual return to load — tissue-first caution",
  whyItWorks:
    "Au retour, les muscles récupèrent plus vite que les tendons, les os et le cartilage. Garder tout en facile et augmenter le volume très progressivement laisse aux tissus conjonctifs le temps de se réadapter, ce qui prévient la rechute la plus fréquente : trop, trop vite.",
  whyItWorksEn:
    "On return, muscles recover faster than tendons, bones and cartilage. Keeping everything easy and ramping volume very gradually gives connective tissue time to re-adapt, preventing the most common relapse: too much, too soon.",
  settings: {
    sessions: 4,
    targetVolumeH: 2.5,
    quality: "random",
    disciplines: [],
    levels: [],
    longRunDay: 5,
  },
  sessions: [
    {
      dayOfWeek: 0,
      workoutId: "REC-002",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 30,
      why: "Récup marche-course : alterner marche et course ménage les tissus pour le tout premier retour.",
      whyEn: "Walk-run recovery: alternating walking and running spares the tissues for the very first run back.",
    },
    {
      dayOfWeek: 2,
      workoutId: "REC-005",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 30,
      why: "Régénération active : on reste en facile, on teste les sensations sans forcer.",
      whyEn: "Active regeneration: stay easy, test the sensations without pushing.",
    },
    {
      dayOfWeek: 4,
      workoutId: "END-014",
      sessionType: "endurance",
      isKeySession: false,
      estimatedDurationMin: 40,
      why: "Sortie aérobie légère : première vraie sortie continue, toujours sous contrôle.",
      whyEn: "Light aerobic run: the first proper continuous run, still well under control.",
    },
    {
      dayOfWeek: 5,
      workoutId: "LR-014",
      sessionType: "long_run",
      isKeySession: false,
      estimatedDurationMin: 50,
      why: "Sortie longue courte : on rallonge un peu le samedi, en facile, pour réhabituer à la durée.",
      whyEn: "Short long run: a slightly longer Saturday, easy, to re-accustom to time on feet.",
    },
  ],
};
