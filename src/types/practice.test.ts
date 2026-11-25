import { describe, expect, test } from "bun:test";

import {
  PRACTICES,
  PRACTICE_META,
  distancesOfPractice,
  practiceFromRaceDistance,
  type Practice,
} from "./practice";
import { DISTANCE_PROFILE } from "@/lib/planGenerator/constants";
import { OFFERED_RACE_DISTANCES, type RaceDistance } from "@/types/plan";

const ALL_DISTANCES = Object.keys(DISTANCE_PROFILE) as RaceDistance[];

describe("practiceFromRaceDistance", () => {
  test("chaque distance de course tombe dans une pratique", () => {
    for (const distance of ALL_DISTANCES) {
      expect(PRACTICES).toContain(practiceFromRaceDistance(distance));
    }
  });

  test("aller-retour : une distance proposée revient par sa pratique", () => {
    for (const distance of OFFERED_RACE_DISTANCES) {
      expect(distancesOfPractice(practiceFromRaceDistance(distance))).toContain(distance);
    }
  });

  /* L'ultra n'est plus proposé (25 novembre 2026), mais des plans enregistrés
     le portent : ils doivent s'ouvrir comme du trail, pas comme de la route. */
  test("un ancien plan ultra s'ouvre en trail", () => {
    expect(practiceFromRaceDistance("ultra")).toBe("trail");
  });

  test("aucune distance n'est revendiquée par deux pratiques", () => {
    for (const distance of ALL_DISTANCES) {
      const claimants = PRACTICES.filter((p) => distancesOfPractice(p).includes(distance));
      expect(claimants.length).toBeLessThanOrEqual(1);
    }
  });
});

describe("PRACTICE_META", () => {
  test("deux pratiques, route et trail, rien d'autre", () => {
    expect([...PRACTICES]).toEqual(["road", "trail"]);
  });

  test("l'ultra ne se propose plus nulle part", () => {
    expect(OFFERED_RACE_DISTANCES).not.toContain("ultra");
    for (const practice of PRACTICES) {
      expect(distancesOfPractice(practice)).not.toContain("ultra");
    }
  });

  test("l'id de chaque entrée est sa clé", () => {
    for (const practice of PRACTICES) {
      expect(PRACTICE_META[practice].id).toBe(practice);
    }
  });

  // L'axe produit (Practice) et l'axe moteur (DistanceProfile) ont le droit
  // d'être de granularités différentes, route contient du "short" ET du
  // "long". Ce qui ne doit PAS dériver, c'est que le trail reste du côté
  // trail du moteur : c'est ce qui lui donne ses tables de volume, de phases
  // et d'affûtage.
  test("le trail reste sur le profil moteur trail", () => {
    for (const distance of distancesOfPractice("trail")) {
      expect(DISTANCE_PROFILE[distance]).toBe("trail");
    }
  });

  test("la route ne contient aucune distance de profil trail", () => {
    for (const distance of distancesOfPractice("road")) {
      expect(DISTANCE_PROFILE[distance]).not.toBe("trail");
    }
  });

  test("chaque pratique propose au moins une distance", () => {
    for (const practice of PRACTICES) {
      expect(distancesOfPractice(practice).length).toBeGreaterThan(0);
    }
  });

  test("chaque pratique a ses libellés dans les deux langues", () => {
    for (const practice of PRACTICES) {
      const meta = PRACTICE_META[practice];
      for (const field of ["label", "labelEn", "blurb", "blurbEn"] as const) {
        expect(meta[field].length).toBeGreaterThan(0);
      }
    }
  });

  test("une pratique déclare au moins une modalité", () => {
    for (const practice of PRACTICES) {
      expect(PRACTICE_META[practice].disciplines.length).toBeGreaterThan(0);
    }
  });
});

describe("PRACTICES", () => {
  test("couvre exactement les clés de PRACTICE_META, sans doublon", () => {
    const keys = Object.keys(PRACTICE_META) as Practice[];
    expect([...PRACTICES].sort()).toEqual(keys.sort());
    expect(new Set(PRACTICES).size).toBe(PRACTICES.length);
  });
});
