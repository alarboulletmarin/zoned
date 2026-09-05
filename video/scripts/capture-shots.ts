/**
 * USAGE:
 *   bun run scripts/capture-shots.ts                          # French, from zoned.run
 *   bun run scripts/capture-shots.ts --lang en                # English
 *   bun run scripts/capture-shots.ts --lang all               # both, one pass each
 *   bun run scripts/capture-shots.ts library plans            # only those surfaces
 *   ZONED_BASE_URL=http://localhost:4173 bun run scripts/capture-shots.ts
 *
 * Captures the app screenshots the videos put on screen, into
 * public/shots/<lang>/.
 *
 * These are deliberately not the images in ../assets/: those are framed for the
 * README, while the films need a matching mobile crop for the 9:16 cut. Output
 * is gitignored — rerun this when the UI moves.
 *
 * Output per surface <id>:
 *   public/shots/<lang>/<id>-desktop.png   1440x900  @2x
 *   public/shots/<lang>/<id>-mobile.png     390x844  @3x
 *
 * The language directory is not cosmetic: both cuts read `shots/<lang>/…`, so
 * without it an English pass silently overwrites the French stills and the
 * French films come back with English screens in them.
 *
 * LANGUAGE COMES FROM THE URL. `?lang=en` is what the app actually reads —
 * `detection.order` in src/i18n/index.ts is `querystring, localStorage, htmlTag`
 * with `lookupQuerystring: "lang"`. The localStorage seed below is kept as a
 * belt-and-braces second source, but on its own it was never exercised in
 * English and the Accept-Language header alone does nothing at all, since
 * `navigator` is deliberately out of the detection chain.
 */

import { mkdirSync } from "fs";
import { join } from "path";
import puppeteer, { type Page } from "puppeteer";

const SHOTS = join(import.meta.dirname, "..", "public", "shots");
const BASE = process.env.ZONED_BASE_URL ?? "https://zoned.run";

type Lang = "fr" | "en";

const ACCEPT_LANGUAGE: Record<Lang, string> = {
  fr: "fr-FR,fr;q=0.9",
  en: "en-US,en;q=0.9",
};

type Surface = {
  id: string;
  url: string;
  /** Skip the phone crop for surfaces whose mobile layout does not render. */
  mobile?: boolean;
  /** Drive the page into a state worth filming before the shutter fires. */
  prepare?: (page: Page) => Promise<void>;
  /** Grant and fake geolocation for surfaces that ask where the runner is. */
  geolocation?: { latitude: number; longitude: number };
};

/**
 * Scrolls until the first element whose text matches sits near the top, then
 * lets the layout settle. Used to reach sections that live below the fold.
 */
async function scrollToText(page: Page, pattern: RegExp, offset = 120) {
  const found = await page.evaluate(
    (source: string, off: number) => {
      const re = new RegExp(source, "i");
      // Headings only, matched on their own text: searching every div matched a
      // wrapper near the top of the page and scrolled nowhere.
      const el = Array.from(document.querySelectorAll("h1, h2, h3")).find((n) =>
        re.test((n as HTMLElement).innerText?.trim() ?? ""),
      );
      if (!el) return false;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - off });
      return true;
    },
    pattern.source,
    offset,
  );
  await new Promise((r) => setTimeout(r, 900));
  return found;
}

/** Clicks the first button whose label matches, then waits for the result. */
async function clickByText(page: Page, pattern: RegExp, settleMs = 2500) {
  const clicked = await page.evaluate((source: string) => {
    const re = new RegExp(source);
    const button = Array.from(document.querySelectorAll("button")).find((b) =>
      re.test(b.textContent ?? ""),
    );
    if (!button || (button as HTMLButtonElement).disabled) return false;
    button.scrollIntoView({ block: "center" });
    (button as HTMLButtonElement).click();
    return true;
  }, pattern.source);

  if (!clicked) throw new Error(`no enabled button matching ${pattern}`);
  await new Promise((r) => setTimeout(r, settleMs));
  await page.evaluate(() => window.scrollTo(0, 0));
}

/**
 * Every label a surface is driven by, in both languages.
 *
 * These are the app's own strings, not guesses — `library.categories`,
 * `session.scienceMode`, `routes.form.*`, `simulator.*`. Two of them do not
 * translate the way you would assume: the VMA filter chip is labelled "VO2max"
 * in English, and the route button is "Generate route", not "Generate a route".
 * A regex that misses either fails the capture rather than producing a wrong
 * one, which is the good failure mode, but it still costs a run.
 */
const VMA_FILTER = /^(VMA|VO2max)$/;
const WHY_IT_WORKS = /^(Pourquoi ça marche|Why it works)$/i;
const ADJUST = /^(Ajuster|Adjust)$/;
const GENERATE_RACE_PLAN = /Générer mon plan|Generate my race plan/;
const USE_MY_LOCATION = /Utiliser ma position|Use my location/;
const GENERATE_ROUTE = /Générer un parcours|Generate route/;

const SURFACES: Surface[] = [
  { id: "home", url: "/" },
  {
    // Unfiltered and unscrolled, the library opens on its page title, a third
    // of the frame in empty filter chrome, and a first row of recovery jogs with
    // truncated names. Filtering to VMA and scrolling to the grid gives a wall
    // of real interval sessions, which is what "256 séances" is meant to feel
    // like.
    id: "library",
    url: "/library",
    prepare: async (page) => {
      await clickByText(page, VMA_FILTER, 1400);
      await page.evaluate(() => window.scrollTo({ top: 430 }));
      await new Promise((r) => setTimeout(r, 700));
    },
  },
  { id: "workout", url: "/workout/VMA-001" },
  { id: "plans", url: "/plan/new/prebuilt" },
  { id: "calculators", url: "/calculators" },
  { id: "zones", url: "/calculators/zones" },
  {
    // The empty form says nothing. Generate the plan so the shot shows the
    // km-by-km splits, which is the whole point of the simulator.
    id: "racesim",
    url: "/race-simulator",
    prepare: (page) => clickByText(page, GENERATE_RACE_PLAN),
  },
  {
    // An empty map contradicts the claim the film makes over it, so the shot is
    // of an actually generated loop. The phone layout renders blank headless,
    // so the film uses the desktop frame in both cuts.
    id: "routes",
    url: "/routes",
    mobile: false,
    geolocation: { latitude: 45.7578, longitude: 4.832 }, // Lyon
    prepare: async (page) => {
      await clickByText(page, USE_MY_LOCATION, 4000);
      await clickByText(page, GENERATE_ROUTE, 1000);
      // Routing goes out to a real service and takes about ten seconds. Waiting
      // for a path alone is not enough — the start marker is already one — so
      // wait for the button to leave its loading state as well.
      await page.waitForFunction(
        (source: string) => {
          const re = new RegExp(source);
          const button = Array.from(document.querySelectorAll("button")).find((b) =>
            re.test(b.textContent ?? ""),
          ) as HTMLButtonElement | undefined;
          const paths = document.querySelectorAll(".leaflet-overlay-pane path").length;
          return paths > 1 && button !== undefined && !button.disabled;
        },
        { timeout: 90_000, polling: 500 },
        GENERATE_ROUTE.source,
      );
      await new Promise((r) => setTimeout(r, 2500));
    },
  },
  { id: "draw", url: "/library/draw" },

  // Added for the substance pass: the science behind a session, the polarised
  // model as documented, the adjust panel, and the competitor comparison.
  {
    id: "science",
    url: "/workout/VMA-001",
    prepare: async (page) => {
      // The section is a collapsed accordion by default: scrolling to it without
      // opening it captures the block below instead.
      const opened = await page.evaluate((source: string) => {
        const re = new RegExp(source, "i");
        const heading = Array.from(document.querySelectorAll("h2")).find((h) =>
          re.test((h as HTMLElement).innerText.trim()),
        );
        if (!heading) return false;
        const trigger =
          heading.closest("button") ??
          heading.parentElement?.querySelector("button") ??
          (heading as HTMLElement);
        (trigger as HTMLElement).click();
        return true;
      }, WHY_IT_WORKS.source);
      if (!opened) throw new Error(`${WHY_IT_WORKS} not found on the workout page`);
      await new Promise((r) => setTimeout(r, 1200));
      await scrollToText(page, WHY_IT_WORKS, 40);
    },
  },
  { id: "methodology", url: "/methodology" },
  { id: "about", url: "/about" },
  {
    id: "adjust",
    url: "/workout/VMA-001",
    prepare: (page) => clickByText(page, ADJUST, 2000),
  },
];

/** Page hints are sonner toasts gated on localStorage — pre-seed them as seen. */
const HINT_KEYS = ["library", "draw", "workout-builder", "plan-calendar"];

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 3, mobile: true },
} as const;

/**
 * Removes the PWA install prompt and the cookie strip. Both are overlays the
 * real user dismisses in a second, and both would date the footage.
 */
async function dismissOverlays(page: Page) {
  await page
    .evaluate(() => {
      document.querySelector("[data-sonner-toaster]")?.remove();
      const noise = /Install Zoned|Installer Zoned|cookie|Cookie/;
      for (const el of Array.from(document.querySelectorAll("div, section, aside"))) {
        const txt = (el as HTMLElement).innerText || "";
        if (noise.test(txt) && txt.length < 400) el.remove();
      }
    })
    .catch(() => {});
}

async function capture(page: Page, surface: Surface, url: string, out: string, w: number, h: number) {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
  await page.waitForSelector("main", { timeout: 20_000 }).catch(() => {});
  await page.evaluateHandle("document.fonts.ready");
  // Let entrance animations settle: the app fades content up on mount and a
  // screenshot taken mid-transition shows half-opacity cards.
  await new Promise((r) => setTimeout(r, 1200));

  if (surface.prepare) await surface.prepare(page);

  await dismissOverlays(page);

  // `clip` is in document coordinates, not viewport ones — a surface that
  // scrolled itself into position would otherwise be captured from the top of
  // the page anyway, silently.
  const scrollY = await page.evaluate(() => window.scrollY);

  await page.screenshot({
    path: out,
    type: "png",
    clip: { x: 0, y: scrollY, width: w, height: h },
  });
}

/** `?lang=` is what actually selects the language — see the header comment. */
function surfaceUrl(path: string, lang: Lang) {
  const url = new URL(path, BASE);
  url.searchParams.set("lang", lang);
  return url.toString();
}

async function captureLang(
  browser: Awaited<ReturnType<typeof puppeteer.launch>>,
  lang: Lang,
  targets: Surface[],
) {
  const out = join(SHOTS, lang);
  mkdirSync(out, { recursive: true });
  console.log(`\n── ${lang.toUpperCase()} ──`);

  let failed = 0;

  for (const surface of targets) {
    for (const [kind, vp] of Object.entries(VIEWPORTS)) {
      if (kind === "mobile" && surface.mobile === false) continue;

      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({ "Accept-Language": ACCEPT_LANGUAGE[lang] });
      await page.setViewport(vp);

      if (surface.geolocation) {
        await browser
          .defaultBrowserContext()
          .overridePermissions(new URL(BASE).origin, ["geolocation"]);
        await page.setGeolocation(surface.geolocation);
      }
      await page.evaluateOnNewDocument(
        (locale: string, hints: string[]) => {
          try {
            localStorage.setItem("zoned-language", locale);
            localStorage.setItem("i18nextLng", locale);
            localStorage.setItem("zoned-theme", "light");
            for (const hint of hints) localStorage.setItem(`zoned-hint-${hint}-seen`, "true");
          } catch {
            /* private mode — the app falls back to its defaults */
          }
        },
        lang,
        HINT_KEYS,
      );

      const file = `${surface.id}-${kind}.png`;
      process.stdout.write(`→ ${surface.url}  (${kind}) `);
      try {
        await capture(page, surface, surfaceUrl(surface.url, lang), join(out, file), vp.width, vp.height);
        console.log(`✓ ${lang}/${file}`);
      } catch (err) {
        failed++;
        console.log(`✗ ${lang}/${file}: ${(err as Error).message}`);
      }
      await page.close();
    }
  }

  return failed;
}

async function main() {
  const argv = process.argv.slice(2);
  const langIndex = argv.indexOf("--lang");
  const langArg = langIndex === -1 ? "fr" : argv[langIndex + 1];
  // Same guard as render.ts: with the flag absent, `i !== langIndex + 1` is
  // `i !== 0` and the first surface name disappears without a word.
  const only = argv.filter(
    (a, i) => a !== "--lang" && (langIndex === -1 || i !== langIndex + 1),
  );

  const langs: Lang[] =
    langArg === "all" ? ["fr", "en"] : langArg === "en" ? ["en"] : ["fr"];
  if (!["fr", "en", "all"].includes(langArg ?? "")) {
    console.error(`Unknown language "${langArg}". Use fr, en or all.`);
    process.exit(1);
  }

  const targets = only.length ? SURFACES.filter((s) => only.includes(s.id)) : SURFACES;

  if (!targets.length) {
    console.error(`No surface matched ${only.join(", ")}.`);
    console.error(`Known: ${SURFACES.map((s) => s.id).join(", ")}`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let failed = 0;
  for (const lang of langs) failed += await captureLang(browser, lang, targets);

  await browser.close();
  console.log(`\nShots in ${SHOTS}/{${langs.join(",")}}`);
  // A missed capture leaves the previous run's file in place, so a silent
  // partial pass would render a film with a stale screen in it.
  if (failed) {
    console.error(`${failed} capture(s) failed.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
