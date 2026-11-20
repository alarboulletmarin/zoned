import { describe, expect, test } from "bun:test";
import { familyOf, intensityOf, rankAlternatives } from "./rankAlternatives";
import type { AnyWorkoutTemplate } from "@/types";

const run = (id: string, category: string, min: number, max: number, load: string, name = id): AnyWorkoutTemplate =>
  ({
    id,
    name,
    nameEn: name,
    category,
    typicalDuration: { min, max },
    selectionCriteria: { relativeLoad: load },
  }) as unknown as AnyWorkoutTemplate;

const CATALOGUE: AnyWorkoutTemplate[] = [
  run("HIL-012", "hills", 40, 50, "hard", "Sprints en côte explosifs"),
  run("HIL-006", "hills", 30, 36, "moderate", "Côtes progressives"),
  run("HIL-008", "hills", 30, 36, "moderate", "Côtes débutant"),
  run("HIL-017", "hills", 60, 70, "hard", "Côtes longues"),
  run("TRL-001", "trail", 90, 120, "moderate", "Sortie trail"),
  run("HIL-030", "hills", 40, 50, "light", "Footing vallonné"),
  run("END-004", "endurance", 40, 50, "light", "Footing"),
  { id: "STR-001", kind: "strength", name: "Gainage", nameEn: "Core", typicalDuration: { min: 20, max: 30 }, intensity: "mobility" } as unknown as AnyWorkoutTemplate,
  { ...run("CYC-001", "endurance", 40, 60, "light", "Vélo facile"), discipline: "cycling" } as AnyWorkoutTemplate,
];
const current = CATALOGUE[0];
const session = { workoutId: "HIL-012", estimatedDurationMin: 48 };

describe("familyOf / intensityOf", () => {
  test("cinq familles", () => {
    expect(familyOf(CATALOGUE[0])).toBe("hills_trail");
    expect(familyOf(CATALOGUE[4])).toBe("hills_trail");
    expect(familyOf(CATALOGUE[6])).toBe("road");
    expect(familyOf(CATALOGUE[7])).toBe("strength");
    expect(familyOf(CATALOGUE[8])).toBe("cycling");
  });
  test("l'intensité suit la charge relative, et l'intensité d'un renfo", () => {
    expect(intensityOf(CATALOGUE[0])).toBe(2);
    expect(intensityOf(CATALOGUE[1])).toBe(1);
    expect(intensityOf(CATALOGUE[5])).toBe(0);
    expect(intensityOf(CATALOGUE[7])).toBe(0);
  });
});

describe("rankAlternatives", () => {
  test("même famille, la séance elle-même exclue", () => {
    const { list, easier } = rankAlternatives(session, current, CATALOGUE, { family: "hills_trail" });
    const ids = [easier, ...list].filter(Boolean).map((r) => r!.workout.id);
    expect(ids).not.toContain("HIL-012");
    expect(ids).not.toContain("END-004");
    expect(ids).toHaveLength(5);
  });

  test("l'alternative plus facile : la plus proche en durée parmi les moins intenses", () => {
    const { easier, list } = rankAlternatives(session, current, CATALOGUE, { family: "hills_trail" });
    // HIL-030 (45 min, facile) est plus proche de 48 que HIL-006 (33 min, modérée).
    expect(easier?.workout.id).toBe("HIL-030");
    expect(list.map((r) => r.workout.id)).not.toContain("HIL-030");
  });

  test("ordre : écart de durée puis d'intensité", () => {
    const { list } = rankAlternatives(session, current, CATALOGUE, { family: "hills_trail" });
    expect(list[0].workout.id).toBe("HIL-017");
    expect(list[list.length - 1].workout.id).toBe("TRL-001");
  });

  test("les séances déjà posées dans la semaine ne sont pas proposées", () => {
    const { easier, list } = rankAlternatives(session, current, CATALOGUE, { family: "hills_trail", excludeIds: ["HIL-030", "HIL-017"] });
    const ids = [easier, ...list].filter(Boolean).map((r) => r!.workout.id);
    expect(ids).not.toContain("HIL-030");
    expect(ids).not.toContain("HIL-017");
  });

  test("une séance déjà facile n'a pas d'alternative plus facile", () => {
    const { easier } = rankAlternatives({ workoutId: "HIL-030", estimatedDurationMin: 45 }, CATALOGUE[5], CATALOGUE, { family: "hills_trail" });
    expect(easier).toBeNull();
  });

  test("filtres : recherche sans accents, intensité, durée, tri par durée", () => {
    const q = rankAlternatives(session, current, CATALOGUE, { family: "hills_trail", query: "cotes deb" });
    expect(q.list.map((r) => r.workout.id)).toEqual(["HIL-008"]);
    expect(q.easier).toBeNull();

    const i = rankAlternatives(session, current, CATALOGUE, { family: "hills_trail", intensity: 1 });
    expect(i.list.map((r) => r.workout.id).sort()).toEqual(["HIL-006", "HIL-008", "TRL-001"]);

    const d = rankAlternatives(session, current, CATALOGUE, { family: "hills_trail", duration: "long" });
    expect(d.list.map((r) => r.workout.id)).toEqual(["HIL-017"]);
    expect(d.easier?.workout.id).toBe("TRL-001");

    const s = rankAlternatives(session, current, CATALOGUE, { family: "hills_trail", sort: "duration" });
    const all = s.list.map((r) => r.durationMin);
    expect([...all].sort((a, b) => a - b)).toEqual(all);
  });
});
