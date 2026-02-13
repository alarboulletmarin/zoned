// src/data/collections/types.ts

import type { Difficulty } from "@/types";

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
  /** Tailwind gradient classes for card background */
  gradient: string;
  /** Target difficulty level (optional for mixed-difficulty collections) */
  difficulty?: Difficulty;
  /** Whether the workouts should be followed in order */
  isProgression: boolean;
  /** Ordered list of workout IDs */
  workoutIds: string[];
  /** Searchable tags */
  tags: string[];
}
