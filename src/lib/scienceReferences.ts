/**
 * Deduplicated view over `TARGET_SYSTEM_SCIENCE` — the single scientific
 * bibliography cited across the app (workout rationale, methodology pages).
 * Some papers back more than one target system (e.g. Faude et al. 2009 is
 * cited from both `aerobic_threshold` and `lactate_threshold`), so this is
 * the one place that collapses them to a stable, sorted list.
 */
import { TARGET_SYSTEM_SCIENCE } from "@/data/science";
import type { ScientificReference } from "@/data/science";
import type { TargetSystem } from "@/types";

export interface ScienceReferenceEntry extends ScientificReference {
  /** First target system whose rationale cites this reference. */
  targetSystem: TargetSystem;
}

function referenceKey(ref: ScientificReference): string {
  return `${ref.title}|${ref.year}`;
}

/** Every reference cited across the target-system science map, deduplicated
 *  by title + year and sorted oldest first. */
export function getAllScienceReferences(): ScienceReferenceEntry[] {
  const seen = new Map<string, ScienceReferenceEntry>();
  for (const [system, data] of Object.entries(TARGET_SYSTEM_SCIENCE) as [
    TargetSystem,
    (typeof TARGET_SYSTEM_SCIENCE)[TargetSystem],
  ][]) {
    for (const ref of data.references) {
      const key = referenceKey(ref);
      if (!seen.has(key)) seen.set(key, { ...ref, targetSystem: system });
    }
  }
  return [...seen.values()].sort((a, b) => a.year - b.year);
}

/** Count of unique references (see `getAllScienceReferences`). */
export function countUniqueScienceSources(): number {
  return getAllScienceReferences().length;
}
