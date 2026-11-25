import { describe, expect, mock, test } from "bun:test";
import type { AnyWorkoutTemplate, WorkoutTemplate } from "@/types";
import type { StrengthWorkoutTemplate } from "@/types/strength";
import type { FilterContext, WorkoutFiltersState } from "./libraryFilters";

// La durée passe par transforms.ts, qui lit la langue : i18n reste hors du test.
mock.module("@/i18n", () => ({ default: { language: "fr" } }));

const {
  DURATION_OPEN,
  bucketOfRange,
  countActiveFilters,
  defaultFilters,
  familyIndex,
  filterWorkouts,
  isLibraryAtRest,
  measureWorkout,
  parseLibraryParams,
  rangeOfBucket,
  serializeLibraryParams,
  sortWorkouts,
  toggleTerrain,
} = await import("./libraryFilters");

/* Des séances fabriquées, une par cas que les filtres doivent départager.
   Les identifiants sont uniques au fichier : `practicesOfWorkout` mémorise
   par identifiant. */

interface RunSpec {
  id: string;
  category: WorkoutTemplate["category"];
  difficulty: WorkoutTemplate["difficulty"];
  /** [minutes, zone], le corps de séance. */
  blocks: [number, string][];
  track?: boolean;
  hills?: boolean;
  climbM?: number;
  trail?: boolean;
  discipline?: WorkoutTemplate["discipline"];
  name?: string;
}

function run(spec: RunSpec): WorkoutTemplate {
  const terrainType = spec.trail ? "trail_runnable" : "road";
  return {
    id: spec.id,
    name: spec.name ?? spec.id,
    nameEn: spec.name ?? spec.id,
    description: "",
    descriptionEn: "",
    category: spec.category,
    difficulty: spec.difficulty,
    discipline: spec.discipline,
    environment: { requiresTrack: spec.track ?? false, requiresHills: spec.hills ?? false },
    selectionCriteria: { tags: [] },
    warmupTemplate: [],
    cooldownTemplate: [],
    mainSetTemplate: spec.blocks.map(([min, zone], i) => ({
      description: "bloc",
      descriptionEn: "block",
      durationMin: min,
      zone,
      terrainType,
      ...(i === 0 && spec.climbM ? { elevationGainM: spec.climbM } : {}),
    })),
    mainSetStructure: spec.blocks.map(([min, zone], i) => ({
      kind: "segment" as const,
      description: "bloc",
      descriptionEn: "block",
      durationSec: min * 60,
      zone,
      role: "effort" as const,
      terrainType,
      ...(i === 0 && spec.climbM ? { elevationGainM: spec.climbM } : {}),
    })),
  } as unknown as WorkoutTemplate;
}

const easy = run({ id: "LIBT-END", category: "endurance", difficulty: "beginner", blocks: [[25, "Z2"]], name: "Footing facile" });
const threshold = run({ id: "LIBT-THR", category: "threshold", difficulty: "intermediate", blocks: [[33, "Z2"], [30, "Z4"]], track: true });
const hills = run({ id: "LIBT-HIL", category: "hills", difficulty: "advanced", blocks: [[40, "Z2"], [10, "Z5"]], hills: true, name: "Côtes courtes" });
const trail = run({ id: "LIBT-TRL", category: "trail", difficulty: "elite", blocks: [[100, "Z3"]], climbM: 400, trail: true });
const cycling = run({ id: "LIBT-CYC", category: "endurance", difficulty: "beginner", blocks: [[45, "Z2"]], discipline: "cycling" });
const strength = {
  id: "LIBT-STR",
  kind: "strength",
  name: "Gainage",
  nameEn: "Core",
  description: "",
  descriptionEn: "",
  category: "runner_core",
  difficulty: "beginner",
  typicalDuration: { min: 30, max: 40 },
  equipment: ["none"],
  primaryMuscleGroups: ["core_anterior"],
  intensity: "moderate",
} as unknown as StrengthWorkoutTemplate;

const ALL: AnyWorkoutTemplate[] = [trail, strength, hills, cycling, threshold, easy];
const ctx: FilterContext = { favorites: [], practice: null, activityType: "all" };

const ids = (list: AnyWorkoutTemplate[]) => list.map((w) => w.id).sort();
const only = (patch: Partial<WorkoutFiltersState>, c: FilterContext = ctx) =>
  ids(filterWorkouts(ALL, { ...defaultFilters, ...patch }, c));

describe("les mesures", () => {
  test("la durée est celle de la page séance, le renfo prend le milieu de sa fourchette", () => {
    expect(measureWorkout(threshold).duration).toBe(63);
    expect(measureWorkout(strength).duration).toBe(35);
  });
  test("le pic est getPeakZone, le renfo n'en a pas", () => {
    expect(measureWorkout(hills).peak).toBe(5);
    expect(measureWorkout(strength).peak).toBeNull();
  });
  test("le D+ vient de computeTrailMetrics", () => {
    expect(measureWorkout(trail).climbM).toBe(400);
    expect(measureWorkout(easy).climbM).toBe(0);
  });
});

describe("filterWorkouts, chaque filtre seul", () => {
  test("sans filtre, tout passe", () => {
    expect(only({})).toEqual(ids(ALL));
  });

  test("famille", () => {
    expect(only({ category: ["endurance"] })).toEqual(["LIBT-CYC", "LIBT-END"]);
  });

  test("niveau", () => {
    expect(only({ difficulty: ["beginner"] })).toEqual(["LIBT-CYC", "LIBT-END", "LIBT-STR"]);
  });

  test("pic d'intensité, multiple, sans le renfo", () => {
    expect(only({ peak: [4, 5] })).toEqual(["LIBT-HIL", "LIBT-THR"]);
    expect(only({ peak: [2] })).toEqual(["LIBT-CYC", "LIBT-END"]);
  });

  test("favoris", () => {
    expect(only({ favoritesOnly: true }, { ...ctx, favorites: ["LIBT-HIL", "LIBT-STR"] })).toEqual([
      "LIBT-HIL",
      "LIBT-STR",
    ]);
  });

  test("recherche sur le nom, sans accent ni casse", () => {
    expect(only({ searchQuery: "cote" })).toEqual(["LIBT-HIL"]);
  });

  test("pratique trail : le renfo transversal reste", () => {
    expect(only({}, { ...ctx, practice: "trail" })).toEqual(["LIBT-STR", "LIBT-TRL"]);
  });

  test("le vélo choisi passe outre la pratique", () => {
    expect(ids(filterWorkouts([cycling], defaultFilters, { ...ctx, practice: "road", activityType: "cycling" }))).toEqual([
      "LIBT-CYC",
    ]);
  });

  test("renfo : un filtre de renfo écarte tout le reste", () => {
    expect(only({ equipment: ["none"] })).toEqual(["LIBT-STR"]);
    expect(only({ strengthCategory: ["runner_core"] })).toEqual(["LIBT-STR"]);
    expect(only({ muscleGroup: ["glutes"] })).toEqual([]);
  });
});

describe("le terrain corrigé", () => {
  test("Sans piste garde tout ce qui n'exige pas de piste, renfo compris", () => {
    expect(only({ terrain: ["no_track"] })).toEqual(["LIBT-CYC", "LIBT-END", "LIBT-HIL", "LIBT-STR", "LIBT-TRL"]);
  });

  test("Avec D+ garde le D+ mesuré et les côtes exigées, jamais le plat", () => {
    expect(only({ terrain: ["climb"] })).toEqual(["LIBT-HIL", "LIBT-TRL"]);
  });

  test("Sans côte écarte le D+ et les côtes exigées", () => {
    expect(only({ terrain: ["no_hills"] })).toEqual(["LIBT-CYC", "LIBT-END", "LIBT-STR", "LIBT-THR"]);
  });

  test("les puces se cumulent", () => {
    expect(only({ terrain: ["no_hills", "no_track"] })).toEqual(["LIBT-CYC", "LIBT-END", "LIBT-STR"]);
    expect(only({ terrain: ["climb", "no_track"] })).toEqual(["LIBT-HIL", "LIBT-TRL"]);
  });

  test("Avec D+ et Sans côte s'excluent", () => {
    expect(toggleTerrain(["no_hills", "no_track"], "climb")).toEqual(["no_track", "climb"]);
    expect(toggleTerrain(["climb"], "no_hills")).toEqual(["no_hills"]);
    expect(toggleTerrain(["climb"], "climb")).toEqual([]);
    expect(toggleTerrain(["climb"], "no_track")).toEqual(["climb", "no_track"]);
  });
});

describe("les tranches de durée, sur la durée réelle", () => {
  const bucket = (id: Parameters<typeof rangeOfBucket>[0]) => only({ durationRange: rangeOfBucket(id) });
  test("30 min ou moins", () => {
    expect(bucket("le30")).toEqual(["LIBT-END"]);
  });
  test("30 à 45, borne basse exclusive, borne haute inclusive", () => {
    expect(bucket("30_45")).toEqual(["LIBT-CYC", "LIBT-STR"]);
  });
  test("45 à 60", () => {
    expect(bucket("45_60")).toEqual(["LIBT-HIL"]);
  });
  test("1 h à 1 h 30 : 63 min y est, pas dans 45 à 60", () => {
    expect(bucket("60_90")).toEqual(["LIBT-THR"]);
  });
  test("plus long", () => {
    expect(bucket("gt90")).toEqual(["LIBT-TRL"]);
  });
  test("une plage reconnaît sa tranche", () => {
    expect(bucketOfRange([30, 45])).toBe("30_45");
    expect(bucketOfRange([0, 40])).toBeNull();
    expect(bucketOfRange([0, DURATION_OPEN])).toBeNull();
  });
});

describe("filtres combinés", () => {
  test("Trail et Avec D+", () => {
    expect(only({ terrain: ["climb"] }, { ...ctx, practice: "trail" })).toEqual(["LIBT-TRL"]);
  });
  test("niveau et pic", () => {
    expect(only({ difficulty: ["beginner", "advanced"], peak: [5] })).toEqual(["LIBT-HIL"]);
  });
  test("durée, terrain et recherche", () => {
    expect(only({ durationRange: rangeOfBucket("le30"), terrain: ["no_track"], searchQuery: "footing" })).toEqual([
      "LIBT-END",
    ]);
  });
});

describe("le compteur et le repos", () => {
  test("le compteur compte le panneau, sport compris, ni la famille ni la recherche", () => {
    expect(countActiveFilters(defaultFilters, "all")).toBe(0);
    expect(countActiveFilters({ ...defaultFilters, category: ["hills"], searchQuery: "x" }, "all")).toBe(0);
    expect(
      countActiveFilters(
        { ...defaultFilters, peak: [4, 5], durationRange: [0, 30], terrain: ["no_track"], favoritesOnly: true },
        "running",
      ),
    ).toBe(6);
  });
  test("le repos", () => {
    expect(isLibraryAtRest(defaultFilters, "all")).toBe(true);
    expect(isLibraryAtRest({ ...defaultFilters, category: ["hills"] }, "all")).toBe(false);
    expect(isLibraryAtRest({ ...defaultFilters, searchQuery: "côte" }, "all")).toBe(false);
    expect(isLibraryAtRest(defaultFilters, "strength")).toBe(false);
  });
});

describe("sortWorkouts", () => {
  const order = (sort: Parameters<typeof sortWorkouts>[1]) => sortWorkouts(ALL, sort).map((w) => w.id);
  test("durée, la plus courte d'abord", () => {
    expect(order("duration")).toEqual(["LIBT-END", "LIBT-STR", "LIBT-CYC", "LIBT-HIL", "LIBT-THR", "LIBT-TRL"]);
  });
  test("intensité : le pic, puis la durée, le renfo en dernier", () => {
    expect(order("intensity")).toEqual(["LIBT-END", "LIBT-CYC", "LIBT-TRL", "LIBT-THR", "LIBT-HIL", "LIBT-STR"]);
  });
  test("niveau : débutant à élite, puis la durée", () => {
    expect(order("level")).toEqual(["LIBT-END", "LIBT-STR", "LIBT-CYC", "LIBT-THR", "LIBT-HIL", "LIBT-TRL"]);
  });
  test("ne modifie pas la liste reçue", () => {
    const copy = ALL.slice();
    sortWorkouts(ALL, "level");
    expect(ALL).toEqual(copy);
  });
});

describe("familyIndex", () => {
  test("compte, durées réelles et plage de pics, dans l'ordre du catalogue", () => {
    const index = familyIndex(ALL, { practice: null, activityType: "all" });
    expect(index.map((f) => f.category)).toEqual(["endurance", "threshold", "hills", "trail"]);
    const endurance = index[0];
    expect(endurance).toEqual({
      category: "endurance",
      count: 2,
      minDuration: 25,
      maxDuration: 45,
      minPeak: 2,
      maxPeak: 2,
    });
    expect(index[1]).toMatchObject({ minPeak: 4, maxPeak: 4, minDuration: 63 });
  });
  test("le renfo n'a pas de famille", () => {
    expect(familyIndex([strength], { practice: null, activityType: "all" })).toEqual([]);
  });
  test("une famille vide dans la pratique n'apparaît pas", () => {
    const index = familyIndex(ALL, { practice: "trail", activityType: "all" });
    expect(index.map((f) => f.category)).toEqual(["trail"]);
    const road = familyIndex(ALL, { practice: "road", activityType: "all" });
    expect(road.map((f) => f.category)).toEqual(["endurance", "threshold", "hills"]);
  });
});

describe("parseLibraryParams et serializeLibraryParams", () => {
  const parse = (query: string) => parseLibraryParams(new URLSearchParams(query));

  test("les nouveaux paramètres", () => {
    const p = parse("peak=5,4&minDuration=45&maxDuration=60&terrain=no_track,climb&sort=intensity&favorites=1&category=hills&type=running&practice=trail");
    expect(p.filters.peak).toEqual([4, 5]);
    expect(p.filters.durationRange).toEqual([45, 60]);
    expect(p.filters.terrain).toEqual(["no_track", "climb"]);
    expect(p.filters.favoritesOnly).toBe(true);
    expect(p.filters.category).toEqual(["hills"]);
    expect(p.sort).toBe("intensity");
    expect(p.activityType).toBe("running");
    expect(p.practice).toBe("trail");
  });

  test("le défaut", () => {
    const p = parse("");
    expect(p.filters).toEqual(defaultFilters);
    expect(p.sort).toBe("duration");
    expect(p.activityType).toBe("all");
  });

  test("les valeurs inconnues tombent", () => {
    const p = parse("peak=9,x&category=nope,tempo&difficulty=god&sort=random&type=rowing&terrain=lava");
    expect(p.filters.peak).toEqual([]);
    expect(p.filters.category).toEqual(["tempo"]);
    expect(p.filters.difficulty).toEqual([]);
    expect(p.filters.terrain).toEqual([]);
    expect(p.sort).toBe("duration");
    expect(p.activityType).toBe("all");
  });

  test("ancien lien : terrain=flat devient Sans côte et Sans piste", () => {
    expect(parse("terrain=flat").filters.terrain).toEqual(["no_hills", "no_track"]);
  });

  test("ancien lien : terrain=hills devient Avec D+, track est ignoré", () => {
    expect(parse("terrain=hills,track").filters.terrain).toEqual(["climb"]);
    expect(parse("terrain=track").filters.terrain).toEqual([]);
    // flat et hills ensemble : la seconde l'emporte sur Sans côte, comme une puce.
    expect(parse("terrain=flat,hills").filters.terrain).toEqual(["no_track", "climb"]);
  });

  test("ancien lien : maxDuration seul est la tranche 30 min ou moins", () => {
    const p = parse("maxDuration=30");
    expect(p.filters.durationRange).toEqual([0, 30]);
    expect(bucketOfRange(p.filters.durationRange)).toBe("le30");
  });

  test("?q= et ?search=", () => {
    expect(parse("q=seuil").filters.searchQuery).toBe("seuil");
    expect(parse("search=côte&q=autre").filters.searchQuery).toBe("côte");
  });

  test("aller-retour", () => {
    const state = {
      activityType: "running" as const,
      practice: "trail" as const,
      sort: "level" as const,
      filters: {
        ...defaultFilters,
        category: ["hills" as const],
        peak: [5 as const, 4 as const],
        durationRange: [90, DURATION_OPEN] as [number, number],
        difficulty: ["elite" as const],
        terrain: ["climb" as const],
        favoritesOnly: true,
        searchQuery: "côte",
      },
    };
    const params = serializeLibraryParams(state);
    expect(params.get("peak")).toBe("4,5");
    expect(params.get("minDuration")).toBe("90");
    expect(params.has("maxDuration")).toBe(false);
    const back = parseLibraryParams(params);
    expect(back.filters).toEqual({ ...state.filters, peak: [4, 5] });
    expect(back.sort).toBe("level");
    expect(back.activityType).toBe("running");
    expect(back.practice).toBe("trail");
  });

  test("rien d'écrit pour le défaut, le tri par durée compris", () => {
    const params = serializeLibraryParams({
      activityType: "all",
      practice: null,
      sort: "duration",
      filters: defaultFilters,
    });
    expect(params.toString()).toBe("");
  });
});
