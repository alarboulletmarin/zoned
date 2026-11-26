import type { PrebuiltWeek } from "../types";

/**
 * Bloc développement (seuil), 6 sessions, two threshold days spaced (Tue/Thu),
 * easy days between, long run Saturday. Higher load, still ~80/20.
 */
export const blocDeveloppement: PrebuiltWeek = {
  id: "bloc-developpement-seuil",
  slug: "bloc-developpement-seuil",
  name: "Bloc développement, seuil",
  nameEn: "Build Block, Threshold",
  nameIt: "Blocco costruzione, soglia",
  description:
    "Deux séances de seuil espacées, encadrées de facile, avec sortie longue. La semaine qui élève le plafond aérobie quand la base est posée.",
  descriptionEn:
    "Two threshold sessions spaced out, framed by easy running, with a long run. The week that raises the aerobic ceiling once the base is set.",
  descriptionIt:
    "Due sedute di soglia distanziate, incorniciate da corsa facile, con lungo. La settimana che alza il tetto aerobico una volta costruita la base.",
  icon: "TrendingUp",
  difficulty: "intermediate",
  category: "build",
  provenance: "Travail au seuil, Jack Daniels (Running Formula)",
  provenanceEn: "Threshold work, Jack Daniels (Running Formula)",
  provenanceIt: "Lavoro alla soglia, Jack Daniels (Running Formula)",
  whyItWorks:
    "Deux séances au seuil dans la semaine, séparées par au moins 48 h de facile, augmentent la vitesse à laquelle le lactate commence à s'accumuler, un déterminant majeur de la performance en endurance. L'alternance dur / facile respecte la supercompensation : chaque stimulus est suivi d'une récupération réelle avant le suivant.",
  whyItWorksEn:
    "Two threshold sessions a week, separated by at least 48 h of easy running, raise the speed at which lactate starts to accumulate, a key endurance determinant. The hard/easy alternation respects supercompensation: each stimulus is followed by real recovery before the next.",
  whyItWorksIt:
    "Due sedute alla soglia a settimana, separate da almeno 48 ore di corsa facile, aumentano la velocità alla quale il lattato inizia ad accumularsi, un fattore chiave della prestazione di resistenza. L'alternanza duro/facile rispetta la supercompensazione: ogni stimolo è seguito da un vero recupero prima del successivo.",
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
      workoutId: "END-008",
      sessionType: "endurance",
      isKeySession: false,
      estimatedDurationMin: 50,
      why: "Endurance régénératrice : démarre la semaine en facile, prépare les jambes au premier seuil.",
      whyEn: "Regenerative endurance: starts the week easy, primes the legs for the first threshold.",
      whyIt: "Fondo rigenerante: apre la settimana in modo facile e prepara le gambe alla prima soglia.",
    },
    {
      dayOfWeek: 1,
      workoutId: "THR-001",
      sessionType: "threshold",
      isKeySession: true,
      estimatedDurationMin: 55,
      why: "Premier seuil continu : tenir l'allure seuil pour reculer le point d'accumulation du lactate.",
      whyEn: "First continuous threshold: holding threshold pace to push back the lactate-accumulation point.",
      whyIt: "Prima soglia continua: mantenere il ritmo soglia per spostare in avanti il punto di accumulo del lattato.",
    },
    {
      dayOfWeek: 2,
      workoutId: "REC-005",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 30,
      why: "Récupération active entre les deux séances dures : recharge sans annuler le stimulus.",
      whyEn: "Active recovery between the two hard days: recharges without erasing the stimulus.",
      whyIt: "Recupero attivo tra i due giorni intensi: ricarica senza annullare lo stimolo.",
    },
    {
      dayOfWeek: 3,
      workoutId: "THR-004",
      sessionType: "threshold",
      isKeySession: true,
      estimatedDurationMin: 65,
      why: "Second seuil en 2×15 min : volume au seuil plus élevé, 48 h après le premier pour récupérer.",
      whyEn: "Second threshold as 2×15 min: more time at threshold, 48 h after the first to recover.",
      whyIt: "Seconda soglia da 2×15 min: maggior tempo alla soglia, 48 ore dopo la prima per recuperare.",
    },
    {
      dayOfWeek: 5,
      workoutId: "SL-003",
      sessionType: "long_run",
      isKeySession: false,
      estimatedDurationMin: 95,
      why: "Sortie longue endurance pure le samedi : volume aérobie en facile, loin des deux seuils.",
      whyEn: "Pure-endurance long run on Saturday: easy aerobic volume, far from both thresholds.",
      whyIt: "Lungo di pura resistenza il sabato: volume aerobico facile, lontano da entrambe le soglie.",
    },
    {
      dayOfWeek: 6,
      workoutId: "REC-016",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 55,
      why: "Footing régénération en nature : clôt le bloc, dénoue les jambes après la longue.",
      whyEn: "Nature regeneration jog: closes the block, loosens the legs after the long run.",
      whyIt: "Corsa rigenerante nella natura: chiude il blocco e scioglie le gambe dopo il lungo.",
    },
  ],
};
