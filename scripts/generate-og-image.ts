/**
 * USAGE: bun run scripts/generate-og-image.ts
 *
 * Generates Zoned share cards (Wordmark direction):
 *   - public/og-image.png              1200×630  — site-wide card, referenced by index.html
 *   - public/og-<section>.png          1200×630  — one per key section, referenced by
 *                                                  scripts/generate-route-meta.ts
 *   - public/og-images/wordmark-square.png  1080×1080 — Instagram / LinkedIn carousel
 *
 * Copy is English: these cards are what social crawlers serve to link previews,
 * and the audience there is predominantly English-speaking. Headline numbers are
 * read from the live catalogue (scripts/site-stats.ts) so they can never drift.
 *
 * Design tokens sourced from the Claude Design handoff (variant A — "Scientific & Calm").
 */

import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { dirname, join } from "path";
import puppeteer from "puppeteer";
import { readSiteStats } from "./site-stats";

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
};

// Sizes scale roughly with the story-ui-refonte.html reference (1080×1920 → headline 156, padding 96).
const OG: FormatConfig = {
  name: "og",
  w: 1200, h: 630,
  pxX: 72, pxY: 56,
  wordmarkSize: 36,
  fs: 88, sub: 22,
  bulletNumFs: 13, bulletFs: 44,
  urlFs: 28, metaFs: 13,
};

const SQUARE: FormatConfig = {
  name: "square",
  w: 1080, h: 1080,
  pxX: 96, pxY: 96,
  wordmarkSize: 44,
  fs: 132, sub: 32,
  bulletNumFs: 16, bulletFs: 60,
  urlFs: 40, metaFs: 18,
};

// --- Card copy -------------------------------------------------------------

type Bullet = { value: string; label: string };

type Card = {
  /** Output path relative to the repo root. */
  out: string;
  /** Headline may contain <em> (accent italic) and <br />. */
  headline: string;
  subline: string;
  bullets: [Bullet, Bullet, Bullet];
  footer?: string;
};

const DEFAULT_FOOTER = "Free.&nbsp; No account.&nbsp; No tracking.&nbsp; Forever.";

function buildCards(stats: ReturnType<typeof readSiteStats>): Card[] {
  const { workouts, plans, calculators } = stats;

  return [
    {
      out: "public/og-image.png",
      headline: "Structured training,<br /><em>without</em> the noise.",
      subline: "Science-based endurance training. Everything stays in your browser.",
      bullets: [
        { value: String(workouts), label: "Workouts" },
        { value: String(plans), label: "Plans 5K &rarr; marathon" },
        { value: String(calculators), label: "Calculators" },
      ],
    },
    {
      out: "public/og-library.png",
      headline: "Every session,<br /><em>filtered</em> your way.",
      subline:
        "Run, bike, swim and strength sessions across 12 categories — with exports to Garmin, PDF and calendar.",
      bullets: [
        { value: String(workouts), label: "Workouts" },
        { value: "12", label: "Categories" },
        { value: "6", label: "Training zones" },
      ],
    },
    {
      out: "public/og-calculators.png",
      headline: "Know your <em>numbers</em>,<br />not your guesses.",
      subline: "Zones, paces, VMA, FTP, CSS and race equivalences — computed in your browser.",
      bullets: [
        { value: String(calculators), label: "Calculators" },
        { value: "0", label: "Accounts needed" },
        { value: "&infin;", label: "Free, forever" },
      ],
    },
    {
      out: "public/og-plans.png",
      headline: "A plan that bends<br />when <em>life</em> does.",
      subline:
        "Prebuilt or generated plans from 5K to marathon, with periodized strength and one-click rescheduling.",
      bullets: [
        { value: String(plans), label: "Prebuilt plans" },
        { value: "4", label: "View modes" },
        { value: "5K&ndash;42K", label: "Race distances" },
      ],
    },
    {
      out: "public/og-learn.png",
      headline: "The <em>why</em> behind<br />every session.",
      subline:
        "Articles, guides and a glossary grounded in published research — Seiler, Billat, Daniels, Coggan.",
      bullets: [
        { value: "12", label: "Articles" },
        { value: "50+", label: "Glossary terms" },
        { value: "3", label: "Practical guides" },
      ],
    },
    {
      out: "public/og-race-simulator.png",
      headline: "Race day,<br /><em>rehearsed</em>.",
      subline:
        "Km-by-km pacing, fueling and hydration timing, plus the checklists for the week before.",
      bullets: [
        { value: "1 km", label: "Split precision" },
        { value: "3", label: "Checklists" },
        { value: "PDF", label: "Export" },
      ],
    },
  ];
}

// --- Template rendering ---

function buildHtml(fmt: FormatConfig, card: Card): string {
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
    HEADLINE: card.headline,
    SUBLINE: card.subline,
    B1_VALUE: card.bullets[0].value,
    B1_LABEL: card.bullets[0].label,
    B2_VALUE: card.bullets[1].value,
    B2_LABEL: card.bullets[1].label,
    B3_VALUE: card.bullets[2].value,
    B3_LABEL: card.bullets[2].label,
    FOOTER: card.footer ?? DEFAULT_FOOTER,
  };

  for (const [key, val] of Object.entries(subs)) {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(val));
  }
  return html;
}

// --- Screenshot ---

async function captureOne(
  browser: import("puppeteer").Browser,
  fmt: FormatConfig,
  html: string
): Promise<Buffer> {
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

async function render(
  browser: import("puppeteer").Browser,
  fmt: FormatConfig,
  card: Card,
  out: string
) {
  const png = await captureOne(browser, fmt, buildHtml(fmt, card));
  const outPath = join(ROOT, out);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, png);
  console.log(`  ${String(fmt.w).padStart(4)}×${String(fmt.h).padEnd(4)} → ${out}`);
}

// --- Main ---

async function main() {
  console.log("Generating Zoned share cards (Wordmark direction)...");

  const stats = readSiteStats();
  console.log("Stats:", stats);

  const cards = buildCards(stats);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    for (const card of cards) {
      await render(browser, OG, card, card.out);
    }
    // Square variant of the site-wide card only — used for Instagram / LinkedIn.
    await render(browser, SQUARE, cards[0], "public/og-images/wordmark-square.png");
  } finally {
    await browser.close();
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Failed to generate share cards:", err);
  process.exit(1);
});
