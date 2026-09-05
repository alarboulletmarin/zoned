import puppeteer from "puppeteer";

const [,, url, outPath, widthArg, theme] = process.argv;
const width = widthArg ? parseInt(widthArg, 10) : 1400;

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width, height: 1200, deviceScaleFactor: 1 });
await page.evaluateOnNewDocument((t) => {
  try { localStorage.setItem("zoned-theme", t); } catch(e) {}
}, theme || "dark");
await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
await new Promise(r => setTimeout(r, 500));
// Scroll through the full page first so whileInView (framer-motion)
// reveal animations have actually triggered before the fullPage capture —
// otherwise anything below the fold is stuck at opacity:0.
await page.evaluate(async () => {
  const total = document.body.scrollHeight;
  for (let y = 0; y < total; y += 400) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 40));
  }
  window.scrollTo(0, 0);
});
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log("saved", outPath);
