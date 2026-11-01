/**
 * USAGE: bun run scripts/prerender-routes.ts
 *        bun run scripts/prerender-routes.ts --only /workout/ASS-001
 *
 * HTML statique de chaque URL du sitemap, francais et anglais, puis
 * hydratation cote client. Pas de serveur au runtime : les fichiers
 * anglais vivent sous dist/_en et Vercel les sert pour ?lang=en.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const SSR_ENTRY = join(ROOT, "dist-ssr/entry-server.js");
const SITEMAP = join(ROOT, "public/sitemap.xml");

const onlyArg = process.argv.indexOf("--only");
const ONLY = onlyArg >= 0 ? process.argv[onlyArg + 1] : undefined;

installDomShim();

function installDomShim(): void {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
  };

  const element = () => {
    const node: Record<string, unknown> = {
      style: {},
      dataset: {},
      classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
      children: [],
      childNodes: [],
      setAttribute() {},
      getAttribute: () => null,
      removeAttribute() {},
      addEventListener() {},
      removeEventListener() {},
      appendChild(child: unknown) { return child; },
      removeChild(child: unknown) { return child; },
      querySelector: () => null,
      querySelectorAll: () => [],
      getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0 }),
      focus() {},
      click() {},
    };
    return node;
  };

  const documentElement = element();
  documentElement.lang = "fr";

  const document = {
    documentElement,
    body: element(),
    head: element(),
    cookie: "",
    visibilityState: "visible",
    readyState: "complete",
    createElement: () => element(),
    createElementNS: () => element(),
    createTextNode: (text: string) => ({ nodeType: 3, textContent: text }),
    getElementById: () => null,
    getElementsByTagName: () => [],
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    removeEventListener() {},
  };

  const window = {
    document,
    localStorage,
    sessionStorage: localStorage,
    navigator: {
      language: "fr-FR",
      languages: ["fr-FR"],
      userAgent: "zoned-prerender",
      onLine: true,
      platform: "Linux",
      maxTouchPoints: 0,
    },
    location: {
      pathname: "/",
      search: "",
      hash: "",
      href: "https://zoned.run/",
      origin: "https://zoned.run",
    },
    history: { length: 1, pushState() {}, replaceState() {}, state: null },
    matchMedia: () => ({
      matches: false,
      media: "",
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    }),
    addEventListener() {},
    removeEventListener() {},
    scrollTo() {},
    requestAnimationFrame: (cb: (t: number) => void) => setTimeout(() => cb(0), 0),
    cancelAnimationFrame: (id: number) => clearTimeout(id),
    getComputedStyle: () => ({ getPropertyValue: () => "" }),
    innerWidth: 1280,
    innerHeight: 800,
    devicePixelRatio: 1,
    pageYOffset: 0,
    scrollY: 0,
  };

  const g = globalThis as Record<string, unknown>;
  g.window = window;
  g.document = document;
  g.localStorage = localStorage;
  g.sessionStorage = localStorage;
  g.navigator = window.navigator;
  if (typeof g.HTMLElement === "undefined") g.HTMLElement = class HTMLElement {};
  if (typeof g.Element === "undefined") g.Element = class Element {};
  if (typeof g.Node === "undefined") g.Node = class Node {};
  if (typeof g.SVGElement === "undefined") g.SVGElement = class SVGElement {};
}

function pathsFromSitemap(): string[] {
  const xml = readFileSync(SITEMAP, "utf-8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    const raw = match[1].replace("https://zoned.run", "").split("?")[0];
    return raw === "" ? "/" : raw;
  });
  const unique = [...new Set(locs)];
  if (!ONLY) return unique;
  const wanted = ONLY.startsWith("/") ? ONLY : `/${ONLY}`;
  return unique.filter((path) => path === wanted);
}

function shellPath(pathname: string, lang: "fr" | "en"): string {
  if (lang === "fr") {
    return pathname === "/" ? join(DIST, "index.html") : join(DIST, `${pathname.slice(1)}.html`);
  }
  return pathname === "/" ? join(DIST, "_en.html") : join(DIST, "_en", `${pathname.slice(1)}.html`);
}

function splitPrelude(html: string): { head: string; body: string } {
  const marker = html.search(/<a\b[^>]*class="zn-skip"/);
  if (marker === -1) return { head: "", body: html };
  return { head: html.slice(0, marker), body: html.slice(marker) };
}

function stripDefaultSeo(html: string): string {
  return html
    .replace(/<title\b[^>]*\bdata-default-seo\b[^>]*>[\s\S]*?<\/title>\s*/g, "")
    .replace(/<script\b[^>]*\bdata-default-seo\b[^>]*>[\s\S]*?<\/script>\s*/g, "")
    .replace(/<(?:meta|link)\b[^>]*\bdata-default-seo\b[^>]*\/?>\s*/g, "");
}

function removeLoadingShell(html: string): string {
  const start = html.indexOf('<div id="loading-shell"');
  if (start === -1) return html;
  let index = start;
  let depth = 0;
  while (index < html.length) {
    if (html.startsWith("<div", index)) {
      depth += 1;
      index += 4;
      continue;
    }
    if (html.startsWith("</div>", index)) {
      depth -= 1;
      index += 6;
      if (depth === 0) return html.slice(0, start) + html.slice(index);
      continue;
    }
    index += 1;
  }
  return html;
}

const EN_GUARD = `<script>
(function () {
  var path = location.pathname;
  if (path === "/_en" || path.indexOf("/_en/") === 0) {
    var rest = path === "/_en" ? "/" : path.slice(4);
    var search = location.search ? location.search + "&" : "?";
    location.replace(rest + search + "lang=en");
  }
})();
</script>`;

function applyRender(shell: string, rendered: string, pathname: string, lang: "fr" | "en"): string {
  const { head, body } = splitPrelude(rendered);
  const hoisted = head.replace(/hrefLang=/g, "hreflang=");
  let html = stripDefaultSeo(shell);
  html = html.replace(
    /<html\b[^>]*>/,
    `<html lang="${lang}" data-prerender-path="${pathname}" data-prerender-lang="${lang}">`,
  );
  if (!html.includes('id="root"')) {
    throw new Error(`Pas de #root dans la coquille de ${pathname}`);
  }
  html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  const headInsert = `${lang === "en" ? EN_GUARD : ""}${hoisted}`;
  html = html.replace("</head>", `${headInsert}</head>`);
  if (!(pathname === "/" && lang === "fr")) html = removeLoadingShell(html);
  return html;
}

async function main(): Promise<void> {
  if (!existsSync(join(DIST, "index.html"))) {
    console.error("dist/index.html est absent. Lancer vite build d'abord.");
    process.exit(1);
  }
  if (!existsSync(SITEMAP)) {
    console.error("public/sitemap.xml est absent.");
    process.exit(1);
  }

  if (process.env.SKIP_SSR_BUILD !== "1" || !existsSync(SSR_ENTRY)) {
    const built = spawnSync("bun", ["x", "vite", "build", "--config", "vite.ssr.config.ts"], {
      cwd: ROOT,
      stdio: "inherit",
    });
    if (built.status !== 0) process.exit(built.status ?? 1);
  }

  const { renderRoute } = await import(SSR_ENTRY);
  const paths = pathsFromSitemap();
  if (paths.length === 0) {
    console.error(ONLY ? `Route absente du sitemap : ${ONLY}` : "Sitemap vide.");
    process.exit(1);
  }

  console.log(`Prerendu de ${paths.length} routes, deux langues.`);
  const shells = new Map<string, string>();
  for (const pathname of paths) {
    const file = shellPath(pathname, "fr");
    if (!existsSync(file)) {
      console.error(`Coquille absente : ${pathname}`);
      process.exit(1);
    }
    shells.set(pathname, readFileSync(file, "utf-8"));
  }
  const langs = ["fr", "en"] as const;
  const failures: string[] = [];
  let done = 0;

  for (const lang of langs) {
    for (const pathname of paths) {
      try {
        const rendered = await renderRoute(pathname, lang);
        const shell = shells.get(pathname);
        if (!shell) {
          failures.push(`${lang} ${pathname} : coquille FR absente`);
          continue;
        }
        const html = applyRender(shell, rendered, pathname, lang);
        if (!/<h1[\s>]/i.test(html)) failures.push(`${lang} ${pathname} : pas de h1`);
        if (!/<a\s[^>]*href="/i.test(html)) failures.push(`${lang} ${pathname} : pas de lien`);
        const out = shellPath(pathname, lang);
        mkdirSync(dirname(out), { recursive: true });
        writeFileSync(out, html);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(`${lang} ${pathname} : ${message}`);
      }
      done += 1;
      if (done % 25 === 0 || done === paths.length * 2) {
        console.log(`  ${done}/${paths.length * 2}`);
      }
    }
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} route(s) en echec :`);
    for (const line of failures.slice(0, 40)) console.error(`  ${line}`);
    process.exit(1);
  }
  console.log(`HTML pret pour ${paths.length * 2} documents.`);
}

await main();
