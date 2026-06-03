import type { PrebuiltWeek } from "../types";

/**
 * Affûtage / taper (VO₂·VMA) — 4 sessions, low volume, one sharp short quality.
 * Long run shortened. Keeps intensity, slashes volume.
 */
export const affutageVo2: PrebuiltWeek = {
  id: "affutage-vo2",
  slug: "affutage-vo2",
  name: "Affûtage VO₂",
  nameEn: "VO₂ Sharpening Taper",
  description:
    "Volume réduit, intensité conservée : une touche de VMA courte pour garder le punch sans accumuler de fatigue avant un objectif.",
  descriptionEn:
    "Reduced volume, intensity kept: a touch of short VO₂ work to stay sharp without piling on fatigue before a goal.",
  icon: "Zap",
  difficulty: "intermediate",
  category: "sharpening",
  provenance: "Principes d'affûtage — Bosquet & Mujika (méta-analyse)",
  provenanceEn: "Tapering principles — Bosquet & Mujika (meta-analysis)",
  whyItWorks:
    "L'affûtage coupe le volume de 40–60 % tout en gardant un peu d'intensité : la fatigue chute plus vite que la condition, et la fraîcheur grimpe. Les répétitions VMA courtes entretiennent l'économie de course et le système neuromusculaire sans créer de dommages durables.",
  whyItWorksEn:
    "Tapering cuts volume by 40–60% while keeping a little intensity: fatigue drops faster than fitness, and freshness climbs. Short VO₂ reps maintain running economy and the neuromuscular system without lasting damage.",
  settings: {
    sessions: 5,
    targetVolumeH: 3.5,
    quality: "vo2vma",
    disciplines: [],
    levels: [],
    longRunDay: 5,
  },
  sessions: [
    {
      dayOfWeek: 0,
      workoutId: "END-013",
      sessionType: "endurance",
      isKeySession: false,
      estimatedDurationMin: 35,
      why: "Footing de maintien court : entretient l'aérobie, volume volontairement bas pendant l'affûtage.",
      whyEn: "Short maintenance jog: keeps the aerobic system ticking, volume kept low during the taper.",
    },
    {
      dayOfWeek: 2,
      workoutId: "VMA-020",
      sessionType: "vo2max",
      isKeySession: true,
      estimatedDurationMin: 28,
      why: "VMA pré-course : quelques répétitions vives pour rester affûté sans fatiguer — la séance signature de l'affûtage.",
      whyEn: "Pre-race VO₂: a few sharp reps to stay crisp without fatigue — the signature taper session.",
    },
    {
      dayOfWeek: 3,
      workoutId: "REC-016",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 45,
      why: "Footing régénération en nature : du volume facile pour garder la part « low » dominante malgré l'intensité.",
      whyEn: "Nature regeneration jog: easy volume to keep the easy share dominant despite the intensity.",
    },
    {
      dayOfWeek: 4,
      workoutId: "REC-011",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 22,
      why: "Shakeout court : activation très légère la veille, jambes fraîches et système nerveux réveillé.",
      whyEn: "Short shakeout: a very light pre-day activation, fresh legs and nervous system primed.",
    },
    {
      dayOfWeek: 5,
      workoutId: "LR-014",
      sessionType: "long_run",
      isKeySession: false,
      estimatedDurationMin: 45,
      why: "Sortie longue raccourcie : on garde le geste de la longue mais à dose réduite pour arriver frais.",
      whyEn: "Shortened long run: the long-run feel kept, but trimmed so you arrive fresh.",
    },
  ],
};
