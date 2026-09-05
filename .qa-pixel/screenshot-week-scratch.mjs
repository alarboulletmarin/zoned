import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1200 });
await page.evaluateOnNewDocument(() => {
  try {
    localStorage.setItem("zoned-theme", "dark");
    localStorage.setItem("zoned-storage-warning-seen", "true");
  } catch(e) {}
});
await page.goto("http://localhost:5199/weeks/new", { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: "/home/andrea/projets/github/zoned/.qa-pixel/week-new-live-dark.png", fullPage: true });

const els = await page.$$("button");
let target = null;
for (const el of els) {
  const text = await page.evaluate(e => e.textContent.trim(), el);
  if (text.includes("Partir de zéro")) { target = el; break; }
}
console.log("found scratch button:", !!target);
if (target) await target.click();
await new Promise(r => setTimeout(r, 1200));
console.log("url:", page.url());
await page.evaluate(async () => {
  const total = document.body.scrollHeight;
  for (let y = 0; y < total; y += 400) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 40));
  }
  window.scrollTo(0, 0);
});
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: "/home/andrea/projets/github/zoned/.qa-pixel/week-composer-live-dark.png", fullPage: true });
await browser.close();
