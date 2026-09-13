import { beforeEach, describe, expect, test } from "bun:test";

import { loadLastPractice, resolvePractice, saveLastPractice } from "./practicePrefs";
import { PRACTICES } from "@/types/practice";

// bun n'a pas de DOM : on pose le minimum que le module touche.
const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
} as unknown as Storage;

beforeEach(() => store.clear());

describe("la mémoire du dernier choix", () => {
  test("relit ce qu'on a écrit", () => {
    saveLastPractice("trail");
    expect(loadLastPractice()).toBe("trail");
  });

  test("null efface", () => {
    saveLastPractice("ultra");
    saveLastPractice(null);
    expect(loadLastPractice()).toBeNull();
  });

  test("une valeur inconnue en stockage ne devient pas une pratique", () => {
    store.set("zoned:practice", "ski-de-fond");
    expect(loadLastPractice()).toBeNull();
  });

  test("écrit sur sa propre clé, jamais dans zoned-settings", () => {
    saveLastPractice("road");
    // zoned-settings est relu par le script inline d'index.html avant tout
    // bundle : il doit rester minuscule et purement présentationnel.
    expect(store.has("zoned-settings")).toBe(false);
    expect(store.has("zoned:practice")).toBe(true);
  });
});

describe("resolvePractice", () => {
  test("l'URL gagne sur la mémoire", () => {
    saveLastPractice("ultra");
    expect(resolvePractice("trail", PRACTICES)).toBe("trail");
  });

  test("sans paramètre, la mémoire prend le relais", () => {
    saveLastPractice("ultra");
    expect(resolvePractice(null, PRACTICES)).toBe("ultra");
  });

  test("sans paramètre ni mémoire, aucune pratique n'est devinée", () => {
    expect(resolvePractice(null, PRACTICES)).toBeNull();
  });

  test("un paramètre illisible ne réveille pas la mémoire", () => {
    // Sinon un lien partagé avec ?practice=nimportequoi afficherait la
    // pratique du destinataire, pas celle du lien : surprenant et faux.
    saveLastPractice("ultra");
    expect(resolvePractice("nimportequoi", PRACTICES)).toBeNull();
  });

  test("une pratique que la personne a masquée n'est pas rouverte", () => {
    saveLastPractice("triathlon");
    expect(resolvePractice(null, ["road", "trail"])).toBeNull();
    expect(resolvePractice("triathlon", ["road", "trail"])).toBeNull();
  });
});
