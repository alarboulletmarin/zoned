import type { PrebuiltPlan } from "../types";

export const plan5kBeginner: PrebuiltPlan = {
  id: "5k-beginner",
  slug: "5k-debutant",
  name: "Objectif 5K debutant",
  nameEn: "5K Beginner Plan",
  description:
    "Plan de 8 semaines pour preparer votre premier 5 km. 3 seances par semaine avec une progression douce vers la ligne d'arrivee.",
  descriptionEn:
    "8-week plan to prepare your first 5K. 3 sessions per week with gentle progression toward the finish line.",
  icon: "Zap",
  difficulty: "beginner",
  raceDistance: "5K",
  sessionsPerWeek: 3,
  totalWeeks: 8,
  phases: [
    { phase: "base", startWeek: 1, endWeek: 3 },
    { phase: "build", startWeek: 4, endWeek: 6 },
    { phase: "peak", startWeek: 7, endWeek: 7 },
    { phase: "taper", startWeek: 8, endWeek: 8 },
  ],
  weeks: [
    // ── Week 1 (base) ──
    {
      weekNumber: 1,
      phase: "base",
      isRecoveryWeek: false,
      volumePercent: 80,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "END-001",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 50,
        },
        {
          dayOfWeek: 3,
          workoutId: "FAR-010",
          sessionType: "fartlek",
          isKeySession: true,
          estimatedDurationMin: 40,
        },
        {
          dayOfWeek: 6,
          workoutId: "SL-008",
          sessionType: "long_run",
          isKeySession: false,
          estimatedDurationMin: 60,
        },
      ],
    },
    // ── Week 2 (base) ──
    {
      weekNumber: 2,
      phase: "base",
      isRecoveryWeek: false,
      volumePercent: 90,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "END-001",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 50,
        },
        {
          dayOfWeek: 3,
          workoutId: "FAR-001",
          sessionType: "fartlek",
          isKeySession: true,
          estimatedDurationMin: 45,
        },
        {
          dayOfWeek: 6,
          workoutId: "END-003",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 60,
        },
      ],
    },
    // ── Week 3 (base) ──
    {
      weekNumber: 3,
      phase: "base",
      isRecoveryWeek: false,
      volumePercent: 100,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "END-001",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 50,
        },
        {
          dayOfWeek: 3,
          workoutId: "FAR-010",
          sessionType: "fartlek",
          isKeySession: true,
          estimatedDurationMin: 40,
        },
        {
          dayOfWeek: 6,
          workoutId: "SL-008",
          sessionType: "long_run",
          isKeySession: false,
          estimatedDurationMin: 70,
        },
      ],
    },
    // ── Week 4 (build, recovery week) ──
    {
      weekNumber: 4,
      phase: "build",
      isRecoveryWeek: true,
      volumePercent: 60,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "REC-001",
          sessionType: "recovery",
          isKeySession: false,
          estimatedDurationMin: 30,
        },
        {
          dayOfWeek: 3,
          workoutId: "FAR-010",
          sessionType: "fartlek",
          isKeySession: false,
          estimatedDurationMin: 35,
        },
        {
          dayOfWeek: 6,
          workoutId: "END-001",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 45,
        },
      ],
    },
    // ── Week 5 (build) ──
    {
      weekNumber: 5,
      phase: "build",
      isRecoveryWeek: false,
      volumePercent: 100,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "END-002",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 55,
        },
        {
          dayOfWeek: 3,
          workoutId: "VMA-007",
          sessionType: "vo2max",
          isKeySession: true,
          estimatedDurationMin: 30,
        },
        {
          dayOfWeek: 6,
          workoutId: "SL-008",
          sessionType: "long_run",
          isKeySession: false,
          estimatedDurationMin: 75,
        },
      ],
    },
    // ── Week 6 (build) ──
    {
      weekNumber: 6,
      phase: "build",
      isRecoveryWeek: false,
      volumePercent: 100,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "END-002",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 55,
        },
        {
          dayOfWeek: 3,
          workoutId: "TMP-017",
          sessionType: "tempo",
          isKeySession: true,
          estimatedDurationMin: 45,
        },
        {
          dayOfWeek: 6,
          workoutId: "SL-008",
          sessionType: "long_run",
          isKeySession: false,
          estimatedDurationMin: 75,
        },
      ],
    },
    // ── Week 7 (peak) ──
    {
      weekNumber: 7,
      phase: "peak",
      isRecoveryWeek: false,
      volumePercent: 90,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "END-001",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 50,
        },
        {
          dayOfWeek: 3,
          workoutId: "RP-017",
          sessionType: "race_specific",
          isKeySession: true,
          estimatedDurationMin: 40,
        },
        {
          dayOfWeek: 6,
          workoutId: "SL-001",
          sessionType: "long_run",
          isKeySession: true,
          estimatedDurationMin: 70,
        },
      ],
    },
    // ── Week 8 (taper) ──
    {
      weekNumber: 8,
      phase: "taper",
      isRecoveryWeek: false,
      volumePercent: 50,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "REC-001",
          sessionType: "recovery",
          isKeySession: false,
          estimatedDurationMin: 30,
        },
        {
          dayOfWeek: 3,
          workoutId: "FAR-010",
          sessionType: "fartlek",
          isKeySession: false,
          estimatedDurationMin: 35,
        },
        {
          dayOfWeek: 6,
          workoutId: "RP-017",
          sessionType: "race_specific",
          isKeySession: true,
          estimatedDurationMin: 35,
        },
      ],
    },
  ],
  tags: ["5k", "debutant", "beginner", "premier-5k"],
};
