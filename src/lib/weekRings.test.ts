import { describe, expect, mock, test } from "bun:test";

// `planStats` charge le catalogue, qui atteint l'entrée i18n et son
// `import.meta.glob` de Vite : on la remplace avant de charger le module.
mock.module("@/i18n", () => ({ default: { language: "fr" } }));

const { buildWeekRings, offPlanTss, plannedMinutesOf, qualityShareOf, resolveRingMetric, ringState } =
  await import("./weekRings");
const { runTssFromZone } = await import("./planGenerator/tss");

import type { AnyWorkoutTemplate, WorkoutTemplate } from "@/types";
import type { PlanSession } from "@/types/plan";
import type { ComplementaryActivity } from "@/types/activity";

const RANGE = { from: "2026-11-16", to: "2026-11-22" };
const THURSDAY = new Date("2026-11-19T09:00:00");

type Block = { durationMin?: number; zone?: string; elevationGainM?: number };

// Le moteur de structure lit la description de chaque bloc.
const described = (block: Block) => ({ description: "bloc", descriptionEn: "block", ...block });

function running(
  id: string,
  blocks: { warmup?: Block[]; main: Block[]; cooldown?: Block[] },
  range: [number, number] = [45, 45],
): WorkoutTemplate {
  return {
    id,
    category: "threshold",
    typicalDuration: { min: range[0], max: range[1] },
    warmupTemplate: (blocks.warmup ?? []).map(described),
    mainSetTemplate: blocks.main.map(described),
    cooldownTemplate: (blocks.cooldown ?? []).map(described),
  } as unknown as WorkoutTemplate;
}

const CATALOG: Record<string, AnyWorkoutTemplate> = {
  // 15 min d'échauffement, 30 au seuil, 10 de retour au calme : 55 min.
  "THR-001": running("THR-001", {
    warmup: [{ durationMin: 15, zone: "Z1-Z2" }],
    main: [{ durationMin: 30, zone: "Z4" }],
    cooldown: [{ durationMin: 10, zone: "Z1" }],
  }),
  // Un tempo : 10 min d'échauffement, 20 en Z3, 10 en Z2-Z3, 5 de retour au calme.
  "TMP-001": running("TMP-001", {
    warmup: [{ durationMin: 10, zone: "Z1-Z2" }],
    main: [{ durationMin: 20, zone: "Z3" }, { durationMin: 10, zone: "Z2-Z3" }],
    cooldown: [{ durationMin: 5, zone: "Z1" }],
  }),
  // Un footing souple de 30 à 50 min.
  "END-001": running("END-001", { main: [{ durationMin: 40, zone: "Z2" }] }, [30, 50]),
  // Une sortie de trail, 600 m de D+.
  "TRL-001": running("TRL-001", { main: [{ durationMin: 90, zone: "Z2", elevationGainM: 600 }] }),
  "STR-001": { id: "STR-001", kind: "strength", exercises: [] } as unknown as AnyWorkoutTemplate,
};
const workoutOf = (id: string) => CATALOG[id];

const session = (over: Partial<PlanSession> = {}): PlanSession => ({
  dayOfWeek: 1,
  workoutId: "END-001",
  sessionType: "endurance",
  isKeySession: false,
  estimatedDurationMin: 40,
  status: "planned",
  ...over,
});

const activity = (over: Partial<ComplementaryActivity> = {}): ComplementaryActivity => ({
  id: crypto.randomUUID(),
  date: "2026-11-17",
  discipline: "cycling",
  purpose: "commute",
  durationMin: 30,
  distanceKm: 7,
  createdAt: "2026-11-17T08:00:00.000Z",
  ...over,
});

const build = (
  sessions: PlanSession[],
  extra: Partial<Parameters<typeof buildWeekRings>[0]> = {},
) =>
  buildWeekRings({ sessions, activities: [], range: RANGE, today: THURSDAY, workoutOf, ...extra });

describe("le prévu", () => {
  test("une séance de seuil se répartit bloc par bloc : échauffement en Endurance, blocs en Qualité", () => {
    const rings = build([
      session({ workoutId: "THR-001", sessionType: "threshold", estimatedDurationMin: 55, precision: "fixed" }),
    ])!;
    expect(rings.endurance.target.time).toBeCloseTo(25);
    expect(rings.quality.target.time).toBeCloseTo(30);
    expect(qualityShareOf(session({ workoutId: "THR-001" }), CATALOG["THR-001"], 55)).toBeCloseTo(30 / 55);
  });

  test("le tempo est de la Qualité, comme dans le 80/20 : Z3 compte du côté dur", () => {
    const rings = build([session({ workoutId: "TMP-001", sessionType: "tempo", estimatedDurationMin: 45 })])!;
    // 20 min de Z3, la moitié Z3 de la plage Z2-Z3 ; le reste en Endurance.
    expect(rings.quality.target.time).toBeCloseTo(25);
    expect(rings.endurance.target.time).toBeCloseTo(20);
  });

  test("la répartition suit la durée de la séance, mise à l'échelle", () => {
    const rings = build([
      session({ workoutId: "THR-001", sessionType: "threshold", estimatedDurationMin: 110 }),
    ])!;
    expect(rings.endurance.target.time).toBeCloseTo(50);
    expect(rings.quality.target.time).toBeCloseTo(60);
  });

  test("une séance souple compte pour le milieu de sa fourchette", () => {
    // La durée posée est périmée : c'est la fourchette du gabarit qui compte.
    const loose = session({ precision: "loose", estimatedDurationMin: 33 });
    expect(plannedMinutesOf(loose, CATALOG["END-001"])).toBe(40);
    expect(build([loose])!.endurance.target.time).toBe(40);
    // Fixée, c'est la durée posée.
    const fixed = session({ precision: "fixed", estimatedDurationMin: 33 });
    expect(build([fixed])!.endurance.target.time).toBe(33);
  });

  test("le jour de course n'est pas une séance", () => {
    const rings = build([session(), session({ workoutId: "__race_day__", estimatedDurationMin: 200 })])!;
    expect(rings.total.target.time).toBe(40);
  });

  test("les km et le D+ se répartissent au prorata des minutes", () => {
    const rings = build([
      session({ workoutId: "THR-001", sessionType: "threshold", estimatedDurationMin: 55, targetDistanceKm: 11 }),
    ])!;
    expect(rings.endurance.target.km).toBeCloseTo(5);
    expect(rings.quality.target.km).toBeCloseTo(6);
  });
});

describe("le fait", () => {
  test("une séance non close compte au prévu et pas au fait", () => {
    const rings = build([session({ status: "planned" }), session({ status: "skipped" })])!;
    expect(rings.endurance.target.time).toBe(80);
    expect(rings.endurance.done.time).toBe(0);
  });

  test("une durée réelle remplace la prévue, la répartition garde les proportions prévues", () => {
    const rings = build([
      session({
        workoutId: "THR-001",
        sessionType: "threshold",
        estimatedDurationMin: 55,
        status: "modified",
        actualDurationMin: 66,
        actualDistanceKm: 13.2,
      }),
    ])!;
    expect(rings.quality.done.time).toBeCloseTo(36);
    expect(rings.endurance.done.time).toBeCloseTo(30);
    expect(rings.quality.done.km).toBeCloseTo(13.2 * (30 / 55));
  });
});

describe("les états des anneaux", () => {
  const overDone = (workoutId: string, minutes: number, actual: number) =>
    session({ workoutId, estimatedDurationMin: minutes, status: "completed", actualDurationMin: actual });

  test("un excédent de Qualité déclenche warn, un excédent d'Endurance non", () => {
    const rings = build([overDone("THR-001", 55, 110), overDone("END-001", 40, 60)])!;
    const quality = ringState(rings.quality, "time", rings.reference);
    const endurance = ringState(rings.endurance, "time", rings.reference);
    expect(quality.excess).toBeCloseTo(1);
    expect(quality.progress).toBe(1);
    expect(quality.warn).toBe(true);
    expect(endurance.excess).toBeGreaterThan(0);
    expect(endurance.warn).toBe(false);
    expect(endurance.complete).toBe(true);
  });

  test("l'excédent est borné à 1", () => {
    const rings = build([overDone("END-001", 40, 400)])!;
    expect(ringState(rings.endurance, "time", "plan").excess).toBe(1);
  });

  test("Renfo 2/2 est complete, Qualité à 100 % ne l'est jamais", () => {
    const rings = build([
      session({ workoutId: "STR-001", sessionType: "strength", estimatedDurationMin: 25, status: "completed" }),
      session({ workoutId: "STR-001", sessionType: "strength", estimatedDurationMin: 25, status: "completed" }),
      session({ workoutId: "THR-001", estimatedDurationMin: 55, status: "completed" }),
    ])!;
    const strength = ringState(rings.strength, "time", rings.reference);
    expect(strength.done).toBe(2);
    expect(strength.target).toBe(2);
    expect(strength.complete).toBe(true);
    const quality = ringState(rings.quality, "time", rings.reference);
    expect(quality.ratio).toBeCloseTo(1);
    expect(quality.complete).toBe(false);
    expect(quality.warn).toBe(false);
  });

  test("le Renfo reste en séances quelle que soit la mesure, et entre dans le total en temps seulement", () => {
    const rings = build([
      session({ workoutId: "STR-001", sessionType: "strength", estimatedDurationMin: 25 }),
      session({ estimatedDurationMin: 40, targetDistanceKm: 8 }),
    ])!;
    expect(ringState(rings.strength, "km", rings.reference).target).toBe(1);
    expect(rings.endurance.target.time).toBe(40);
    expect(rings.quality.target.time).toBe(0);
    expect(rings.total.target.time).toBe(65);
    expect(rings.total.target.km).toBe(8);
  });
});

describe("le hors plan", () => {
  test("absent des anneaux, présent dans offPlan avec son motif pour libellé", () => {
    const rings = build([session()], {
      activities: [activity(), activity({ date: "2026-11-18" }), activity({ date: "2026-11-19", distanceKm: 8 })],
    })!;
    expect(rings.endurance.done.time).toBe(0);
    expect(rings.total.done.time).toBe(0);
    expect(rings.offPlan).not.toBeNull();
    expect(rings.offPlan!.count).toBe(3);
    expect(rings.offPlan!.minutes).toBe(90);
    expect(rings.offPlan!.km).toBe(22);
    // Dans l'unité du plan : un vélotaf sans RPE vaut 3, donc Z2, donc le TSS de Z2.
    expect(rings.offPlan!.load).toBe(Math.round(3 * runTssFromZone(30, 2)));
    expect(offPlanTss(activity({ rpe: 7 }))).toBe(runTssFromZone(30, 4));
    expect(rings.offPlan!.purposeKey).toBe("commuteCycling");
  });

  test("deux sports : pas de total de km, deux motifs : pas de libellé commun", () => {
    const rings = build([session()], {
      activities: [activity(), activity({ discipline: "swimming", purpose: "training", distanceKm: 2 })],
    })!;
    expect(rings.offPlan!.km).toBeNull();
    expect(rings.offPlan!.purposeKey).toBeNull();
  });

  test("journal vide, pas de ligne hors plan", () => {
    expect(build([session()])!.offPlan).toBeNull();
  });
});

describe("sans plan", () => {
  const doneWeek = (minutes: number) => [session({ estimatedDurationMin: minutes, status: "completed" })];

  test("la référence est la moyenne du fait des 4 semaines précédentes, sans coche ni alerte", () => {
    const rings = build([], { history: [doneWeek(40), doneWeek(60), doneWeek(80), []] })!;
    expect(rings.reference).toBe("average");
    expect(rings.endurance.target.time).toBe(45);
    const state = ringState({ ...rings.endurance, done: { time: 90, km: 0, dplus: 0 } }, "time", "average");
    expect(state.excess).toBe(0);
    expect(state.complete).toBe(false);
  });

  test("sans historique, null", () => {
    expect(build([])).toBeNull();
    expect(build([], { history: [[], [], [], []] })).toBeNull();
    // Un historique prévu mais jamais fait n'est pas un repère.
    expect(build([], { history: [[session()], [], [], []] })).toBeNull();
  });
});

describe("les mesures", () => {
  test("pas d'onglet D+ quand la semaine n'a pas de dénivelé", () => {
    expect(build([session()])!.metrics).toEqual(["time", "km"]);
  });

  test("une semaine de trail propose D+, et l'ouvre par défaut pour la pratique trail", () => {
    const sessions = [session({ workoutId: "TRL-001", estimatedDurationMin: 90 })];
    const trail = build(sessions, { practice: "trail" })!;
    expect(trail.metrics).toEqual(["time", "km", "dplus"]);
    expect(trail.endurance.target.dplus).toBe(600);
    expect(trail.defaultMetric).toBe("dplus");
    expect(build(sessions, { practice: "road" })!.defaultMetric).toBe("time");
  });

  test("le choix retenu s'applique seulement s'il est proposé cette semaine", () => {
    const road = build([session()])!;
    expect(resolveRingMetric(road, "km")).toBe("km");
    expect(resolveRingMetric(road, "dplus")).toBe("time");
    expect(resolveRingMetric(road, undefined)).toBe("time");
  });

  test("le jour de référence se lit dans la semaine", () => {
    expect(build([session()])!.dayIndex).toBe(3);
  });
});
