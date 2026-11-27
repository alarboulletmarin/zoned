import type { PrebuiltWeek } from "../types";

/**
 * Gros volume polarisé, 6 sessions, lots of easy aerobic volume, a single
 * quality day. High weekly load, 5 easy sessions out of 6.
 *
 * Sessions run at the top of their template range and the long run is a
 * durability outing: at 5.8h the week was an intermediate volume wearing an
 * "advanced, high volume" label, and its VO2max session was cut to 40min from
 * the 60-70 its structure calls for.
 */
export const grosVolume: PrebuiltWeek = {
  id: "gros-volume-polarise",
  slug: "gros-volume-polarise",
  name: "Gros volume polarisé",
  nameEn: "High-Volume Polarized",
  nameIt: "Alto volume polarizzato",
  description:
    "Six séances, beaucoup de facile, une seule qualité : la semaine à fort volume des coureurs confirmés, polarisée pour rester soutenable.",
  descriptionEn:
    "Six sessions, lots of easy running, a single quality day: the high-volume week of seasoned runners, polarized to stay sustainable.",
  descriptionIt:
    "Sei sedute, molta corsa facile, un solo giorno di qualità: la settimana ad alto volume dei runner esperti, polarizzata per restare sostenibile.",
  icon: "Activity",
  difficulty: "advanced",
  category: "build",
  provenance: "Distribution polarisée des athlètes d'élite, Seiler & Tønnessen",
  provenanceEn: "Elite polarized distribution, Seiler & Tønnessen",
  provenanceIt: "Distribuzione polarizzata degli atleti d'élite, Seiler & Tønnessen",
  whyItWorks:
    "Les athlètes d'endurance d'élite accumulent l'essentiel de leur volume très en dessous du seuil et concentrent l'intensité sur de rares séances. Ce gros volume facile maximise les adaptations aérobies périphériques tandis qu'une seule séance dure entretient le haut du spectre, un volume élevé qui ne déborde pas la capacité de récupération.",
  whyItWorksEn:
    "Elite endurance athletes accumulate most of their volume well below threshold and concentrate intensity in a few sessions. This high easy volume maximizes peripheral aerobic adaptations while a single hard session maintains the top end, high volume that doesn't outrun recovery capacity.",
  whyItWorksIt:
    "Gli atleti di resistenza d'élite accumulano la maggior parte del volume ben al di sotto della soglia e concentrano l'intensità in poche sedute. Questo ampio volume facile massimizza gli adattamenti aerobici periferici mentre una sola seduta intensa mantiene il picco, un carico elevato che non supera la capacità di recupero.",
  settings: {
    sessions: 6,
    targetVolumeH: 7,
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
      estimatedDurationMin: 65,
      why: "Endurance en groupe : gros bloc aérobie facile pour démarrer le volume de la semaine.",
      whyEn: "Group endurance: a big easy aerobic block to kick off the week's volume.",
      whyIt: "Fondo in gruppo: un grande blocco aerobico facile per avviare il volume della settimana.",
    },
    {
      dayOfWeek: 1,
      workoutId: "END-001",
      sessionType: "endurance",
      isKeySession: false,
      estimatedDurationMin: 55,
      why: "Endurance fondamentale : encore du facile, on empile le volume aérobie sans intensité.",
      whyEn: "Fundamental endurance: more easy running, stacking aerobic volume without intensity.",
      whyIt: "Fondo lento: ancora corsa facile, per accumulare volume aerobico senza intensità.",
    },
    {
      dayOfWeek: 3,
      workoutId: "VMA-018",
      sessionType: "vo2max",
      isKeySession: true,
      estimatedDurationMin: 65,
      why: "L'unique séance dure : VMA spécifique pour tenir le haut du spectre malgré le gros volume.",
      whyEn: "The single hard session: specific VO₂ work to hold the top end despite the high volume.",
      whyIt: "L'unica seduta intensa: lavoro specifico sul VO₂max per mantenere la brillantezza nonostante l'alto volume.",
    },
    {
      dayOfWeek: 4,
      workoutId: "REC-016",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 60,
      why: "Footing régénération long lendemain de qualité : facile mais conséquent, c'est du volume.",
      whyEn: "Long regeneration jog after quality: easy but substantial, it's still volume.",
      whyIt: "Corsa rigenerante lunga dopo la qualità: facile ma consistente, contribuisce comunque al volume.",
    },
    {
      dayOfWeek: 5,
      workoutId: "LR-015",
      sessionType: "long_run",
      isKeySession: false,
      estimatedDurationMin: 130,
      why: "Sortie longue durabilité : le plus gros bloc de la semaine, entièrement en facile, assez long pour travailler la résistance à la dérive cardiaque.",
      whyEn: "Durability long run: the biggest block of the week, entirely easy, long enough to work on resisting cardiac drift.",
      whyIt: "Lungo di durata: il blocco più grande della settimana, interamente facile, abbastanza lungo da allenare la resistenza alla deriva cardiaca.",
    },
    {
      dayOfWeek: 6,
      workoutId: "END-008",
      sessionType: "endurance",
      isKeySession: false,
      estimatedDurationMin: 50,
      why: "Endurance régénératrice : déverrouille les jambes au lendemain de la longue, finit le volume en douceur.",
      whyEn: "Regenerative endurance: loosens the legs after the long run, finishes the volume gently.",
      whyIt: "Fondo rigenerante: scioglie le gambe dopo il lungo e completa il volume con dolcezza.",
    },
  ],
};
