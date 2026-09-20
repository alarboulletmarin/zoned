import { describe, expect, test } from "bun:test";
import {
  formatPaceDigits,
  formatTimeDigits,
  normalizePaceDigits,
  normalizeVma,
  paceDigits,
  paceDigitsToSeconds,
  parseVma,
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

  test("trois groupes se lisent tels quels", () => {
    expect(timeDigitsToSeconds("33000", 42.195)).toBe(3 * 3600 + 30 * 60);
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
