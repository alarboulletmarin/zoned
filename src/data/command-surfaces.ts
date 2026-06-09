// src/data/command-surfaces.ts
// Static registry of navigable product surfaces (tools, guides, pages) surfaced
// in the Command Palette. Each entry is a directly-navigable destination — no
// heuristics. Titles/subtitles are stored inline FR/EN (same pattern as
// CALCULATEURS and collections data) so this module stays light and free of
// page-component imports.

import { normalizeSearch } from "@/lib/search-utils";

export type SurfaceSection = "calculator" | "guide" | "page";

export interface CommandSurface {
  id: string;
  section: SurfaceSection;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  url: string;
  /** FR + EN terms so users can type a product need (e.g. "nutrition", "trail"). */
  keywords: string[];
  /** Surfaced in the empty-state "quick access" list. */
  featured?: boolean;
}

export const COMMAND_SURFACES: CommandSurface[] = [
  // --- Calculateurs (titles mirror CALCULATEURS in CalculateursPage) ---
  {
    id: "calculators",
    section: "calculator",
    title: "Calculateurs",
    titleEn: "Calculators",
    subtitle: "Tous les outils de calcul et de conversion",
    subtitleEn: "All calculation and conversion tools",
    url: "/calculators",
    keywords: ["calculateur", "calculator", "outils", "tools", "convertir", "convert"],
    featured: true,
  },
  {
    id: "calc-zones",
    section: "calculator",
    title: "Zones d'entraînement",
    titleEn: "Training Zones",
    subtitle: "Calculez vos zones FC et allures depuis votre VMA ou FCmax",
    subtitleEn: "Calculate your HR and pace zones from VMA or max HR",
    url: "/calculators/zones",
    keywords: ["zones", "fc", "fcmax", "vma", "heart rate", "frequence cardiaque", "allures"],
  },
  {
    id: "calc-vma",
    section: "calculator",
    title: "VMA depuis un chrono",
    titleEn: "VMA from Race Time",
    subtitle: "Estimez votre VMA à partir d'un résultat de course",
    subtitleEn: "Estimate your VMA from a race result",
    url: "/calculators/vma",
    keywords: ["vma", "vo2max", "vitesse maximale aerobie", "chrono", "race time"],
  },
  {
    id: "calc-ftp",
    section: "calculator",
    title: "Test FTP vélo",
    titleEn: "FTP Cycling Test",
    subtitle: "Estimez votre FTP depuis un test 20 minutes ou un ramp test",
    subtitleEn: "Estimate your FTP from a 20-minute or ramp test",
    url: "/calculators/ftp",
    keywords: ["ftp", "velo", "cycling", "cyclisme", "watts", "puissance", "power", "ramp test"],
  },
  {
    id: "calc-css",
    section: "calculator",
    title: "Test CSS natation",
    titleEn: "CSS Swimming Test",
    subtitle: "Estimez votre CSS depuis un test 400m + 200m",
    subtitleEn: "Estimate your CSS from a 400m + 200m test",
    url: "/calculators/css",
    keywords: ["css", "natation", "swimming", "swim", "critical swim speed", "nage"],
  },
  {
    id: "calc-allures",
    section: "calculator",
    title: "Convertisseur d'allures",
    titleEn: "Pace Converter",
    subtitle: "Convertissez entre min/km, km/h et min/mile en temps réel",
    subtitleEn: "Convert between min/km, km/h and min/mile in real time",
    url: "/calculators/convertisseur",
    keywords: ["allure", "pace", "convertisseur", "converter", "min/km", "km/h", "mile"],
  },
  {
    id: "calc-table-allures",
    section: "calculator",
    title: "Table de référence",
    titleEn: "Pace Reference Table",
    subtitle: "Toutes les allures de 3:00 à 10:00/km avec temps estimés",
    subtitleEn: "All paces from 3:00 to 10:00/km with estimated times",
    url: "/calculators/table-allures",
    keywords: ["table", "allures", "pace table", "reference", "temps", "splits"],
  },
  {
    id: "calc-tapis",
    section: "calculator",
    title: "Convertisseur tapis roulant",
    titleEn: "Treadmill Converter",
    subtitle: "Convertissez vitesse et inclinaison en allure équivalente",
    subtitleEn: "Convert speed and incline to equivalent pace",
    url: "/calculators/tapis-roulant",
    keywords: ["tapis", "treadmill", "inclinaison", "incline", "vitesse", "indoor"],
  },
  {
    id: "calc-splits",
    section: "calculator",
    title: "Générateur de splits",
    titleEn: "Split Generator",
    subtitle: "Planifiez vos passages pour atteindre votre objectif chrono",
    subtitleEn: "Plan your splits to reach your target time",
    url: "/calculators/splits",
    keywords: ["splits", "passages", "objectif", "chrono", "negative split", "pacing"],
  },
  {
    id: "calc-equivalence",
    section: "calculator",
    title: "Équivalence entre distances",
    titleEn: "Race Equivalence",
    subtitle: "Prédisez vos temps sur toutes les distances depuis un résultat",
    subtitleEn: "Predict your times across all distances from one result",
    url: "/calculators/equivalence",
    keywords: ["equivalence", "prediction", "distances", "5k", "10k", "semi", "marathon", "predict"],
  },
  {
    id: "calc-age-graded",
    section: "calculator",
    title: "Performance age-graded",
    titleEn: "Age-Graded Performance",
    subtitle: "Comparez votre performance au record mondial de votre catégorie",
    subtitleEn: "Compare your performance to the world record for your category",
    url: "/calculators/age-graded",
    keywords: ["age", "age-graded", "performance", "record", "categorie", "wma"],
  },
  {
    id: "calc-race-simulator",
    section: "calculator",
    title: "Simulateur jour de course",
    titleEn: "Race Day Simulator",
    subtitle: "Plan complet jour de course : horaires, allures, nutrition, mental",
    subtitleEn: "Complete race day plan: schedule, pacing, nutrition, mental cues",
    url: "/race-simulator",
    keywords: ["course", "race", "simulateur", "simulator", "objectif", "chrono", "pacing", "negative split", "jour j"],
    featured: true,
  },
  {
    id: "calc-what-if",
    section: "calculator",
    title: "Simulateur What-If",
    titleEn: "What-If Simulator",
    subtitle: "Comparez deux scénarios d'entraînement et visualisez les différences",
    subtitleEn: "Compare two training scenarios and visualize the differences",
    url: "/calculators/what-if",
    keywords: ["what-if", "scenario", "comparer", "compare", "simulation"],
  },

  // --- Guides ---
  {
    id: "guides",
    section: "guide",
    title: "Guides",
    titleEn: "Guides",
    subtitle: "Guides pratiques : nutrition, préparation course, échauffement",
    subtitleEn: "Practical guides: nutrition, race prep, warmup",
    url: "/guides",
    keywords: ["guide", "guides", "pratique", "how to", "tutoriel"],
    featured: true,
  },
  {
    id: "guide-nutrition",
    section: "guide",
    title: "Guide nutrition",
    titleEn: "Nutrition Guide",
    subtitle: "Alimentation, hydratation et ravitaillement en course",
    subtitleEn: "Fueling, hydration and race-day nutrition",
    url: "/guides/nutrition",
    keywords: ["nutrition", "alimentation", "hydratation", "glucides", "ravitaillement", "carbs", "fueling", "gels"],
  },
  {
    id: "guide-race-prep",
    section: "guide",
    title: "Guide préparation course",
    titleEn: "Race Prep Guide",
    subtitle: "Checklist, stratégie et récupération autour de la course",
    subtitleEn: "Checklist, strategy and recovery around race day",
    url: "/guides/race-prep",
    keywords: ["preparation", "course", "race prep", "checklist", "strategie", "taper", "affutage"],
  },
  {
    id: "guide-warmup",
    section: "guide",
    title: "Guide échauffement",
    titleEn: "Warmup Guide",
    subtitle: "Routines d'échauffement et retour au calme",
    subtitleEn: "Warmup routines and cool-down",
    url: "/guides/warmup",
    keywords: ["echauffement", "warmup", "warm up", "retour au calme", "cool down", "mobilite", "etirements"],
  },
  {
    id: "nutrition-hub",
    section: "guide",
    title: "Nutrition",
    titleEn: "Nutrition",
    subtitle: "Tout sur la nutrition du coureur",
    subtitleEn: "Everything about runner nutrition",
    url: "/nutrition",
    keywords: ["nutrition", "alimentation", "hydratation", "glucides", "carbs", "energie"],
  },

  // --- Pages / outils ---
  {
    id: "settings",
    section: "page",
    title: "Paramètres",
    titleEn: "Settings",
    subtitle: "Langue, thème, unités et préférences",
    subtitleEn: "Language, theme, units and preferences",
    url: "/settings",
    keywords: ["parametres", "settings", "preferences", "langue", "language", "theme", "unites", "units", "reglages"],
    featured: true,
  },
  {
    id: "contribute",
    section: "page",
    title: "Contribuer",
    titleEn: "Contribute",
    subtitle: "Proposez du contenu, signalez un bug, donnez votre avis",
    subtitleEn: "Suggest content, report a bug, share feedback",
    url: "/contribute",
    keywords: ["contribuer", "contribute", "github", "feedback", "suggestion", "bug", "avis", "proposer"],
    featured: true,
  },
  {
    id: "plans",
    section: "page",
    title: "Mes plans",
    titleEn: "My Plans",
    subtitle: "Vos plans d'entraînement personnalisés",
    subtitleEn: "Your personalized training plans",
    url: "/plans",
    keywords: ["plan", "plans", "entrainement", "training", "programme"],
    featured: true,
  },
  {
    id: "plan-new",
    section: "page",
    title: "Créer un plan",
    titleEn: "Create a Plan",
    subtitle: "Démarrez un nouveau plan d'entraînement",
    subtitleEn: "Start a new training plan",
    url: "/plan/new",
    keywords: ["nouveau plan", "creer", "create", "new plan", "assisted", "prebuilt", "generer"],
  },
  {
    id: "plan-methodology",
    section: "page",
    title: "Méthodologie des plans",
    titleEn: "Plan Methodology",
    subtitle: "Comment nos plans d'entraînement sont construits",
    subtitleEn: "How our training plans are built",
    url: "/plans/methodology",
    keywords: ["methodologie", "methodology", "plans", "periodisation", "construction"],
  },
  {
    id: "methodology",
    section: "page",
    title: "Méthodologie",
    titleEn: "Methodology",
    subtitle: "La science derrière Zoned",
    subtitleEn: "The science behind Zoned",
    url: "/methodology",
    keywords: ["methodologie", "methodology", "science", "references", "sources"],
  },
  {
    id: "compare",
    section: "page",
    title: "Comparatifs",
    titleEn: "Compare",
    subtitle: "Comparez Zoned aux autres outils d'entraînement",
    subtitleEn: "Compare Zoned to other training tools",
    url: "/compare",
    keywords: ["comparer", "compare", "comparatif", "vs", "alternative", "concurrents"],
  },
  {
    id: "profile",
    section: "page",
    title: "Profil coureur",
    titleEn: "Runner Profile",
    subtitle: "Vos données, niveaux et records personnels",
    subtitleEn: "Your data, levels and personal records",
    url: "/profile",
    keywords: ["profil", "profile", "coureur", "runner", "records", "niveau"],
  },
  {
    id: "favorites",
    section: "page",
    title: "Favoris",
    titleEn: "Favorites",
    subtitle: "Vos séances et contenus enregistrés",
    subtitleEn: "Your saved workouts and content",
    url: "/favorites",
    keywords: ["favoris", "favorites", "enregistres", "saved", "bookmarks"],
  },
  {
    id: "routes",
    section: "page",
    title: "Parcours",
    titleEn: "Routes",
    subtitle: "Générez et explorez des parcours de course",
    subtitleEn: "Generate and explore running routes",
    url: "/routes",
    keywords: ["parcours", "routes", "trail", "itineraire", "carte", "map", "gpx"],
  },
  {
    id: "quiz",
    section: "page",
    title: "Quiz",
    titleEn: "Quiz",
    subtitle: "Testez vos connaissances en entraînement",
    subtitleEn: "Test your training knowledge",
    url: "/quiz",
    keywords: ["quiz", "test", "connaissances", "questions"],
  },
  {
    id: "changelog",
    section: "page",
    title: "Nouveautés",
    titleEn: "Changelog",
    subtitle: "Les dernières mises à jour de Zoned",
    subtitleEn: "The latest Zoned updates",
    url: "/changelog",
    keywords: ["changelog", "nouveautes", "updates", "releases", "versions", "what's new"],
  },
  {
    id: "about",
    section: "page",
    title: "À propos",
    titleEn: "About",
    subtitle: "En savoir plus sur Zoned",
    subtitleEn: "Learn more about Zoned",
    url: "/about",
    keywords: ["a propos", "about", "zoned", "qui", "projet"],
  },
];

/** Surfaces shown in the empty-state quick-access list, in registry order. */
export const FEATURED_SURFACES: CommandSurface[] = COMMAND_SURFACES.filter(
  (s) => s.featured,
);

/**
 * Filter navigable surfaces by query (diacritic-insensitive), matching against
 * title, subtitle and keywords in both languages.
 */
export function searchSurfaces(query: string): CommandSurface[] {
  const q = normalizeSearch(query.trim());
  if (!q) return [];
  return COMMAND_SURFACES.filter((s) => {
    const haystack = normalizeSearch(
      [s.title, s.titleEn, s.subtitle, s.subtitleEn, ...s.keywords].join(" "),
    );
    return haystack.includes(q);
  });
}
