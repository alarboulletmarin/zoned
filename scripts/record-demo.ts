/**
 * USAGE: bun run demo:gif   (alias for: bun run scripts/record-demo.ts)
 *
 * Records the README demo GIF against the local dev server. The scenario
 * (~12 s, French UI, light theme) walks through: home → library → "Seuil"
 * filter → workout detail → block structure scroll → Export → Garmin FIT.
 *
 * The session is captured as .webm via Playwright's recordVideo, then
 * converted to GIF with ffmpeg (two-pass palettegen/paletteuse). If the
 * GIF exceeds the size budget, it falls back to a lower fps / width.
 *
 * Requirements:
 *   - dev server running on http://localhost:5173 (`bun run dev`)
 *   - ffmpeg on PATH
 *   - chromium for Playwright (`bunx playwright install chromium`)
 *
 * Env:
 *   ZONED_BASE_URL        target another server (default http://localhost:5173)
 *   ZONED_DEMO_KEEP_WEBM  path to also keep the intermediate .webm
 *
 * Deterministic by construction: the workout catalog is static JSON shipped
 * in the repo, language/theme/onboarding are pinned via localStorage before
 * any page script runs, and every request that doesn't target the dev
 * server is aborted.
 *
 * Output (overwrites): assets/demo.gif
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync, mkdirSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, type Page } from "playwright";

const BASE_URL = process.env.ZONED_BASE_URL ?? "http://localhost:5173";
const ROOT = join(import.meta.dirname, "..");
const OUT_GIF = join(ROOT, "assets", "demo.gif");

const VIEWPORT = { width: 1280, height: 800 };
const SIZE_BUDGET_BYTES = 8 * 1024 * 1024;
const PRIMARY = { fps: 12, width: 960 };
const FALLBACK = { fps: 10, width: 800 };

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

async function moveTo(page: Page, x: number, y: number, durationMs = 700): Promise<void> {
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
    await moveTo(page, VIEWPORT.width / 2, VIEWPORT.height - 30, 350);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(500);
    target = await center();
  }

  await page.mouse.down();
  await page.waitForTimeout(90);
  await page.mouse.up();
}

/** Smooth wheel scroll in small eased increments, so the capture looks human. */
async function smoothScroll(page: Page, totalPx: number, durationMs = 1400): Promise<void> {
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

// Workout cards — excludes the "create your own workout" CTA which also
// lives under /workout/.
const CARD_LINK = 'a[href^="/workout/"]:not([href*="builder"]):visible';

// ---------------------------------------------------------------------------
// Scenario
// ---------------------------------------------------------------------------

interface Recording {
  webm: string;
  trimStartSec: number;
  wallTotalSec: number;
}

async function recordScenario(videoDir: string): Promise<Recording> {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    colorScheme: "light",
    recordVideo: { dir: videoDir, size: VIEWPORT },
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
      localStorage.setItem("zoned-storage-warning-dismissed", "true");
      // Page-level hint toasts (usePageHint) would pop over the recording.
      for (const hint of ["library", "plan-calendar", "draw", "workout-builder"]) {
        localStorage.setItem(`zoned-hint-${hint}-seen`, "true");
      }
    } catch {}
  });
  await context.addInitScript(CURSOR_INIT_SCRIPT);

  // Wall-clock reference for the video: recording starts with the page.
  const recordingStart = Date.now();
  const page = await context.newPage();
  // Garmin FIT export triggers a real download; accept and discard it.
  page.on("download", (download) => void download.cancel().catch(() => {}));
  const step = (label: string) =>
    console.log(`  [${((Date.now() - recordingStart) / 1000).toFixed(1)}s] ${label}`);

  step("step 1: home");
  // 1 — Home
  await page.goto(BASE_URL + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height * 0.6);
  pointer = { x: VIEWPORT.width / 2, y: VIEWPORT.height * 0.6 };
  // Everything before this point (page load) is trimmed from the GIF.
  const trimStartSec = (Date.now() - recordingStart) / 1000;
  await pause(page, 1000);

  step("step 2: library nav");
  // 2 — Library, via the hero CTA (the header nav item opens a dropdown on
  // hover that would sit over the page after navigating).
  await moveToAndClick(page, 'a[data-slot="button"][href="/library"]:visible');
  await page.waitForURL("**/library**");
  await page.waitForSelector(CARD_LINK, { timeout: 10_000 });
  // Don't hold the "key screen" pause on skeleton cards.
  await page
    .waitForSelector(".react-loading-skeleton", { state: "detached", timeout: 5_000 })
    .catch(() => {});
  await pause(page, 1000);

  step("step 3: seuil filter");
  // 3 — Filter on the "Seuil" (threshold) category
  // The filter panel is rendered twice (hidden mobile drawer + desktop
  // sidebar) — :visible disambiguates.
  await moveToAndClick(page, 'button:text-is("Seuil"):visible');
  await page.waitForURL("**category=threshold**");
  await pause(page, 1000);

  step("step 4: open workout");
  // 4 — Open the first threshold workout
  await moveToAndClick(page, CARD_LINK);
  await page.waitForURL("**/workout/**");
  await page.waitForSelector('h2:has-text("Structure de la séance")', { timeout: 10_000 });
  await pause(page, 1000);

  step("step 5: scroll structure");
  // 5 — Scroll through the block structure
  const structureY = await page
    .locator('h2:has-text("Structure de la séance")')
    .first()
    .evaluate((el) => el.getBoundingClientRect().top);
  const scrollPx = Math.max(0, structureY - 140);
  await smoothScroll(page, scrollPx, 1200);
  await pause(page, 1000);

  step("step 6: export menu");
  // 6 — Export menu (scroll back up first; a scrollIntoView jump cut looks bad)
  await smoothScroll(page, -scrollPx, 600);
  await moveToAndClick(page, 'button:has-text("Exporter")');
  await page.waitForSelector('[role="menuitem"]', { timeout: 5_000 });
  await pause(page, 500);

  step("step 7: garmin fit");
  // 7 — Garmin FIT
  await moveToAndClick(page, '[role="menuitem"]:has-text("Garmin")', { durationMs: 500 });
  // Hold on the FIT transfer dialog — the closing shot.
  await page.waitForSelector('[role="dialog"]', { timeout: 5_000 }).catch(() => {});
  await pause(page, 1500);

  // Recording stops at context.close(), so the video ends on the dialog
  // hold above — only the page-load lead-in needs trimming.
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
  { fps, width }: { fps: number; width: number },
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
  assertFfmpeg();
  await assertDevServerUp();
  mkdirSync(join(ROOT, "assets"), { recursive: true });

  const videoDir = mkdtempSync(join(tmpdir(), "zoned-demo-"));
  try {
    console.log(`→ Recording scenario against ${BASE_URL} …`);
    const { webm, trimStartSec, wallTotalSec } = await recordScenario(videoDir);
    const keepWebm = process.env.ZONED_DEMO_KEEP_WEBM;
    if (keepWebm) copyFileSync(webm, keepWebm);

    // The video clock drifts from the wall clock (frames are written as the
    // screencast delivers them), so scale the trim point into video time.
    const videoScale = probeDurationSec(webm) / wallTotalSec;
    const scaledTrim = trimStartSec * videoScale;

    console.log(`→ Converting to GIF (fps=${PRIMARY.fps}, width=${PRIMARY.width}) …`);
    convertToGif(webm, OUT_GIF, scaledTrim, videoScale, PRIMARY);
    let size = statSync(OUT_GIF).size;

    if (size > SIZE_BUDGET_BYTES) {
      console.log(
        `  ${(size / 1024 / 1024).toFixed(1)} MB > 8 MB budget — retrying at fps=${FALLBACK.fps}, width=${FALLBACK.width}`,
      );
      convertToGif(webm, OUT_GIF, scaledTrim, videoScale, FALLBACK);
      size = statSync(OUT_GIF).size;
    }

    console.log(`✓ assets/demo.gif written (${(size / 1024 / 1024).toFixed(1)} MB)`);
  } finally {
    rmSync(videoDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
