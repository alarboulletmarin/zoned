import type { PrebuiltWeek } from "../types";

/**
 * Gros volume polarisé — 6 sessions, lots of easy aerobic volume, a single
 * quality day. High weekly load that stays ~80/20.
 */
export const grosVolume: PrebuiltWeek = {
  id: "gros-volume-polarise",
  slug: "gros-volume-polarise",
  name: "Gros volume polarisé",
  nameEn: "High-Volume Polarized",
  description:
    "Six séances, beaucoup de facile, une seule qualité : la semaine à fort volume des coureurs confirmés, polarisée pour rester soutenable.",
  descriptionEn:
    "Six sessions, lots of easy running, a single quality day: the high-volume week of seasoned runners, polarized to stay sustainable.",
  icon: "Activity",
  difficulty: "advanced",
  category: "build",
  provenance: "Distribution polarisée des athlètes d'élite — Seiler & Tønnessen",
  provenanceEn: "Elite polarized distribution — Seiler & Tønnessen",
  whyItWorks:
    "Les athlètes d'endurance d'élite accumulent l'essentiel de leur volume très en dessous du seuil et concentrent l'intensité sur de rares séances. Ce gros volume facile maximise les adaptations aérobies périphériques tandis qu'une seule séance dure entretient le haut du spectre — un volume élevé qui ne déborde pas la capacité de récupération.",
  whyItWorksEn:
    "Elite endurance athletes accumulate most of their volume well below threshold and concentrate intensity in a few sessions. This high easy volume maximizes peripheral aerobic adaptations while a single hard session maintains the top end — high volume that doesn't outrun recovery capacity.",
  settings: {
    sessions: 6,
    targetVolumeH: 8,
    quality: "vo2vma",
    disciplines: [],
    levels: [],
    longRunDay: 5,
  },
  sessions: [
    {
      dayOfWeek: 0,
      workoutId: "END-007",
      sessionType: "endurance",
      isKeySession: false,
      estimatedDurationMin: 60,
      why: "Endurance en groupe : gros bloc aérobie facile pour démarrer le volume de la semaine.",
      whyEn: "Group endurance: a big easy aerobic block to kick off the week's volume.",
    },
    {
      dayOfWeek: 1,
      workoutId: "END-001",
      sessionType: "endurance",
      isKeySession: false,
      estimatedDurationMin: 55,
      why: "Endurance fondamentale : encore du facile, on empile le volume aérobie sans intensité.",
      whyEn: "Fundamental endurance: more easy running, stacking aerobic volume without intensity.",
    },
    {
      dayOfWeek: 3,
      workoutId: "VMA-018",
      sessionType: "vo2max",
      isKeySession: true,
      estimatedDurationMin: 40,
      why: "L'unique séance dure : VMA spécifique pour tenir le haut du spectre malgré le gros volume.",
      whyEn: "The single hard session: specific VO₂ work to hold the top end despite the high volume.",
    },
    {
      dayOfWeek: 4,
      workoutId: "REC-016",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 50,
      why: "Footing régénération long lendemain de qualité : facile mais conséquent, c'est du volume.",
      whyEn: "Long regeneration jog after quality: easy but substantial — it's still volume.",
    },
    {
      dayOfWeek: 5,
      workoutId: "SL-003",
      sessionType: "long_run",
      isKeySession: false,
      estimatedDurationMin: 100,
      why: "Sortie longue endurance pure : le plus gros bloc de la semaine, entièrement en facile.",
      whyEn: "Pure-endurance long run: the biggest block of the week, entirely easy.",
    },
    {
      dayOfWeek: 6,
      workoutId: "END-008",
      sessionType: "endurance",
      isKeySession: false,
      estimatedDurationMin: 45,
      why: "Endurance régénératrice : déverrouille les jambes au lendemain de la longue, finit le volume en douceur.",
      whyEn: "Regenerative endurance: loosens the legs after the long run, finishes the volume gently.",
    },
  ],
};
