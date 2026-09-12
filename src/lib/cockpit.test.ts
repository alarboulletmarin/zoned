import { describe, expect, test } from "bun:test";

import { focusHref, pickTodayFocus } from "./cockpit";
import type { PlanSession, PlanWeek, TrainingPlan } from "@/types/plan";

function session(dayOfWeek: number, workoutId = "W-1"): PlanSession {
  return {
    dayOfWeek,
    workoutId,
    sessionType: "endurance",
    isKeySession: false,
    estimatedDurationMin: 45,
  };
}

function week(weekNumber: number, sessions: PlanSession[]): PlanWeek {
  return { weekNumber, phase: "base", isRecoveryWeek: false, volumePercent: 100, sessions };
}

/** Un plan qui démarre le lundi donné. `startDate` porte le calage. */
function plan(over: {
  id: string;
  startDate: string;
  totalWeeks?: number;
  weeks?: PlanWeek[];
  isSingleWeek?: boolean;
  createdAt?: string;
}): TrainingPlan {
  const totalWeeks = over.totalWeeks ?? 4;
  return {
    id: over.id,
    config: {
      id: `cfg-${over.id}`,
      daysPerWeek: 4,
      startDate: over.startDate,
      createdAt: over.createdAt ?? "2026-01-01T10:00:00.000Z",
      isSingleWeek: over.isSingleWeek,
    },
    weeks: over.weeks ?? [week(1, [session(0)])],
    totalWeeks,
    phases: [{ phase: "base", startWeek: 1, endWeek: totalWeeks }],
    name: over.id,
    nameEn: over.id,
    version: 2,
  };
}

// Lundi 2026-09-07, mercredi 2026-09-09, lundi suivant 2026-09-14.
const MONDAY = new Date(2026, 8, 7);
const WEDNESDAY = new Date(2026, 8, 9);

describe("pickTodayFocus", () => {
  test("sans aucun plan, il n'y a rien à reprendre", () => {
    const focus = pickTodayFocus([], MONDAY);
    expect(focus.state).toBe("none");
    expect(focus.plan).toBeNull();
    expect(focusHref(focus)).toBeNull();
  });

  test("rend la séance du jour", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      weeks: [week(1, [session(0, "LUNDI"), session(2, "MERCREDI")])],
    });
    const focus = pickTodayFocus([p], MONDAY);
    expect(focus.state).toBe("session");
    expect(focus.weekNumber).toBe(1);
    expect(focus.dayOfWeek).toBe(0);
    expect(focus.sessions.map((s) => s.workoutId)).toEqual(["LUNDI"]);
  });

  test("le bon jour de la semaine, pas le premier trouvé", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      weeks: [week(1, [session(0, "LUNDI"), session(2, "MERCREDI")])],
    });
    expect(pickTodayFocus([p], WEDNESDAY).sessions.map((s) => s.workoutId)).toEqual([
      "MERCREDI",
    ]);
  });

  test("un jour sans séance est du repos, pas un trou", () => {
    const p = plan({ id: "p1", startDate: "2026-09-07", weeks: [week(1, [session(2)])] });
    const focus = pickTodayFocus([p], MONDAY);
    expect(focus.state).toBe("rest");
    expect(focus.sessions).toEqual([]);
    // On sait quand même où on en est : c'est ce qui distingue repos et vide.
    expect(focus.plan?.id).toBe("p1");
    expect(focus.weekNumber).toBe(1);
  });

  test("rend plusieurs séances quand la journée en porte deux", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      weeks: [week(1, [session(0, "MATIN"), session(0, "SOIR")])],
    });
    expect(pickTodayFocus([p], MONDAY).sessions).toHaveLength(2);
  });

  test("trouve la bonne semaine, pas seulement la première", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      totalWeeks: 3,
      weeks: [week(1, [session(0, "S1")]), week(2, [session(0, "S2")])],
    });
    // Lundi de la semaine 2.
    const focus = pickTodayFocus([p], new Date(2026, 8, 14));
    expect(focus.weekNumber).toBe(2);
    expect(focus.sessions.map((s) => s.workoutId)).toEqual(["S2"]);
  });

  test("un plan terminé ne se reprend plus", () => {
    const p = plan({ id: "fini", startDate: "2026-01-05", totalWeeks: 2 });
    expect(pickTodayFocus([p], MONDAY).state).toBe("none");
  });

  test("un plan qui n'a pas commencé s'annonce, avec ses jours restants", () => {
    const p = plan({ id: "futur", startDate: "2026-09-14" });
    const focus = pickTodayFocus([p], MONDAY);
    expect(focus.state).toBe("upcoming");
    expect(focus.plan?.id).toBe("futur");
    expect(focus.daysUntilStart).toBe(7);
  });

  test("un plan en cours passe devant un plan à venir", () => {
    const now = plan({ id: "encours", startDate: "2026-09-07" });
    const later = plan({ id: "futur", startDate: "2026-09-14" });
    expect(pickTodayFocus([later, now], MONDAY).plan?.id).toBe("encours");
  });

  test("entre deux plans en cours, le plus récemment créé gagne", () => {
    const older = plan({
      id: "ancien",
      startDate: "2026-09-07",
      createdAt: "2026-01-01T10:00:00.000Z",
    });
    const newer = plan({
      id: "recent",
      startDate: "2026-09-07",
      createdAt: "2026-06-01T10:00:00.000Z",
    });
    expect(pickTodayFocus([older, newer], MONDAY).plan?.id).toBe("recent");
    // Et l'ordre d'entrée ne change rien.
    expect(pickTodayFocus([newer, older], MONDAY).plan?.id).toBe("recent");
  });

  test("entre deux plans à venir, le plus proche de commencer gagne", () => {
    const soon = plan({ id: "bientot", startDate: "2026-09-14" });
    const far = plan({ id: "loin", startDate: "2026-10-19" });
    expect(pickTodayFocus([far, soon], MONDAY).plan?.id).toBe("bientot");
  });

  test("une date de création illisible ne fait pas tomber le tri", () => {
    const broken = plan({ id: "casse", startDate: "2026-09-07", createdAt: "pas une date" });
    const fine = plan({
      id: "bon",
      startDate: "2026-09-07",
      createdAt: "2026-06-01T10:00:00.000Z",
    });
    expect(pickTodayFocus([broken, fine], MONDAY).plan?.id).toBe("bon");
  });
});

describe("une semaine seule", () => {
  test("se reprend comme une semaine, et pointe /weeks", () => {
    const w = plan({
      id: "w1",
      startDate: "2026-09-07",
      totalWeeks: 1,
      isSingleWeek: true,
    });
    const focus = pickTodayFocus([w], MONDAY);
    expect(focus.isWeek).toBe(true);
    expect(focusHref(focus)).toBe("/weeks/w1");
  });

  test("un plan pointe /plan", () => {
    const p = plan({ id: "p1", startDate: "2026-09-07" });
    const focus = pickTodayFocus([p], MONDAY);
    expect(focus.isWeek).toBe(false);
    expect(focusHref(focus)).toBe("/plan/p1");
  });
});
