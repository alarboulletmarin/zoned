/**
 * USAGE: bun run scripts/generate-og-image.ts
 *
 * Generates Zoned share cards (Wordmark direction) in two formats:
 *   - OG    1200×630 → public/og-image.png             (default OG referenced by SEOHead)
 *   - Square 1080×1080 → public/og-images/wordmark-square.png  (Instagram / LinkedIn carousel)
 *
 * Reads live app data (workouts, plans, calculators) to keep the subtitle accurate.
 * Design tokens sourced from the Claude Design handoff (variant A — "Scientific & Calm").
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import puppeteer from "puppeteer";

const ROOT = join(import.meta.dirname, "..");
const TEMPLATE_PATH = join(import.meta.dirname, "og-wordmark-template.html");

// --- Format configs (mirror share-cards.jsx `fmt` for ShareWordmarkCard) ---

type FormatConfig = {
  name: string;
  w: number;
  h: number;
  pxX: number;
  pxY: number;
  wordmarkSize: number;
  fs: number;
  sub: number;
  bulletNumFs: number;
  bulletFs: number;
  urlFs: number;
  metaFs: number;
  out: string;
};

// Sizes scale roughly with the story-ui-refonte.html reference (1080×1920 → headline 156, padding 96).
const FORMATS: FormatConfig[] = [
  {
    name: "og",
    w: 1200, h: 630,
    pxX: 72, pxY: 56,
    wordmarkSize: 36,
    fs: 88, sub: 22,
    bulletNumFs: 13, bulletFs: 44,
    urlFs: 28, metaFs: 13,
    out: "public/og-image.png",
  },
  {
    name: "square",
    w: 1080, h: 1080,
    pxX: 96, pxY: 96,
    wordmarkSize: 44,
    fs: 132, sub: 32,
    bulletNumFs: 16, bulletFs: 60,
    urlFs: 40, metaFs: 18,
    out: "public/og-images/wordmark-square.png",
  },
];

// --- Data collection ---
// Must mirror `useAppStats` (src/hooks/useAppStats.ts) so the OG image shows the
// same numbers users see on the About page: running + cycling + swimming + strength.

function countTemplatesInDir(dir: string): number {
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  let total = 0;
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(dir, file), "utf-8"));
    if (data.templates && Array.isArray(data.templates)) {
      total += data.templates.length;
    }
  }
  return total;
}

function countWorkouts(): number {
  // src/data/workouts/*.json holds running + cycling + swimming files; strength sessions live separately.
  const main = countTemplatesInDir(join(ROOT, "src/data/workouts"));
  const strength = countTemplatesInDir(join(ROOT, "src/data/strength/sessions"));
  return main + strength;
}

function countCalculators(): number {
  // Parse the CALCULATEURS array literal in CalculateursPage.tsx (single source of truth in-app).
  const src = readFileSync(join(ROOT, "src/pages/CalculateursPage.tsx"), "utf-8");
  const start = src.indexOf("export const CALCULATEURS");
  if (start === -1) throw new Error("CALCULATEURS array not found");
  const end = src.indexOf("\n];", start);
  if (end === -1) throw new Error("CALCULATEURS array terminator not found");
  const slice = src.slice(start, end);
  const matches = slice.match(/^\s+id:\s/gm);
  return matches ? matches.length : 0;
}

function countPlans(): number {
  const dir = join(ROOT, "src/data/prebuilt-plans/plans");
  return readdirSync(dir).filter((f) => f.endsWith(".ts")).length;
}

// --- Template rendering ---

function buildHtml(fmt: FormatConfig, stats: { workouts: number; plans: number; calculators: number }): string {
  let html = readFileSync(TEMPLATE_PATH, "utf-8");

  const subs: Record<string, string | number> = {
    W: fmt.w,
    H: fmt.h,
    PX_X: fmt.pxX,
    PX_Y: fmt.pxY,
    WORDMARK_SIZE: fmt.wordmarkSize,
    FS: fmt.fs,
    SUB: fmt.sub,
    BULLET_NUM_FS: fmt.bulletNumFs,
    BULLET_FS: fmt.bulletFs,
    URL_FS: fmt.urlFs,
    META_FS: fmt.metaFs,
    WORKOUT_COUNT: stats.workouts,
    PLAN_COUNT: stats.plans,
    CALCULATOR_COUNT: stats.calculators,
  };

  for (const [key, val] of Object.entries(subs)) {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(val));
  }
  return html;
}

// --- Screenshot ---

async function captureOne(browser: import("puppeteer").Browser, fmt: FormatConfig, html: string): Promise<Buffer> {
  const page = await browser.newPage();
  await page.setViewport({ width: fmt.w, height: fmt.h, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 15000 });

  const screenshot = await page.screenshot({
    type: "png",
    clip: { x: 0, y: 0, width: fmt.w, height: fmt.h },
  });
  await page.close();
  return Buffer.from(screenshot);
}

// --- Main ---

async function main() {
  console.log("Generating Zoned share cards (Wordmark direction)...");

  const stats = {
    workouts: countWorkouts(),
    plans: countPlans(),
    calculators: countCalculators(),
  };
  console.log("Stats:", stats);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    for (const fmt of FORMATS) {
      const html = buildHtml(fmt, stats);
      const png = await captureOne(browser, fmt, html);
      const outPath = join(ROOT, fmt.out);
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, png);
      console.log(`  ${fmt.name.padEnd(8)} ${fmt.w}×${fmt.h} → ${fmt.out}`);
    }
  } finally {
    await browser.close();
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Failed to generate share cards:", err);
  process.exit(1);
});
