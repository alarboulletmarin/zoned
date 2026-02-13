// src/data/collections/data.ts
// Curated workout collections with REAL workout IDs

import type { Collection } from "./types";

export const collections: Collection[] = [
  // ── Beginner & Lifestyle ──────────────────────────────────
  {
    id: "debuter-le-running",
    slug: "debuter-le-running",
    name: "Débuter le running",
    nameEn: "Getting Started with Running",
    description:
      "Un parcours progressif pour passer de zéro à coureur régulier en toute sécurité.",
    descriptionEn:
      "A progressive path from zero to regular runner, safely and sustainably",
    icon: "Footprints",
    gradient: "from-green-500 to-emerald-600",
    difficulty: "beginner",
    isProgression: true,
    workoutIds: [
      "REC-002", // Recup marche-course (walk-run intro)
      "REC-001", // Footing recuperation (easy jog)
      "END-001", // Endurance fondamentale
      "END-007", // Endurance en groupe
      "END-003", // Endurance longue debutant
      "FAR-001", // Fartlek libre (playful speed intro)
      "END-008", // Endurance regeneratrice
      "VMA-027", // Lignes droites (gentle speed strides)
      "TMP-002", // Tempo court (first tempo taste)
      "SL-008", // Sortie longue debutant
    ],
    tags: [
      "debutant",
      "beginner",
      "progression",
      "marche",
      "walk",
      "premier-pas",
    ],
  },
  {
    id: "anti-stress",
    slug: "anti-stress",
    name: "Running anti-stress",
    nameEn: "Stress-Relief Running",
    description:
      "Des séances douces et ressourçantes pour décompresser et retrouver l'équilibre.",
    descriptionEn:
      "Gentle, restorative sessions to decompress and find balance",
    icon: "Leaf",
    gradient: "from-teal-400 to-cyan-500",
    isProgression: false,
    workoutIds: [
      "REC-004", // Recuperation nature
      "REC-010", // Yoga-running
      "REC-005", // Regeneration active
      "END-001", // Endurance fondamentale
      "END-008", // Endurance regeneratrice
      "FAR-001", // Fartlek libre
      "FAR-005", // Fartlek nature
      "END-009", // Endurance trail
    ],
    tags: [
      "bien-etre",
      "wellness",
      "zen",
      "detente",
      "relaxation",
      "nature",
    ],
  },
  {
    id: "retour-de-blessure",
    slug: "retour-de-blessure",
    name: "Retour de blessure",
    nameEn: "Comeback from Injury",
    description:
      "Un protocole prudent et progressif pour reprendre la course après une blessure.",
    descriptionEn:
      "A careful, progressive protocol to resume running after an injury",
    icon: "Shield",
    gradient: "from-amber-400 to-orange-500",
    difficulty: "beginner",
    isProgression: true,
    workoutIds: [
      "REC-002", // Recup marche-course
      "REC-001", // Footing recuperation
      "REC-005", // Regeneration active
      "END-008", // Endurance regeneratrice
      "END-001", // Endurance fondamentale
      "END-003", // Endurance longue debutant
      "FAR-001", // Fartlek libre
      "VMA-027", // Lignes droites
    ],
    tags: [
      "blessure",
      "injury",
      "retour",
      "comeback",
      "prudent",
      "rehab",
      "reprise",
    ],
  },
  {
    id: "post-course",
    slug: "post-course",
    name: "Récupération post-course",
    nameEn: "Post-Race Recovery",
    description:
      "Le protocole idéal pour récupérer après une compétition et relancer l'entraînement.",
    descriptionEn:
      "The ideal protocol to recover after a race and restart training",
    icon: "RefreshCw",
    gradient: "from-sky-400 to-blue-500",
    isProgression: true,
    workoutIds: [
      "REC-003", // Decrassage post-course
      "REC-001", // Footing recuperation
      "REC-005", // Regeneration active
      "REC-009", // Regeneration longue
      "END-008", // Endurance regeneratrice
      "END-001", // Endurance fondamentale
    ],
    tags: [
      "recuperation",
      "recovery",
      "post-race",
      "competition",
      "decrassage",
    ],
  },
  {
    id: "pre-course",
    slug: "pre-course",
    name: "Préparation pré-course",
    nameEn: "Pre-Race Preparation",
    description:
      "Affûtage et activation pour arriver au top le jour J, de J-14 à la veille.",
    descriptionEn:
      "Tapering and activation to arrive at peak form on race day, from D-14 to the eve",
    icon: "Flag",
    gradient: "from-violet-500 to-purple-600",
    isProgression: true,
    workoutIds: [
      "END-001",  // Endurance fondamentale (volume reduction)
      "THR-015",  // Seuil pre-race
      "VMA-020",  // VMA pre-race
      "TMP-015",  // Tempo pre-race
      "FAR-008",  // Fartlek pre-course
      "MIX-010",  // Seance pre-competition
      "REC-007",  // Recup pre-competition
      "RP-008",   // Allure pre-course
      "SL-012",   // Sortie longue pre-competition
      "RP-016",   // Echauffement simulation course
    ],
    tags: [
      "affutage",
      "tapering",
      "pre-race",
      "competition",
      "activation",
      "jour-j",
    ],
  },

  // ── Iconic Workouts ───────────────────────────────────────
  {
    id: "seances-mythiques",
    slug: "seances-mythiques",
    name: "Séances mythiques",
    nameEn: "Legendary Workouts",
    description:
      "Les séances de référence utilisées par les meilleurs coureurs du monde.",
    descriptionEn:
      "The benchmark sessions used by the world's best runners",
    icon: "Star",
    gradient: "from-yellow-400 to-amber-500",
    isProgression: false,
    workoutIds: [
      "VMA-021",  // Billat 30/30
      "RP-009",   // Yasso 800s
      "FAR-009",  // Moneghetti Fartlek
      "TMP-013",  // Tempo Kenyan
      "HIL-005",  // Cotes Kenyan
      "THR-016",  // Double seuil norvegien
      "VMA-028",  // 6x1km australien
      "MIX-011",  // 10-20-30 Bangsbo classique
      "RP-010",   // Rosario 800s
      "VMA-022",  // Speed Endurance
    ],
    tags: [
      "mythique",
      "legendary",
      "classique",
      "classic",
      "elite",
      "reference",
      "billat",
      "yasso",
      "kenyan",
    ],
  },

  // ── Race Goals ────────────────────────────────────────────
  {
    id: "objectif-5k",
    slug: "objectif-5k",
    name: "Objectif 5K",
    nameEn: "5K Goal",
    description:
      "Développez votre VMA et votre vitesse pour exploser votre chrono sur 5 km.",
    descriptionEn:
      "Develop your VO2max speed and pace to smash your 5K personal best",
    icon: "Target",
    gradient: "from-red-500 to-rose-600",
    difficulty: "intermediate",
    isProgression: true,
    workoutIds: [
      "VMA-001",  // 30/30 classique
      "VMA-002",  // 400m piste
      "TMP-001",  // Tempo classique
      "VMA-006",  // 1min/1min
      "THR-002",  // Seuil fractionne
      "VMA-018",  // VMA specifique 5K
      "RP-004",   // Allure 5K
      "RP-015",   // 6km confiance 10K (builds 5K speed endurance)
    ],
    tags: ["5k", "5km", "vitesse", "speed", "vma", "chrono", "pb"],
  },
  {
    id: "objectif-10k",
    slug: "objectif-10k",
    name: "Objectif 10K",
    nameEn: "10K Goal",
    description:
      "Travaillez le seuil et le tempo pour tenir l'allure sur 10 kilomètres.",
    descriptionEn:
      "Work on threshold and tempo to sustain your pace over 10 kilometers",
    icon: "Target",
    gradient: "from-orange-500 to-red-500",
    difficulty: "intermediate",
    isProgression: true,
    workoutIds: [
      "TMP-001",  // Tempo classique
      "THR-002",  // Seuil fractionne
      "THR-010",  // Seuil 10K pace
      "VMA-001",  // 30/30 classique
      "TMP-005",  // Tempo progressif
      "RP-002",   // Allure 10K
      "RP-012",   // Spe 10km pyramide
      "RP-015",   // 6km confiance 10K
    ],
    tags: ["10k", "10km", "seuil", "threshold", "tempo", "chrono", "pb"],
  },
  {
    id: "objectif-semi",
    slug: "objectif-semi",
    name: "Objectif semi-marathon",
    nameEn: "Half-Marathon Goal",
    description:
      "Combinez endurance, seuil et allure spécifique pour réussir votre semi.",
    descriptionEn:
      "Combine endurance, threshold and race pace to nail your half-marathon",
    icon: "Target",
    gradient: "from-blue-500 to-indigo-600",
    difficulty: "advanced",
    isProgression: true,
    workoutIds: [
      "END-002",  // Endurance progressive
      "SL-001",   // Sortie longue progressive
      "TMP-009",  // Tempo semi-marathon
      "THR-002",  // Seuil fractionne
      "TMP-005",  // Tempo progressif
      "RP-003",   // Allure semi-marathon
      "SL-004",   // Sortie longue semi-marathon
      "THR-004",  // Seuil 2x15min
      "RP-014",   // Semi-10K combine
      "SL-007",   // Sortie longue avec finish tempo
    ],
    tags: [
      "semi",
      "half-marathon",
      "21k",
      "endurance",
      "seuil",
      "allure",
      "chrono",
    ],
  },
  {
    id: "objectif-marathon",
    slug: "objectif-marathon",
    name: "Objectif marathon",
    nameEn: "Marathon Goal",
    description:
      "Préparez-vous à courir 42 km avec des sorties longues, du tempo et de l'allure spécifique.",
    descriptionEn:
      "Prepare to run 42K with long runs, tempo work and race-specific pace",
    icon: "Route",
    gradient: "from-indigo-500 to-purple-600",
    difficulty: "advanced",
    isProgression: true,
    workoutIds: [
      "END-011",  // Endurance fondamentale longue
      "SL-001",   // Sortie longue progressive
      "TMP-008",  // Tempo marathon
      "RP-001",   // Allure marathon
      "SL-005",   // Sortie longue vallonnee
      "SL-002",   // Sortie longue allure specifique
      "RP-007",   // Allure marathon longue
      "RP-011",   // Cutdown marathon
      "SL-010",   // Sortie longue simulation course
      "RP-013",   // Multi-allures progressif
    ],
    tags: [
      "marathon",
      "42k",
      "sortie-longue",
      "long-run",
      "endurance",
      "allure",
    ],
  },
  {
    id: "objectif-ultra",
    slug: "objectif-ultra",
    name: "Objectif ultra-trail",
    nameEn: "Ultra-Trail Goal",
    description:
      "Construisez l'endurance extrême et la résistance nécessaires pour l'ultra-distance.",
    descriptionEn:
      "Build the extreme endurance and resilience needed for ultra-distance",
    icon: "Mountain",
    gradient: "from-emerald-600 to-teal-700",
    difficulty: "elite",
    isProgression: true,
    workoutIds: [
      "END-011",  // Endurance fondamentale longue
      "SL-003",   // Sortie longue endurance pure
      "SL-006",   // Sortie longue trail
      "SL-005",   // Sortie longue vallonnee
      "END-009",  // Endurance trail
      "HIL-003",  // Cotes longues
      "HIL-010",  // Cotes pre-trail
      "SL-009",   // Sortie longue a jeun
      "SL-011",   // Back-to-back jour 2
      "RP-005",   // Allure trail
    ],
    tags: [
      "ultra",
      "trail",
      "endurance",
      "montagne",
      "mountain",
      "distance",
      "deni",
    ],
  },

  // ── Speed Development ─────────────────────────────────────
  {
    id: "progresser-vma",
    slug: "progresser-vma",
    name: "Progresser en VMA",
    nameEn: "Improve Your VO2max Speed",
    description:
      "Un programme progressif pour développer votre vitesse maximale aérobie.",
    descriptionEn:
      "A progressive program to develop your maximal aerobic speed",
    icon: "Rocket",
    gradient: "from-pink-500 to-rose-600",
    difficulty: "intermediate",
    isProgression: true,
    workoutIds: [
      "VMA-027",  // Lignes droites (strides warm-up)
      "VMA-007",  // VMA courte debutant
      "VMA-012",  // 20/20
      "VMA-001",  // 30/30 classique
      "VMA-006",  // 1min/1min
      "VMA-010",  // 500m repetes
      "VMA-008",  // VMA pyramide
      "VMA-013",  // VMA 2min
      "VMA-003",  // 1000m VMA
      "VMA-009",  // VMA longue 3min
    ],
    tags: [
      "vma",
      "vo2max",
      "vitesse",
      "speed",
      "intervalles",
      "intervals",
      "progression",
    ],
  },
];
