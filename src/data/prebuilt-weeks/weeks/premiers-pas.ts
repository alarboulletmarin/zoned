import type { PrebuiltWeek } from "../types";

/**
 * Premiers pas — 3 sessions, no quality, four full rest days. The entry point
 * for someone who does not run yet: everything easy, volume kept deliberately
 * low so the week can be repeated before adding anything.
 */
export const premiersPas: PrebuiltWeek = {
  id: "premiers-pas",
  slug: "premiers-pas",
  name: "Premiers pas",
  nameEn: "First Steps",
  description:
    "Trois sorties faciles, quatre jours de repos : la première semaine de quelqu'un qui ne court pas encore. Rien d'intense, tout est dans la régularité.",
  descriptionEn:
    "Three easy runs, four rest days: the first week for someone who does not run yet. Nothing intense, it is all about turning up.",
  icon: "Footprints",
  difficulty: "beginner",
  category: "base",
  provenance: "Progression prudente du débutant — règle des 10 %",
  provenanceEn: "Cautious beginner progression — the 10% rule",
  whyItWorks:
    "Chez un coureur qui débute, ce sont les tendons et les os qui limitent, pas le souffle : ils s'adaptent plus lentement que le système cardiovasculaire. Trois sorties très faciles séparées par des jours de repos laissent le temps à ces tissus de suivre, et la semaine est faite pour être répétée telle quelle avant d'ajouter quoi que ce soit. Alterner marche et course sur la première séance n'est pas une facilité, c'est la façon la plus sûre de construire du volume.",
  whyItWorksEn:
    "For a new runner the limit is tendons and bone, not breathing: they adapt more slowly than the cardiovascular system. Three very easy runs separated by rest days give those tissues time to keep up, and the week is meant to be repeated as-is before anything is added. Alternating walking and running in the first session is not a shortcut, it is the safest way to build volume.",
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
      workoutId: "REC-002",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 30,
      why: "Marche-course : on alterne les deux pour habituer les tendons sans jamais forcer sur le souffle.",
      whyEn: "Walk-run: alternating the two gets tendons used to the load without ever pushing the breathing.",
    },
    {
      dayOfWeek: 3,
      workoutId: "END-001",
      sessionType: "endurance",
      isKeySession: false,
      estimatedDurationMin: 45,
      why: "Endurance fondamentale à une allure où l'on peut parler : c'est le repère, pas le chronomètre.",
      whyEn: "Fundamental endurance at a pace where you can still talk: that is the marker, not the watch.",
    },
    {
      dayOfWeek: 5,
      workoutId: "LR-014",
      sessionType: "long_run",
      isKeySession: false,
      estimatedDurationMin: 45,
      why: "Sortie longue courte : la plus longue de la semaine reste modeste, et le week-end laisse deux jours pour l'absorber.",
      whyEn: "Short long run: the week's longest stays modest, and the weekend leaves two days to absorb it.",
    },
  ],
};
