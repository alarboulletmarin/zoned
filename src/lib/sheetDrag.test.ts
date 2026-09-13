/**
 * La règle a deux moitiés qui ne servent à rien l'une sans l'autre : la course
 * (100px), pour le glissement franc, et l'élan, pour le flick, le geste
 * réflexe sur mobile, qui part vite et s'arrête au bout de trois centimètres.
 * La seconde a un plancher de course, sans quoi un tremblement rapide du pouce
 * sur la barre de titre fermerait la sheet que l'utilisateur vient d'ouvrir.
 */
import { describe, expect, test } from "bun:test";

import { shouldCloseSheet } from "./sheetDrag";

/** Immobile au lâcher : seule la course peut décider. */
const ARRET = 0;
/** Un flick ordinaire, ~600px/s, au-dessus du seuil de 0,5px/ms. */
const FLICK = 0.6;

describe("shouldCloseSheet", () => {
  test("la course franche ferme, quelle que soit la vitesse", () => {
    expect(shouldCloseSheet(150, ARRET)).toBe(true);
    expect(shouldCloseSheet(101, ARRET)).toBe(true);
  });

  test("la course courte et lente ne ferme pas, la sheet revient", () => {
    expect(shouldCloseSheet(80, ARRET)).toBe(false);
    expect(shouldCloseSheet(100, ARRET)).toBe(false);
  });

  test("le flick court ferme sur son seul élan", () => {
    expect(shouldCloseSheet(40, FLICK)).toBe(true);
  });

  test("le tremblement rapide ne ferme pas : l'élan a un plancher de course", () => {
    expect(shouldCloseSheet(24, FLICK)).toBe(false);
    expect(shouldCloseSheet(10, 5)).toBe(false);
  });

  test("le geste vers le haut ne ferme jamais", () => {
    expect(shouldCloseSheet(-150, -2)).toBe(false);
    expect(shouldCloseSheet(0, ARRET)).toBe(false);
  });
});
