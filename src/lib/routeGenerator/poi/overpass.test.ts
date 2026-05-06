import { describe, expect, test } from "bun:test";

import { parseOverpassElements } from "./overpass";

describe("parseOverpassElements", () => {
  test("infers park, beach, promenade and trail types from tags", () => {
    const result = parseOverpassElements([
      {
        id: 1,
        type: "way",
        center: { lat: 43.7, lon: 7.27 },
        tags: { leisure: "park", name: "Jardin Albert Ier" },
      },
      {
        id: 2,
        type: "way",
        center: { lat: 43.69, lon: 7.26 },
        tags: { natural: "beach", name: "Plage de la Réserve" },
      },
      {
        id: 3,
        type: "way",
        center: { lat: 43.695, lon: 7.265 },
        tags: { highway: "footway", name: "Promenade des Anglais" },
      },
      {
        id: 4,
        type: "way",
        center: { lat: 43.71, lon: 7.28 },
        tags: { route: "hiking", name: "Sentier des Crêtes" },
      },
    ]);

    expect(result).toHaveLength(4);
    expect(result.map((p) => p.type)).toEqual([
      "park",
      "beach",
      "promenade",
      "trail",
    ]);
    // Promenade scores highest for runners.
    const prom = result.find((p) => p.type === "promenade");
    const park = result.find((p) => p.type === "park");
    expect(prom?.weight ?? 0).toBeGreaterThan(park?.weight ?? 0);
  });

  test("uses element-level lat/lon when center is missing", () => {
    const result = parseOverpassElements([
      {
        id: 99,
        type: "node",
        lat: 43.7,
        lon: 7.27,
        tags: { leisure: "park", name: "Carré Vert" },
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].point).toEqual([7.27, 43.7]);
  });

  test("skips elements without coordinates", () => {
    const result = parseOverpassElements([
      { id: 1, type: "way", tags: { leisure: "park" } }, // no center, no lat/lon
    ]);
    expect(result).toEqual([]);
  });

  test("skips elements that don't match any known POI type", () => {
    const result = parseOverpassElements([
      {
        id: 1,
        type: "way",
        center: { lat: 43.7, lon: 7.27 },
        tags: { highway: "primary", name: "Avenue de la Victoire" }, // not a footway
      },
    ]);
    expect(result).toEqual([]);
  });

  test("requires the 'promenade' name pattern for highway POIs", () => {
    // A footway without 'promenade' in its name is NOT considered a POI.
    const result = parseOverpassElements([
      {
        id: 1,
        type: "way",
        center: { lat: 43.7, lon: 7.27 },
        tags: { highway: "footway", name: "Rue des Fleurs" },
      },
    ]);
    expect(result).toEqual([]);
  });
});
