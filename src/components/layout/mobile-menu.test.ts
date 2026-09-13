/**
 * Deux garde-fous du panneau mobile, tous deux nés d'un défaut constaté.
 *
 * 1. LE NOM PARTAGÉ. `.zn-menu__` appartient aux menus déroulants de Radix
 *    (dropdown-menu.css) ET au panneau plein écran (mobile-menu.css). Les deux
 *    feuilles vivent dans la même couche, à la même spécificité, et l'ordre
 *    alphabétique des imports fait gagner la seconde. La collision a déjà eu
 *    lieu deux fois : d'abord sur `.zn-menu` lui-même, qui a repeint chaque
 *    menu déroulant de l'app en dialogue plein écran, puis, en écrivant les
 *    rangées de portes, sur `.zn-menu__item`, qui leur a donné le padding et
 *    la boîte flex d'une entrée de menu déroulant, donc des lignes de 72px
 *    dont le chevron revenait se coller au mot. Le préfixe `__door` est au
 *    panneau ; ce test refuse tout autre nom commun aux deux feuilles.
 *
 * 2. LA LIGNE, ET SES DEUX GESTES. Une porte qui a des pages donne un lien
 *    pour y aller et un bouton pour les déplier, jamais un seul objet pour les
 *    deux : c'est ce qui remplace le `<details>` dont le `<summary>` prenait
 *    la ligne entière. Le test garde l'accord entre les `aria-controls` et les
 *    `id` des listes, qui est ce que le `<details>` offrait gratuitement et
 *    que ce fichier écrit maintenant à la main.
 *
 * Le test lit les sources, il ne monte rien : `bun test` n'a pas de DOM, cf.
 * l'en-tête de mobile-menu-focus.test.ts.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

/** Les classes `.zn-menu__x` qu'une feuille DÉCLARE, sélecteurs seulement. */
function declared(css: string): Set<string> {
  const out = new Set<string>();
  // Les commentaires de ces feuilles citent des noms de classes en prose.
  const rules = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const match of rules.matchAll(/\.(zn-menu__[a-z0-9-]+)/g)) out.add(match[1]);
  return out;
}

describe("le panneau mobile ne partage aucun nom avec les menus déroulants", () => {
  test("aucune classe .zn-menu__ n'est déclarée par les deux feuilles", () => {
    const panel = declared(read("src/styles/components/mobile-menu.css"));
    const dropdown = declared(read("src/styles/components/dropdown-menu.css"));

    const shared = [...panel].filter((name) => dropdown.has(name));
    expect(
      shared,
      "mobile-menu.css est importé après dropdown-menu.css, donc un nom commun "
        + "descend sur les menus de Radix. Préfixer en .zn-menu__door-*.",
    ).toEqual([]);
  });
});

describe("une porte, deux gestes", () => {
  const src = read("src/components/layout/MobileMenu.tsx");
  // Les commentaires de ce fichier racontent le <details> qu'ils remplacent,
  // et un test qui les lirait serait rouge pour la prose.
  const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  test("plus de <details> : la ligne ne fait plus les deux à la fois", () => {
    expect(code).not.toContain("<details");
    expect(code).not.toContain("<summary");
  });

  test("le dépliant est un bouton, avec aria-expanded et aria-controls", () => {
    const disclose = code.match(/className="zn-menu__disclose"[\s\S]*?\/>/)![0];
    expect(disclose).toContain("aria-expanded=");
    expect(disclose).toContain("aria-controls=");
    // Nommé, sinon le bouton n'est qu'un chevron pour un lecteur d'écran.
    expect(disclose).toContain("aria-label=");
  });

  test("chaque dépliant commande la liste qui porte le même id", () => {
    // Les quatre portes : le même `panelId` des deux côtés.
    expect(code).toContain("aria-controls={panelId}");
    expect(code).toContain("id={panelId}");
    // Le reste : le seul id écrit en clair, et il l'est deux fois.
    expect(code).toContain('aria-controls="zn-menu-more"');
    expect(code).toContain('id="zn-menu-more"');
    // Le déclencheur, lui, commande le dialogue.
    expect(code).toContain('aria-controls="mobile-menu"');
    expect(code).toContain('id="mobile-menu"');
  });

  test("la porte où l'on est se voit autrement que par la couleur", () => {
    // La forme (le point) et l'attribut, pas l'un sans l'autre.
    expect(code).toContain("data-current=");
    expect(code).toContain("aria-current={");
    expect(read("src/styles/components/mobile-menu.css")).toMatch(
      /\.zn-menu__door\[data-current\]::after\s*\{/,
    );
  });
});
