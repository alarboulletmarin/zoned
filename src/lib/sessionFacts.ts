/**
 * Les chiffres de la page de séance, tirés du gabarit et de rien d'autre.
 *
 * Pur et testé : la page ne calcule rien, elle lit ce module. Voir
 * `docs/seance.md` pour les choix, en particulier pic contre dominante.
 */

import type { WorkoutTemplate, ZoneNumber, ZoneRange } from "@/types";
import { getPeakZone, parseZoneSpan } from "@/types";
import { flattenWorkoutSegments } from "@/lib/workoutStructure";
import { calculatePaceZones } from "@/lib/zones";
import { enduranceQualityMinutes, QUALITY_FROM_ZONE } from "@/lib/weekRings";

export { QUALITY_FROM_ZONE };

/** Endurance et Qualité en minutes, sur la règle des anneaux. */
export interface IntensitySplit {
  enduranceMin: number;
  qualityMin: number;
}

/**
 * La barre d'intensité : Endurance (sous `QUALITY_FROM_ZONE`) et Qualité,
 * bloc par bloc, ramenées à `totalMin` (la durée que la page affiche, celle
 * du plan quand on en vient).
 */
export function intensitySplit(workout: WorkoutTemplate, totalMin: number): IntensitySplit {
  const { endurance, quality } = enduranceQualityMinutes(workout, totalMin);
  return { enduranceMin: endurance, qualityMin: quality };
}

/**
 * Le pic : la zone la plus haute du corps de séance (`getPeakZone`), et le
 * temps CUMULÉ que la séance passe dans un bloc qui monte jusqu'à elle.
 * `null` pour une séance sans aucune zone, qui n'a pas de pic à dire.
 */
export function peakOf(workout: WorkoutTemplate): { zone: ZoneNumber; seconds: number } | null {
  const segments = flattenWorkoutSegments(workout);
  if (!segments.some((segment) => parseZoneSpan(segment.zone ?? undefined))) return null;
  const zone = getPeakZone(workout);
  const seconds = segments
    .filter((segment) => parseZoneSpan(segment.zone ?? undefined)?.max === zone)
    .reduce((sum, segment) => sum + segment.durationSec, 0);
  return { zone, seconds };
}

/**
 * La distance estimée d'une séance de course pour une VMA donnée : chaque
 * segment couru à la vitesse du milieu de sa zone (`calculatePaceZones`),
 * une plage au milieu de toute sa plage, un segment sans zone en Z2.
 * `null` hors de la course, où une VMA ne dit rien.
 */
export function estimateDistanceKm(workout: WorkoutTemplate, vma: number): number | null {
  if ((workout.discipline ?? "running") !== "running" || !(vma > 0)) return null;
  const zones = calculatePaceZones(vma);
  const speedOf = (zone: number, edge: "fast" | "slow") => {
    const range = zones.find((z) => z.zone === zone);
    const pace = edge === "fast" ? range?.paceMinPerKm : range?.paceMaxPerKm;
    return pace ? 60 / pace : 0;
  };
  let km = 0;
  for (const segment of flattenWorkoutSegments(workout)) {
    const span = parseZoneSpan(segment.zone ?? undefined) ?? { min: 2, max: 2 };
    const kmh = (speedOf(span.min, "slow") + speedOf(span.max, "fast")) / 2;
    km += (segment.durationSec / 3600) * kmh;
  }
  return km;
}

/** Le code compact d'une zone : `Z5`, `Z1-Z2`. `null` sans zone lisible. */
export function zoneCode(spec: string | null | undefined): string | null {
  const span = parseZoneSpan(spec ?? undefined);
  if (!span) return null;
  return span.min === span.max ? `Z${span.min}` : `Z${span.min}-Z${span.max}`;
}

/** La teinte d'une puce de zone : celle de la zone la plus haute qu'elle couvre. */
export function zoneTone(spec: string | null | undefined): ZoneNumber | null {
  return parseZoneSpan(spec ?? undefined)?.max ?? null;
}

/** Une allure en `m:ss`. */
function pace(minPerKm: number): string {
  const totalSec = Math.round(minPerKm * 60);
  return `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, "0")}`;
}

/**
 * La cible d'un bloc pour les zones de l'athlète, du plus lent au plus
 * rapide : `6:40 → 5:40 /km`, sinon la fréquence cardiaque, sinon `null`.
 * Une plage `Z1-Z2` va du bas de Z1 au haut de Z2.
 */
export function stepTarget(
  spec: string | null | undefined,
  userZones: readonly ZoneRange[] | undefined,
  options: { paces: boolean },
): string | null {
  const span = parseZoneSpan(spec ?? undefined);
  if (!span || !userZones || userZones.length === 0) return null;
  const low = userZones.find((z) => z.zone === span.min);
  const high = userZones.find((z) => z.zone === span.max);
  if (!low || !high) return null;
  if (options.paces && low.paceMaxPerKm && high.paceMinPerKm) {
    const slow = pace(low.paceMaxPerKm);
    const fast = pace(high.paceMinPerKm);
    return slow === fast ? `${slow} /km` : `${slow} → ${fast} /km`;
  }
  if (low.hrMin && high.hrMax) return `${low.hrMin}-${high.hrMax} bpm`;
  return null;
}
