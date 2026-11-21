/**
 * Pas deux fois la même séance dans une semaine.
 *
 * Le plan de démo du Trail des Balcons portait TMP-015 le mercredi ET le
 * vendredi de sa semaine 9 : le sélecteur levait l'exclusion de la semaine
 * dès que son pool resserré (phase, charge, niveau) était vide, alors que le
 * catalogue gardait d'autres tempos. La propriété se vérifie sur tout l'axe
 * des distances, des niveaux et des jours, avec et sans renforcement.
 */
import { describe, expect, test } from "bun:test";
import { generatePlan } from "./index";
import type { AssistedPlanConfig, RaceDistance } from "@/types/plan";
import type { Difficulty } from "@/types";

const DISTANCES: { distance: RaceDistance; weeks: number }[] = [
  { distance: "5K", weeks: 8 },
  { distance: "10K", weeks: 10 },
  { distance: "semi", weeks: 12 },
  { distance: "marathon", weeks: 16 },
  { distance: "trail_short", weeks: 11 },
  { distance: "trail", weeks: 16 },
  { distance: "ultra", weeks: 20 },
];
const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];
const DAYS = [3, 4, 5, 6];

function raceDate(weeks: number): string {
  // Départ le lundi 26 octobre 2026, course le dimanche de la dernière semaine.
  const d = new Date(2026, 9, 26 + weeks * 7 - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

describe("aucune semaine ne répète une séance", () => {
  for (const { distance, weeks } of DISTANCES) {
    test(distance, async () => {
      const offenders: string[] = [];
      for (const level of LEVELS) {
        for (const days of DAYS) {
          for (const includeStrength of [false, true]) {
            const plan = await generatePlan({
              id: "dup",
              createdAt: "2026-10-20T00:00:00.000Z",
              startDate: "2026-10-26",
              raceDate: raceDate(weeks),
              raceDistance: distance,
              runnerLevel: level,
              trainingGoal: "time",
              daysPerWeek: days,
              longRunDay: 6,
              vma: 15,
              elevationGain: distance === "trail_short" || distance === "trail" || distance === "ultra" ? 1500 : undefined,
              planPurpose: "race",
              includeStrength,
              strengthFrequency: 2,
            } as AssistedPlanConfig);
            for (const week of plan.weeks) {
              const seen = new Set<string>();
              for (const s of week.sessions) {
                if (s.workoutId.startsWith("__")) continue;
                if (seen.has(s.workoutId)) {
                  offenders.push(`${level} ${days}j renfo=${includeStrength} S${week.weekNumber} ${s.workoutId}`);
                }
                seen.add(s.workoutId);
              }
            }
          }
        }
      }
      expect(offenders).toEqual([]);
    });
  }
});
