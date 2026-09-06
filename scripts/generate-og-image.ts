/**
 * USAGE: bun run scripts/generate-og-image.ts
 *
 * Generates the Zoned share cards:
 *   - public/og-image.png                   1200×630  — site-wide card, referenced by index.html
 *   - public/og-<section>.png               1200×630  — one per key section, referenced by
 *                                                       scripts/generate-route-meta.ts
 *   - public/og-images/wordmark-square.png  1080×1080 — Instagram / LinkedIn
 *
 * scripts/generate-readme-banner.ts reuses the pieces exported below for the
 * README banner (the site card, recomposed in 1280×400) — hence the
 * `import.meta.main` guard at the bottom.
 *
 * Copy is English: these cards are what social crawlers serve to link previews,
 * and the audience there is predominantly English-speaking. Headline numbers are
 * read from the live catalogue (scripts/site-stats.ts) so they can never drift.
 *
 * Composition (docs/doodles.md, « le sol est la règle de la page »): the
 * wordmark, one lede, three numbers with their labels, and the approved duo of
 * runners — all standing on the one rule. The duo is the drawing itself,
 * src/assets/doodles/runners-duo.svg, injected untouched; the tokens are the
 * paper, ink and vermillon of src/styles/design/colors.css; the fonts are the
 * self-hosted woff2s of public/fonts, embedded so the headless page needs no
 * server. Every card is 1200×630 or larger, so every card has room for the duo.
 */

import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { dirname, join } from "path";
import puppeteer from "puppeteer";
import { readSiteStats } from "./site-stats";

const ROOT = join(import.meta.dirname, "..");
const TEMPLATE_PATH = join(import.meta.dirname, "og-wordmark-template.html");
const DUO_PATH = join(ROOT, "src/assets/doodles/runners-duo.svg");

// --- Format configs ---------------------------------------------------------

export type FormatConfig = {
  name: string;
  w: number;
  h: number;
  /** Horizontal padding, top padding, bottom padding. */
  pxX: number;
  pxTop: number;
  pxBottom: number;
  wordmarkFs: number;
  ledeFs: number;
  /** Max width of the lede, in ch. */
  ledeMax: number;
  valueFs: number;
  labelFs: number;
  metaFs: number;
  /** Gap between the three numbers. */
  statGap: number;
  /** Rendered width of the duo; its height follows the viewBox. */
  duoW: number;
  /** Thickness of the rule everything stands on. */
  rule: number;
};

// The longest stats row (learn: "Practical guides") must fit beside the duo:
// 1200 − 2×72 − 500 − 40 = 516px for the copy column at these sizes.
const OG: FormatConfig = {
  name: "og",
  w: 1200, h: 630,
  pxX: 72, pxTop: 56, pxBottom: 44,
  wordmarkFs: 96,
  ledeFs: 30, ledeMax: 24,
  valueFs: 72, labelFs: 14, metaFs: 16,
  statGap: 40,
  duoW: 500, rule: 2,
};

// Square: the copy column is only 440px wide next to the duo, so the numbers
// shrink a notch rather than the figure.
const SQUARE: FormatConfig = {
  name: "square",
  w: 1080, h: 1080,
  pxX: 80, pxTop: 80, pxBottom: 64,
  wordmarkFs: 96,
  ledeFs: 34, ledeMax: 22,
  valueFs: 80, labelFs: 16, metaFs: 16,
  statGap: 44,
  duoW: 440, rule: 2,
};

// --- Card copy -------------------------------------------------------------

type Stat = { value: string; label: string };

export type Card = {
  /** Output path relative to the repo root. */
  out: string;
  /** One sentence or two; wraps to three lines at most at `ledeMax`. */
  lede: string;
  stats: [Stat, Stat, Stat];
};

const FOOTER = "open source &middot; MIT";

export function buildCards(stats: ReturnType<typeof readSiteStats>): Card[] {
  const { workouts, plans, calculators } = stats;

  return [
    {
      out: "public/og-image.png",
      lede: "Endurance training, explained by the science. Free, no account.",
      stats: [
        { value: String(workouts), label: "Workouts" },
        { value: String(plans), label: "Plans" },
        { value: String(calculators), label: "Calculators" },
      ],
    },
    {
      out: "public/og-library.png",
      lede: "Every session, filtered your way. Run, bike, swim and strength.",
      stats: [
        { value: String(workouts), label: "Workouts" },
        { value: "12", label: "Categories" },
        { value: "6", label: "Training zones" },
      ],
    },
    {
      out: "public/og-calculators.png",
      lede: "Know your numbers, not your guesses. Zones, paces, VMA, FTP, CSS.",
      stats: [
        { value: String(calculators), label: "Calculators" },
        { value: "0", label: "Accounts needed" },
        { value: "&infin;", label: "Free, forever" },
      ],
    },
    {
      out: "public/og-plans.png",
      lede: "A plan that bends when life does. From 5K to marathon.",
      stats: [
        { value: String(plans), label: "Prebuilt plans" },
        { value: "4", label: "View modes" },
        { value: "7", label: "Race distances" },
      ],
    },
    {
      out: "public/og-learn.png",
      lede: "The why behind every session. Articles, guides and a glossary.",
      stats: [
        { value: "12", label: "Articles" },
        { value: "50+", label: "Glossary terms" },
        { value: "3", label: "Practical guides" },
      ],
    },
    {
      out: "public/og-race-simulator.png",
      lede: "Race day, rehearsed. Km-by-km pacing, fueling and hydration.",
      stats: [
        { value: "1 km", label: "Split precision" },
        { value: "3", label: "Checklists" },
        { value: "PDF", label: "Export" },
      ],
    },
  ];
}

// --- Template rendering ---

function fontDataUri(file: string): string {
  return `data:font/woff2;base64,${readFileSync(join(ROOT, "public/fonts", file)).toString("base64")}`;
}

const FONTS = {
  FONT_DISPLAY: fontDataUri("bricolage-grotesque-latin.woff2"),
  FONT_TEXT: fontDataUri("space-grotesk-latin.woff2"),
  FONT_MONO: fontDataUri("jetbrains-mono-latin.woff2"),
};

export function buildHtml(fmt: FormatConfig, card: Card, theme: "light" | "dark" = "light"): string {
  let html = readFileSync(TEMPLATE_PATH, "utf-8");

  const subs: Record<string, string | number> = {
    ...FONTS,
    THEME: theme === "dark" ? "dark" : "",
    W: fmt.w,
    H: fmt.h,
    PX_X: fmt.pxX,
    PX_TOP: fmt.pxTop,
    PX_BOTTOM: fmt.pxBottom,
    WORDMARK_FS: fmt.wordmarkFs,
    LEDE_FS: fmt.ledeFs,
    LEDE_MAX: fmt.ledeMax,
    VALUE_FS: fmt.valueFs,
    LABEL_FS: fmt.labelFs,
    META_FS: fmt.metaFs,
    STAT_GAP: fmt.statGap,
    DUO_W: fmt.duoW,
    RULE: fmt.rule,
    LEDE: card.lede,
    S1_VALUE: card.stats[0].value,
    S1_LABEL: card.stats[0].label,
    S2_VALUE: card.stats[1].value,
    S2_LABEL: card.stats[1].label,
    S3_VALUE: card.stats[2].value,
    S3_LABEL: card.stats[2].label,
    FOOTER,
    DUO: readFileSync(DUO_PATH, "utf-8"),
  };

  for (const [key, val] of Object.entries(subs)) {
    // split/join, not replace(): a base64 font holds "$" sequences that
    // String.replace would interpret.
    html = html.split(`{{${key}}}`).join(String(val));
  }
  return html;
}

// --- Screenshot ---

export function launchBrowser() {
  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
}

export async function captureOne(
  browser: import("puppeteer").Browser,
  fmt: FormatConfig,
  html: string,
  scale = 1
): Promise<Buffer> {
  const page = await browser.newPage();
  await page.setViewport({ width: fmt.w, height: fmt.h, deviceScaleFactor: scale });
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);

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
  console.log("Generating Zoned share cards...");

  const stats = readSiteStats();
  console.log("Stats:", stats);

  const cards = buildCards(stats);

  const browser = await launchBrowser();

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

if (import.meta.main) {
  main().catch((err) => {
    console.error("Failed to generate share cards:", err);
    process.exit(1);
  });
}
