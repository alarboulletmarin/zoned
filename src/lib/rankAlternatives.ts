import type { AnyWorkoutTemplate, WorkoutTemplate } from "@/types";
import { getWorkoutDiscipline, isStrengthWorkout } from "@/types";
import type { PlanSession } from "@/types/plan";

/**
 * Les séances qui peuvent en remplacer une autre dans un plan, classées.
 *
 * Il n'existait pas de classement à réutiliser : `SwapSessionDialog` filtrait
 * le catalogue par type et par nom, sans ordre, et le générateur tire une
 * séance pour un créneau vide, pas une voisine d'une séance posée. La
 * substitution par une autre discipline garde le sien
 * (`rankSubstitutionCandidates`, à charge égale), la page le lit tel quel.
 *
 * ── La famille ───────────────────────────────────────────────────────────
 *
 * Cinq familles, celles que la feuille propose en pilules : côtes et trail,
 * route, renfo, vélo, natation. Une séance appartient à une seule.
 *
 * ── L'ordre ──────────────────────────────────────────────────────────────
 *
 * Même famille d'abord (le filtre l'impose), puis la distance à la séance
 * actuelle : l'écart de durée relatif à sa durée, plus l'écart d'intensité.
 * La séance elle-même n'est jamais proposée.
 *
 * ── L'alternative plus facile ────────────────────────────────────────────
 *
 * La plus proche en durée parmi celles d'intensité inférieure. Une séance
 * déjà facile n'en a pas.
 */

export type AlternativeFamily = "hills_trail" | "road" | "strength" | "cycling" | "swimming";
export type IntensityLevel = 0 | 1 | 2;
export type DurationBand = "short" | "medium" | "long";
export type AlternativeSort = "match" | "duration";

export interface AlternativeFilters {
  family: AlternativeFamily;
  query?: string;
  intensity?: IntensityLevel | null;
  duration?: DurationBand | null;
  sort?: AlternativeSort;
  /** Les séances déjà posées dans la semaine : une alternative ne les répète pas. */
  excludeIds?: readonly string[];
}

export interface RankedAlternative {
  workout: AnyWorkoutTemplate;
  durationMin: number;
  intensity: IntensityLevel;
  score: number;
}

export interface AlternativesResult {
  /** La plus proche en durée parmi les moins intenses, absente de `list`. */
  easier: RankedAlternative | null;
  list: RankedAlternative[];
}

const LOAD_LEVEL: Record<string, IntensityLevel> = { light: 0, moderate: 1, hard: 2, key: 2 };
const STRENGTH_LEVEL: Record<string, IntensityLevel> = { mobility: 0, endurance: 1 };

export function familyOf(workout: AnyWorkoutTemplate): AlternativeFamily {
  if (isStrengthWorkout(workout)) return "strength";
  const discipline = getWorkoutDiscipline(workout);
  if (discipline === "cycling") return "cycling";
  if (discipline === "swimming") return "swimming";
  return workout.category === "hills" || workout.category === "trail" ? "hills_trail" : "road";
}

export function intensityOf(workout: AnyWorkoutTemplate): IntensityLevel {
  if (isStrengthWorkout(workout)) return STRENGTH_LEVEL[workout.intensity] ?? 2;
  return LOAD_LEVEL[(workout as WorkoutTemplate).selectionCriteria?.relativeLoad ?? "moderate"] ?? 1;
}

export function typicalMinutes(workout: AnyWorkoutTemplate): number {
  const range = workout.typicalDuration;
  return range ? Math.round((range.min + range.max) / 2) : 0;
}

export function durationBandOf(minutes: number): DurationBand {
  if (minutes < 30) return "short";
  if (minutes <= 60) return "medium";
  return "long";
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function matchesQuery(workout: AnyWorkoutTemplate, query: string | undefined): boolean {
  const q = normalize(query ?? "");
  if (!q) return true;
  return [workout.name, workout.nameEn, workout.id].some((s) => s && normalize(s).includes(q));
}

export function rankAlternatives(
  session: Pick<PlanSession, "workoutId" | "estimatedDurationMin">,
  workout: AnyWorkoutTemplate | undefined,
  catalogue: readonly AnyWorkoutTemplate[],
  filters: AlternativeFilters,
): AlternativesResult {
  const target = session.estimatedDurationMin > 0
    ? session.estimatedDurationMin
    : workout
      ? typicalMinutes(workout)
      : 45;
  const currentLevel: IntensityLevel = workout ? intensityOf(workout) : 1;

  const excluded = new Set(filters.excludeIds ?? []);
  const ranked: RankedAlternative[] = [];
  for (const candidate of catalogue) {
    if (candidate.id === session.workoutId || excluded.has(candidate.id)) continue;
    if (familyOf(candidate) !== filters.family) continue;
    if (!matchesQuery(candidate, filters.query)) continue;
    const durationMin = typicalMinutes(candidate);
    const intensity = intensityOf(candidate);
    if (filters.intensity != null && intensity !== filters.intensity) continue;
    if (filters.duration && durationBandOf(durationMin) !== filters.duration) continue;
    const score = Math.abs(durationMin - target) / Math.max(target, 1) + Math.abs(intensity - currentLevel) * 0.5;
    ranked.push({ workout: candidate, durationMin, intensity, score });
  }

  const byMatch = (a: RankedAlternative, b: RankedAlternative) =>
    a.score - b.score || a.durationMin - b.durationMin || a.workout.id.localeCompare(b.workout.id);
  const byDuration = (a: RankedAlternative, b: RankedAlternative) =>
    a.durationMin - b.durationMin || byMatch(a, b);
  ranked.sort(filters.sort === "duration" ? byDuration : byMatch);

  // Pas de recommandation quand la personne a déjà restreint l'intensité ou
  // cherche un nom : elle sait ce qu'elle veut.
  let easier: RankedAlternative | null = null;
  if (filters.intensity == null && !filters.query?.trim()) {
    for (const r of ranked) {
      if (r.intensity >= currentLevel) continue;
      const gap = Math.abs(r.durationMin - target);
      if (!easier || gap < Math.abs(easier.durationMin - target)) easier = r;
    }
  }

  return { easier, list: easier ? ranked.filter((r) => r !== easier) : ranked };
}
