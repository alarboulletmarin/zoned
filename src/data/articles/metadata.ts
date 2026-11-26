// src/data/articles/metadata.ts
// Lightweight article metadata - NO content

import type { ArticleMeta, ArticleCategory } from "./types";

/**
 * Article metadata array - used for listing and navigation
 * Content is loaded separately via dynamic imports
 */
export const articleMetadata: ArticleMeta[] = [
  {
    id: "zones",
    slug: "zones",
    title: "Comprendre les 6 zones d'entraînement",
    titleEn: "Understanding the 6 Training Zones",
    titleIt: "Comprendere le 6 zone di allenamento",
    description:
      "La science derrière l'entraînement par zones et comment l'appliquer à votre pratique",
    descriptionEn:
      "The science behind zone training and how to apply it to your practice",
    descriptionIt:
      "La scienza alla base dell'allenamento a zone e come applicarla alla tua pratica",
    category: "fundamentals",
    readTime: 10,
    publishedAt: "2025-09-12",
    updatedAt: "2026-04-22",
  },
  {
    id: "testing-vma",
    slug: "testing-vma",
    title: "Mesurer sa VMA et sa FCmax",
    titleEn: "Measuring Your VO2max Speed and HRmax",
    titleIt: "Misurare la VAM e la FCmax",
    description:
      "Protocoles de tests et méthodes pour établir vos références d'entraînement",
    descriptionEn:
      "Test protocols and methods to establish your training benchmarks",
    descriptionIt:
      "Protocolli di test e metodi per stabilire i tuoi riferimenti di allenamento",
    category: "fundamentals",
    readTime: 12,
    publishedAt: "2025-09-24",
    updatedAt: "2026-03-08",
  },
  {
    id: "warmup",
    slug: "warmup",
    title: "L'échauffement du coureur",
    titleEn: "The Runner's Warm-up",
    titleIt: "Il riscaldamento del runner",
    description:
      "Préparer son corps à l'effort : physiologie, protocoles et erreurs courantes",
    descriptionEn:
      "Preparing your body for effort: physiology, protocols and common mistakes",
    descriptionIt:
      "Preparare il corpo allo sforzo: fisiologia, protocolli ed errori comuni",
    category: "training",
    readTime: 8,
    publishedAt: "2025-10-07",
    updatedAt: "2026-02-14",
  },
  {
    id: "recovery",
    slug: "recovery",
    title: "La récupération : là où tout se joue",
    titleEn: "Recovery: Where It All Comes Together",
    titleIt: "Il recupero: dove tutto si gioca",
    description:
      "Comprendre pourquoi la progression se fait au repos et comment optimiser votre récupération",
    descriptionEn:
      "Understanding why progression happens at rest and how to optimize your recovery",
    descriptionIt:
      "Capire perché il miglioramento avviene a riposo e come ottimizzare il recupero",
    category: "lifestyle",
    readTime: 10,
    publishedAt: "2025-10-29",
    updatedAt: "2026-04-02",
  },
  {
    id: "nutrition",
    slug: "nutrition",
    title: "Nutrition du coureur",
    titleEn: "The Runner's Nutrition",
    titleIt: "Nutrizione del runner",
    description:
      "Alimenter la performance : avant, pendant et après l'effort",
    descriptionEn: "Fueling performance: before, during and after effort",
    descriptionIt:
      "Alimentare la prestazione: prima, durante e dopo lo sforzo",
    category: "lifestyle",
    readTime: 12,
    publishedAt: "2025-11-15",
    updatedAt: "2026-05-09",
  },
  {
    id: "faq",
    slug: "faq",
    title: "Questions fréquentes",
    titleEn: "Frequently Asked Questions",
    titleIt: "Domande frequenti",
    description: "Réponses aux interrogations courantes des coureurs",
    descriptionEn: "Answers to common runner questions",
    descriptionIt: "Risposte alle domande più comuni dei runner",
    category: "fundamentals",
    readTime: 8,
    publishedAt: "2025-12-03",
    updatedAt: "2026-05-21",
  },
  {
    id: "periodization",
    slug: "periodization",
    title: "La périodisation en course à pied",
    titleEn: "Periodization in Running",
    titleIt: "La periodizzazione nella corsa",
    description:
      "Organiser son entraînement en cycles pour progresser efficacement et atteindre ses objectifs",
    descriptionEn:
      "Organizing training in cycles to progress efficiently and reach your goals",
    descriptionIt:
      "Organizzare l'allenamento in cicli per progredire efficacemente e raggiungere i propri obiettivi",
    category: "training",
    readTime: 8,
    publishedAt: "2025-12-18",
    updatedAt: "2026-04-12",
  },
  {
    id: "supercompensation",
    slug: "supercompensation",
    title: "Comprendre la surcompensation",
    titleEn: "Understanding Supercompensation",
    titleIt: "Comprendere la supercompensazione",
    description:
      "Le mécanisme clé de la progression : pourquoi on progresse au repos et comment en tirer parti",
    descriptionEn:
      "The key mechanism of progression: why we improve at rest and how to leverage it",
    descriptionIt:
      "Il meccanismo chiave del miglioramento: perché si progredisce a riposo e come sfruttarlo",
    category: "training",
    readTime: 6,
    publishedAt: "2026-01-09",
    updatedAt: "2026-04-30",
  },
  {
    id: "tapering",
    slug: "tapering",
    title: "L'art du taper",
    titleEn: "The Art of Tapering",
    titleIt: "L'arte del tapering",
    description:
      "Réduire l'entraînement avant une course pour arriver au sommet de sa forme",
    descriptionEn:
      "Reducing training before a race to arrive at peak form",
    descriptionIt:
      "Ridurre l'allenamento prima di una gara per arrivare al massimo della forma",
    category: "training",
    readTime: 7,
    publishedAt: "2026-01-28",
    updatedAt: "2026-04-18",
  },
  {
    id: "polarized-training",
    slug: "polarized-training",
    title: "L'entraînement polarisé 80/20",
    titleEn: "Polarized Training 80/20",
    titleIt: "L'allenamento polarizzato 80/20",
    description:
      "Courir lentement pour progresser vite : la méthode des élites décryptée",
    descriptionEn:
      "Run slow to get fast: the elite method explained",
    descriptionIt:
      "Correre piano per migliorare velocemente: il metodo degli atleti d'élite spiegato",
    category: "training",
    readTime: 8,
    publishedAt: "2026-02-15",
    updatedAt: "2026-05-04",
  },
  {
    id: "progressive-overload",
    slug: "progressive-overload",
    title: "La surcharge progressive",
    titleEn: "Progressive Overload",
    titleIt: "Il sovraccarico progressivo",
    description:
      "Le principe fondamental pour progresser sans se blesser : augmenter graduellement la charge",
    descriptionEn:
      "The fundamental principle for progress without injury: gradually increasing the load",
    descriptionIt:
      "Il principio fondamentale per progredire senza infortuni: aumentare gradualmente il carico",
    category: "training",
    readTime: 6,
    publishedAt: "2026-03-04",
    updatedAt: "2026-05-12",
  },
  {
    id: "consistency",
    slug: "consistency",
    title: "La régularité : clé de la progression",
    titleEn: "Consistency: The Key to Progress",
    titleIt: "La costanza: la chiave del miglioramento",
    description:
      "Pourquoi la régularité compte plus que l'intensité et comment bâtir des habitudes durables",
    descriptionEn:
      "Why consistency matters more than intensity and how to build sustainable habits",
    descriptionIt:
      "Perché la costanza conta più dell'intensità e come costruire abitudini durature",
    category: "fundamentals",
    readTime: 5,
    publishedAt: "2026-03-22",
    updatedAt: "2026-05-25",
  },
];

/**
 * Available article categories
 */
export const articleCategories: ArticleCategory[] = [
  "fundamentals",
  "training",
  "lifestyle",
];

/**
 * Index by slug for O(1) lookup
 */
const metadataBySlug = new Map<string, ArticleMeta>(
  articleMetadata.map((a) => [a.slug, a])
);

/**
 * Get article metadata by slug
 */
export function getArticleMetaBySlug(slug: string): ArticleMeta | undefined {
  return metadataBySlug.get(slug);
}

/**
 * Get all article metadata
 */
export function getAllArticleMeta(): ArticleMeta[] {
  return articleMetadata;
}

/**
 * Get article metadata by category
 */
export function getArticleMetaByCategory(category: ArticleCategory): ArticleMeta[] {
  return articleMetadata.filter((a) => a.category === category);
}

/**
 * Get adjacent articles for navigation
 */
export function getAdjacentArticleMeta(
  slug: string
): { prev: ArticleMeta | null; next: ArticleMeta | null } {
  const index = articleMetadata.findIndex((a) => a.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? articleMetadata[index - 1] : null,
    next: index < articleMetadata.length - 1 ? articleMetadata[index + 1] : null,
  };
}
