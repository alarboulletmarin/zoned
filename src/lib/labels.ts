/**
 * Shared bilingual labels for session types.
 *
 * Covers all `SessionType` values from `@/types` plus a few extra keys
 * used in the swap-session dialog (intervals, mixed, technique, warm-up).
 */

export const SESSION_TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  recovery: { fr: "Récupération", en: "Recovery" },
  endurance: { fr: "Endurance", en: "Endurance" },
  tempo: { fr: "Tempo", en: "Tempo" },
  threshold: { fr: "Seuil", en: "Threshold" },
  vo2max: { fr: "VO2max", en: "VO2max" },
  speed: { fr: "Vitesse", en: "Speed" },
  long_run: { fr: "Sortie longue", en: "Long Run" },
  hills: { fr: "Côtes", en: "Hills" },
  fartlek: { fr: "Fartlek", en: "Fartlek" },
  race_specific: { fr: "Allure course", en: "Race Specific" },
  strength: { fr: "Renforcement", en: "Strength" },
  cycling: { fr: "Vélo", en: "Cycling" },
  swimming: { fr: "Natation", en: "Swimming" },
  yoga: { fr: "Yoga", en: "Yoga" },
  rest: { fr: "Repos", en: "Rest" },
  rest_day: { fr: "Repos actif", en: "Active Rest" },
  cross_training: { fr: "Cross-training", en: "Cross-training" },
  intervals: { fr: "Intervalles", en: "Intervals" },
  mixed: { fr: "Mixte", en: "Mixed" },
  technique: { fr: "Technique", en: "Technique" },
  "warm-up": { fr: "Échauffement", en: "Warm-up" },
};
