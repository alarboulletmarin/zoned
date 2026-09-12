import { describe, expect, test } from "bun:test";

import {
  PRACTICES,
  PRACTICE_META,
  distancesOfPractice,
  isPracticeLive,
  practiceFromRaceDistance,
  type Practice,
} from "./practice";
import { DISTANCE_PROFILE } from "@/lib/planGenerator/constants";
import type { RaceDistance } from "@/types/plan";

const ALL_DISTANCES = Object.keys(DISTANCE_PROFILE) as RaceDistance[];

describe("practiceFromRaceDistance", () => {
  test("chaque distance de course tombe dans une pratique", () => {
    for (const distance of ALL_DISTANCES) {
      expect(PRACTICES).toContain(practiceFromRaceDistance(distance));
    }
  });

  test("aller-retour : la pratique d'une distance la propose en retour", () => {
    for (const distance of ALL_DISTANCES) {
      const practice = practiceFromRaceDistance(distance);
      expect(distancesOfPractice(practice)).toContain(distance);
    }
  });

  test("chaque distance est revendiquée par exactement une pratique", () => {
    for (const distance of ALL_DISTANCES) {
      const claimants = PRACTICES.filter((p) =>
        distancesOfPractice(p).includes(distance),
      );
      expect(claimants).toHaveLength(1);
    }
  });
});

describe("PRACTICE_META", () => {
  test("l'id de chaque entrée est sa clé", () => {
    for (const practice of PRACTICES) {
      expect(PRACTICE_META[practice].id).toBe(practice);
    }
  });

  // L'axe produit (Practice) et l'axe moteur (DistanceProfile) ont le droit
  // d'être de granularités différentes — « route » contient du "short" ET du
  // "long". Ce qui ne doit PAS dériver, c'est que trail et ultra restent du
  // côté trail du moteur : c'est ce qui leur donne leurs tables de volume,
  // de phases et d'affûtage.
  test("trail et ultra restent sur le profil moteur trail", () => {
    for (const practice of ["trail", "ultra"] as const) {
      for (const distance of distancesOfPractice(practice)) {
        expect(DISTANCE_PROFILE[distance]).toBe("trail");
      }
    }
  });

  test("la route ne contient aucune distance de profil trail", () => {
    for (const distance of distancesOfPractice("road")) {
      expect(DISTANCE_PROFILE[distance]).not.toBe("trail");
    }
  });

  test("une pratique vivante propose au moins une distance", () => {
    for (const practice of PRACTICES) {
      if (!isPracticeLive(practice)) continue;
      expect(distancesOfPractice(practice).length).toBeGreaterThan(0);
    }
  });

  // Ce test échoue le jour où quelqu'un bascule le triathlon en "live" sans
  // avoir écrit ses plans. C'est voulu : l'annonce est une promesse, pas un
  // réglage qu'on retourne en passant.
  test("le triathlon est annoncé, pas livré", () => {
    expect(PRACTICE_META.triathlon.status).toBe("announced");
    expect(distancesOfPractice("triathlon")).toHaveLength(0);
    expect(isPracticeLive("triathlon")).toBe(false);
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
