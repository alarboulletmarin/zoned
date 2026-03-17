// src/data/glossary/types.ts
// Type definitions for the glossary feature

/**
 * Categories for organizing glossary terms
 */
export type GlossaryCategory =
  | "metrics" // Acronymes de mesure (VMA, FTP, TSS...)
  | "periodization" // Périodisation (macrocycle, taper...)
  | "sessions" // Types de séances (tempo, intervals...)
  | "zones" // Zones d'entraînement
  | "physiology" // Physiologie (VO2max, seuils...)
  | "recovery" // Récupération
  | "biomechanics" // Biomécanique de course
  | "injuries" // Blessures & prévention
  | "nutrition"; // Nutrition du coureur

/**
 * External link to scientific sources or documentation
 */
export interface ExternalLink {
  /** Display label for the link */
  label: string;
  /** URL of the external resource */
  url: string;
  /** Author or source name (e.g., "Seiler", "Jeukendrup") */
  author?: string;
}

/**
 * A single glossary term with all its metadata
 */
export interface GlossaryTerm {
  /** Unique identifier, lowercase with dashes (e.g., "vma", "zone-2") */
  id: string;

  /** Full term name (e.g., "Vitesse Maximale Aérobie") */
  term: string;

  /** English term name (e.g., "Maximal Aerobic Speed") */
  termEn?: string;

  /** Acronym or short form if applicable (e.g., "VMA", "TSS") */
  acronym?: string;

  /** Category for filtering and organization */
  category: GlossaryCategory;

  /** Short definition (1-2 sentences) for tooltips and previews */
  shortDefinition: string;

  /** Short definition in English */
  shortDefinitionEn?: string;

  /** Full detailed definition */
  fullDefinition: string;

  /** Full detailed definition in English */
  fullDefinitionEn?: string;

  /** Practical example of usage */
  example?: string;

  /** Practical example in English */
  exampleEn?: string;

  /** Formula or calculation if applicable */
  formula?: string;

  /** IDs of related terms for navigation */
  relatedTerms?: string[];

  /** Associated training zone if applicable (1-6) */
  zone?: 1 | 2 | 3 | 4 | 5 | 6;

  /** Links to scientific sources */
  externalLinks?: ExternalLink[];

  /** Keywords for search functionality */
  keywords?: string[];
}

/**
 * Metadata for a glossary category
 */
export interface GlossaryCategoryInfo {
  /** Category identifier */
  id: GlossaryCategory;
  /** Display label in French */
  label: string;
  /** Display label in English */
  labelEn: string;
  /** Short description */
  description: string;
  /** Short description in English */
  descriptionEn: string;
  /** Lucide icon name */
  icon: string;
}
