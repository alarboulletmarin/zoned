/**
 * USAGE: bun run scripts/generate-og-image.ts
 *
 * Generates a professional OG image (1200x630 PNG) for social sharing.
 * Reads actual app data to display accurate stats, renders an HTML
 * template with Puppeteer, and saves to public/og-image.png.
 */

import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import puppeteer from "puppeteer";

const ROOT = join(import.meta.dirname, "..");
const TEMPLATE_PATH = join(import.meta.dirname, "og-template.html");
const OUTPUT_PATH = join(ROOT, "public/og-image.png");

// --- Data collection ---

function countWorkouts(): number {
  const dir = join(ROOT, "src/data/workouts");
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

function countCalculators(): number {
  return 9;
}

function countGlossaryTerms(): number {
  const dir = join(ROOT, "src/data/glossary/terms");
  const files = readdirSync(dir).filter((f) => f.endsWith(".ts"));
  let total = 0;
  for (const file of files) {
    const content = readFileSync(join(dir, file), "utf-8");
    const matches = content.match(/^\s+id:\s/gm);
    if (matches) total += matches.length;
  }
  return total;
}

function countPlans(): number {
  const dir = join(ROOT, "src/data/prebuilt-plans/plans");
  return readdirSync(dir).filter((f) => f.endsWith(".ts")).length;
}

function loadLogoSvg(): string {
  return readFileSync(join(ROOT, "src/assets/logo.svg"), "utf-8");
}

// --- Template rendering ---

function buildHtml(): string {
  const stats = {
    workouts: countWorkouts(),
    calculators: countCalculators(),
    glossary: countGlossaryTerms(),
    plans: countPlans(),
  };

  console.log("Stats:", stats);

  let html = readFileSync(TEMPLATE_PATH, "utf-8");
  html = html.replace(/\{\{WORKOUT_COUNT\}\}/g, String(stats.workouts));
  html = html.replace(/\{\{CALCULATOR_COUNT\}\}/g, String(stats.calculators));
  html = html.replace(/\{\{GLOSSARY_COUNT\}\}/g, String(stats.glossary));
  html = html.replace(/\{\{PLAN_COUNT\}\}/g, String(stats.plans));
  html = html.replace(/\{\{LOGO_SVG\}\}/g, loadLogoSvg());

  return html;
}

// --- Screenshot ---

async function captureScreenshot(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 15000 });

  const screenshot = await page.screenshot({
    type: "png",
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });

  await browser.close();
  return Buffer.from(screenshot);
}

// --- Main ---

async function main() {
  console.log("Generating OG image...");

  const html = buildHtml();
  const png = await captureScreenshot(html);
  writeFileSync(OUTPUT_PATH, png);

  console.log(`OG image saved to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("Failed to generate OG image:", err);
  process.exit(1);
});
