/**
 * Capture ShareDialog screenshots at desktop / tablet / mobile widths to
 * audit overflow issues. Connects to the running dev server on :5173.
 */

import { mkdirSync } from "fs";
import puppeteer from "puppeteer";

const OUT = "/tmp/share-shots";
mkdirSync(OUT, { recursive: true });

const URL = process.env.WORKOUT_URL ?? "http://localhost:5173/workout/REC-001";

const VIEWPORTS = [
  { name: "desktop", w: 1440, h: 900 },
  { name: "tablet", w: 768, h: 1024 },
  { name: "mobile", w: 414, h: 896 },
];

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.setItem("zoned-language", "fr");
        localStorage.setItem("i18nextLng", "fr");
        localStorage.setItem("zoned-theme", "light");
      } catch {}
    });

    console.log(`\n[${vp.name}] ${vp.w}×${vp.h}`);
    await page.goto(URL, { waitUntil: "networkidle0", timeout: 45000 });
    await page.waitForSelector("main", { timeout: 10000 }).catch(() => {});
    await page.evaluateHandle("document.fonts.ready");
    await new Promise((r) => setTimeout(r, 600));

    // Find the Partager button by accessible text.
    const found = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      for (const b of buttons) {
        const txt = (b.textContent || "").trim();
        if (/^Partager/.test(txt) && txt.length < 20) {
          (b as HTMLElement).click();
          return true;
        }
      }
      return false;
    });
    if (!found) {
      console.log(`  ⚠ Partager button not found`);
      await page.screenshot({ path: `${OUT}/${vp.name}-no-btn.png` });
      await page.close();
      continue;
    }

    // Wait for the dialog to mount and fonts to settle.
    await page.waitForSelector("[data-slot='dialog-content']", { timeout: 5000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500)); // allow templates to render

    // Scroll the dialog body to the bottom so the last templates become
    // visible. Strategy: find the actually-scrollable container by walking
    // descendants of dialog-content and picking the one with
    // scrollHeight > clientHeight.
    if (process.env.SCROLL_FRACTION) {
      const fraction = Number(process.env.SCROLL_FRACTION);
      await page.evaluate((f: number) => {
        const dialog = document.querySelector(
          "[data-slot='dialog-content']",
        ) as HTMLElement | null;
        if (!dialog) return;
        for (const el of Array.from(dialog.querySelectorAll<HTMLElement>("*"))) {
          if (el.scrollHeight > el.clientHeight + 4) {
            el.scrollTop = (el.scrollHeight - el.clientHeight) * f;
            return;
          }
        }
      }, fraction);
      await new Promise((r) => setTimeout(r, 600));
    }

    if (process.env.SCROLL_LAST) {
      const info = await page.evaluate(() => {
        const dialog = document.querySelector(
          "[data-slot='dialog-content']",
        ) as HTMLElement | null;
        if (!dialog) return { ok: false };
        let target: HTMLElement | null = null;
        for (const el of Array.from(dialog.querySelectorAll<HTMLElement>("*"))) {
          if (el.scrollHeight > el.clientHeight + 4) {
            target = el;
            break;
          }
        }
        if (!target) return { ok: false };
        const before = target.scrollTop;
        target.scrollTop = target.scrollHeight;
        return {
          ok: true,
          tag: target.tagName,
          cls: target.className.toString().slice(0, 50),
          sh: target.scrollHeight,
          ch: target.clientHeight,
          before,
          after: target.scrollTop,
        };
      });
      console.log(`  scroll info:`, info);
      await new Promise((r) => setTimeout(r, 600));
    }

    await page.screenshot({
      path: `${OUT}/${vp.name}-full.png`,
      fullPage: false,
    });

    // Also a "dialog-only" crop for clarity.
    const dialogBox = await page.evaluate(() => {
      const el = document.querySelector(
        "[data-slot='dialog-content']",
      ) as HTMLElement | null;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    if (dialogBox) {
      console.log(
        `  dialog: ${Math.round(dialogBox.width)}×${Math.round(dialogBox.height)} at (${Math.round(dialogBox.x)}, ${Math.round(dialogBox.y)})`,
      );
      await page.screenshot({
        path: `${OUT}/${vp.name}-dialog.png`,
        clip: {
          x: Math.max(0, dialogBox.x - 4),
          y: Math.max(0, dialogBox.y - 4),
          width: Math.min(vp.w, dialogBox.width + 8),
          height: Math.min(vp.h, dialogBox.height + 8),
        },
      });
    }

    // Detect any horizontal overflow inside the dialog body
    const overflow = await page.evaluate(() => {
      const dialog = document.querySelector(
        "[data-slot='dialog-content']",
      ) as HTMLElement | null;
      if (!dialog) return null;
      const dialogRect = dialog.getBoundingClientRect();
      const offenders: { tag: string; cls: string; left: number; right: number }[] = [];
      const walker = document.createTreeWalker(dialog, NodeFilter.SHOW_ELEMENT, null);
      let n: Node | null;
      while ((n = walker.nextNode())) {
        const el = n as HTMLElement;
        const r = el.getBoundingClientRect();
        if (r.left < dialogRect.left - 1 || r.right > dialogRect.right + 1) {
          offenders.push({
            tag: el.tagName,
            cls: el.className.toString().slice(0, 60),
            left: Math.round(r.left - dialogRect.left),
            right: Math.round(r.right - dialogRect.right),
          });
        }
      }
      return offenders.slice(0, 8);
    });
    if (overflow && overflow.length) {
      console.log(`  ⚠ ${overflow.length} element(s) overflow the dialog:`);
      for (const o of overflow) {
        console.log(`    ${o.tag}.${o.cls}  left=${o.left} right=${o.right}`);
      }
    } else {
      console.log(`  ✓ no horizontal overflow`);
    }

    await page.close();
  }

  await browser.close();
  console.log(`\nScreenshots → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
