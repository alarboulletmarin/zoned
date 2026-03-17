// src/data/glossary/categories.ts
// Category metadata for the glossary

import type { GlossaryCategoryInfo } from "./types";

export const categories: GlossaryCategoryInfo[] = [
  {
    id: "metrics",
    label: "Métriques",
    labelEn: "Metrics",
    description: "Acronymes et indicateurs de performance",
    descriptionEn: "Acronyms and performance indicators",
    icon: "Activity",
  },
  {
    id: "periodization",
    label: "Périodisation",
    labelEn: "Periodization",
    description: "Cycles et phases d'entraînement",
    descriptionEn: "Training cycles and phases",
    icon: "Calendar",
  },
  {
    id: "sessions",
    label: "Séances",
    labelEn: "Sessions",
    description: "Types d'entraînement",
    descriptionEn: "Training session types",
    icon: "Zap",
  },
  {
    id: "zones",
    label: "Zones",
    labelEn: "Zones",
    description: "Intensités d'effort",
    descriptionEn: "Effort intensities",
    icon: "Gauge",
  },
  {
    id: "physiology",
    label: "Physiologie",
    labelEn: "Physiology",
    description: "Mécanismes du corps",
    descriptionEn: "Body mechanisms",
    icon: "Heart",
  },
  {
    id: "recovery",
    label: "Récupération",
    labelEn: "Recovery",
    description: "Repos et adaptation",
    descriptionEn: "Rest and adaptation",
    icon: "Moon",
  },
  {
    id: "biomechanics",
    label: "Biomécanique",
    labelEn: "Biomechanics",
    description: "Mécanique de la foulée et posture",
    descriptionEn: "Stride mechanics and posture",
    icon: "Footprints",
  },
  {
    id: "injuries",
    label: "Blessures & Prévention",
    labelEn: "Injuries & Prevention",
    description: "Blessures courantes et comment les éviter",
    descriptionEn: "Common injuries and how to prevent them",
    icon: "ShieldAlert",
  },
  {
    id: "nutrition",
    label: "Nutrition",
    labelEn: "Nutrition",
    description: "Alimentation et hydratation du coureur",
    descriptionEn: "Runner's diet and hydration",
    icon: "Apple",
  },
];
