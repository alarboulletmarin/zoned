export type ComparisonValue =
  | { type: "yes" }
  | { type: "no" }
  | { type: "partial"; labelFr: string; labelEn: string }
  | { type: "text"; valueFr: string; valueEn: string };

export interface ComparisonCriterion {
  key: string;
  labelFr: string;
  labelEn: string;
  zoned: ComparisonValue;
  competitor: ComparisonValue;
}

export interface Competitor {
  slug: string;
  nameFr: string;
  nameEn: string;
  taglineFr: string;
  taglineEn: string;
  descriptionFr: string;
  descriptionEn: string;
  priceFr: string;
  priceEn: string;
  criteria: ComparisonCriterion[];
}

const criteriaLabels: Array<{ key: string; labelFr: string; labelEn: string }> = [
  { key: "price", labelFr: "Prix", labelEn: "Price" },
  { key: "account", labelFr: "Compte requis", labelEn: "Account required" },
  { key: "dataCollection", labelFr: "Données collectées", labelEn: "Data collected" },
  { key: "personalizedPlans", labelFr: "Plans personnalisés", labelEn: "Personalized plans" },
  { key: "exportFit", labelFr: "Export FIT / GPX", labelEn: "FIT / GPX export" },
  { key: "exportPdf", labelFr: "Export PDF / ICS", labelEn: "PDF / ICS export" },
  { key: "library", labelFr: "Bibliothèque de séances", labelEn: "Workout library" },
  { key: "calculators", labelFr: "Calculateurs", labelEn: "Calculators" },
  { key: "openSource", labelFr: "Open Source", labelEn: "Open Source" },
];

const zonedValues: Record<string, ComparisonValue> = {
  price: { type: "text", valueFr: "Gratuit", valueEn: "Free" },
  account: { type: "no" },
  dataCollection: { type: "no" },
  personalizedPlans: { type: "yes" },
  exportFit: { type: "yes" },
  exportPdf: { type: "yes" },
  library: { type: "text", valueFr: "200+ séances", valueEn: "200+ workouts" },
  calculators: { type: "text", valueFr: "9 calculateurs", valueEn: "9 calculators" },
  openSource: { type: "yes" },
};

function buildCriteria(competitorValues: Record<string, ComparisonValue>): ComparisonCriterion[] {
  return criteriaLabels.map(({ key, labelFr, labelEn }) => ({
    key,
    labelFr,
    labelEn,
    zoned: zonedValues[key],
    competitor: competitorValues[key],
  }));
}

export const competitors: Competitor[] = [
  {
    slug: "runna",
    nameFr: "Runna",
    nameEn: "Runna",
    taglineFr: "App de coaching running par abonnement, rachetée par Strava en 2024",
    taglineEn: "Subscription-based running coaching app, acquired by Strava in 2024",
    descriptionFr:
      "Runna est un coach de course personnalisé par abonnement, racheté par Strava en 2024. Comparez avec Zoned : gratuit, sans compte et sans collecte de données.",
    descriptionEn:
      "Runna is a subscription-based personal running coach, acquired by Strava in 2024. Compare with Zoned: free, no account required, zero data collection.",
    priceFr: "~14,99€/mois",
    priceEn: "~$14.99/month",
    criteria: buildCriteria({
      price: { type: "text", valueFr: "~14,99€/mois", valueEn: "~$14.99/month" },
      account: { type: "yes" },
      dataCollection: { type: "yes" },
      personalizedPlans: { type: "yes" },
      exportFit: { type: "partial", labelFr: "Via Strava", labelEn: "Via Strava" },
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
    taglineFr: "App de running gratuite de Decathlon, nécessite un compte Decathlon",
    taglineEn: "Decathlon's free running app, requires a Decathlon account",
    descriptionFr:
      "Kiprun Pacer est l'app de running gratuite de Decathlon. Elle nécessite un compte Decathlon et collecte vos données. Comparez avec Zoned : aucun compte, aucune donnée collectée.",
    descriptionEn:
      "Kiprun Pacer is Decathlon's free running app. It requires a Decathlon account and collects your data. Compare with Zoned: no account, no data collected.",
    priceFr: "Gratuit",
    priceEn: "Free",
    criteria: buildCriteria({
      price: { type: "text", valueFr: "Gratuit", valueEn: "Free" },
      account: { type: "yes" },
      dataCollection: { type: "yes" },
      personalizedPlans: { type: "partial", labelFr: "Plans basiques", labelEn: "Basic plans" },
      exportFit: { type: "no" },
      exportPdf: { type: "no" },
      library: { type: "partial", labelFr: "Séances guidées", labelEn: "Guided sessions" },
      calculators: { type: "no" },
      openSource: { type: "no" },
    }),
  },
  {
    slug: "campus-coach",
    nameFr: "Campus Coach",
    nameEn: "Campus Coach",
    taglineFr: "App de coaching running freemium avec adaptation en temps réel",
    taglineEn: "Freemium running coaching app with real-time adaptation",
    descriptionFr:
      "Campus Coach est une app de coaching running freemium avec adaptation en temps réel. Comparez avec Zoned : entièrement gratuit, sans compte, open source.",
    descriptionEn:
      "Campus Coach is a freemium running coaching app with real-time adaptation. Compare with Zoned: completely free, no account required, open source.",
    priceFr: "Freemium",
    priceEn: "Freemium",
    criteria: buildCriteria({
      price: { type: "text", valueFr: "Freemium", valueEn: "Freemium" },
      account: { type: "yes" },
      dataCollection: { type: "yes" },
      personalizedPlans: { type: "yes" },
      exportFit: { type: "no" },
      exportPdf: { type: "no" },
      library: { type: "partial", labelFr: "Plan uniquement", labelEn: "Plan only" },
      calculators: { type: "no" },
      openSource: { type: "no" },
    }),
  },
];

export function getCompetitorBySlug(slug: string): Competitor | undefined {
  return competitors.find((c) => c.slug === slug);
}
