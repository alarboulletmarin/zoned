import type { PrebuiltPlan } from "../types";

export const planReturnFromInjury: PrebuiltPlan = {
  id: "return-from-injury",
  slug: "retour-de-blessure",
  name: "Retour apres blessure",
  nameEn: "Return from Injury",
  description:
    "Plan de 6 semaines pour reprendre la course en douceur apres une blessure. 3 seances par semaine avec une progression tres conservative.",
  descriptionEn:
    "6-week plan to gently return to running after an injury. 3 sessions per week with very conservative progression.",
  icon: "Heart",
  difficulty: "beginner",
  sessionsPerWeek: 3,
  totalWeeks: 6,
  phases: [
    { phase: "recovery", startWeek: 1, endWeek: 2 },
    { phase: "base", startWeek: 3, endWeek: 5 },
    { phase: "build", startWeek: 6, endWeek: 6 },
  ],
  weeks: [
    // ── Week 1 (recovery) ──
    {
      weekNumber: 1,
      phase: "recovery",
      isRecoveryWeek: false,
      volumePercent: 40,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "REC-002",
          sessionType: "recovery",
          isKeySession: false,
          estimatedDurationMin: 25,
        },
        {
          dayOfWeek: 3,
          workoutId: "REC-015",
          sessionType: "recovery",
          isKeySession: false,
          estimatedDurationMin: 30,
        },
        {
          dayOfWeek: 6,
          workoutId: "REC-001",
          sessionType: "recovery",
          isKeySession: false,
          estimatedDurationMin: 25,
        },
      ],
    },
    // ── Week 2 (recovery) ──
    {
      weekNumber: 2,
      phase: "recovery",
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
          workoutId: "REC-005",
          sessionType: "recovery",
          isKeySession: false,
          estimatedDurationMin: 30,
        },
        {
          dayOfWeek: 6,
          workoutId: "END-014",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 40,
        },
      ],
    },
    // ── Week 3 (base) ──
    {
      weekNumber: 3,
      phase: "base",
      isRecoveryWeek: false,
      volumePercent: 65,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "END-001",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 40,
        },
        {
          dayOfWeek: 3,
          workoutId: "END-008",
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
    // ── Week 4 (base) ──
    {
      weekNumber: 4,
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
          workoutId: "END-008",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 45,
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
    // ── Week 5 (base) ──
    {
      weekNumber: 5,
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
    // ── Week 6 (build) ──
    {
      weekNumber: 6,
      phase: "build",
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
          estimatedDurationMin: 70,
        },
      ],
    },
  ],
  tags: ["blessure", "injury", "reprise", "return", "debutant", "beginner", "conservative"],
};
