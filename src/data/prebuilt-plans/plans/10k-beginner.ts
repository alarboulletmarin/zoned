import type { PrebuiltPlan } from "../types";

export const plan10kBeginner: PrebuiltPlan = {
  id: "10k-beginner",
  slug: "10k-debutant",
  name: "Objectif 10K debutant",
  nameEn: "10K Beginner Plan",
  description:
    "Plan de 10 semaines pour preparer votre premier 10 km. 3 seances par semaine avec une construction progressive de l'endurance.",
  descriptionEn:
    "10-week plan to prepare your first 10K. 3 sessions per week with progressive endurance building.",
  icon: "Timer",
  difficulty: "beginner",
  raceDistance: "10K",
  sessionsPerWeek: 3,
  totalWeeks: 10,
  phases: [
    { phase: "base", startWeek: 1, endWeek: 4 },
    { phase: "build", startWeek: 5, endWeek: 7 },
    { phase: "peak", startWeek: 8, endWeek: 9 },
    { phase: "taper", startWeek: 10, endWeek: 10 },
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
          workoutId: "END-003",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 55,
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
          estimatedDurationMin: 65,
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
          workoutId: "FAR-001",
          sessionType: "fartlek",
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
    // ── Week 4 (base, recovery) ──
    {
      weekNumber: 4,
      phase: "base",
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
          estimatedDurationMin: 80,
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
          workoutId: "SL-003",
          sessionType: "long_run",
          isKeySession: false,
          estimatedDurationMin: 85,
        },
      ],
    },
    // ── Week 7 (build) ──
    {
      weekNumber: 7,
      phase: "build",
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
          workoutId: "TMP-001",
          sessionType: "tempo",
          isKeySession: true,
          estimatedDurationMin: 55,
        },
        {
          dayOfWeek: 6,
          workoutId: "SL-008",
          sessionType: "long_run",
          isKeySession: false,
          estimatedDurationMin: 85,
        },
      ],
    },
    // ── Week 8 (peak, recovery) ──
    {
      weekNumber: 8,
      phase: "peak",
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
    // ── Week 9 (peak) ──
    {
      weekNumber: 9,
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
          workoutId: "RP-018",
          sessionType: "race_specific",
          isKeySession: true,
          estimatedDurationMin: 45,
        },
        {
          dayOfWeek: 6,
          workoutId: "SL-001",
          sessionType: "long_run",
          isKeySession: true,
          estimatedDurationMin: 80,
        },
      ],
    },
    // ── Week 10 (taper) ──
    {
      weekNumber: 10,
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
          workoutId: "RP-018",
          sessionType: "race_specific",
          isKeySession: true,
          estimatedDurationMin: 40,
        },
        {
          dayOfWeek: 6,
          workoutId: "REC-007",
          sessionType: "recovery",
          isKeySession: false,
          estimatedDurationMin: 25,
        },
      ],
    },
  ],
  tags: ["10k", "debutant", "beginner", "premier-10k"],
};
