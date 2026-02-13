// src/data/collections/index.ts
// Public API for collections data

import type { Collection } from "./types";
import { collections } from "./data";

export type { Collection } from "./types";
export { collections } from "./data";

/**
 * Index by slug for O(1) lookup
 */
const collectionsBySlug = new Map<string, Collection>(
  collections.map((c) => [c.slug, c])
);

/**
 * Get all collections
 */
export function getAllCollections(): Collection[] {
  return collections;
}

/**
 * Get a collection by slug
 */
export function getCollectionBySlug(slug: string): Collection | undefined {
  return collectionsBySlug.get(slug);
}

/**
 * Get collections that contain a specific workout ID
 */
export function getCollectionsForWorkout(workoutId: string): Collection[] {
  return collections.filter((c) => c.workoutIds.includes(workoutId));
}

/**
 * Get only progression collections (ordered sequences)
 */
export function getProgressionCollections(): Collection[] {
  return collections.filter((c) => c.isProgression);
}

/**
 * Get collections by tag
 */
export function getCollectionsByTag(tag: string): Collection[] {
  const lowerTag = tag.toLowerCase();
  return collections.filter((c) =>
    c.tags.some((t) => t.toLowerCase() === lowerTag)
  );
}

/**
 * Search collections by name or description (supports both FR and EN)
 */
export function searchCollections(query: string): Collection[] {
  const lowerQuery = query.toLowerCase();
  return collections.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.nameEn.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery) ||
      c.descriptionEn.toLowerCase().includes(lowerQuery) ||
      c.tags.some((t) => t.includes(lowerQuery))
  );
}
