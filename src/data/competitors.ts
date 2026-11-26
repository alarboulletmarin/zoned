export type ComparisonValue =
  | { type: "yes" }
  | { type: "no" }
  | { type: "partial"; labelFr: string; labelEn: string; labelIt?: string }
  | { type: "text"; valueFr: string; valueEn: string; valueIt?: string };

export interface ComparisonCriterion {
  key: string;
  labelFr: string;
  labelEn: string;
  labelIt?: string;
  zoned: ComparisonValue;
  competitor: ComparisonValue;
}

export interface Competitor {
  slug: string;
  nameFr: string;
  nameEn: string;
  nameIt?: string;
  taglineFr: string;
  taglineEn: string;
  taglineIt?: string;
  descriptionFr: string;
  descriptionEn: string;
  descriptionIt?: string;
  priceFr: string;
  priceEn: string;
  priceIt?: string;
  criteria: ComparisonCriterion[];
}

const criteriaLabels: Array<{ key: string; labelFr: string; labelEn: string; labelIt: string }> = [
  { key: "price", labelFr: "Prix", labelEn: "Price", labelIt: "Prezzo" },
  { key: "account", labelFr: "Compte requis", labelEn: "Account required", labelIt: "Account richiesto" },
  { key: "dataCollection", labelFr: "Données collectées", labelEn: "Data collected", labelIt: "Dati raccolti" },
  { key: "personalizedPlans", labelFr: "Plans personnalisés", labelEn: "Personalized plans", labelIt: "Piani personalizzati" },
  { key: "exportFit", labelFr: "Export FIT / GPX", labelEn: "FIT / GPX export", labelIt: "Esportazione FIT / GPX" },
  { key: "exportPdf", labelFr: "Export PDF / ICS", labelEn: "PDF / ICS export", labelIt: "Esportazione PDF / ICS" },
  { key: "library", labelFr: "Bibliothèque de séances", labelEn: "Workout library", labelIt: "Libreria sedute" },
  { key: "calculators", labelFr: "Calculateurs", labelEn: "Calculators", labelIt: "Calcolatori" },
  { key: "openSource", labelFr: "Open Source", labelEn: "Open Source", labelIt: "Open Source" },
];

const zonedValues: Record<string, ComparisonValue> = {
  price: { type: "text", valueFr: "Gratuit", valueEn: "Free", valueIt: "Gratuito" },
  account: { type: "no" },
  dataCollection: { type: "no" },
  personalizedPlans: { type: "yes" },
  exportFit: { type: "yes" },
  exportPdf: { type: "yes" },
  library: { type: "text", valueFr: "262 séances", valueEn: "262 workouts", valueIt: "262 sedute" },
  calculators: { type: "text", valueFr: "10 calculateurs", valueEn: "10 calculators", valueIt: "10 calcolatori" },
  openSource: { type: "yes" },
};

function buildCriteria(competitorValues: Record<string, ComparisonValue>): ComparisonCriterion[] {
  return criteriaLabels.map(({ key, labelFr, labelEn, labelIt }) => ({
    key,
    labelFr,
    labelEn,
    labelIt,
    zoned: zonedValues[key],
    competitor: competitorValues[key],
  }));
}

export const competitors: Competitor[] = [
  {
    slug: "runna",
    nameFr: "Runna",
    nameEn: "Runna",
    nameIt: "Runna",
    taglineFr: "App de coaching running par abonnement, rachetée par Strava en 2024",
    taglineEn: "Subscription-based running coaching app, acquired by Strava in 2024",
    taglineIt: "App di coaching running in abbonamento, acquisita da Strava nel 2024",
    descriptionFr:
      "Runna est un coach de course personnalisé par abonnement, racheté par Strava en 2024. Comparez avec Zoned : gratuit, sans compte et sans collecte de données.",
    descriptionEn:
      "Runna is a subscription-based personal running coach, acquired by Strava in 2024. Compare with Zoned: free, no account required, zero data collection.",
    descriptionIt:
      "Runna è un coach di corsa personalizzato in abbonamento, acquisito da Strava nel 2024. Confronta con Zoned: gratuito, senza account e senza raccolta dati.",
    priceFr: "~14,99€/mois",
    priceEn: "~$14.99/month",
    priceIt: "~14,99€/mese",
    criteria: buildCriteria({
      price: { type: "text", valueFr: "~14,99€/mois", valueEn: "~$14.99/month", valueIt: "~14,99€/mese" },
      account: { type: "yes" },
      dataCollection: { type: "yes" },
      personalizedPlans: { type: "yes" },
      exportFit: { type: "partial", labelFr: "Via Strava", labelEn: "Via Strava", labelIt: "Via Strava" },
      exportPdf: { type: "no" },
      library: { type: "yes" },
      calculators: { type: "no" },
      openSource: { type: "no" },
    }),
  },
  {
    slug: "kiprun-pacer",
    nameFr: "Kiprun Pacer",
    nameEn: "Kiprun Pacer",
    nameIt: "Kiprun Pacer",
    taglineFr: "App de running gratuite de Decathlon, nécessite un compte Decathlon",
    taglineEn: "Decathlon's free running app, requires a Decathlon account",
    taglineIt: "App di running gratuita di Decathlon, richiede un account Decathlon",
    descriptionFr:
      "Kiprun Pacer est l'app de running gratuite de Decathlon. Elle nécessite un compte Decathlon et collecte vos données. Comparez avec Zoned : aucun compte, aucune donnée collectée.",
    descriptionEn:
      "Kiprun Pacer is Decathlon's free running app. It requires a Decathlon account and collects your data. Compare with Zoned: no account, no data collected.",
    descriptionIt:
      "Kiprun Pacer è l'app di running gratuita di Decathlon. Richiede un account Decathlon e raccoglie i tuoi dati. Confronta con Zoned: nessun account, nessun dato raccolto.",
    priceFr: "Gratuit",
    priceEn: "Free",
    priceIt: "Gratuito",
    criteria: buildCriteria({
      price: { type: "text", valueFr: "Gratuit", valueEn: "Free", valueIt: "Gratuito" },
      account: { type: "yes" },
      dataCollection: { type: "yes" },
      personalizedPlans: { type: "partial", labelFr: "Plans basiques", labelEn: "Basic plans", labelIt: "Piani base" },
      exportFit: { type: "no" },
      exportPdf: { type: "no" },
      library: { type: "partial", labelFr: "Séances guidées", labelEn: "Guided sessions", labelIt: "Sedute guidate" },
      calculators: { type: "no" },
      openSource: { type: "no" },
    }),
  },
  {
    slug: "campus-coach",
    nameFr: "Campus Coach",
    nameEn: "Campus Coach",
    nameIt: "Campus Coach",
    taglineFr: "App de coaching running freemium avec adaptation en temps réel",
    taglineEn: "Freemium running coaching app with real-time adaptation",
    taglineIt: "App di coaching running freemium con adattamento in tempo reale",
    descriptionFr:
      "Campus Coach est une app de coaching running freemium avec adaptation en temps réel. Comparez avec Zoned : entièrement gratuit, sans compte, open source.",
    descriptionEn:
      "Campus Coach is a freemium running coaching app with real-time adaptation. Compare with Zoned: completely free, no account required, open source.",
    descriptionIt:
      "Campus Coach è un'app di coaching running freemium con adattamento in tempo reale. Confronta con Zoned: interamente gratuito, senza account, open source.",
    priceFr: "Freemium",
    priceEn: "Freemium",
    priceIt: "Freemium",
    criteria: buildCriteria({
      price: { type: "text", valueFr: "Freemium", valueEn: "Freemium", valueIt: "Freemium" },
      account: { type: "yes" },
      dataCollection: { type: "yes" },
      personalizedPlans: { type: "yes" },
      exportFit: { type: "no" },
      exportPdf: { type: "no" },
      library: { type: "partial", labelFr: "Plan uniquement", labelEn: "Plan only", labelIt: "Solo piano" },
      calculators: { type: "no" },
      openSource: { type: "no" },
    }),
  },
];

export function getCompetitorBySlug(slug: string): Competitor | undefined {
  return competitors.find((c) => c.slug === slug);
}
