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
 * 2. UNE ENTRÉE, UNE DESTINATION. Depuis le 18 septembre 2026 le panneau ne
 *    déplie plus rien : chaque porte est un lien, les outils sont des liens,
 *    et les pages d'une porte vivent sur sa page d'accueil (`HubNav.tsx`).
 *    Le panneau a été un plan de site, quatre dépliants et un Reste de seize
 *    lignes, et il le redeviendrait à la première entrée ajoutée sans qu'on
 *    y pense. Ce test garde la forme : aucun dépliant, aucun réglage dupliqué
 *    de la barre, et la ligne où l'on est dite autrement que par la couleur.
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

describe("une entrée, une destination", () => {
  const src = read("src/components/layout/MobileMenu.tsx");
  // Les commentaires de ce fichier racontent les dépliants qu'ils remplacent,
  // et un test qui les lirait serait rouge pour la prose.
  const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  test("rien ne se déplie dans le panneau", () => {
    expect(code).not.toContain("<details");
    expect(code).not.toContain("<summary");
    // Le seul aria-expanded est celui du déclencheur, qui dit l'état du
    // dialogue ; une seconde occurrence serait un dépliant revenu.
    expect(code.match(/aria-expanded=/g)).toHaveLength(1);
    // Et le seul aria-controls pointe le dialogue.
    expect(code.match(/aria-controls=/g)).toHaveLength(1);
    expect(code).toContain('aria-controls="mobile-menu"');
    expect(code).toContain('id="mobile-menu"');
    expect(code).not.toContain("ChevronDown");
  });

  test("les portes et les outils sont des liens, pas des boutons", () => {
    // Les deux listes viennent de la donnée, et chaque entrée est un <Link>.
    expect(code).toContain("PRIMARY_NAV.map(");
    expect(code).toContain("tools.map(");
    expect(code).toContain('className="zn-display zn-menu__door"');
    expect(code).toContain('className="zn-menu__tool"');
    // Aucune ligne de navigation n'est un <button> : le seul bouton du
    // panneau, hors déclencheur et fermeture, est la recherche.
    const buttons = code.match(/<button[\s\S]*?className="([^"]+)"/g) ?? [];
    const classes = buttons.map((b) => b.match(/className="([^"]+)"/)![1]);
    expect(classes.sort()).toEqual(
      ["zn-menu__close", "zn-menu__search", "zn-topbar__tool zn-menu-trigger"].sort(),
    );
  });

  test("les outils suivent les modules des réglages", () => {
    // Masquer un module dans les réglages retire sa ligne d'ici, comme le
    // promet le texte de la bascule.
    expect(code).toContain("isModuleHidden(settings, section.module)");
  });

  test("la langue et le thème ne sont plus dans le panneau", () => {
    // La barre du haut les garde sur tous les écrans, et les réglages les
    // portent avec leur nom entier : ici ils doublaient la navigation.
    expect(code).not.toContain("Segmented");
    expect(code).not.toContain("changeLanguage");
    expect(code).not.toContain("useTheme");
  });

  test("la ligne où l'on est se voit autrement que par la couleur", () => {
    // La forme (le point) et l'attribut, pas l'un sans l'autre.
    expect(code).toContain("data-current=");
    expect(code).toContain("aria-current={");
    expect(read("src/styles/components/mobile-menu.css")).toMatch(
      /\.zn-menu__door\[data-current\]::after\s*\{/,
    );
  });

  test("la liste est ancrée en haut, la scène entre elle et le sol", () => {
    // L'ordre des trois blocs dans le panneau : navigation, scène, sol. La
    // scène au-dessus des portes est le demi-écran vide que la relecture du
    // 18 septembre a retiré.
    const nav = code.indexOf('className="zn-menu__nav"');
    const scene = code.indexOf('className="zn-menu__scene"');
    const foot = code.indexOf('className="zn-menu__foot"');
    expect(nav).toBeGreaterThan(-1);
    expect(scene).toBeGreaterThan(nav);
    expect(foot).toBeGreaterThan(scene);
  });
});
