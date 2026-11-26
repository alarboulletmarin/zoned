/**
 * Shared bilingual labels for session types.
 *
 * Covers all `SessionType` values from `@/types` plus a few extra keys
 * used in the swap-session dialog (intervals, mixed, technique, warm-up).
 */

export const SESSION_TYPE_LABELS: Record<string, { fr: string; en: string; it?: string }> = {
  recovery: { fr: "Récupération", en: "Recovery", it: "Recupero" },
  endurance: { fr: "Endurance", en: "Endurance", it: "Resistenza" },
  tempo: { fr: "Tempo", en: "Tempo", it: "Tempo" },
  threshold: { fr: "Seuil", en: "Threshold", it: "Soglia" },
  vo2max: { fr: "VO2max", en: "VO2max", it: "VO2max" },
  speed: { fr: "Vitesse", en: "Speed", it: "Velocità" },
  long_run: { fr: "Sortie longue", en: "Long Run", it: "Lungo" },
  hills: { fr: "Côtes", en: "Hills", it: "Salite" },
  fartlek: { fr: "Fartlek", en: "Fartlek", it: "Fartlek" },
  race_specific: { fr: "Allure course", en: "Race Specific", it: "Ritmo gara" },
  strength: { fr: "Renforcement", en: "Strength", it: "Potenziamento" },
  cycling: { fr: "Vélo", en: "Cycling", it: "Ciclismo" },
  swimming: { fr: "Natation", en: "Swimming", it: "Nuoto" },
  yoga: { fr: "Yoga", en: "Yoga", it: "Yoga" },
  rest: { fr: "Repos", en: "Rest", it: "Riposo" },
  rest_day: { fr: "Repos actif", en: "Active Rest", it: "Riposo attivo" },
  cross_training: { fr: "Cross-training", en: "Cross-training", it: "Cross-training" },
  intervals: { fr: "Intervalles", en: "Intervals", it: "Ripetute" },
  mixed: { fr: "Mixte", en: "Mixed", it: "Misto" },
  technique: { fr: "Technique", en: "Technique", it: "Tecnica" },
  "warm-up": { fr: "Échauffement", en: "Warm-up", it: "Riscaldamento" },
};
