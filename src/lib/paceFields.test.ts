import { describe, expect, test } from "bun:test";
import {
  formatPaceDigits,
  formatTimeDigits,
  normalizePaceDigits,
  normalizeTimeDigits,
  normalizeVma,
  paceDigits,
  paceDigitsToSeconds,
  parseVma,
  secondsToTimeDigits,
  timeDigits,
  timeDigitsToSeconds,
  vmaInput,
  vmaToInput,
} from "./paceFields";

describe("allure, les chiffres entrent par la droite", () => {
  test("le masque suit la frappe", () => {
    expect(formatPaceDigits(paceDigits("5"))).toBe("0:05");
    expect(formatPaceDigits(paceDigits("53"))).toBe("0:53");
    expect(formatPaceDigits(paceDigits("530"))).toBe("5:30");
    expect(formatPaceDigits(paceDigits("5:305"))).toBe("53:05");
  });

  test("le masque n'est jamais à retirer par l'appelant", () => {
    expect(paceDigits("5:30")).toBe("530");
    expect(paceDigits("0:05")).toBe("5");
  });

  test("un champ vide reste vide, et se vide vraiment", () => {
    expect(formatPaceDigits("")).toBe("");
    expect(paceDigits("0:00")).toBe("");
  });

  test("rien n'est refusé pendant la frappe, tout se range en sortie", () => {
    expect(paceDigitsToSeconds("575")).toBe(5 * 60 + 75);
    expect(normalizePaceDigits("575")).toBe("615");
    expect(formatPaceDigits(normalizePaceDigits("575"))).toBe("6:15");
  });

  test("quatre chiffres au plus", () => {
    expect(paceDigits("123456")).toBe("1234");
  });
});

describe("chrono d'arrivée", () => {
  test("deux groupes jusqu'à quatre chiffres, trois au-delà", () => {
    expect(formatTimeDigits(timeDigits("5230"))).toBe("52:30");
    expect(formatTimeDigits(timeDigits("33000"))).toBe("3:30:00");
    expect(formatTimeDigits(timeDigits("130000"))).toBe("13:00:00");
  });

  test("la distance départage minutes et heures", () => {
    // 52:30 sur 10 km : 52 minutes, pas 52 heures.
    expect(timeDigitsToSeconds("5230", 10)).toBe(52 * 60 + 30);
    // 3:30 sur marathon : trois heures et demie.
    expect(timeDigitsToSeconds("330", 42.195)).toBe(3 * 3600 + 30 * 60);
    // 1:45 sur semi : plausible dans les deux sens, les heures gagnent au semi.
    expect(timeDigitsToSeconds("145", 21.0975)).toBe(3600 + 45 * 60);
    // 45:00 sur 10 km : 45 minutes.
    expect(timeDigitsToSeconds("4500", 10)).toBe(45 * 60);
  });

  test("sans distance, deux groupes se lisent comme un chronomètre, m:ss", () => {
    expect(timeDigitsToSeconds("2500", 0)).toBe(25 * 60);
    expect(timeDigitsToSeconds("13000", 0)).toBe(3600 + 30 * 60);
    expect(formatTimeDigits(normalizeTimeDigits("9000", 0))).toBe("1:30:00");
  });

  test("trois groupes se lisent tels quels", () => {
    expect(timeDigitsToSeconds("33000", 42.195)).toBe(3 * 3600 + 30 * 60);
  });
});

describe("chrono, le rangement à la sortie", () => {
  test("ce qui déborde remonte", () => {
    expect(formatTimeDigits(normalizeTimeDigits("4575", 10))).toBe("46:15");
    expect(formatTimeDigits(normalizeTimeDigits("39000", 42.195))).toBe("4:30:00");
  });

  test("la lecture retenue pour la distance s'écrit en clair", () => {
    expect(formatTimeDigits(normalizeTimeDigits("330", 42.195))).toBe("3:30:00");
    expect(formatTimeDigits(normalizeTimeDigits("4500", 10))).toBe("45:00");
  });

  test("le rangement se relit à l'identique", () => {
    for (const [seconds, km] of [
      [45 * 60, 10],
      [59 * 60, 42.195],
      [3 * 3600 + 29 * 60 + 59, 42.195],
      [18 * 60 + 30, 5],
      [1 * 3600 + 35 * 60, 21.0975],
    ] as const) {
      const digits = secondsToTimeDigits(seconds, km);
      expect(timeDigitsToSeconds(digits, km)).toBe(seconds);
    }
    // 59 minutes sur marathon se lirait 59 heures : le zéro des heures reste.
    expect(formatTimeDigits(secondsToTimeDigits(59 * 60, 42.195))).toBe("0:59:00");
  });

  test("rien de lisible, champ vide", () => {
    expect(normalizeTimeDigits("", 10)).toBe("");
    expect(secondsToTimeDigits(0, 10)).toBe("");
  });
});

describe("VMA", () => {
  test("un séparateur, écrit en virgule, deux chiffres de chaque côté", () => {
    expect(vmaInput("14.5")).toBe("14,5");
    expect(vmaInput("14,")).toBe("14,");
    expect(vmaInput("14,255")).toBe("14,25");
    expect(vmaInput("145")).toBe("14");
    expect(vmaInput("1,2,3")).toBe("1,23");
  });

  test("se lit entre 5 et 30 km/h", () => {
    expect(parseVma("14,5")).toBe(14.5);
    expect(parseVma("14.5")).toBe(14.5);
    expect(parseVma("")).toBeUndefined();
    expect(parseVma("3")).toBeUndefined();
    expect(parseVma("45")).toBeUndefined();
  });

  test("se range en quittant le champ", () => {
    expect(normalizeVma("14,")).toBe("14");
    expect(normalizeVma("14,50")).toBe("14,5");
    expect(normalizeVma("abc")).toBe("");
    expect(vmaToInput(16.5)).toBe("16,5");
    expect(vmaToInput(undefined)).toBe("");
  });
});
