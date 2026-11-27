import type { PrebuiltWeek } from "../types";

/**
 * Base aérobie 80/20 (Seiler), 5 sessions, one quality day, the rest easy.
 * Long run Saturday (day 5). Hard day Wednesday (day 2), nothing adjacent.
 * 80/20 is counted in sessions (4 easy out of 5); the share of *time* in
 * Z1-Z2 sits higher still, around 95%.
 */
export const baseAerobie: PrebuiltWeek = {
  id: "base-aerobie-80-20",
  slug: "base-aerobie-80-20",
  name: "Base aérobie 80/20",
  nameEn: "Aerobic Base 80/20",
  nameIt: "Base aerobica 80/20",
  description:
    "Une semaine de fondation : 4 séances faciles sur 5, une seule séance de qualité. Le socle qui développe l'endurance sans creuser la fatigue.",
  descriptionEn:
    "A foundation week: 4 easy sessions out of 5, a single quality session. The base that builds endurance without digging fatigue.",
  descriptionIt:
    "Una settimana di costruzione: 4 sedute facili su 5, una sola seduta di qualità. La base che sviluppa la resistenza senza accumulare fatica.",
  icon: "Mountain",
  difficulty: "intermediate",
  category: "base",
  provenance: "Modèle polarisé 80/20, Stephen Seiler",
  provenanceEn: "80/20 polarized model, Stephen Seiler",
  provenanceIt: "Modello polarizzato 80/20, Stephen Seiler",
  whyItWorks:
    "La majorité des minutes en Z1-Z2 stimule les adaptations aérobies centrales (densité mitochondriale, capillarisation) sans coût neuromusculaire élevé. Une seule séance dure suffit à entretenir la VO₂max, ce qui laisse récupérer pleinement et rend la charge soutenable semaine après semaine.",
  whyItWorksEn:
    "Most minutes in Z1-Z2 drive central aerobic adaptations (mitochondrial density, capillarization) at a low neuromuscular cost. A single hard session is enough to maintain VO₂max while leaving room for full recovery, which keeps the load sustainable week after week.",
  whyItWorksIt:
    "La maggior parte dei minuti in Z1-Z2 stimola gli adattamenti aerobici centrali (densità mitocondriale, capillarizzazione) con un basso costo neuromuscolare. Una sola seduta intensa è sufficiente per mantenere il VO₂max lasciando spazio a un recupero completo, rendendo il carico sostenibile settimana dopo settimana.",
  settings: {
    sessions: 5,
    targetVolumeH: 4,
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
      estimatedDurationMin: 50,
      why: "Endurance fondamentale en Z2 : ouvre la semaine sans fatigue, construit la base aérobie.",
      whyEn: "Fundamental Z2 endurance: opens the week without fatigue, builds the aerobic base.",
      whyIt: "Fondo lento in Z2: apre la settimana senza fatica e costruisce la base aerobica.",
    },
    {
      dayOfWeek: 2,
      workoutId: "THR-003",
      sessionType: "threshold",
      isKeySession: true,
      estimatedDurationMin: 40,
      why: "L'unique séance dure : un seuil court pour repousser le seuil lactique, placé loin de la sortie longue.",
      whyEn: "The single hard session: a short threshold to push the lactate threshold, placed far from the long run.",
      whyIt: "L'unica seduta intensa: una soglia breve per spostare la soglia del lattato, lontana dal lungo.",
    },
    {
      dayOfWeek: 3,
      workoutId: "REC-001",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 30,
      why: "Footing de récupération le lendemain de la qualité : favorise l'évacuation et garde le volume facile.",
      whyEn: "Recovery jog the day after quality: aids clearance and keeps volume easy.",
      whyIt: "Corsa di recupero il giorno dopo la qualità: favorisce lo smaltimento e mantiene il volume facile.",
    },
    {
      dayOfWeek: 5,
      workoutId: "SL-008",
      sessionType: "long_run",
      isKeySession: false,
      estimatedDurationMin: 90,
      why: "Sortie longue en Z1-Z2 le samedi : la pierre angulaire de l'endurance, entièrement en facile.",
      whyEn: "Saturday long run in Z1-Z2: the cornerstone of endurance, entirely easy.",
      whyIt: "Lungo del sabato in Z1-Z2: il pilastro della resistenza, interamente a ritmo facile.",
    },
    {
      dayOfWeek: 6,
      workoutId: "REC-004",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 40,
      why: "Récupération nature pour clore la semaine : sang qui circule, jambes qui s'allègent.",
      whyEn: "Nature recovery to close the week: blood flowing, legs getting lighter.",
      whyIt: "Recupero nella natura per chiudere la settimana: circolazione attiva e gambe più leggere.",
    },
  ],
};
