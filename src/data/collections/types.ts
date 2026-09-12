// src/data/collections/types.ts

import type { Difficulty } from "@/types";
import type { Practice } from "@/types/practice";

/**
 * A curated collection of workouts, either a progression (ordered)
 * or an unordered thematic set.
 */
export interface Collection {
  /** Unique identifier (kebab-case) */
  id: string;
  /** URL-friendly slug */
  slug: string;
  /** Display name (French) */
  name: string;
  /** Display name (English) */
  nameEn: string;
  /** Short description (French) */
  description: string;
  /** Short description (English) */
  descriptionEn: string;
  /** Icon name (matches SVG icon component) */
  icon: string;
  /**
   * La pratique que cette collection sert, quand elle en sert UNE.
   *
   * Absente = transversale, et c'est le cas de dix des quinze : débuter,
   * anti-stress, retour de blessure, renforcement, VMA servent les quatre
   * pratiques. Même sémantique que `practiceIndex` pour les séances, où une
   * liste vide passe sous n'importe quelle pratique — le renforcement d'un
   * coureur sur route ne disparaît pas parce qu'il a choisi « route ».
   *
   * Sans ce champ, la curation existante était invisible dans le nouvel axe :
   * « Objectif ultra » était rangé par thème éditorial et par rien d'autre.
   */
  practice?: Practice;
  /** Target difficulty level (optional for mixed-difficulty collections) */
  difficulty?: Difficulty;
  /** Whether the workouts should be followed in order */
  isProgression: boolean;
  /** Ordered list of workout IDs */
  workoutIds: string[];
  /** Searchable tags */
  tags: string[];
}
