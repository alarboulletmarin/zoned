import puppeteer from "puppeteer";
const [,, planUrl] = process.argv;
const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1200 });
await page.evaluateOnNewDocument(() => {
  try { localStorage.setItem("zoned-theme", "dark"); } catch(e) {}
});
await page.goto(planUrl, { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 800));
// dismiss the local-storage notice modal if present
const dismissed = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button"));
  const b = btns.find(el => /j'ai compris/i.test(el.textContent || ""));
  if (b) { b.click(); return true; }
  return false;
});
await new Promise(r => setTimeout(r, 400));
// click "Semaine" view tab
const clicked = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button"));
  const b = btns.find(el => /^Semaine$/i.test((el.textContent || "").trim()));
  if (b) { b.click(); return true; }
  return false;
});
console.log("dismissed:", dismissed, "clicked semaine:", clicked);
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: "/home/andrea/projets/github/zoned/.qa-pixel/plan-view-live-dark.png", fullPage: true });
await browser.close();
