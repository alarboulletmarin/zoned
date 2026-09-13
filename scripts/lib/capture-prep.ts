/**
 * Ce que tout script de capture doit faire avant d'appuyer sur le déclencheur.
 *
 * Trois scripts photographient l'app, les captures du README, celles du
 * manifeste PWA, les stills des films, et chacun portait sa propre copie de la
 * même préparation. Les copies avaient divergé : celle du manifeste semait la
 * langue sous `i18nextLng`, qui n'est pas la clé que l'app lit, et aucune ne
 * fermait les toasts, d'où le carton Filter to find planté en bas des
 * captures du store. La préparation vit ici, une fois.
 *
 * Le paquet `video/` reste volontairement isolé (son propre package.json, son
 * propre Remotion) et garde donc sa copie ; c'est le prix de l'isolation, pas
 * un oubli.
 */

import type { Page } from "puppeteer";

export type Lang = "fr" | "en";
export type Theme = "light" | "dark";

export const ACCEPT_LANGUAGE: Record<Lang, string> = {
  fr: "fr-FR,fr;q=0.9",
  en: "en-US,en;q=0.9",
};

/**
 * Les bandeaux, cartons et fenêtres que l'app a le droit d'ouvrir et qu'une
 * capture n'a pas à montrer. Tous sont fermés par une clé de localStorage,
 * donc les semer revient à photographier l'app d'un habitué plutôt que celle
 * d'un premier jour.
 *
 * `zoned-pwa-install-dismissed` porte un horodatage relu contre une fenêtre de
 * trente jours (src/hooks/usePWA.ts) : `Date.now()` au moment de la capture est
 * la seule valeur qui vaille, "true" y serait lu comme l'époque Unix.
 */
function dismissalSeed(): Record<string, string> {
  return {
    "zoned-pwa-install-dismissed": String(Date.now()),
    "zoned-storage-warning-seen": "true",
    "zoned-zone-cta-dismissed": "true",
  };
}

/**
 * Fixe la langue et le thème avant que le moindre script de page ne tourne.
 *
 * LA LANGUE SE LIT DANS L'URL. `detection.order` (src/i18n/index.ts) est
 * `querystring, localStorage, htmlTag` avec `lookupQuerystring: "lang"` et
 * `lookupLocalStorage: "zoned-language"`, et `navigator` est hors de la chaîne,
 * donc l'en-tête Accept-Language ne décide de rien. `withLang()` ci-dessous
 * pose le paramètre ; le localStorage n'est qu'une seconde source, et
 * `i18nextLng` (le cache d'i18next) est semé avec pour que rien ne le
 * contredise au montage.
 */
export async function seedApp(
  page: Page,
  opts: { lang: Lang; theme?: Theme; extra?: Record<string, string> },
): Promise<void> {
  const seed: Record<string, string> = {
    "zoned-language": opts.lang,
    i18nextLng: opts.lang,
    ...dismissalSeed(),
    ...(opts.theme ? { "zoned-theme": opts.theme } : {}),
    ...(opts.extra ?? {}),
  };

  await page.setExtraHTTPHeaders({ "Accept-Language": ACCEPT_LANGUAGE[opts.lang] });
  await page.evaluateOnNewDocument((entries: Record<string, string>) => {
    try {
      for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
    } catch {
      /* navigation privée, l'app retombe sur ses valeurs par défaut */
    }
  }, seed);
}

/** Ajoute `?lang=` à une route, la seule façon fiable de choisir la langue. */
export function withLang(base: string, path: string, lang: Lang): string {
  const url = new URL(path, base);
  url.searchParams.set("lang", lang);
  return url.toString();
}

/**
 * Attend que l'app soit réellement à l'écran.
 *
 * La coquille de chargement tient au moins une foulée (src/main.tsx,
 * SHELL_HOLD_MS) puis s'efface en fondu : sans cette attente, une capture calée
 * sur un délai fixe photographie le splash. Les squelettes et le fondu d'entrée
 * des cartes coûtent la seconde qui suit.
 */
export async function waitForApp(page: Page, settleMs = 1200): Promise<void> {
  await page.waitForSelector("main", { timeout: 20_000 }).catch(() => {});
  await page
    .waitForFunction(
      () => {
        const shell = document.getElementById("loading-shell");
        return !shell || getComputedStyle(shell).visibility === "hidden";
      },
      { timeout: 10_000 },
    )
    .catch(() => {});
  await page
    .waitForFunction(() => document.querySelectorAll(".react-loading-skeleton").length === 0, {
      timeout: 8_000,
    })
    .catch(() => {});
  await page.evaluateHandle("document.fonts.ready");
  await new Promise((resolve) => setTimeout(resolve, settleMs));
}

/**
 * Retire ce qui reste : les toasts sonner, le bandeau d'installation, la bande
 * cookies. Ce sont des surfaces qu'un vrai visiteur ferme en une seconde et qui
 * datent la capture.
 *
 * Le filtre par texte garde une longueur maximale : sans elle, la remontée du
 * DOM finit par attraper un conteneur qui porte le bandeau ET la page, et la
 * capture sort blanche.
 */
export async function dismissOverlays(page: Page): Promise<void> {
  await page
    .evaluate(() => {
      document.querySelector("[data-sonner-toaster]")?.remove();
      const noise = /Install Zoned|Installer Zoned|cookie|Cookie/;
      for (const el of Array.from(document.querySelectorAll("div, section, aside"))) {
        const text = (el as HTMLElement).innerText || "";
        if (noise.test(text) && text.length < 400) el.remove();
      }
    })
    .catch(() => {});
}

/** Charge une route, attend l'app, ferme les surfaces jetables. */
export async function openSurface(
  page: Page,
  base: string,
  path: string,
  lang: Lang,
  settleMs?: number,
): Promise<void> {
  await page.goto(withLang(base, path, lang), { waitUntil: "networkidle0", timeout: 60_000 });
  await waitForApp(page, settleMs);
  await dismissOverlays(page);
}
