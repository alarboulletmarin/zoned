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

  /* L'aller-retour ne vaut que pour une pratique OUVERTE : une pratique
     annoncée ne propose aucune distance, c'est sa définition même, et c'est
     précisément ce qui ferme son parcours. La projection inverse, elle, reste
     totale, un plan ultra déjà enregistré doit garder sa pratique, sinon il
     s'ouvrirait comme un plan sur route. */
  test("aller-retour : une pratique ouverte propose en retour ses distances", () => {
    for (const distance of ALL_DISTANCES) {
      const practice = practiceFromRaceDistance(distance);
      if (!isPracticeLive(practice)) continue;
      expect(distancesOfPractice(practice)).toContain(distance);
    }
  });

  test("aucune distance n'est revendiquée par deux pratiques", () => {
    for (const distance of ALL_DISTANCES) {
      const claimants = PRACTICES.filter((p) =>
        distancesOfPractice(p).includes(distance),
      );
      expect(claimants.length).toBeLessThanOrEqual(1);
      /* Une distance sans revendiquant est une distance dont la pratique est
         fermée, jamais un trou dans la table. */
      if (claimants.length === 0) {
        expect(isPracticeLive(practiceFromRaceDistance(distance))).toBe(false);
      }
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
  // d'être de granularités différentes, route contient du "short" ET du
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

  // Ces tests échouent le jour où quelqu'un rouvre une pratique annoncée sans
  // avoir écrit, ou fiabilisé, ses plans. C'est voulu : l'annonce est une
  // promesse, pas un réglage qu'on retourne en passant.
  test("le triathlon est annoncé, pas livré", () => {
    expect(PRACTICE_META.triathlon.status).toBe("announced");
    expect(distancesOfPractice("triathlon")).toHaveLength(0);
    expect(isPracticeLive("triathlon")).toBe(false);
  });

  // Fermé le 12 septembre 2026 : le générateur a ses tables d'ultra, mais ce
  // qu'il en sort n'a pas été jugé assez fiable pour être proposé. Le jour où
  // il l'est, c'est ici que le verrou saute.
  test("l'ultra est annoncé, pas livré", () => {
    expect(PRACTICE_META.ultra.status).toBe("announced");
    expect(distancesOfPractice("ultra")).toHaveLength(0);
    expect(isPracticeLive("ultra")).toBe(false);
  });

  // Une pratique annoncée ne propose AUCUNE distance : c'est ce qui ferme
  // l'étape distance et, par elle, toute la suite du parcours.
  test("une pratique annoncée ne propose aucune distance", () => {
    for (const practice of PRACTICES) {
      if (isPracticeLive(practice)) continue;
      expect(distancesOfPractice(practice)).toHaveLength(0);
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
