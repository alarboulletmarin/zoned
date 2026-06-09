/**
 * USAGE:
 *   bun run demo:gif              → records every scenario
 *   bun run demo:gif mobile plans → records a subset
 *
 * Records the README demo GIFs against the local dev server by driving the
 * app with Playwright (French UI, light theme, injected fake cursor with
 * eased movements). Each scenario is captured as .webm via recordVideo,
 * then converted to GIF with ffmpeg (two-pass palettegen/paletteuse). If a
 * GIF exceeds the size budget, it falls back to a lower fps / width.
 *
 * Scenarios (output in assets/):
 *   library      demo.gif              home → library → "Seuil" filter →
 *                                      workout → blocks → Export → Garmin FIT
 *   plans        demo-plans.gif        new plan → prebuilt → semi-marathon →
 *                                      stats → "Utiliser ce plan" → calendar
 *   calculators  demo-calculators.gif  calculators → VMA from race time →
 *                                      zones preview → save VMA
 *   mobile       demo-mobile.gif       390×844: menu → library → filter
 *                                      drawer → workout structure
 *
 * Requirements:
 *   - dev server running on http://localhost:5173 (`bun run dev`)
 *   - ffmpeg on PATH
 *   - chromium for Playwright (`bunx playwright install chromium`)
 *
 * Env:
 *   ZONED_BASE_URL        target another server (default http://localhost:5173)
 *   ZONED_DEMO_KEEP_WEBM  directory in which to also keep the intermediate .webm files
 *
 * Deterministic by construction: the workout/plan catalog is static data
 * shipped in the repo, language/theme/onboarding are pinned via localStorage
 * before any page script runs, and every request that doesn't target the
 * dev server is aborted.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync, mkdirSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, type Page } from "playwright";

const BASE_URL = process.env.ZONED_BASE_URL ?? "http://localhost:5173";
const ROOT = join(import.meta.dirname, "..");
const SIZE_BUDGET_BYTES = 8 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Preflight checks — fail fast with actionable messages.
// ---------------------------------------------------------------------------

async function assertDevServerUp(): Promise<void> {
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error(`✗ Dev server unreachable at ${BASE_URL} (${(err as Error).message})`);
    console.error("  Start it first with: bun run dev");
    process.exit(1);
  }
}

function assertFfmpeg(): void {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
  } catch {
    console.error("✗ ffmpeg not found on PATH — install it (e.g. apt install ffmpeg / brew install ffmpeg).");
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Fake cursor — a dark semi-transparent dot that follows the real mouse,
// with a press "pulse" on mousedown. Injected before every document loads
// so it survives full navigations.
// ---------------------------------------------------------------------------

const CURSOR_INIT_SCRIPT = `
(() => {
  const install = () => {
    if (document.getElementById("__demo-cursor")) return;
    const dot = document.createElement("div");
    dot.id = "__demo-cursor";
    dot.style.cssText = [
      "position: fixed",
      "top: 0",
      "left: 0",
      "width: 26px",
      "height: 26px",
      "margin: -13px 0 0 -13px",
      "border-radius: 50%",
      "background: rgba(15, 23, 42, 0.45)",
      "border: 2px solid rgba(255, 255, 255, 0.85)",
      "box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35)",
      "pointer-events: none",
      "z-index: 2147483647",
      "transform: translate(-200px, -200px) scale(1)",
      "transition: transform 40ms linear",
    ].join(";");
    document.documentElement.appendChild(dot);

    let x = -200, y = -200, pressed = false;
    const render = () => {
      dot.style.transform = "translate(" + x + "px," + y + "px) scale(" + (pressed ? 0.72 : 1) + ")";
    };
    document.addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; render(); }, true);
    document.addEventListener("mousedown", () => { pressed = true; render(); }, true);
    document.addEventListener("mouseup", () => { pressed = false; render(); }, true);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
})();
`;

// ---------------------------------------------------------------------------
// Natural mouse movement: eased (easeInOutCubic) interpolation between the
// current pointer position and the target, driven from Node so real
// mousemove events fire along the path (hover states included).
// ---------------------------------------------------------------------------

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

let pointer = { x: 0, y: 0 };

async function moveTo(page: Page, x: number, y: number, durationMs = 600): Promise<void> {
  const from = { ...pointer };
  // Wall-clock based: each mouse.move round-trip costs ~20-30 ms, so a
  // fixed-frame loop would run much slower than the requested duration.
  const start = Date.now();
  let elapsed = 0;
  while (elapsed < durationMs) {
    const t = easeInOutCubic(elapsed / durationMs);
    await page.mouse.move(from.x + (x - from.x) * t, from.y + (y - from.y) * t);
    await page.waitForTimeout(8);
    elapsed = Date.now() - start;
  }
  await page.mouse.move(x, y);
  pointer = { x, y };
}

async function moveToAndClick(
  page: Page,
  selector: string,
  opts: { durationMs?: number; settleMs?: number } = {},
): Promise<void> {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible", timeout: 10_000 });
  await locator.scrollIntoViewIfNeeded();

  // Lazily-mounted sections can shift the layout right after a SPA
  // navigation; wait until the target's bounding box stops moving.
  const center = async () => {
    const box = await locator.boundingBox();
    if (!box) throw new Error(`No bounding box for selector: ${selector}`);
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  };
  let target = await center();
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(100);
    const next = await center();
    const stable = Math.hypot(next.x - target.x, next.y - target.y) < 1;
    target = next;
    if (stable) break;
  }

  // The glide can hover the header nav and leave a dropdown panel open on
  // top of the target (the click would land on the panel). Hit-test the
  // click point and, if covered, park the cursor away so the panel closes,
  // then glide back.
  for (let attempt = 0; attempt < 3; attempt++) {
    await moveTo(page, target.x, target.y, opts.durationMs ?? 600);
    await page.waitForTimeout(opts.settleMs ?? 120);
    // Re-target in case the layout shifted during the glide.
    const final = await center();
    if (Math.hypot(final.x - target.x, final.y - target.y) >= 1) {
      target = final;
      await moveTo(page, final.x, final.y, 200);
    }
    const onTarget = await locator.evaluate((el, pt) => {
      const hit = document.elementFromPoint(pt.x, pt.y);
      return hit !== null && (el === hit || el.contains(hit) || hit.contains(el));
    }, target);
    if (onTarget) break;
    if (attempt === 2) throw new Error(`Click point for "${selector}" stays covered by another element`);
    // Dismiss whatever overlays the target (header dropdowns only close on
    // an outside click — the dismissing click is swallowed by the overlay).
    const vp = page.viewportSize() ?? { width: 1280, height: 800 };
    await moveTo(page, vp.width / 2, vp.height - 30, 350);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(500);
    target = await center();
  }

  await page.mouse.down();
  await page.waitForTimeout(90);
  await page.mouse.up();
}

/** Click into a field, then type at a human pace. */
async function typeInto(page: Page, selector: string, text: string): Promise<void> {
  await moveToAndClick(page, selector, { durationMs: 500 });
  await page.keyboard.type(text, { delay: 140 });
}

/** Smooth wheel scroll in small eased increments, so the capture looks human. */
async function smoothScroll(page: Page, totalPx: number, durationMs = 1200): Promise<void> {
  const start = Date.now();
  let done = 0;
  let elapsed = 0;
  while (elapsed < durationMs) {
    const target = Math.round(totalPx * easeInOutCubic(elapsed / durationMs));
    await page.mouse.wheel(0, target - done);
    done = target;
    await page.waitForTimeout(16);
    elapsed = Date.now() - start;
  }
  await page.mouse.wheel(0, totalPx - done);
}

const pause = (page: Page, ms: number) => page.waitForTimeout(ms);

/** Wait until the loading skeletons of the freshly-mounted page are gone. */
const settleSkeletons = (page: Page) =>
  page
    .waitForSelector(".react-loading-skeleton", { state: "detached", timeout: 5_000 })
    .catch(() => {});

// Workout cards — excludes the "create your own workout" CTA which also
// lives under /workout/.
const CARD_LINK = 'a[href^="/workout/"]:not([href*="builder"]):visible';

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

interface GifParams {
  fps: number;
  width: number;
}

interface Scenario {
  name: string;
  output: string;
  /** First page of the recording (default: home). */
  startPath?: string;
  viewport: { width: number; height: number };
  mobile?: boolean;
  gif: GifParams;
  gifFallback: GifParams;
  run(page: Page): Promise<void>;
}

const SCENARIOS: Scenario[] = [
  {
    name: "library",
    output: "demo.gif",
    viewport: { width: 1280, height: 800 },
    gif: { fps: 12, width: 960 },
    gifFallback: { fps: 10, width: 800 },
    async run(page) {
      // Home → library via the hero CTA (the header nav item opens a
      // dropdown on hover that would sit over the page after navigating).
      await moveToAndClick(page, 'a[data-slot="button"][href="/library"]:visible');
      await page.waitForURL("**/library**");
      await page.waitForSelector(CARD_LINK, { timeout: 10_000 });
      await settleSkeletons(page);
      await pause(page, 1000);

      // Filter on the "Seuil" (threshold) category. The filter panel is
      // rendered twice (hidden mobile drawer + desktop sidebar) — :visible
      // disambiguates.
      await moveToAndClick(page, 'button:text-is("Seuil"):visible');
      await page.waitForURL("**category=threshold**");
      await pause(page, 1000);

      // Open the first threshold workout
      await moveToAndClick(page, CARD_LINK);
      await page.waitForURL("**/workout/**");
      await page.waitForSelector('h2:has-text("Structure de la séance")', { timeout: 10_000 });
      await pause(page, 1000);

      // Scroll through the block structure
      const structureY = await page
        .locator('h2:has-text("Structure de la séance")')
        .first()
        .evaluate((el) => el.getBoundingClientRect().top);
      const scrollPx = Math.max(0, structureY - 140);
      await smoothScroll(page, scrollPx, 1200);
      await pause(page, 1000);

      // Export menu (scroll back up first; a scrollIntoView jump cut looks bad)
      await smoothScroll(page, -scrollPx, 600);
      await moveToAndClick(page, 'button:has-text("Exporter")');
      await page.waitForSelector('[role="menuitem"]', { timeout: 5_000 });
      await pause(page, 500);

      // Garmin FIT — hold on the transfer dialog, the closing shot.
      await moveToAndClick(page, '[role="menuitem"]:has-text("Garmin")', { durationMs: 500 });
      await page.waitForSelector('[role="dialog"]', { timeout: 5_000 }).catch(() => {});
      await pause(page, 1500);
    },
  },
  {
    name: "plans",
    output: "demo-plans.gif",
    startPath: "/plan/new",
    viewport: { width: 1280, height: 800 },
    gif: { fps: 12, width: 960 },
    gifFallback: { fps: 10, width: 800 },
    async run(page) {
      // Plan type choice → prebuilt plans
      await moveToAndClick(page, 'a[href="/plan/new/prebuilt"]:visible');
      await page.waitForURL("**/plan/new/prebuilt**");
      await settleSkeletons(page);
      await pause(page, 1000);

      // Open the semi-marathon plan
      await moveToAndClick(page, '[href="/plan/prebuilt/semi-marathon"]:visible');
      await page.waitForURL("**/plan/prebuilt/semi-marathon**");
      await page.waitForSelector('h1:has-text("Semi-marathon")', { timeout: 10_000 });
      await pause(page, 1000);

      // Scroll through phases + stats charts
      await smoothScroll(page, 760, 1300);
      await pause(page, 1100);
      await smoothScroll(page, -760, 600);

      // Adopt the plan → lands on the personal plan calendar
      await moveToAndClick(page, 'button:has-text("Utiliser ce plan")');
      await page.waitForURL("**/plan/**");
      await settleSkeletons(page);
      await pause(page, 1800);
    },
  },
  {
    name: "calculators",
    output: "demo-calculators.gif",
    startPath: "/calculators",
    viewport: { width: 1280, height: 800 },
    gif: { fps: 12, width: 960 },
    gifFallback: { fps: 10, width: 800 },
    async run(page) {
      // Calculators hub → VMA from a race time
      await moveToAndClick(page, 'main a[href="/calculators/vma"]:visible');
      await page.waitForURL("**/calculators/vma**");
      await page.waitForSelector("select#distance", { timeout: 10_000 });
      await pause(page, 900);

      // 10 km in 45:30 — zones table appears live while typing
      await moveToAndClick(page, "select#distance", { durationMs: 500 });
      await page.selectOption("select#distance", { label: "10 km" });
      await pause(page, 400);
      await typeInto(page, 'input[aria-label="Minutes"]', "45");
      await typeInto(page, 'input[aria-label="Secondes"]', "30");
      await pause(page, 800);

      // Show the estimated VMA + pace zones preview
      const zonesY = await page
        .locator('text="Aperçu des zones d\'allure"')
        .first()
        .evaluate((el) => el.getBoundingClientRect().top)
        .catch(() => 0);
      const scrollPx = Math.max(0, zonesY - 240);
      await smoothScroll(page, scrollPx, 1100);
      await pause(page, 1400);

      // Save it — closing shot on the confirmation toast
      await moveToAndClick(page, 'button:has-text("Utiliser cette VMA")');
      await pause(page, 1600);
    },
  },
  {
    name: "mobile",
    output: "demo-mobile.gif",
    viewport: { width: 390, height: 844 },
    mobile: true,
    gif: { fps: 12, width: 390 },
    gifFallback: { fps: 10, width: 320 },
    async run(page) {
      // Hamburger menu → library
      await moveToAndClick(page, 'button[aria-label="Menu"]');
      await page.waitForSelector('[data-slot="sheet-content"]', { timeout: 5_000 });
      await pause(page, 700); // sheet slide-in animation
      await moveToAndClick(page, '[data-slot="sheet-content"] a[href="/library"]');
      await page.waitForURL("**/library**");
      await page.waitForSelector(CARD_LINK, { timeout: 10_000 });
      await settleSkeletons(page);
      await pause(page, 1000);

      // Mobile filter drawer → "Seuil" → apply
      await moveToAndClick(page, 'button[aria-label="Filtres"]');
      await page.waitForSelector('[role="dialog"] button:text-is("Seuil")', { timeout: 5_000 });
      await pause(page, 600);
      await moveToAndClick(page, '[role="dialog"] button:text-is("Seuil")', { durationMs: 500 });
      await pause(page, 500);
      await moveToAndClick(page, '[role="dialog"] button:has-text("Appliquer")', { durationMs: 500 });
      await page.waitForURL("**category=threshold**");
      await pause(page, 1000);

      // Open the first threshold workout and walk to the block structure
      await moveToAndClick(page, CARD_LINK, { durationMs: 500 });
      await page.waitForURL("**/workout/**");
      await page.waitForSelector('h2:has-text("Structure de la séance")', { timeout: 10_000 });
      await pause(page, 1000);
      const structureY = await page
        .locator('h2:has-text("Structure de la séance")')
        .first()
        .evaluate((el) => el.getBoundingClientRect().top);
      await smoothScroll(page, Math.max(0, structureY - 90), 1500);
      await pause(page, 1600);
    },
  },
];

// ---------------------------------------------------------------------------
// Recording
// ---------------------------------------------------------------------------

interface Recording {
  webm: string;
  trimStartSec: number;
  wallTotalSec: number;
}

async function recordScenario(scenario: Scenario, videoDir: string): Promise<Recording> {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: scenario.viewport,
    deviceScaleFactor: 2,
    isMobile: scenario.mobile ?? false,
    hasTouch: scenario.mobile ?? false,
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    colorScheme: "light",
    recordVideo: { dir: videoDir, size: scenario.viewport },
  });

  // No external network: abort anything that doesn't target the dev server.
  const allowedOrigin = new URL(BASE_URL).origin;
  await context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.origin === allowedOrigin) return route.continue();
    return route.abort();
  });

  // Pin language/theme and silence first-run UI before any page script runs.
  await context.addInitScript(() => {
    try {
      localStorage.setItem("zoned-language", "fr");
      localStorage.setItem("i18nextLng", "fr");
      localStorage.setItem("zoned-theme", "light");
      localStorage.setItem("zoned-onboarding-seen", "true");
      // "Your data is stored locally" dialog on the first plan page.
      localStorage.setItem("zoned-storage-warning-seen", "true");
      // Page-level hint toasts (usePageHint) would pop over the recording.
      for (const hint of ["library", "plan-calendar", "draw", "workout-builder", "weekly"]) {
        localStorage.setItem(`zoned-hint-${hint}-seen`, "true");
      }
    } catch {}
  });
  await context.addInitScript(CURSOR_INIT_SCRIPT);

  // Wall-clock reference for the video: recording starts with the page.
  const recordingStart = Date.now();
  const page = await context.newPage();
  // Some scenarios trigger a real download (FIT export); accept and discard.
  page.on("download", (download) => void download.cancel().catch(() => {}));

  // Scenario entry point, fonts ready, cursor parked.
  await page.goto(BASE_URL + (scenario.startPath ?? "/"), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const park = { x: scenario.viewport.width / 2, y: scenario.viewport.height * 0.6 };
  await page.mouse.move(park.x, park.y);
  pointer = park;
  // Everything before this point (page load) is trimmed from the GIF.
  const trimStartSec = (Date.now() - recordingStart) / 1000;
  await pause(page, 1000);

  await scenario.run(page);

  // Recording stops at context.close(), so the video ends on the scenario's
  // closing shot — only the page-load lead-in needs trimming.
  const wallTotalSec = (Date.now() - recordingStart) / 1000;
  await context.close();
  const webm = await page.video()!.path();
  await browser.close();
  return { webm, trimStartSec, wallTotalSec };
}

// ---------------------------------------------------------------------------
// webm → GIF (two-pass palette for quality at small size)
// ---------------------------------------------------------------------------

function probeDurationSec(file: string): number {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { encoding: "utf8" },
  );
  return parseFloat(out.trim());
}

function convertToGif(
  webm: string,
  out: string,
  trimStartSec: number,
  videoScale: number,
  { fps, width }: GifParams,
): void {
  const palette = join(tmpdir(), `zoned-demo-palette-${process.pid}.png`);
  // setpts compensates the screencast clock drift so the GIF plays at the
  // pace the scenario actually ran.
  const filters = `setpts=PTS/${videoScale.toFixed(4)},fps=${fps},scale=${width}:-1:flags=lanczos`;
  const trim = trimStartSec > 0.05 ? ["-ss", trimStartSec.toFixed(2)] : [];
  execFileSync(
    "ffmpeg",
    [
      "-hide_banner", "-loglevel", "error",
      "-y", ...trim, "-i", webm,
      "-vf", `${filters},palettegen=stats_mode=diff`,
      "-update", "1", "-frames:v", "1",
      palette,
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
  execFileSync(
    "ffmpeg",
    [
      "-hide_banner", "-loglevel", "error",
      "-y", ...trim, "-i", webm, "-i", palette,
      "-lavfi", `${filters} [v]; [v][1:v] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`,
      "-loop", "0",
      out,
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
  rmSync(palette, { force: true });
}

// ---------------------------------------------------------------------------

async function main() {
  const requested = process.argv.slice(2);
  const unknown = requested.filter((n) => !SCENARIOS.some((s) => s.name === n));
  if (unknown.length > 0) {
    console.error(`✗ Unknown scenario(s): ${unknown.join(", ")}`);
    console.error(`  Available: ${SCENARIOS.map((s) => s.name).join(", ")}`);
    process.exit(1);
  }
  const selected =
    requested.length > 0 ? SCENARIOS.filter((s) => requested.includes(s.name)) : SCENARIOS;

  assertFfmpeg();
  await assertDevServerUp();
  mkdirSync(join(ROOT, "assets"), { recursive: true });

  for (const scenario of selected) {
    const videoDir = mkdtempSync(join(tmpdir(), "zoned-demo-"));
    try {
      console.log(`\n● ${scenario.name} → assets/${scenario.output}`);
      console.log(`  → Recording against ${BASE_URL} …`);
      const { webm, trimStartSec, wallTotalSec } = await recordScenario(scenario, videoDir);
      const keepDir = process.env.ZONED_DEMO_KEEP_WEBM;
      if (keepDir) {
        mkdirSync(keepDir, { recursive: true });
        copyFileSync(webm, join(keepDir, `${scenario.name}.webm`));
      }

      // The video clock drifts from the wall clock (frames are written as
      // the screencast delivers them), so scale the trim into video time.
      const videoScale = probeDurationSec(webm) / wallTotalSec;
      const scaledTrim = trimStartSec * videoScale;
      const outGif = join(ROOT, "assets", scenario.output);

      console.log(`  → Converting to GIF (fps=${scenario.gif.fps}, width=${scenario.gif.width}) …`);
      convertToGif(webm, outGif, scaledTrim, videoScale, scenario.gif);
      let size = statSync(outGif).size;

      if (size > SIZE_BUDGET_BYTES) {
        const fb = scenario.gifFallback;
        console.log(
          `    ${(size / 1024 / 1024).toFixed(1)} MB > 8 MB budget — retrying at fps=${fb.fps}, width=${fb.width}`,
        );
        convertToGif(webm, outGif, scaledTrim, videoScale, fb);
        size = statSync(outGif).size;
      }

      console.log(`  ✓ assets/${scenario.output} written (${(size / 1024 / 1024).toFixed(1)} MB)`);
    } finally {
      rmSync(videoDir, { recursive: true, force: true });
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
