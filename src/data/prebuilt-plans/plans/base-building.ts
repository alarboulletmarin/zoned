import type { PrebuiltPlan } from "../types";

export const planBaseBuilding: PrebuiltPlan = {
  id: "base-building",
  slug: "construction-base",
  name: "Construction de la base aerobique",
  nameEn: "Aerobic Base Building",
  description:
    "Plan de 8 semaines pour construire une base d'endurance solide. 3 seances par semaine, ideal pour debuter ou reprendre la course apres une pause.",
  descriptionEn:
    "8-week plan to build a solid endurance base. 3 sessions per week, ideal for starting out or returning to running after a break.",
  icon: "Activity",
  difficulty: "beginner",
  sessionsPerWeek: 3,
  totalWeeks: 8,
  phases: [
    { phase: "base", startWeek: 1, endWeek: 4 },
    { phase: "build", startWeek: 5, endWeek: 7 },
    { phase: "peak", startWeek: 8, endWeek: 8 },
  ],
  weeks: [
    // ── Week 1 (base) ──
    {
      weekNumber: 1,
      phase: "base",
      isRecoveryWeek: false,
      volumePercent: 75,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "END-001",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 45,
        },
        {
          dayOfWeek: 3,
          workoutId: "END-001",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 45,
        },
        {
          dayOfWeek: 6,
          workoutId: "SL-008",
          sessionType: "long_run",
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
      volumePercent: 85,
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
          workoutId: "END-005",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 50,
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
    // ── Week 3 (base) ──
    {
      weekNumber: 3,
      phase: "base",
      isRecoveryWeek: false,
      volumePercent: 95,
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
          workoutId: "END-002",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 55,
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
          workoutId: "END-001",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 40,
        },
        {
          dayOfWeek: 6,
          workoutId: "END-003",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 50,
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
          workoutId: "SL-003",
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
          workoutId: "VMA-027",
          sessionType: "vo2max",
          isKeySession: true,
          estimatedDurationMin: 35,
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
          workoutId: "END-005",
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
          estimatedDurationMin: 80,
        },
      ],
    },
    // ── Week 8 (peak) ──
    {
      weekNumber: 8,
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
          workoutId: "END-002",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 55,
        },
        {
          dayOfWeek: 6,
          workoutId: "SL-001",
          sessionType: "long_run",
          isKeySession: true,
          estimatedDurationMin: 90,
        },
      ],
    },
  ],
  tags: ["base", "endurance", "debutant", "beginner", "reprise", "fondamentale"],
};
