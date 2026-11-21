import { describe, expect, test } from "bun:test";
import { createFreePlan } from "@/lib/createFreePlan";
import type { PlanSession } from "@/types/plan";
import { calculateTrainingPaces, formatPaceRange } from "./paceEngine";
import { applyPlanVma } from "./sessionBuilder";

describe("applyPlanVma", () => {
  test("updates upcoming running prescriptions and preserves completed, past and cycling sessions", () => {
    const plan = createFreePlan("Test", 2, "2026-11-16");
    plan.config.planMode = "assisted";
    const running: PlanSession = {
      dayOfWeek: 0,
      workoutId: "END-001",
      sessionType: "endurance",
      isKeySession: false,
      estimatedDurationMin: 40,
      notes: "Allure seuil : 4:30 - 5:00/km\n2 répétitions",
      notesEn: "Threshold pace: 4:30 - 5:00/km\n2 repetitions",
      paceNotes: [{ zone: "Z4", paceMinKm: 4.5, paceMaxKm: 5, description: "Allure seuil", descriptionEn: "Threshold pace" }],
    };
    const past = { ...running, dayOfWeek: 1 };
    const planned = { ...running, dayOfWeek: 3, locked: true };
    const completed = { ...running, dayOfWeek: 4, status: "completed" as const, actualDurationMin: 32, userNote: "Done" };
    const cycling = { ...running, dayOfWeek: 5, workoutId: "CYC-001" };
    plan.weeks[0].sessions = [past, planned, completed, cycling];

    const updated = applyPlanVma(plan, 17.5, "2026-11-19");
    const sessions = updated.weeks[0].sessions;
    const threshold = calculateTrainingPaces(17.5, plan.config.runnerLevel).T;
    expect(updated.config.vma).toBe(17.5);
    expect(plan.config.vma).toBeUndefined();
    expect(sessions[0]).toEqual(past);
    expect(sessions[1]).toMatchObject({
      workoutId: planned.workoutId,
      dayOfWeek: planned.dayOfWeek,
      locked: true,
      estimatedDurationMin: 40,
      notes: `Allure seuil : ${formatPaceRange(threshold)}/km\n2 répétitions`,
      notesEn: `Threshold pace: ${formatPaceRange(threshold)}/km\n2 repetitions`,
      paceNotes: [{ zone: "Z4", paceMinKm: threshold.min, paceMaxKm: threshold.max }],
    });
    expect(sessions[2]).toEqual(completed);
    expect(sessions[3]).toEqual(cycling);
  });

  test("adds a prescription to an unscheduled session and preserves a manual instruction", () => {
    const plan = createFreePlan("Test", 1);
    const instruction = "Allure seuil : selon le terrain";
    plan.weeks[0].sessions = [{
      dayOfWeek: 2,
      workoutId: "END-003",
      sessionType: "endurance",
      isKeySession: false,
      estimatedDurationMin: 45,
      notes: instruction,
    }];

    const updated = applyPlanVma(plan, 17.5, "2026-11-19");
    const session = updated.weeks[0].sessions[0];
    const easy = formatPaceRange(calculateTrainingPaces(17.5, plan.config.runnerLevel).E);
    expect(session.notes).toBe(`Allure endurance : ${easy}/km\n${instruction}`);
    expect(session.notesEn).toBe(`Easy pace: ${easy}/km`);
  });
});
