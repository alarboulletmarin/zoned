import puppeteer from "puppeteer";

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();

// Mobile screenshot
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await page.evaluateOnNewDocument(() => {
  try { localStorage.setItem("zoned-theme", "dark"); } catch(e) {}
});
await page.goto("http://localhost:5199/library/draw", { waitUntil: "networkidle0", timeout: 30000 });
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: ".qa-pixel/draw-mobile-dark.png", fullPage: true });

// Now desktop, click "Filtres" toggle isn't needed on desktop; click Tirer
await page.setViewport({ width: 1400, height: 1200, deviceScaleFactor: 1 });
await page.goto("http://localhost:5199/library/draw", { waitUntil: "networkidle0", timeout: 30000 });
await new Promise(r => setTimeout(r, 500));

const clicked = await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll("button"));
  const btn = buttons.find(b => b.textContent.trim().match(/^Tirer une séance$/i));
  if (btn) { btn.click(); return true; }
  return false;
});
console.log("clicked draw button:", clicked);

// Wait for the scan animation (~1.5-2s) to settle on a result
await new Promise(r => setTimeout(r, 2500));
await page.screenshot({ path: ".qa-pixel/draw-result-dark.png", fullPage: true });

await browser.close();
console.log("done");
