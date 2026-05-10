/**
 * MET (Metabolic Equivalent of Task) calculator.
 *
 * Reference: Compendium of Physical Activities (Ainsworth et al., 2011 update)
 * https://fr.wikipedia.org/wiki/%C3%89quivalent_m%C3%A9tabolique
 *
 * 1 MET = 3.5 ml O₂ / kg / min ≈ 1 kcal / kg / h (resting metabolic rate)
 * Energy expenditure (kcal) = MET × weight (kg) × duration (h)
 */

export type MetCategory =
  | "running"
  | "cycling"
  | "swimming"
  | "walking"
  | "strength"
  | "other";

export interface MetActivity {
  id: string;
  category: MetCategory;
  met: number;
  label: string;
  labelEn: string;
}

export const MET_ACTIVITIES: MetActivity[] = [
  // Running
  { id: "run-jog", category: "running", met: 6.0, label: "Jogging (6 km/h)", labelEn: "Jogging (6 km/h)" },
  { id: "run-8", category: "running", met: 8.3, label: "Course 8 km/h (7:30/km)", labelEn: "Running 8 km/h (12:00/mi)" },
  { id: "run-10", category: "running", met: 10.0, label: "Course 10 km/h (6:00/km)", labelEn: "Running 10 km/h (9:40/mi)" },
  { id: "run-12", category: "running", met: 11.8, label: "Course 12 km/h (5:00/km)", labelEn: "Running 12 km/h (8:00/mi)" },
  { id: "run-14", category: "running", met: 13.5, label: "Course 14 km/h (4:17/km)", labelEn: "Running 14 km/h (6:54/mi)" },
  { id: "run-16", category: "running", met: 14.5, label: "Course 16 km/h (3:45/km)", labelEn: "Running 16 km/h (6:00/mi)" },
  { id: "run-17", category: "running", met: 16.0, label: "Course 17,5 km/h (3:25/km)", labelEn: "Running 17.5 km/h (5:30/mi)" },
  { id: "run-trail", category: "running", met: 9.0, label: "Trail running modéré", labelEn: "Trail running, moderate" },

  // Cycling
  { id: "bike-light", category: "cycling", met: 4.0, label: "Vélo loisir (< 16 km/h)", labelEn: "Cycling, leisure (< 16 km/h)" },
  { id: "bike-mod", category: "cycling", met: 6.8, label: "Vélo modéré (16-19 km/h)", labelEn: "Cycling, moderate (16-19 km/h)" },
  { id: "bike-vig", category: "cycling", met: 8.0, label: "Vélo soutenu (19-22 km/h)", labelEn: "Cycling, vigorous (19-22 km/h)" },
  { id: "bike-fast", category: "cycling", met: 10.0, label: "Vélo rapide (22-25 km/h)", labelEn: "Cycling, fast (22-25 km/h)" },
  { id: "bike-race", category: "cycling", met: 12.0, label: "Vélo course (25-30 km/h)", labelEn: "Cycling, racing (25-30 km/h)" },
  { id: "bike-elite", category: "cycling", met: 15.8, label: "Vélo course (> 30 km/h)", labelEn: "Cycling, racing (> 30 km/h)" },
  { id: "bike-mtb", category: "cycling", met: 8.5, label: "VTT", labelEn: "Mountain biking" },
  { id: "bike-spin", category: "cycling", met: 8.5, label: "Vélo en salle (spinning)", labelEn: "Indoor cycling (spinning)" },

  // Swimming
  { id: "swim-light", category: "swimming", met: 5.8, label: "Crawl léger", labelEn: "Freestyle, light" },
  { id: "swim-mod", category: "swimming", met: 8.3, label: "Crawl modéré", labelEn: "Freestyle, moderate" },
  { id: "swim-vig", category: "swimming", met: 9.8, label: "Crawl rapide", labelEn: "Freestyle, vigorous" },
  { id: "swim-breast", category: "swimming", met: 5.3, label: "Brasse", labelEn: "Breaststroke" },
  { id: "swim-back", category: "swimming", met: 4.8, label: "Dos crawlé", labelEn: "Backstroke" },
  { id: "swim-fly", category: "swimming", met: 13.8, label: "Papillon", labelEn: "Butterfly" },

  // Walking
  { id: "walk-slow", category: "walking", met: 2.0, label: "Marche lente (3 km/h)", labelEn: "Walking, slow (3 km/h)" },
  { id: "walk-mod", category: "walking", met: 3.5, label: "Marche modérée (5 km/h)", labelEn: "Walking, moderate (5 km/h)" },
  { id: "walk-brisk", category: "walking", met: 5.0, label: "Marche rapide (6 km/h)", labelEn: "Walking, brisk (6 km/h)" },
  { id: "walk-fast", category: "walking", met: 6.3, label: "Marche très rapide (7 km/h)", labelEn: "Walking, very brisk (7 km/h)" },
  { id: "walk-hike", category: "walking", met: 6.0, label: "Randonnée (terrain vallonné)", labelEn: "Hiking (hilly)" },
  { id: "walk-stairs", category: "walking", met: 8.8, label: "Montée d'escaliers", labelEn: "Climbing stairs" },

  // Strength
  { id: "str-light", category: "strength", met: 3.5, label: "Musculation modérée", labelEn: "Weightlifting, moderate" },
  { id: "str-vig", category: "strength", met: 6.0, label: "Musculation vigoureuse", labelEn: "Weightlifting, vigorous" },
  { id: "str-cross", category: "strength", met: 8.0, label: "Cross-training / HIIT", labelEn: "Cross-training / HIIT" },
  { id: "str-circuit", category: "strength", met: 8.0, label: "Circuit training", labelEn: "Circuit training" },
  { id: "str-calist", category: "strength", met: 4.5, label: "Calisthenics modéré", labelEn: "Calisthenics, moderate" },

  // Other endurance & sports
  { id: "other-row", category: "other", met: 7.0, label: "Aviron modéré", labelEn: "Rowing, moderate" },
  { id: "other-row-vig", category: "other", met: 8.5, label: "Aviron soutenu", labelEn: "Rowing, vigorous" },
  { id: "other-rope", category: "other", met: 12.3, label: "Corde à sauter", labelEn: "Jump rope" },
  { id: "other-yoga", category: "other", met: 2.5, label: "Yoga (Hatha)", labelEn: "Yoga (Hatha)" },
  { id: "other-yoga-vin", category: "other", met: 4.0, label: "Yoga (Vinyasa / Power)", labelEn: "Yoga (Vinyasa / Power)" },
  { id: "other-pilates", category: "other", met: 3.0, label: "Pilates", labelEn: "Pilates" },
  { id: "other-elliptical", category: "other", met: 5.0, label: "Vélo elliptique modéré", labelEn: "Elliptical, moderate" },
  { id: "other-ski", category: "other", met: 9.0, label: "Ski de fond", labelEn: "Cross-country skiing" },
  { id: "other-tennis", category: "other", met: 7.3, label: "Tennis (simple)", labelEn: "Tennis (singles)" },
  { id: "other-football", category: "other", met: 7.0, label: "Football", labelEn: "Soccer" },
  { id: "other-basket", category: "other", met: 6.5, label: "Basketball", labelEn: "Basketball" },
  { id: "other-climb", category: "other", met: 8.0, label: "Escalade", labelEn: "Rock climbing" },
];

export const CATEGORY_ORDER: MetCategory[] = [
  "running",
  "cycling",
  "swimming",
  "walking",
  "strength",
  "other",
];

/**
 * Compute energy expenditure for a given MET value, body weight and duration.
 * @param met MET value of the activity
 * @param weightKg Body weight in kilograms
 * @param durationMin Duration in minutes
 * @returns Energy expended in kilocalories (kcal)
 */
export function computeCalories(met: number, weightKg: number, durationMin: number): number {
  if (met <= 0 || weightKg <= 0 || durationMin <= 0) return 0;
  return met * weightKg * (durationMin / 60);
}

/**
 * Approximate oxygen consumption (VO₂) for a given MET value.
 * 1 MET = 3.5 ml O₂ / kg / min.
 */
export function computeVO2(met: number): number {
  return met * 3.5;
}

/**
 * Intensity classification per the Compendium of Physical Activities:
 *   < 3 MET  → light
 *   3–6 MET  → moderate
 *   ≥ 6 MET  → vigorous
 */
export type MetIntensity = "light" | "moderate" | "vigorous";

export function classifyIntensity(met: number): MetIntensity {
  if (met < 3) return "light";
  if (met < 6) return "moderate";
  return "vigorous";
}
