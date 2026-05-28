/**
 * Click through every share template and capture the dialog. Helpful for
 * visual QA across the 11 templates × {desktop, mobile} matrix.
 */

import { mkdirSync } from "fs";
import puppeteer from "puppeteer";

const OUT = "/tmp/share-each";
mkdirSync(OUT, { recursive: true });

const URL = process.env.WORKOUT_URL ?? "http://localhost:5173/workout/VMA-001";
const VIEWPORT = { w: 1440, h: 900 };

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: VIEWPORT.w, height: VIEWPORT.h, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem("zoned-language", "fr");
      localStorage.setItem("i18nextLng", "fr");
      localStorage.setItem("zoned-theme", "light");
    } catch {}
  });

  await page.goto(URL, { waitUntil: "networkidle0", timeout: 45000 });
  await page.waitForSelector("main", { timeout: 10000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 800));

  // Open the share dialog
  await page.evaluate(() => {
    for (const b of Array.from(document.querySelectorAll("button"))) {
      if (/^Partager/.test((b.textContent || "").trim())) {
        (b as HTMLElement).click();
        return;
      }
    }
  });
  await page.waitForSelector("[data-share-template]", { timeout: 5000 });
  await new Promise((r) => setTimeout(r, 1200));

  // Collect template IDs from the rendered DOM
  const ids: string[] = await page.evaluate(() => {
    const all = document.querySelectorAll("[data-share-template]");
    const seen = new Set<string>();
    const result: string[] = [];
    all.forEach((el, i) => {
      // Each template button has a data-share-template descendant; we need
      // the buttons themselves, but we can also walk up.
      const parentBtn = (el as HTMLElement).closest("button");
      if (!parentBtn) return;
      const key = parentBtn.getAttribute("aria-label") || `tpl-${i}`;
      if (seen.has(key)) return;
      seen.add(key);
      result.push(key);
    });
    return result;
  });
  console.log(`${ids.length} template buttons found`);

  // Iterate by index and click each one
  const buttons = await page.$$("[data-slot='dialog-content'] button[aria-pressed]");
  console.log(`${buttons.length} buttons matched aria-pressed`);

  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    // Get its label
    const label = await page.evaluate(
      (el) => el.querySelector("span")?.textContent || `tpl-${i}`,
      btn,
    );
    const slug = (label || `tpl-${i}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Scroll the button into view inside the dialog, then click.
    await btn.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await new Promise((r) => setTimeout(r, 300));
    await btn.click();
    await new Promise((r) => setTimeout(r, 400));

    // Take a screenshot focused on the dialog
    const box = await page.evaluate(() => {
      const el = document.querySelector(
        "[data-slot='dialog-content']",
      ) as HTMLElement | null;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    if (!box) continue;
    const filename = `${OUT}/${String(i + 1).padStart(2, "0")}-${slug}.png`;
    await page.screenshot({
      path: filename,
      clip: {
        x: Math.max(0, box.x - 4),
        y: Math.max(0, box.y - 4),
        width: Math.min(VIEWPORT.w, box.width + 8),
        height: Math.min(VIEWPORT.h, box.height + 8),
      },
    });
    console.log(`  ✓ ${slug}`);
  }

  await browser.close();
  console.log(`\nDone → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
