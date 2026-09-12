import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

import { FOOTER_GROUPS, PRIMARY_NAV } from "./navigation";
import { COMMAND_SURFACES } from "@/data/command-surfaces";

/**
 * Le garde-fou de la relégation.
 *
 * La refonte fait passer la navigation de 5 portes et 28 entrées à 4 portes et
 * 14, et les ~35 destinations sorties gardent toutes leur route : elles restent
 * indexées, prérendues et partageables. Mais une page qui n'est plus dans la
 * nav ET pas dans le pied de page ET pas dans la palette est **supprimée sans
 * que personne ne l'ait décidé** — et rien, ni `tsc`, ni le build, ni le
 * sitemap, ne le dirait.
 *
 * Ce test lit les routes directement dans `App.tsx` par regex — la même
 * astuce que `scripts/generate-route-meta.ts` — et exige que chacune soit
 * joignable depuis au moins une des trois surfaces, ou nommée explicitement
 * dans la liste ci-dessous avec sa raison.
 */

const APP = readFileSync(join(import.meta.dirname, "../../App.tsx"), "utf8");

/** Les routes statiques déclarées dans le routeur, paramètres exclus. */
const STATIC_ROUTES = [...APP.matchAll(/path="(\/[^"]*)"/g)]
  .map((m) => m[1])
  .filter((p) => !p.includes(":") && !p.includes("*"));

/**
 * Ce qui n'a pas à être joignable depuis la navigation, et pourquoi.
 * Toute nouvelle entrée ici doit porter sa justification.
 */
const NOT_A_DESTINATION: Record<string, string> = {
  "/": "la landing publique — on y arrive par le logo et par le web, pas par la nav",
  "/workout/shared": "atterrissage d'un lien partagé",
  "/weeks/shared": "atterrissage d'un lien partagé",
  "/plan/shared": "atterrissage d'un lien partagé",
  "/race-simulator/shared": "atterrissage d'un lien partagé",
  "/library/weekly": "redirection historique vers /weeks",
  "/quiz": "redirection historique vers /library/draw",
  "/plan/new/assisted": "étape interne du parcours, atteinte depuis /plan/new",
  "/plan/new/free": "étape interne du parcours, atteinte depuis /plan/new",
};

function reachableFromNav(): Set<string> {
  const out = new Set<string>();
  for (const section of PRIMARY_NAV) {
    out.add(section.to);
    for (const child of section.children ?? []) out.add(child.to);
  }
  return out;
}

function reachableFromFooter(): Set<string> {
  const out = new Set<string>();
  for (const group of FOOTER_GROUPS) {
    for (const link of group.links) if (link.to) out.add(link.to);
  }
  return out;
}

function reachableFromPalette(): Set<string> {
  return new Set(COMMAND_SURFACES.map((s) => s.url));
}

describe("les routes du routeur", () => {
  test("le test lit bien App.tsx", () => {
    // Si la regex cesse de trouver les routes, tous les tests ci-dessous
    // passeraient pour de mauvaises raisons.
    expect(STATIC_ROUTES.length).toBeGreaterThan(40);
    expect(STATIC_ROUTES).toContain("/library");
    expect(STATIC_ROUTES).toContain("/calculators");
  });

  test("chaque route statique est joignable, ou explicitement écartée", () => {
    const reachable = new Set([
      ...reachableFromNav(),
      ...reachableFromFooter(),
      ...reachableFromPalette(),
    ]);

    const orphans = STATIC_ROUTES.filter(
      (route) => !reachable.has(route) && !(route in NOT_A_DESTINATION),
    );

    expect(orphans).toEqual([]);
  });

  test("aucune surface ne pointe une route qui n'existe pas", () => {
    const declared = new Set(STATIC_ROUTES);
    const dangling = [
      ...reachableFromNav(),
      ...reachableFromFooter(),
      ...reachableFromPalette(),
    ].filter((to) => !declared.has(to));

    expect(dangling).toEqual([]);
  });

  test("la liste des écartées ne contient rien de périmé", () => {
    const declared = new Set(STATIC_ROUTES);
    for (const route of Object.keys(NOT_A_DESTINATION)) {
      expect(declared.has(route)).toBe(true);
    }
  });
});

describe("la navigation elle-même", () => {
  test("quatre portes, et pas une de plus", () => {
    // Le but du chantier est lisible ici : cinq portes et 28 entrées, c'était
    // 28 décisions avant la première séance.
    expect(PRIMARY_NAV).toHaveLength(4);
    expect(PRIMARY_NAV.map((s) => s.id)).toEqual(["today", "sessions", "plan", "numbers"]);
  });

  test("le nombre d'entrées reste sous le seuil qu'on s'est donné", () => {
    const entries = PRIMARY_NAV.reduce(
      (n, s) => n + 1 + (s.children?.length ?? 0),
      0,
    );
    expect(entries).toBeLessThanOrEqual(18);
  });

  test("les deux gestes courts sont dans la nav, pas au fond d'un menu", () => {
    const all = reachableFromNav();
    expect(all.has("/library/draw")).toBe(true);
    expect(all.has("/weeks")).toBe(true);
  });

  test("le cockpit est la première porte", () => {
    expect(PRIMARY_NAV[0].to).toBe("/today");
  });

  test("aucune entrée n'est répétée dans deux portes", () => {
    const seen = new Map<string, string>();
    for (const section of PRIMARY_NAV) {
      for (const child of section.children ?? []) {
        const previous = seen.get(child.to);
        expect(previous, `${child.to} est déjà sous « ${previous} »`).toBeUndefined();
        seen.set(child.to, section.id);
      }
    }
  });
});
