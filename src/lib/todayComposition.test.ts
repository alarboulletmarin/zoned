import { describe, expect, test } from "bun:test";

import {
  EMPTY_COMPOSITION,
  isoMondayOf,
  layerFor,
  mondayOf,
  parseTodayComposition,
  placeWeek,
  pruneComposition,
  removeLayer,
  resolveTodaySources,
  setLayerEnabled,
  sourcePosition,
} from "./todayComposition";
import type { PlanWeek, TrainingPlan } from "@/types/plan";

function plan(over: {
  id: string;
  startDate?: string;
  createdAt?: string;
  totalWeeks?: number;
  isSingleWeek?: boolean;
}): TrainingPlan {
  const totalWeeks = over.totalWeeks ?? 4;
  const weeks: PlanWeek[] = Array.from({ length: totalWeeks }, (_, i) => ({
    weekNumber: i + 1,
    phase: "base",
    isRecoveryWeek: false,
    volumePercent: 100,
    sessions: [],
  }));
  return {
    id: over.id,
    config: {
      id: `cfg-${over.id}`,
      daysPerWeek: 4,
      startDate: over.startDate,
      createdAt: over.createdAt ?? "2026-01-01T10:00:00.000Z",
      isSingleWeek: over.isSingleWeek,
    },
    weeks,
    totalWeeks,
    phases: [{ phase: "base", startWeek: 1, endWeek: totalWeeks }],
    name: over.id,
    nameEn: over.id,
    version: 2,
  };
}

// Lundi 2026-09-07.
const MONDAY = new Date(2026, 8, 7);

describe("le lundi d'une date", () => {
  test("un mercredi remonte à son lundi, un dimanche au lundi d'avant", () => {
    expect(mondayOf(new Date(2026, 8, 9)).getDate()).toBe(7);
    expect(mondayOf(new Date(2026, 8, 13)).getDate()).toBe(7);
    expect(mondayOf(MONDAY).getDate()).toBe(7);
  });

  test("en date seule, et null pour une date illisible", () => {
    expect(isoMondayOf("2026-09-11")).toBe("2026-09-07");
    expect(isoMondayOf("pas une date")).toBeNull();
  });
});

describe("lire la composition", () => {
  test("rien, ou une charge utile cassée, vaut la composition vide", () => {
    expect(parseTodayComposition(null)).toEqual(EMPTY_COMPOSITION);
    expect(parseTodayComposition("{")).toEqual(EMPTY_COMPOSITION);
    expect(parseTodayComposition('{"layers": "non"}')).toEqual(EMPTY_COMPOSITION);
  });

  test("une couche illisible est retirée, pas la composition entière", () => {
    const parsed = parseTodayComposition(
      JSON.stringify({ version: 1, layers: [{ id: "a" }, { nope: true }, { id: "" }, 3] }),
    );
    expect(parsed.layers).toEqual([{ id: "a", enabled: true }]);
  });

  test("un ancrage est ramené à son lundi, un ancrage illisible est oublié", () => {
    const parsed = parseTodayComposition(
      JSON.stringify({
        layers: [
          { id: "a", enabled: false, anchor: "2026-09-10" },
          { id: "b", enabled: true, anchor: "hier" },
        ],
      }),
    );
    expect(parsed.layers).toEqual([
      { id: "a", enabled: false, anchor: "2026-09-07" },
      { id: "b", enabled: true },
    ]);
  });

  test("un id en double ne compte qu'une fois, le premier", () => {
    const parsed = parseTodayComposition(
      JSON.stringify({ layers: [{ id: "a", enabled: false }, { id: "a", enabled: true }] }),
    );
    expect(parsed.layers).toEqual([{ id: "a", enabled: false }]);
  });
});

describe("écrire la composition", () => {
  test("poser une semaine l'allume sur le lundi de la semaine visée", () => {
    const c = placeWeek(EMPTY_COMPOSITION, "w", new Date(2026, 8, 10));
    expect(layerFor(c, "w")).toEqual({ id: "w", enabled: true, anchor: "2026-09-07" });
  });

  test("éteindre garde l'ancrage, rallumer le retrouve", () => {
    let c = placeWeek(EMPTY_COMPOSITION, "w", MONDAY);
    c = setLayerEnabled(c, "w", false);
    expect(layerFor(c, "w")).toEqual({ id: "w", enabled: false, anchor: "2026-09-07" });
    c = setLayerEnabled(c, "w", true);
    expect(layerFor(c, "w")?.anchor).toBe("2026-09-07");
  });

  test("retirer une couche la fait retomber sur la règle de repli", () => {
    const c = removeLayer(placeWeek(EMPTY_COMPOSITION, "w", MONDAY), "w");
    expect(c.layers).toEqual([]);
  });

  test("les couches d'un plan disparu sont retirées, les autres restent", () => {
    const c = setLayerEnabled(placeWeek(EMPTY_COMPOSITION, "w", MONDAY), "gone", false);
    const pruned = pruneComposition(c, [plan({ id: "w", isSingleWeek: true })]);
    expect(pruned.layers.map((l) => l.id)).toEqual(["w"]);
    // Rien à retirer : le même objet, pour ne pas faire recalculer l'écran.
    expect(pruneComposition(pruned, [plan({ id: "w", isSingleWeek: true })])).toBe(pruned);
  });
});

describe("les sources suivies", () => {
  const marathon = plan({ id: "marathon", startDate: "2026-08-31", createdAt: "2026-08-01T10:00:00.000Z" });
  const renfo = plan({
    id: "renfo",
    totalWeeks: 1,
    isSingleWeek: true,
    createdAt: "2026-09-08T08:00:00.000Z",
  });

  test("un plan est suivi sans rien écrire", () => {
    const sources = resolveTodaySources([marathon], EMPTY_COMPOSITION, MONDAY);
    expect(sources.map((s) => s.plan.id)).toEqual(["marathon"]);
    expect(sources[0].isWeek).toBe(false);
    expect(sources[0].explicit).toBe(false);
  });

  test("une semaine sans couche ne s'invite que sans plan en cours", () => {
    expect(
      resolveTodaySources([marathon, renfo], EMPTY_COMPOSITION, MONDAY).map((s) => s.plan.id),
    ).toEqual(["marathon"]);
    expect(resolveTodaySources([renfo], EMPTY_COMPOSITION, MONDAY).map((s) => s.plan.id)).toEqual([
      "renfo",
    ]);
  });

  test("un plan à venir ne compte pas comme en cours : la semaine se montre", () => {
    const later = plan({ id: "later", startDate: "2026-10-05" });
    expect(
      resolveTodaySources([later, renfo], EMPTY_COMPOSITION, MONDAY).map((s) => s.plan.id),
    ).toEqual(["later", "renfo"]);
  });

  test("une semaine sans couche est datée sur sa semaine de création", () => {
    const [source] = resolveTodaySources([renfo], EMPTY_COMPOSITION, MONDAY);
    expect(source.monday.getTime()).toBe(MONDAY.getTime());
    expect(sourcePosition(source, new Date(2026, 8, 11))).toEqual({ weekNumber: 1, dayOfWeek: 4 });
    expect(sourcePosition(source, new Date(2026, 8, 14))).toBeNull();
  });

  test("posée, elle est datée sur son lundi de pose, à côté du plan", () => {
    const composition = placeWeek(EMPTY_COMPOSITION, "renfo", new Date(2026, 8, 16));
    const sources = resolveTodaySources([marathon, renfo], composition, MONDAY);
    expect(sources.map((s) => s.plan.id)).toEqual(["marathon", "renfo"]);
    expect(sources[1].monday.getTime()).toBe(new Date(2026, 8, 14).getTime());
    expect(sources[1].explicit).toBe(true);
  });

  test("éteinte, une source n'est plus suivie, plan ou semaine", () => {
    let composition = setLayerEnabled(EMPTY_COMPOSITION, "marathon", false);
    expect(
      resolveTodaySources([marathon, renfo], composition, MONDAY).map((s) => s.plan.id),
    ).toEqual(["renfo"]);
    composition = setLayerEnabled(composition, "renfo", false);
    expect(resolveTodaySources([marathon, renfo], composition, MONDAY)).toEqual([]);
  });

  test("les plans d'abord, du plus récent au plus ancien, puis les semaines", () => {
    const older = plan({ id: "older", startDate: "2026-09-07", createdAt: "2026-01-01T10:00:00.000Z" });
    const composition = placeWeek(EMPTY_COMPOSITION, "renfo", MONDAY);
    expect(
      resolveTodaySources([renfo, older, marathon], composition, MONDAY).map((s) => s.plan.id),
    ).toEqual(["marathon", "older", "renfo"]);
  });
});
