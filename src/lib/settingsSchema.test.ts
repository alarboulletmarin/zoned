import { describe, expect, test } from "bun:test";

import {
  isModuleHidden,
  parseStoredSettings,
  sanitizeSettings,
  visiblePractices,
} from "./settingsSchema";
import { DEFAULT_SETTINGS } from "@/types/settings";
import { PRACTICES } from "@/types/practice";

describe("sanitizeSettings", () => {
  test("rend les défauts pour ce qui n'est pas un objet", () => {
    for (const raw of [null, undefined, 42, "settings", [], true]) {
      expect(sanitizeSettings(raw)).toEqual(DEFAULT_SETTINGS);
    }
  });

  test("un objet écrit avant les nouveaux champs gagne leurs défauts", () => {
    // La charge utile exacte d'avant ce lot — c'est le test « aucune migration ».
    const legacy = {
      colorPalette: "standard",
      unitSystem: "imperial",
      routeGeneratorEnabled: false,
      openingAnimation: "never",
    };
    const settings = sanitizeSettings(legacy);
    expect(settings.unitSystem).toBe("imperial");
    expect(settings.routeGeneratorEnabled).toBe(false);
    expect(settings.openingAnimation).toBe("never");
    expect(settings.enabledPractices).toEqual([]);
    expect(settings.disabledModules).toEqual([]);
    expect(settings.cockpit).toEqual(DEFAULT_SETTINGS.cockpit);
    // Le réglage mort ne survit pas à la relecture.
    expect("colorPalette" in settings).toBe(false);
  });

  // Le bug que ce module existe pour empêcher : une chaîne là où le code
  // attend un tableau faisait lever `.includes()` en plein rendu.
  test("une liste qui n'est pas une liste ne fait pas tomber l'app", () => {
    const settings = sanitizeSettings({
      disabledModules: "routes",
      enabledPractices: { road: true },
    });
    expect(settings.disabledModules).toEqual([]);
    expect(settings.enabledPractices).toEqual([]);
    expect(() => isModuleHidden(settings, "routes")).not.toThrow();
  });

  test("les entrées inconnues d'une liste sont jetées, le reste survit", () => {
    const settings = sanitizeSettings({
      disabledModules: ["routes", "teleportation", 7, null, "learn"],
      enabledPractices: ["trail", "skiing", "trail"],
    });
    expect(settings.disabledModules).toEqual(["routes", "learn"]);
    // Et les doublons partent.
    expect(settings.enabledPractices).toEqual(["trail"]);
  });

  test("une valeur d'énumération inconnue retombe sur son défaut", () => {
    const settings = sanitizeSettings({
      unitSystem: "furlongs",
      openingAnimation: "sometimes",
    });
    expect(settings.unitSystem).toBe(DEFAULT_SETTINGS.unitSystem);
    expect(settings.openingAnimation).toBe(DEFAULT_SETTINGS.openingAnimation);
  });

  test("le cockpit se répare champ par champ", () => {
    const settings = sanitizeSettings({ cockpit: { resume: false, art: "oui" } });
    expect(settings.cockpit.resume).toBe(false);
    expect(settings.cockpit.art).toBe(true);
    expect(settings.cockpit.shortcuts).toBe(true);
  });

  test("un cockpit qui n'est pas un objet retombe entièrement", () => {
    expect(sanitizeSettings({ cockpit: "tout" }).cockpit).toEqual(DEFAULT_SETTINGS.cockpit);
  });

  test("ne partage jamais l'objet cockpit par défaut", () => {
    const a = sanitizeSettings(null);
    const b = sanitizeSettings(null);
    expect(a.cockpit).not.toBe(b.cockpit);
    expect(a.cockpit).not.toBe(DEFAULT_SETTINGS.cockpit);
  });
});

describe("parseStoredSettings", () => {
  test("du JSON illisible rend les défauts au lieu de lever", () => {
    expect(parseStoredSettings("{pas du json")).toEqual(DEFAULT_SETTINGS);
    expect(parseStoredSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  test("relit ce qu'on a écrit", () => {
    const stored = JSON.stringify({ unitSystem: "imperial", disabledModules: ["learn"] });
    const settings = parseStoredSettings(stored);
    expect(settings.unitSystem).toBe("imperial");
    expect(isModuleHidden(settings, "learn")).toBe(true);
    expect(isModuleHidden(settings, "routes")).toBe(false);
  });
});

describe("visiblePractices", () => {
  test("vide veut dire toutes — on ne montre jamais une app sans pratique", () => {
    expect(visiblePractices(sanitizeSettings(null))).toEqual(PRACTICES);
  });

  test("un choix explicite est respecté", () => {
    const settings = sanitizeSettings({ enabledPractices: ["trail", "ultra"] });
    expect(visiblePractices(settings)).toEqual(["trail", "ultra"]);
  });
});
