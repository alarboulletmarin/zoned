import { describe, expect, test } from "bun:test";
import { effortOf, familyOf, intensityOf, isMeasured, rankAlternatives } from "./rankAlternatives";
import type { AnyWorkoutTemplate } from "@/types";

const run = (
  id: string,
  category: string,
  min: number,
  max: number,
  load: string,
  name = id,
  zones: (string | undefined)[] = ["Z2"],
): AnyWorkoutTemplate =>
  ({
    id,
    name,
    nameEn: name,
    category,
    typicalDuration: { min, max },
    selectionCriteria: { relativeLoad: load },
    mainSetTemplate: zones.map((zone) => ({ description: "", zone })),
  }) as unknown as AnyWorkoutTemplate;

const CATALOGUE: AnyWorkoutTemplate[] = [
  run("HIL-012", "hills", 40, 50, "hard", "Sprints en côte explosifs", ["Z6"]),
  run("HIL-006", "hills", 30, 36, "moderate", "Côtes progressives", ["Z4"]),
  run("HIL-008", "hills", 30, 36, "moderate", "Côtes débutant", ["Z4"]),
  run("HIL-017", "hills", 60, 70, "hard", "Côtes longues", ["Z5"]),
  run("TRL-001", "trail", 90, 120, "moderate", "Sortie trail"),
  run("HIL-030", "hills", 40, 50, "light", "Footing vallonné"),
  run("HIL-040", "hills", 40, 50, "light", "Côtes sans zone", [undefined]),
  run("END-004", "endurance", 40, 50, "moderate", "Footing"),
  run("END-005", "endurance", 40, 50, "moderate", "Endurance avec gammes", ["Z2", undefined]),
  run("REC-001", "recovery", 40, 50, "light", "Récupération"),
  run("REC-010", "recovery", 40, 45, "light", "Yoga-running", ["Z1", undefined]),
  run("THR-001", "threshold", 40, 50, "hard", "Seuil", ["Z4"]),
  { id: "STR-001", kind: "strength", name: "Gainage", nameEn: "Core", typicalDuration: { min: 20, max: 30 }, intensity: "mobility" } as unknown as AnyWorkoutTemplate,
  { ...run("CYC-001", "endurance", 40, 60, "light", "Vélo facile"), discipline: "cycling" } as AnyWorkoutTemplate,
];
const byId = (id: string) => CATALOGUE.find((w) => w.id === id)!;
const current = byId("HIL-012");
const session = { workoutId: "HIL-012", estimatedDurationMin: 48 };
const ids = (r: ReturnType<typeof rankAlternatives>) => [r.easier, ...r.list].filter(Boolean).map((x) => x!.workout.id);

describe("familles, efforts, intensité, mesure", () => {
  test("cinq familles", () => {
    expect(familyOf(byId("HIL-012"))).toBe("hills_trail");
    expect(familyOf(byId("TRL-001"))).toBe("hills_trail");
    expect(familyOf(byId("END-004"))).toBe("road");
    expect(familyOf(byId("STR-001"))).toBe("strength");
    expect(familyOf(byId("CYC-001"))).toBe("cycling");
  });
  test("familles d'effort", () => {
    expect(effortOf(byId("END-004"))).toBe("easy");
    expect(effortOf(byId("REC-001"))).toBe("easy");
    expect(effortOf(byId("THR-001"))).toBe("quality");
    expect(effortOf(byId("TRL-001"))).toBe("trail");
  });
  test("l'intensité suit la charge relative, et l'intensité d'un renfo", () => {
    expect(intensityOf(byId("HIL-012"))).toBe(2);
    expect(intensityOf(byId("HIL-006"))).toBe(1);
    expect(intensityOf(byId("HIL-030"))).toBe(0);
    expect(intensityOf(byId("STR-001"))).toBe(0);
  });
  test("une séance dont un effort n'a pas de zone n'est pas mesurée", () => {
    expect(isMeasured(byId("REC-010"))).toBe(false);
    expect(isMeasured(byId("END-005"))).toBe(false);
    expect(isMeasured(byId("REC-001"))).toBe(true);
    expect(isMeasured(byId("STR-001"))).toBe(true);
  });
});

describe("rankAlternatives", () => {
  test("même famille et même effort, la séance elle-même et les séances non mesurées exclues", () => {
    const r = ids(rankAlternatives(session, current, CATALOGUE, { family: "hills_trail" }));
    expect(r.sort()).toEqual(["HIL-006", "HIL-008", "HIL-017", "HIL-030"]);
  });

  test("un footing se remplace par un footing ou une récupération mesurés, jamais par Yoga-running ni un seuil", () => {
    const r = rankAlternatives({ workoutId: "END-005", estimatedDurationMin: 43 }, byId("END-005"), CATALOGUE, { family: "road" });
    expect(ids(r).sort()).toEqual(["END-004", "REC-001"]);
    expect(r.easier?.workout.id).toBe("REC-001");
  });

  test("une autre famille que celle de la séance reste entière", () => {
    const r = rankAlternatives({ workoutId: "END-005", estimatedDurationMin: 43 }, byId("END-005"), CATALOGUE, { family: "hills_trail" });
    expect(ids(r).sort()).toEqual(["HIL-006", "HIL-008", "HIL-012", "HIL-017", "HIL-030", "TRL-001"]);
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
  });

  test("les séances déjà posées dans la semaine ne sont pas proposées", () => {
    const r = ids(rankAlternatives(session, current, CATALOGUE, { family: "hills_trail", excludeIds: ["HIL-030", "HIL-017"] }));
    expect(r).not.toContain("HIL-030");
    expect(r).not.toContain("HIL-017");
  });

  test("une séance déjà facile n'a pas d'alternative plus facile", () => {
    const { easier } = rankAlternatives({ workoutId: "HIL-030", estimatedDurationMin: 45 }, byId("HIL-030"), CATALOGUE, { family: "hills_trail" });
    expect(easier).toBeNull();
  });

  test("filtres : recherche sans accents, intensité, durée, tri par durée", () => {
    const q = rankAlternatives(session, current, CATALOGUE, { family: "hills_trail", query: "cotes deb" });
    expect(q.list.map((r) => r.workout.id)).toEqual(["HIL-008"]);
    expect(q.easier).toBeNull();

    const i = rankAlternatives(session, current, CATALOGUE, { family: "hills_trail", intensity: 1 });
    expect(i.list.map((r) => r.workout.id).sort()).toEqual(["HIL-006", "HIL-008"]);

    const d = rankAlternatives(session, current, CATALOGUE, { family: "hills_trail", duration: "long" });
    expect(ids(d)).toEqual(["HIL-017"]);

    const s = rankAlternatives(session, current, CATALOGUE, { family: "hills_trail", sort: "duration" });
    const all = s.list.map((r) => r.durationMin);
    expect([...all].sort((a, b) => a - b)).toEqual(all);
  });
});
