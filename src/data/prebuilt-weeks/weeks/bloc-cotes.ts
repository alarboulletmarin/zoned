import type { PrebuiltWeek } from "../types";

/**
 * Bloc côtes, 5 sessions, two hill days spaced (Tue/Fri), hilly long run.
 * Two full rest days: hill work is eccentric-heavy and needs them.
 */
export const blocCotes: PrebuiltWeek = {
  id: "bloc-cotes",
  slug: "bloc-cotes",
  name: "Bloc côtes",
  nameEn: "Hill Block",
  nameIt: "Blocco salite",
  description:
    "Deux séances de côtes espacées et une sortie longue vallonnée : la force spécifique du coureur, sans passer par la salle.",
  descriptionEn:
    "Two spaced hill sessions and a hilly long run: a runner's specific strength, without setting foot in a gym.",
  descriptionIt:
    "Due sedute di salite distanziate e un lungo collinare: la forza specifica del corridore, senza mettere piede in palestra.",
  icon: "Mountain",
  difficulty: "intermediate",
  category: "build",
  provenance: "Côtes comme entraînement en résistance spécifique, Daniels (Running Formula)",
  provenanceEn: "Hills as specific resistance training, Daniels (Running Formula)",
  provenanceIt: "Salite come allenamento di forza specifica, Daniels (Running Formula)",
  whyItWorks:
    "Monter recrute davantage de fibres à chaque foulée qu'un même effort sur le plat, avec un impact au sol plus faible : on gagne en puissance et en économie de course sans le coût articulaire de la vitesse sur le plat. Daniels place ce travail avant les intervalles sur piste, comme une passerelle entre le volume de base et l'intensité. Les descentes sollicitent le travail excentrique, d'où les deux jours de repos complets.",
  whyItWorksEn:
    "Running uphill recruits more fibres per stride than the same effort on the flat, with lower ground impact: you gain power and running economy without the joint cost of flat-out speed. Daniels places this work before track intervals, as a bridge from base volume to intensity. Downhills load the muscles eccentrically, hence the two full rest days.",
  whyItWorksIt:
    "Correre in salita recluta più fibre a ogni passo rispetto allo stesso sforzo in pianura, con un impatto al suolo inferiore: si guadagnano potenza ed economia di corsa senza il carico articolare della velocità in piano. Daniels colloca questo lavoro prima delle ripetute in pista, come ponte tra volume di base e intensità. Le discese sollecitano i muscoli in modo eccentrico, da qui i due giorni di riposo completo.",
  settings: {
    sessions: 5,
    targetVolumeH: 5,
    quality: "random",
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
      why: "Endurance fondamentale : du plat et du facile pour préparer les jambes au travail en côte.",
      whyEn: "Fundamental endurance: flat and easy, priming the legs for the hill work ahead.",
      whyIt: "Fondo lento: in piano e facile, prepara le gambe al lavoro in salita.",
    },
    {
      dayOfWeek: 1,
      workoutId: "HIL-001",
      sessionType: "hills",
      isKeySession: true,
      estimatedDurationMin: 55,
      why: "Côtes courtes : répétitions vives en montée, le stimulus de force le plus direct de la semaine.",
      whyEn: "Short hills: sharp uphill reps, the week's most direct strength stimulus.",
      whyIt: "Salite brevi: ripetute intense in salita, lo stimolo di forza più diretto della settimana.",
    },
    {
      dayOfWeek: 3,
      workoutId: "END-008",
      sessionType: "endurance",
      isKeySession: false,
      estimatedDurationMin: 50,
      why: "Endurance régénératrice après un jour de repos : on relance la circulation sans charger.",
      whyEn: "Regenerative endurance after a rest day: gets the blood moving without loading up.",
      whyIt: "Fondo rigenerante dopo un giorno di riposo: riattiva la circolazione senza appesantire.",
    },
    {
      dayOfWeek: 4,
      workoutId: "HIL-006",
      sessionType: "hills",
      isKeySession: true,
      estimatedDurationMin: 35,
      why: "Côtes progressives, plus courtes que celles de mardi : on répète le stimulus sans le doubler.",
      whyEn: "Progressive hills, shorter than Tuesday's: the stimulus is repeated, not doubled.",
      whyIt: "Salite progressive, più brevi di quelle di martedì: si ripete lo stimolo senza raddoppiarlo.",
    },
    {
      dayOfWeek: 5,
      workoutId: "SL-005",
      sessionType: "long_run",
      isKeySession: false,
      estimatedDurationMin: 95,
      why: "Sortie longue vallonnée : le dénivelé en endurance, là où la force acquise en semaine devient utile.",
      whyEn: "Hilly long run: elevation at easy effort, where the week's strength gains start to pay off.",
      whyIt: "Lungo collinare: dislivello a ritmo facile, dove la forza costruita in settimana inizia a dare frutti.",
    },
  ],
};
